import jwt, { SignOptions } from "jsonwebtoken";

const defaultJwtSecret = "your-super-secret-jwt-key-change-in-production";
const JWT_SECRET = process.env.JWT_SECRET || defaultJwtSecret;

if (
  process.env.NODE_ENV === "production" &&
  (JWT_SECRET === defaultJwtSecret || JWT_SECRET.length < 32)
) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export interface JWTPayload {
  chefId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
