import { Router } from "express";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  validateRequest,
  menuItemSchema,
  customizationOptionSchema,
} from "@forkcast/shared";

const router = Router();

// Get all menu items with pagination and filters
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      category,
      chef,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        name: { contains: category as string, mode: "insensitive" },
      };
    }

    if (chef) {
      where.chefId = chef as string;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
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
          chef: {
            select: {
              id: true,
              name: true,
              cuisine: true,
              rating: true,
            },
          },
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
    console.error("Get menu items error:", error);
    return sendErrorResponse(res, "Failed to fetch menu items", 500);
  }
});

// Get menu item by ID
router.get("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        preparationTime: true,
        rating: true,
        ratingCount: true,
        image: true,
        createdAt: true,
        chef: {
          select: {
            id: true,
            name: true,
            cuisine: true,
            rating: true,
            image: true,
          },
        },
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
    });

    if (!menuItem) {
      return sendErrorResponse(res, "Menu item not found", 404);
    }

    return sendSuccessResponse(res, { menuItem });
  } catch (error) {
    console.error("Get menu item error:", error);
    return sendErrorResponse(res, "Failed to fetch menu item", 500);
  }
});

// Create menu item
router.post("/", validateRequest(menuItemSchema), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      preparationTime,
      categoryId,
      chefId,
      image,
    } = req.body;

    // Verify chef exists
    const chef = await prisma.chef.findUnique({
      where: { id: chefId },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return sendErrorResponse(res, "Category not found", 404);
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        preparationTime,
        chefId,
        categoryId,
        image,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        preparationTime: true,
        rating: true,
        image: true,
        chef: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendSuccessResponse(
      res,
      { menuItem },
      "Menu item created successfully",
      201
    );
  } catch (error) {
    console.error("Create menu item error:", error);
    return sendErrorResponse(res, "Failed to create menu item", 500);
  }
});

// Update menu item
router.put("/:itemId", validateRequest(menuItemSchema), async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      name,
      description,
      price,
      preparationTime,
      categoryId,
      chefId,
      image,
    } = req.body;

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return sendErrorResponse(res, "Menu item not found", 404);
    }

    // Verify chef exists if provided
    if (chefId) {
      const chef = await prisma.chef.findUnique({
        where: { id: chefId },
      });

      if (!chef) {
        return sendErrorResponse(res, "Chef not found", 404);
      }
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return sendErrorResponse(res, "Category not found", 404);
      }
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name,
        description,
        price,
        preparationTime,
        categoryId,
        chefId,
        image,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        preparationTime: true,
        rating: true,
        image: true,
        chef: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccessResponse(
      res,
      { menuItem: updatedMenuItem },
      "Menu item updated successfully"
    );
  } catch (error) {
    console.error("Update menu item error:", error);
    return sendErrorResponse(res, "Failed to update menu item", 500);
  }
});

// Delete menu item
router.delete("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return sendErrorResponse(res, "Menu item not found", 404);
    }

    // Soft delete by setting isActive to false
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isActive: false },
    });

    return sendSuccessResponse(res, null, "Menu item deleted successfully");
  } catch (error) {
    console.error("Delete menu item error:", error);
    return sendErrorResponse(res, "Failed to delete menu item", 500);
  }
});

export default router;
