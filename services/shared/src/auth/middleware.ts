import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "./jwt";

// Extend Express Request type to include chef data
declare global {
  namespace Express {
    interface Request {
      chef?: JWTPayload;
    }
  }
}

export const authenticateChef = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.replace("Bearer ", "");

    // If no Authorization header, try to get from cookies
    if (!token && req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    // If cookie-parser didn't work, try manual parsing
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie
        .split(";")
        .reduce((acc: any, cookie: string) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = value;
          return acc;
        }, {});
      token = cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    req.chef = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.replace("Bearer ", "");

    // If no Authorization header, try to get from cookies
    if (!token && req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    // If cookie-parser didn't work, try manual parsing
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie
        .split(";")
        .reduce((acc: any, cookie: string) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = value;
          return acc;
        }, {});
      token = cookies.authToken;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.chef = decoded;
      } catch (error) {
        // Token is invalid, but we don't fail the request
        // Just continue without setting req.chef
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
