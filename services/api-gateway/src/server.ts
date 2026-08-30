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
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

if (isProduction) {
  app.set("trust proxy", 1);
}

const allowedOrigins = [
  frontendUrl || "http://localhost:3001",
  ...(isProduction ? [] : ["http://localhost:3001"]),
];

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
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
    req.headers.origin || frontendUrl || "http://localhost:3001",
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie",
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
  upload: process.env.UPLOAD_SERVICE_URL || "http://localhost:3006",
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
  }),
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: {
      "^/api/users": "/api/users",
    },
  }),
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
  }),
);

app.use(
  "/api/chefs",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/chefs": "/api/chefs",
    },
  }),
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
  }),
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
  }),
);

app.use(
  "/api/events",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/events": "/api/events",
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
  }),
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: services.order,
    changeOrigin: true,
    pathRewrite: {
      "^/api/orders": "/api/orders",
    },
  }),
);

app.use(
  "/api/search",
  createProxyMiddleware({
    target: services.search,
    changeOrigin: true,
    pathRewrite: {
      "^/api/search": "/api/search",
    },
  }),
);

app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true,
    pathRewrite: {
      "^/api/notifications": "/api/notifications",
    },
  }),
);

// Upload service proxy (for file uploads)
app.use(
  "/api/upload",
  createProxyMiddleware({
    target: services.upload,
    changeOrigin: true,
    pathRewrite: {
      "^/api/upload": "/api/upload",
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward cookies and credentials for authentication
      if (req.headers.cookie) {
        proxyReq.setHeader("cookie", req.headers.cookie);
      }

      // For JSON requests, ensure content-type and content-length are properly set
      if (
        req.headers["content-type"] &&
        req.headers["content-type"].includes("application/json")
      ) {
        proxyReq.setHeader("content-type", req.headers["content-type"]);
        if (req.headers["content-length"]) {
          proxyReq.setHeader("content-length", req.headers["content-length"]);
        }
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
  }),
);

// Static file serving proxy for uploaded images
app.use(
  "/uploads",
  createProxyMiddleware({
    target: services.upload,
    changeOrigin: true,
    pathRewrite: {
      "^/uploads": "/uploads",
    },
    onProxyRes: (proxyRes, req, res) => {
      // Remove any conflicting CORS and security headers from the target service
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-credentials"];
      delete proxyRes.headers["access-control-allow-methods"];
      delete proxyRes.headers["access-control-allow-headers"];
      delete proxyRes.headers["cross-origin-opener-policy"];
      delete proxyRes.headers["cross-origin-embedder-policy"];

      // Set proper CORS headers for image requests
      res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins for static images
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Cookie",
      );

      // Ensure Cross-Origin-Resource-Policy is set correctly
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      // Set proper cache headers for images
      if (req.url && req.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
      }
    },
  }),
);

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("API Gateway Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Something went wrong in the API Gateway",
    });
  },
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
