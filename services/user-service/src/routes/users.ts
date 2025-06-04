import { Router } from "express";
import {
  prisma,
  authenticate,
  authorize,
  validateRequest,
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  chefProfileSchema,
  UserRole,
  paginationSchema,
  validateQuery,
} from "@forkcast/shared";

const router = Router();

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        chef: {
          select: {
            id: true,
            name: true,
            bio: true,
            cuisine: true,
            image: true,
            rating: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    return sendSuccessResponse(res, { user }, "Profile retrieved successfully");
  } catch (error) {
    console.error("Get profile error:", error);
    return sendErrorResponse(res, "Failed to retrieve profile", 500);
  }
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        firstName,
        lastName,
        phone,
        address,
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
        updatedAt: true,
      },
    });

    return sendSuccessResponse(res, { user }, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return sendErrorResponse(res, "Failed to update profile", 500);
  }
});

// Register as chef
router.post(
  "/chef/register",
  authenticate,
  validateRequest(chefProfileSchema),
  async (req, res) => {
    try {
      const { name, bio, cuisine, image } = req.body;

      // Check if user is already a chef
      const existingChef = await prisma.chef.findUnique({
        where: { userId: req.user!.userId },
      });

      if (existingChef) {
        return sendErrorResponse(
          res,
          "User is already registered as a chef",
          409
        );
      }

      // Create chef profile
      const chef = await prisma.chef.create({
        data: {
          userId: req.user!.userId,
          name,
          bio,
          cuisine,
          image,
        },
      });

      // Update user role to CHEF
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { role: UserRole.CHEF },
      });

      return sendSuccessResponse(
        res,
        { chef },
        "Chef registration successful",
        201
      );
    } catch (error) {
      console.error("Chef registration error:", error);
      return sendErrorResponse(res, "Failed to register as chef", 500);
    }
  }
);

// Get all users (admin only)
router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const { page, limit } = req.query as any;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
            role: true,
            isActive: true,
            chef: {
              select: {
                id: true,
                name: true,
                bio: true,
                cuisine: true,
                image: true,
                rating: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.user.count(),
      ]);

      return sendPaginatedResponse(
        res,
        users,
        page,
        limit,
        total,
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Get users error:", error);
      return sendErrorResponse(res, "Failed to retrieve users", 500);
    }
  }
);

// Deactivate user (admin only)
router.patch(
  "/:userId/deactivate",
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      return sendSuccessResponse(
        res,
        { user },
        "User deactivated successfully"
      );
    } catch (error) {
      console.error("Deactivate user error:", error);
      return sendErrorResponse(res, "Failed to deactivate user", 500);
    }
  }
);

// Activate user (admin only)
router.patch(
  "/:userId/activate",
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      return sendSuccessResponse(res, { user }, "User activated successfully");
    } catch (error) {
      console.error("Activate user error:", error);
      return sendErrorResponse(res, "Failed to activate user", 500);
    }
  }
);

export default router;
