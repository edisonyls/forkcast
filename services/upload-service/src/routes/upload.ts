import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import {
  authenticateChef,
  sendSuccessResponse,
  sendErrorResponse,
} from "@forkcast/shared";

const router = express.Router();

// Use absolute path for uploads directory to match Docker volume mount
const uploadsDir = "/app/uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to create chef profile directory
const createChefProfileDirectory = (chefId: string): string => {
  const chefProfileDir = path.join(uploadsDir, chefId, "profile");
  if (!fs.existsSync(chefProfileDir)) {
    fs.mkdirSync(chefProfileDir, { recursive: true });
  }
  return chefProfileDir;
};

const createMenuItemDirectory = (
  chefId: string,
  menuItemId: string
): string => {
  const menuItemDir = path.join(uploadsDir, chefId, "food", menuItemId);
  if (!fs.existsSync(menuItemDir)) {
    fs.mkdirSync(menuItemDir, { recursive: true });
  }
  return menuItemDir;
};

// Configure multer for memory storage (we'll process and save manually)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload image for registration (public endpoint)

// Upload chef profile image (protected endpoint)
router.post(
  "/chef-profile",
  authenticateChef,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return sendErrorResponse(res, "No image file provided", 400);
      }

      const chefId = req.chef!.chefId;

      // Create chef profile directory
      const chefProfileDir = createChefProfileDirectory(chefId);

      // Always save as profile.png (converted to jpg internally)
      const fileName = "profile.jpg";
      const filePath = path.join(chefProfileDir, fileName);

      // Remove existing profile image if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Process image with Sharp: resize to fit within bounds, maintain aspect ratio
      await sharp(req.file.buffer)
        .resize(400, 400, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background for transparency
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toFile(filePath);

      // Generate the URL that will be accessible via the static file server
      // Add timestamp for cache busting since we always use the same filename
      const imageUrl = `/uploads/${chefId}/profile/${fileName}?t=${Date.now()}`;

      return sendSuccessResponse(
        res,
        { imageUrl },
        "Image uploaded successfully"
      );
    } catch (error) {
      console.error("Image upload error:", error);
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return sendErrorResponse(
            res,
            "File size too large. Maximum 5MB allowed.",
            400
          );
        }
      }
      return sendErrorResponse(res, "Failed to upload image", 500);
    }
  }
);

// Upload menu item images (protected endpoint)
router.post(
  "/menu-item/:menuItemId",
  authenticateChef,
  upload.array("images", 10), // Allow up to 10 images
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return sendErrorResponse(res, "No image files provided", 400);
      }

      const chefId = req.chef!.chefId;
      const { menuItemId } = req.params;

      if (!menuItemId) {
        return sendErrorResponse(res, "Menu item ID is required", 400);
      }

      // Create menu item directory
      const menuItemDir = createMenuItemDirectory(chefId, menuItemId);

      // Find existing images to determine starting index for new images
      const existingFiles = fs
        .readdirSync(menuItemDir)
        .filter(
          (file) =>
            file.endsWith(".jpg") ||
            file.endsWith(".jpeg") ||
            file.endsWith(".png")
        );

      // Only return the newly uploaded images, not existing ones
      const newlyUploadedImages: string[] = [];

      // Process each uploaded image, starting from the next available index
      const startIndex = existingFiles.length;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `image${startIndex + i + 1}.jpg`; // Continue numbering from existing images
        const filePath = path.join(menuItemDir, fileName);

        // Process image with Sharp: resize to fit within bounds, maintain aspect ratio
        await sharp(file.buffer)
          .resize(800, 600, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background for transparency
          .jpeg({
            quality: 85,
            progressive: true,
          })
          .toFile(filePath);

        // Generate the URL with cache busting for newly uploaded image only
        const imageUrl = `/uploads/${chefId}/food/${menuItemId}/${fileName}?t=${Date.now()}`;
        newlyUploadedImages.push(imageUrl);
      }

      return sendSuccessResponse(
        res,
        {
          imageUrls: newlyUploadedImages,
          count: newlyUploadedImages.length,
        },
        "Menu item images uploaded successfully"
      );
    } catch (error) {
      console.error("Menu item image upload error:", error);
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return sendErrorResponse(
            res,
            "File size too large. Maximum 5MB per image allowed.",
            400
          );
        }
        if (error.code === "LIMIT_FILE_COUNT") {
          return sendErrorResponse(
            res,
            "Too many files. Maximum 10 images allowed.",
            400
          );
        }
      }
      return sendErrorResponse(res, "Failed to upload menu item images", 500);
    }
  }
);

