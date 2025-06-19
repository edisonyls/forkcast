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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
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

      // Process image with Sharp: resize, optimize, and convert to JPG
      await sharp(req.file.buffer)
        .resize(400, 400, {
          fit: "cover",
          position: "center",
        })
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

      // Clear existing images first
      const existingFiles = fs
        .readdirSync(menuItemDir)
        .filter(
          (file) =>
            file.endsWith(".jpg") ||
            file.endsWith(".jpeg") ||
            file.endsWith(".png")
        );
      existingFiles.forEach((file) => {
        fs.unlinkSync(path.join(menuItemDir, file));
      });

      const uploadedImages: string[] = [];

      // Process each uploaded image
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `image${i + 1}.jpg`; // image1.jpg, image2.jpg, etc.
        const filePath = path.join(menuItemDir, fileName);

        // Process image with Sharp: resize, optimize, and convert to JPG
        await sharp(file.buffer)
          .resize(800, 600, {
            fit: "cover",
            position: "center",
          })
          .jpeg({
            quality: 85,
            progressive: true,
          })
          .toFile(filePath);

        // Generate the URL with cache busting
        const imageUrl = `/uploads/${chefId}/food/${menuItemId}/${fileName}?t=${Date.now()}`;
        uploadedImages.push(imageUrl);
      }

      return sendSuccessResponse(
        res,
        {
          imageUrls: uploadedImages,
          count: uploadedImages.length,
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

export default router;
