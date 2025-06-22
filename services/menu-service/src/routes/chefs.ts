import express from "express";
import bcrypt from "bcryptjs";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  generateToken,
  authenticateChef,
  optionalAuth,
  chefProfileSchema,
  chefSecretSchema,
} from "@forkcast/shared";

const router = express.Router();

// Get all chefs (public endpoint)
router.get("/", async (req, res) => {
  try {
    const chefs = await prisma.chef.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        rating: true,
        ratingCount: true,
        image: true,
        createdAt: true,
      },
    });

    return sendSuccessResponse(res, { chefs }, "Chefs retrieved successfully");
  } catch (error) {
    console.error("Get chefs error:", error);
    return sendErrorResponse(res, "Failed to retrieve chefs", 500);
  }
});

// Get chef by ID (public endpoint)
router.get("/:chefId", async (req, res) => {
  try {
    const { chefId } = req.params;

    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        rating: true,
        ratingCount: true,
        image: true,
        createdAt: true,
      },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    return sendSuccessResponse(res, { chef }, "Chef retrieved successfully");
  } catch (error) {
    console.error("Get chef error:", error);
    return sendErrorResponse(res, "Failed to retrieve chef", 500);
  }
});

// Verify chef secret (public endpoint for menu access)
router.post("/:chefId/verify-secret", async (req, res) => {
  try {
    const { chefId } = req.params;
    const { secret } = req.body;

    if (!secret) {
      return sendErrorResponse(res, "Secret is required", 400);
    }

    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        rating: true,
        ratingCount: true,
        image: true,
        secret: true,
        createdAt: true,
      },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    if (chef.secret !== secret) {
      return sendErrorResponse(res, "Invalid secret", 403);
    }

    // Return chef data without the secret
    const { secret: _, ...chefData } = chef;
    return sendSuccessResponse(
      res,
      { chef: chefData },
      "Secret verified successfully"
    );
  } catch (error) {
    console.error("Verify secret error:", error);
    return sendErrorResponse(res, "Failed to verify secret", 500);
  }
});

// Get chef profile (protected endpoint)
router.get("/profile/me", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;

    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        secret: true,
        rating: true,
        ratingCount: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    return sendSuccessResponse(
      res,
      { chef },
      "Chef profile retrieved successfully"
    );
  } catch (error) {
    console.error("Get chef profile error:", error);
    return sendErrorResponse(res, "Failed to retrieve chef profile", 500);
  }
});

// Update chef profile (protected endpoint)
router.put("/profile/me", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;
    const { name, bio, image, secret } = req.body;

    // Check if chef exists
    const existingChef = await prisma.chef.findUnique({
      where: { id: chefId },
    });

    if (!existingChef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    // Validate secret if provided
    if (secret !== undefined) {
      if (!secret || secret.trim().length < 8) {
        return sendErrorResponse(
          res,
          "Secret must be at least 8 characters long",
          400
        );
      }
    }

    // Only update the fields that are provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;
    if (secret !== undefined) updateData.secret = secret.trim();

    const updatedChef = await prisma.chef.update({
      where: { id: chefId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        secret: true,
        rating: true,
        ratingCount: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccessResponse(
      res,
      { chef: updatedChef },
      "Chef profile updated successfully"
    );
  } catch (error) {
    console.error("Update chef error:", error);
    return sendErrorResponse(res, "Failed to update chef profile", 500);
  }
});

// Chef Sign Up
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username, name, bio, secret, image } = req.body;

    // Validation
    if (!email || !password || !username || !name || !bio || !secret) {
      return sendErrorResponse(res, "All fields are required", 400);
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return sendErrorResponse(res, "Please enter a valid email", 400);
    }

    // Password validation
    if (password.length < 8 || password.length > 32) {
      return sendErrorResponse(
        res,
        "Password must be between 8-32 characters",
        400
      );
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      return sendErrorResponse(
        res,
        "Password must contain both letters and numbers",
        400
      );
    }

    // Check if email already exists
    const existingChef = await prisma.chef.findUnique({
      where: { email },
    });

    if (existingChef) {
      return sendErrorResponse(res, "Email already exists", 400);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create chef
    const chefData: any = {
      email,
      password: hashedPassword,
      username,
      name,
      bio,
      secret,
    };

    // Only include image if it's provided
    if (image && image.trim()) {
      chefData.image = image.trim();
    }

    const chef = await prisma.chef.create({
      data: chefData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        secret: true,
        rating: true,
        ratingCount: true,
        image: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      chefId: chef.id,
      email: chef.email,
    });

    // Set secure HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccessResponse(
      res,
      { chef },
      "Chef account created successfully",
      201
    );
  } catch (error) {
    console.error("Chef signup error:", error);
    return sendErrorResponse(res, "Failed to create chef account", 500);
  }
});

// Chef Sign In
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendErrorResponse(res, "Email and password are required", 400);
    }

    // Find chef by email
    const chef = await prisma.chef.findUnique({
      where: { email },
    });

    if (!chef) {
      return sendErrorResponse(res, "Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, chef.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      chefId: chef.id,
      email: chef.email,
    });

    // Set secure HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return chef data (excluding password)
    const chefData = {
      id: chef.id,
      email: chef.email,
      username: chef.username,
      name: chef.name,
      bio: chef.bio,
      secret: chef.secret,
      rating: chef.rating,
      ratingCount: chef.ratingCount,
      image: chef.image,
      createdAt: chef.createdAt,
    };

    return sendSuccessResponse(res, { chef: chefData }, "Sign in successful");
  } catch (error) {
    console.error("Chef signin error:", error);
    return sendErrorResponse(res, "Failed to sign in", 500);
  }
});

// Chef Sign Out
router.post("/signout", (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return sendSuccessResponse(res, {}, "Signed out successfully");
  } catch (error) {
    console.error("Chef signout error:", error);
    return sendErrorResponse(res, "Failed to sign out", 500);
  }
});

export default router;