// Delete chef profile image (protected endpoint)
router.delete("/chef-profile", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;
    const fileName = "profile.jpg";
    const filePath = path.join(uploadsDir, chefId, "profile", fileName);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return sendSuccessResponse(res, {}, "Image deleted successfully");
    } else {
      return sendErrorResponse(res, "Image not found", 404);
    }
  } catch (error) {
    console.error("Image deletion error:", error);
    return sendErrorResponse(res, "Failed to delete image", 500);
  }
});

// Delete menu item images (protected endpoint)
router.delete("/menu-item/:menuItemId", authenticateChef, async (req, res) => {
  try {
    const chefId = req.chef!.chefId;
    const { menuItemId } = req.params;

    if (!menuItemId) {
      return sendErrorResponse(res, "Menu item ID is required", 400);
    }

    const menuItemDir = path.join(uploadsDir, chefId, "food", menuItemId);

    // Check if directory exists
    if (fs.existsSync(menuItemDir)) {
      // Remove all files in the directory
      const files = fs.readdirSync(menuItemDir);
      files.forEach((file) => {
        fs.unlinkSync(path.join(menuItemDir, file));
      });

      // Remove the directory itself
      fs.rmdirSync(menuItemDir);

      return sendSuccessResponse(
        res,
        {},
        "Menu item images deleted successfully"
      );
    } else {
      return sendSuccessResponse(res, {}, "No images found to delete");
    }
  } catch (error) {
    console.error("Menu item image deletion error:", error);
    return sendErrorResponse(res, "Failed to delete menu item images", 500);
  }
});

// Cleanup old menu item images when updating (protected endpoint)
router.post(
  "/menu-item/:menuItemId/cleanup",
  authenticateChef,
  async (req, res) => {
    try {
      const chefId = req.chef!.chefId;
      const { menuItemId } = req.params;
      const { oldImages, newImages } = req.body;

      if (!menuItemId) {
        return sendErrorResponse(res, "Menu item ID is required", 400);
      }

      const menuItemDir = path.join(uploadsDir, chefId, "food", menuItemId);

      // If all images are removed, delete the entire directory
      if (!newImages || newImages.length === 0) {
        if (fs.existsSync(menuItemDir)) {
          const files = fs.readdirSync(menuItemDir);
          files.forEach((file) => {
            fs.unlinkSync(path.join(menuItemDir, file));
          });
          fs.rmdirSync(menuItemDir);
        }
        return sendSuccessResponse(
          res,
          {},
          "All images cleaned up successfully"
        );
      }

      // Otherwise, only delete images that are no longer needed
      const oldImageFilenames = oldImages
        .map((url: string) => {
          const match = url.match(/\/([^\/\?]+)\?/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      const newImageFilenames = newImages
        .map((url: string) => {
          const match = url.match(/\/([^\/\?]+)\?/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      // Delete images that are in old but not in new
      const imagesToDelete = oldImageFilenames.filter(
        (filename: string) => !newImageFilenames.includes(filename)
      );

      imagesToDelete.forEach((filename: string) => {
        const filePath = path.join(menuItemDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      return sendSuccessResponse(
        res,
        { deletedCount: imagesToDelete.length },
        "Old images cleaned up successfully"
      );
    } catch (error) {
      console.error("Menu item image cleanup error:", error);
      return sendErrorResponse(res, "Failed to cleanup menu item images", 500);
    }
  }
);

export default router;
