import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Security middleware with relaxed cross-origin policies for images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Cookie parser middleware (required for authentication)
app.use(cookieParser());

// Body parsing for JSON requests
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Note: Multer handles multipart form data parsing with its own limits
// Individual file limit: 5MB (configured in routes/upload.ts)
// Total files: 10 max (configured in routes/upload.ts)
// This allows for up to 50MB of image data per request

// Logging
app.use(morgan("combined"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/upload", uploadRoutes);

// Static file serving for uploaded images with proper CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Set CORS headers for all static file requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    next();
  },
  express.static("/app/uploads", {
    setHeaders: (res, path) => {
      // Set cache headers for images
      if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour cache
      }
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
    console.error("Upload service error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Upload service running on port ${PORT}`);
});
