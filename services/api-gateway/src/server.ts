import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3001",
      "http://localhost:3001", // Next.js dev server
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Logging
app.use(morgan("combined"));

// Note: No body parsing middleware here - let the target services handle body parsing
// Body parsing would consume the request stream and prevent proper proxying

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Handle preflight OPTIONS requests
app.options("*", (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin || "http://localhost:3001"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  res.sendStatus(200);
});

// Microservice proxy configurations
const services = {
  user: process.env.USER_SERVICE_URL || "http://localhost:3001",
  menu: process.env.MENU_SERVICE_URL || "http://localhost:3002",
  order: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
  search: process.env.SEARCH_SERVICE_URL || "http://localhost:3004",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005",
};

// Proxy middleware for each service
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "/api/auth",
    },
  })
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: {
      "^/api/users": "/api/users",
    },
  })
);

app.use(
  "/api/chef",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/chef": "/api/chefs",
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward cookies and credentials
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Remove any conflicting CORS headers from the target service
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-credentials"];
      delete proxyRes.headers["access-control-allow-methods"];
      delete proxyRes.headers["access-control-allow-headers"];

      // Handle cookies
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
      }
    },
  })
);

app.use(
  "/api/chefs",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/chefs": "/api/chefs",
    },
  })
);

app.use(
  "/api/menu",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/menu": "/api/menu",
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward cookies and credentials
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Remove any conflicting CORS headers from the target service
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-credentials"];
      delete proxyRes.headers["access-control-allow-methods"];
      delete proxyRes.headers["access-control-allow-headers"];

      // Handle cookies
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
      }
    },
  })
);

app.use(
  "/api/categories",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/categories": "/api/menu/categories",
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward cookies and credentials
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Remove any conflicting CORS headers from the target service
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-credentials"];
      delete proxyRes.headers["access-control-allow-methods"];
      delete proxyRes.headers["access-control-allow-headers"];

      // Handle cookies
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
      }
    },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: services.order,
    changeOrigin: true,
    pathRewrite: {
      "^/api/orders": "/api/orders",
    },
  })
);

app.use(
  "/api/search",
  createProxyMiddleware({
    target: services.search,
    changeOrigin: true,
    pathRewrite: {
      "^/api/search": "/api/search",
    },
  })
);

app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true,
    pathRewrite: {
      "^/api/notifications": "/api/notifications",
    },
  })
);

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("API Gateway Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Something went wrong in the API Gateway",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📋 Health check available at http://localhost:${PORT}/health`);
});
