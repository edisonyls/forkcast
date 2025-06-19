import express from "express";
import {
  prisma,
  sendSuccessResponse,
  sendErrorResponse,
  validateRequest,
  menuItemSchema,
  categorySchema,
  customizationOptionSchema,
  authenticateChef,
  optionalAuth,
} from "@forkcast/shared";

const router = express.Router();

// Get categories for a chef (public endpoint)
router.get("/categories", async (req, res) => {
  try {
    const { chefId } = req.query;

    if (!chefId) {
      return sendErrorResponse(res, "Chef ID is required", 400);
    }

    const categories = await prisma.category.findMany({
      where: { chefId: chefId as string },
      orderBy: { createdAt: "asc" },
    });

    return sendSuccessResponse(
      res,
      { categories },
      "Categories retrieved successfully"
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return sendErrorResponse(res, "Failed to retrieve categories", 500);
  }
});

// Create category (protected endpoint)
router.post(
  "/categories",
  authenticateChef,
  validateRequest(categorySchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { name } = req.body;

      // Check if category already exists for this chef
      const existingCategory = await prisma.category.findFirst({
        where: {
          name,
          chefId,
        },
      });

      if (existingCategory) {
        return sendErrorResponse(res, "Category already exists", 400);
      }

      const category = await prisma.category.create({
        data: {
          name,
          chefId,
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
  }
);

// Update category (protected endpoint)
router.put(
  "/categories/:categoryId",
  authenticateChef,
  validateRequest(categorySchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { categoryId } = req.params;
      const { name } = req.body;

      // Check if category exists and belongs to the chef
      const existingCategory = await prisma.category.findFirst({
        where: {
          id: categoryId,
          chefId,
        },
      });

      if (!existingCategory) {
        return sendErrorResponse(res, "Category not found", 404);
      }

      // Check if another category with the same name exists for this chef
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name,
          chefId,
          id: { not: categoryId },
        },
      });

      if (duplicateCategory) {
        return sendErrorResponse(res, "Category name already exists", 400);
      }

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: { name },
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

// Delete category (protected endpoint)
router.delete("/categories/:categoryId", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;
    const { categoryId } = req.params;

    // Check if category exists and belongs to the chef
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        chefId,
      },
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
        "Cannot delete category with menu items",
        400
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return sendSuccessResponse(res, {}, "Category deleted successfully");
  } catch (error) {
    console.error("Delete category error:", error);
    return sendErrorResponse(res, "Failed to delete category", 500);
  }
});

// Get menu items for a chef (public endpoint with secret verification)
router.get("/items", async (req, res) => {
  try {
    const { chefId, secret, categoryId } = req.query;

    if (!chefId) {
      return sendErrorResponse(res, "Chef ID is required", 400);
    }

    // Verify chef exists and secret is correct
    const chef = await prisma.chef.findUnique({
      where: { id: chefId as string },
      select: { secret: true },
    });

    if (!chef) {
      return sendErrorResponse(res, "Chef not found", 404);
    }

    if (chef.secret !== secret) {
      return sendErrorResponse(res, "Invalid secret", 403);
    }

    const where: any = { chefId: chefId as string };
    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        customizationOptions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccessResponse(
      res,
      { menuItems },
      "Menu items retrieved successfully"
    );
  } catch (error) {
    console.error("Get menu items error:", error);
    return sendErrorResponse(res, "Failed to retrieve menu items", 500);
  }
});

