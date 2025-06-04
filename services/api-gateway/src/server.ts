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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
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
  })
);

app.use(
  "/api/categories",
  createProxyMiddleware({
    target: services.menu,
    changeOrigin: true,
    pathRewrite: {
      "^/api/categories": "/api/categories",
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
