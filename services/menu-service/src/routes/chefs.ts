import { Router } from "express";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  authenticate,
  authorize,
  UserRole,
} from "@forkcast/shared";

const router = Router();

// Get all chefs with pagination and filters
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      cuisine,
      search,
      verified,
      minRating = "0",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (cuisine) {
      where.cuisine = { contains: cuisine as string, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { bio: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (verified === "true") {
      where.isVerified = true;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    const [chefs, total] = await Promise.all([
      prisma.chef.findMany({
        where,
        select: {
          id: true,
          name: true,
          bio: true,
          cuisine: true,
          rating: true,
          ratingCount: true,
          image: true,
          isVerified: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { rating: "desc" },
      }),
      prisma.chef.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccessResponse(res, {
      chefs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get chefs error:", error);
    return sendErrorResponse(res, "Failed to fetch chefs", 500);
  }
});

// Get chef by ID
router.get("/:chefId", async (req, res) => {
  try {
    const { chefId } = req.params;

    const chef = await prisma.chef.findUnique({
      where: { id: chefId, isActive: true },
      select: {
        id: true,
        name: true,
        bio: true,
        cuisine: true,
        rating: true,
        ratingCount: true,
        image: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
        menuItems: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            preparationTime: true,
            rating: true,
            ratingCount: true,
            image: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 10,
          orderBy: { rating: "desc" },
        },
      },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    return sendSuccessResponse(res, { chef });
  } catch (error) {
    console.error("Get chef error:", error);
    return sendErrorResponse(res, "Failed to fetch chef", 500);
  }
});

// Update chef profile (chef only)
router.put(
  "/:chefId",
  authenticate,
  authorize(UserRole.CHEF, UserRole.ADMIN),
  async (req, res) => {
    try {
      const { chefId } = req.params;
      const { name, bio, cuisine, image } = req.body;
      const userId = (req as any).user.userId;

      // Check if chef exists and belongs to user (unless admin)
      const existingChef = await prisma.chef.findUnique({
        where: { id: chefId },
      });

      if (!existingChef) {
        return sendErrorResponse(res, "Chef not found", 404);
      }

      if (
        (req as any).user.role !== UserRole.ADMIN &&
        existingChef.userId !== userId
      ) {
        return sendErrorResponse(
          res,
          "Unauthorized to update this chef profile",
          403
        );
      }

      const updatedChef = await prisma.chef.update({
        where: { id: chefId },
        data: {
          name,
          bio,
          cuisine,
          image,
        },
        select: {
          id: true,
          name: true,
          bio: true,
          cuisine: true,
          rating: true,
          ratingCount: true,
          image: true,
          isVerified: true,
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
  }
);

// Get chef's menu items
router.get("/:chefId/menu", async (req, res) => {
  try {
    const { chefId } = req.params;
    const { page = "1", limit = "10", category } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Verify chef exists
    const chef = await prisma.chef.findUnique({
      where: { id: chefId, isActive: true },
      select: { id: true, name: true },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    const where: any = {
      chefId,
      isActive: true,
    };

    if (category) {
      where.category = {
        name: { contains: category as string, mode: "insensitive" },
      };
    }

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          preparationTime: true,
          rating: true,
          ratingCount: true,
          image: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          customizationOptions: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { rating: "desc" },
      }),
      prisma.menuItem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccessResponse(res, {
      chef,
      menuItems,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get chef menu error:", error);
    return sendErrorResponse(res, "Failed to fetch chef menu", 500);
  }
});

export default router;
