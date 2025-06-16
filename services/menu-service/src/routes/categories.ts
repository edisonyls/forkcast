import { Router } from "express";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  validateRequest,
  categorySchema,
} from "@forkcast/shared";

const router = Router();

// Get all categories (optionally filtered by chef)
router.get("/", async (req, res) => {
  try {
    const { chefId } = req.query;

    const where: any = {};
    if (chefId) {
      where.chefId = chefId as string;
    }

    const categories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        chefId: true,
        chef: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return sendSuccessResponse(res, { categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return sendErrorResponse(res, "Failed to fetch categories", 500);
  }
});

// Get category by ID
router.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        menuItems: {
          select: {
            id: true,
            name: true,
            description: true,
            preparationTime: true,
            rating: true,
            ratingCount: true,
            image: true,
            chef: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
          },
          orderBy: { rating: "desc" },
        },
      },
    });

    if (!category) {
      return sendErrorResponse(res, "Category not found", 404);
    }

    return sendSuccessResponse(res, { category });
  } catch (error) {
    console.error("Get category error:", error);
    return sendErrorResponse(res, "Failed to fetch category", 500);
  }
});

// Create category (chef-specific)
router.post("/", validateRequest(categorySchema), async (req, res) => {
  try {
    const { name, chefId } = req.body;

    if (!chefId) {
      return sendErrorResponse(res, "Chef ID is required", 400);
    }

    // Verify chef exists
    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    // Check if category already exists for this chef
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        chefId: chefId,
      },
    });

    if (existingCategory) {
      return sendErrorResponse(
        res,
        "Category already exists for this chef",
        409
      );
    }

    const category = await prisma.category.create({
      data: { name, chefId },
      select: {
        id: true,
        name: true,
        chefId: true,
        chef: {
          select: {
            id: true,
            name: true,
          },
        },
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

// Update category
router.put(
  "/:categoryId",
  validateRequest(categorySchema),
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!existingCategory) {
        return sendErrorResponse(res, "Category not found", 404);
      }

      // Check if another category with this name exists
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: categoryId },
        },
      });

      if (duplicateCategory) {
        return sendErrorResponse(res, "Category name already exists", 409);
      }

      const category = await prisma.category.update({
        where: { id: categoryId },
        data: { name },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return sendSuccessResponse(
        res,
        { category },
        "Category updated successfully"
      );
    } catch (error) {
      console.error("Update category error:", error);
      return sendErrorResponse(res, "Failed to update category", 500);
    }
  }
);

// Delete category
router.delete("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        menuItems: true,
      },
    });

    if (!existingCategory) {
      return sendErrorResponse(res, "Category not found", 404);
    }

    // Check if category has menu items
    if (existingCategory.menuItems.length > 0) {
      return sendErrorResponse(
        res,
        "Cannot delete category with existing menu items",
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
});

export default router;
