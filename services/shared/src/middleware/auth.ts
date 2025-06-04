import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/jwt";
import { JwtPayload, UserRole } from "../types/common";
import { sendErrorResponse } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, "Access token required", 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return sendErrorResponse(res, "Invalid or expired token", 401);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendErrorResponse(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(res, "Insufficient permissions", 403);
    }

    next();
  };
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
