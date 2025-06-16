import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import menuRoutes from "./routes/menu";
import chefRoutes from "./routes/chefs";
import eventRoutes from "./routes/events";

const app = express();

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins since API Gateway handles CORS
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/chefs", chefRoutes);
app.use("/api/events", eventRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "menu-service" });
});

export default app;
