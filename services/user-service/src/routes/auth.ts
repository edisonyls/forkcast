import { Router } from "express";
import {
  prisma,
  hashPassword,
  comparePassword,
  generateToken,
  validateRequest,
  sendSuccessResponse,
  sendErrorResponse,
  loginSchema,
  registerSchema,
  UserRole,
} from "@forkcast/shared";

const router = Router();

// Register endpoint
router.post("/register", validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendErrorResponse(res, "User with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return sendSuccessResponse(
      res,
      {
        user,
        token,
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return sendErrorResponse(res, "Failed to register user", 500);
  }
});

// Login endpoint
router.post("/login", validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        chef: true,
      },
    });

    if (!user) {
      return sendErrorResponse(res, "Invalid email or password", 401);
    }

    if (!user.isActive) {
      return sendErrorResponse(res, "Account is deactivated", 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccessResponse(
      res,
      {
        user: userWithoutPassword,
        token,
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendErrorResponse(res, "Failed to login", 500);
  }
});

// Logout endpoint (for completeness, mainly handled on frontend)
router.post("/logout", (req, res) => {
  // In a stateless JWT system, logout is mainly handled on the frontend
  // by removing the token from storage
  return sendSuccessResponse(res, null, "Logout successful");
});

// Verify token endpoint
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, "Access token required", 401);
    }

    const token = authHeader.substring(7);

    // This will throw an error if token is invalid
    const decoded = require("@forkcast/shared").verifyToken(token);

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        chef: {
          select: {
            id: true,
            name: true,
            bio: true,
            cuisine: true,
            rating: true,
            image: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return sendErrorResponse(res, "User not found or deactivated", 401);
    }

    return sendSuccessResponse(res, { user }, "Token verified");
  } catch (error) {
    return sendErrorResponse(res, "Invalid or expired token", 401);
  }
});

export default router;
