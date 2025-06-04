import { Router } from "express";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  validateRequest,
  chefProfileSchema,
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

// Create chef profile
router.post("/", validateRequest(chefProfileSchema), async (req, res) => {
  try {
    const { name, bio, cuisine, image } = req.body;

    const chef = await prisma.chef.create({
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
      },
    });

    return sendSuccessResponse(
      res,
      { chef },
      "Chef profile created successfully",
      201
    );
  } catch (error) {
    console.error("Create chef error:", error);
    return sendErrorResponse(res, "Failed to create chef profile", 500);
  }
});

// Update chef profile
router.put("/:chefId", validateRequest(chefProfileSchema), async (req, res) => {
  try {
    const { chefId } = req.params;
    const { name, bio, cuisine, image } = req.body;

    // Check if chef exists
    const existingChef = await prisma.chef.findUnique({
      where: { id: chefId },
    });

    if (!existingChef) {
      return sendErrorResponse(res, "Chef not found", 404);
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
});

// Delete chef profile
router.delete("/:chefId", async (req, res) => {
  try {
    const { chefId } = req.params;

    // Check if chef exists
    const existingChef = await prisma.chef.findUnique({
      where: { id: chefId },
      include: {
        menuItems: {
          where: { isActive: true },
        },
      },
    });

    if (!existingChef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    // Check if chef has active menu items
    if (existingChef.menuItems.length > 0) {
      // Soft delete by setting isActive to false
      await prisma.chef.update({
        where: { id: chefId },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no menu items
      await prisma.chef.delete({
        where: { id: chefId },
      });
    }

    return sendSuccessResponse(res, null, "Chef profile deleted successfully");
  } catch (error) {
    console.error("Delete chef error:", error);
    return sendErrorResponse(res, "Failed to delete chef profile", 500);
  }
});

export default router;
