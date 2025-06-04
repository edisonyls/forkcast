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

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            menuItems: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return sendSuccessResponse(res, { categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return sendErrorResponse(res, "Failed to fetch categories", 500);
  }
});

// Get category by ID with menu items
router.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (!category) {
      return sendErrorResponse(res, "Category not found", 404);
    }

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: {
          categoryId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          preparationTime: true,
          rating: true,
          ratingCount: true,
          image: true,
          chef: {
            select: {
              id: true,
              name: true,
              cuisine: true,
              rating: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { rating: "desc" },
      }),
      prisma.menuItem.count({
        where: {
          categoryId,
          isActive: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccessResponse(res, {
      category,
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
    console.error("Get category error:", error);
    return sendErrorResponse(res, "Failed to fetch category", 500);
  }
});

// Create category (admin only)
router.post("/", authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return sendErrorResponse(res, "Category name is required", 400);
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return sendErrorResponse(res, "Category already exists", 409);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return sendSuccessResponse(
      res,
      { category },
      "Category created successfully",
      201
    );
  } catch (error) {
    console.error("Create category error:", error);
    return sendErrorResponse(res, "Failed to create category", 500);
  }
});

// Update category (admin only)
router.put(
  "/:categoryId",
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return sendErrorResponse(res, "Category name is required", 400);
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!existingCategory) {
        return sendErrorResponse(res, "Category not found", 404);
      }

      // Check if another category with the same name exists
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          id: { not: categoryId },
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
        },
      });

      if (duplicateCategory) {
        return sendErrorResponse(
          res,
          "Category with this name already exists",
          409
        );
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name: name.trim(),
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return sendSuccessResponse(
        res,
        { category: updatedCategory },
        "Category updated successfully"
      );
    } catch (error) {
      console.error("Update category error:", error);
      return sendErrorResponse(res, "Failed to update category", 500);
    }
  }
);

// Delete category (admin only)
router.delete(
  "/:categoryId",
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { categoryId } = req.params;

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: {
              menuItems: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!existingCategory) {
        return sendErrorResponse(res, "Category not found", 404);
      }

      // Check if category has active menu items
      if (existingCategory._count.menuItems > 0) {
        return sendErrorResponse(
          res,
          "Cannot delete category with active menu items",
          400
        );
      }

      await prisma.category.delete({
        where: { id: categoryId },
      });

      return sendSuccessResponse(res, null, "Category deleted successfully");
    } catch (error) {
      console.error("Delete category error:", error);
      return sendErrorResponse(res, "Failed to delete category", 500);
    }
  }
);

export default router;