// Create menu item (protected endpoint)
router.post(
  "/items",
  authenticateChef,
  validateRequest(menuItemSchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { name, description, preparationTime, categoryId, images } =
        req.body;

      // Verify category belongs to the chef
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          chefId,
        },
      });

      if (!category) {
        return sendErrorResponse(res, "Category not found", 404);
      }

      const menuItem = await prisma.menuItem.create({
        data: {
          name,
          description,
          preparationTime: parseInt(preparationTime),
          categoryId,
          chefId,
          images: images || [],
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          customizationOptions: {
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
  }
);

// Update menu item (protected endpoint)
router.put(
  "/items/:itemId",
  authenticateChef,
  validateRequest(menuItemSchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { itemId } = req.params;
      const { name, description, preparationTime, categoryId, images } =
        req.body;

      // Check if menu item exists and belongs to the chef
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          id: itemId,
          chefId,
        },
      });

      if (!existingItem) {
        return sendErrorResponse(res, "Menu item not found", 404);
      }

      // Verify category belongs to the chef
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          chefId,
        },
      });

      if (!category) {
        return sendErrorResponse(res, "Category not found", 404);
      }

      // If images have changed, cleanup old images
      const oldImages = existingItem.images || [];
      const newImages = images || [];

      // Check if images have changed by comparing arrays
      const imagesChanged =
        JSON.stringify(oldImages.sort()) !== JSON.stringify(newImages.sort());

      if (imagesChanged && oldImages.length > 0) {
        try {
          const uploadServiceUrl =
            process.env.UPLOAD_SERVICE_URL || "http://localhost:3006";
          const cleanupResponse = await fetch(
            `${uploadServiceUrl}/api/upload/menu-item/${itemId}/cleanup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.cookie || "", // Forward the auth cookie
              },
              body: JSON.stringify({
                oldImages: oldImages,
                newImages: newImages,
              }),
            }
          );

          if (!cleanupResponse.ok) {
            console.warn(
              `Failed to cleanup old images for menu item ${itemId}: ${cleanupResponse.status}`
            );
            // Continue with update even if image cleanup fails
          }
        } catch (error) {
          console.warn(
            `Error during image cleanup for menu item ${itemId}:`,
            error
          );
          // Continue with update even if image cleanup fails
        }
      }

      const updatedMenuItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: {
          name,
          description,
          preparationTime: parseInt(preparationTime),
          categoryId,
          images: images || [],
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          customizationOptions: {
            select: {
              id: true,
              name: true,
            },
          },
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
  }
);

// Delete menu item (protected endpoint)
router.delete("/items/:itemId", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;
    const { itemId } = req.params;

    // Check if menu item exists and belongs to the chef
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        chefId,
      },
    });

    if (!existingItem) {
      return sendErrorResponse(res, "Menu item not found", 404);
    }

    // Clean up associated images first
    try {
      const uploadServiceUrl =
        process.env.UPLOAD_SERVICE_URL || "http://localhost:3006";
      const cleanupResponse = await fetch(
        `${uploadServiceUrl}/api/upload/menu-item/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.cookie || "", // Forward the auth cookie
          },
        }
      );

      if (!cleanupResponse.ok) {
        console.warn(
          `Failed to cleanup images for menu item ${itemId}: ${cleanupResponse.status}`
        );
        // Continue with deletion even if image cleanup fails
      }
    } catch (error) {
      console.warn(
        `Error during image cleanup for menu item ${itemId}:`,
        error
      );
      // Continue with deletion even if image cleanup fails
    }

    // Delete the menu item from database
    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return sendSuccessResponse(res, {}, "Menu item deleted successfully");
  } catch (error) {
    console.error("Delete menu item error:", error);
    return sendErrorResponse(res, "Failed to delete menu item", 500);
  }
});

// Get customization options for a menu item (public endpoint)
router.get("/:itemId/customizations", async (req, res) => {
  try {
    const { itemId } = req.params;

    const customizationOptions = await prisma.customizationOption.findMany({
      where: { menuItemId: itemId },
      orderBy: { createdAt: "asc" },
    });

    return sendSuccessResponse(
      res,
      { customizationOptions },
      "Customization options retrieved successfully"
    );
  } catch (error) {
    console.error("Get customization options error:", error);
    return sendErrorResponse(
      res,
      "Failed to retrieve customization options",
      500
    );
  }
});

// Create customization option (protected endpoint)
router.post(
  "/:itemId/customizations",
  authenticateChef,
  validateRequest(customizationOptionSchema),
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { itemId } = req.params;
      const { name } = req.body;

      // Verify menu item exists and belongs to the chef
      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: itemId,
          chefId,
        },
      });

      if (!menuItem) {
        return sendErrorResponse(res, "Menu item not found", 404);
      }

      const customizationOption = await prisma.customizationOption.create({
        data: {
          name,
          menuItemId: itemId,
        },
      });

      return sendSuccessResponse(
        res,
        { customizationOption },
        "Customization option created successfully",
        201
      );
    } catch (error) {
      console.error("Create customization option error:", error);
      return sendErrorResponse(
        res,
        "Failed to create customization option",
        500
      );
    }
  }
);

// Delete customization option (protected endpoint)
router.delete(
  "/:itemId/customizations/:optionId",
  authenticateChef,
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { itemId, optionId } = req.params;

      // Verify menu item exists and belongs to the chef
      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: itemId,
          chefId,
        },
      });

      if (!menuItem) {
        return sendErrorResponse(res, "Menu item not found", 404);
      }

      // Check if customization option exists
      const existingOption = await prisma.customizationOption.findFirst({
        where: {
          id: optionId,
          menuItemId: itemId,
        },
      });

      if (!existingOption) {
        return sendErrorResponse(res, "Customization option not found", 404);
      }

      await prisma.customizationOption.delete({
        where: { id: optionId },
      });

      return sendSuccessResponse(
        res,
        {},
        "Customization option deleted successfully"
      );
    } catch (error) {
      console.error("Delete customization option error:", error);
      return sendErrorResponse(
        res,
        "Failed to delete customization option",
        500
      );
    }
  }
);

export default router;
