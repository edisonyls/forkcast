"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageData {
  file: File;
  previewUrl: string;
  id: string;
}

interface MultipleImageUploadProps {
  currentImages?: string[];
  onImagesChange: (imageData: ImageData[] | string[] | null) => void;
  onImageError?: (error: string) => void;
  disabled?: boolean;
  maxImages?: number;
  uploadMode?: "immediate" | "deferred";
}

// Accepted image formats
const ACCEPTED_IMAGE_FORMATS = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};

const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_IMAGE_FORMATS)
  .flat()
  .join(", ");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

export default function MultipleImageUpload({
  currentImages = [],
  onImagesChange,
  onImageError,
  disabled = false,
  maxImages = 10,
  uploadMode = "immediate",
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<ImageData[]>([]);
  const [displayImages, setDisplayImages] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with external currentImages prop
  useEffect(() => {
    if (currentImages.length > 0 && previewImages.length === 0) {
      setDisplayImages(currentImages);
    }
  }, [currentImages, previewImages.length]);

  // Notify parent when images change (for deferred mode)
  useEffect(() => {
    if (uploadMode === "deferred") {
      if (previewImages.length > 0) {
        // New files selected
        onImagesChange(previewImages);
      } else if (displayImages.length > 0) {
        // Only existing images
        onImagesChange(displayImages);
      } else {
        // No images
        onImagesChange(null);
      }
    }
  }, [previewImages, displayImages, uploadMode]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check max images limit
    const totalImages =
      previewImages.length + displayImages.length + files.length;
    if (totalImages > maxImages) {
      onImageError?.(
        `Maximum ${maxImages} images allowed. You can only add ${
          maxImages - previewImages.length - displayImages.length
        } more image(s).`,
      );
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];
    let totalSize = 0;

    // Calculate existing file sizes (approximate)
    totalSize += previewImages.reduce((sum, img) => sum + img.file.size, 0);

    files.forEach((file) => {
      // Validate file type
      const isValidType = Object.keys(ACCEPTED_IMAGE_FORMATS).includes(
        file.type,
      );
      if (!isValidType) {
        errors.push(
          `"${file.name}" is not a supported image format. Accepted formats: ${ACCEPTED_EXTENSIONS}`,
        );
        return;
      }

      // Validate individual file size
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        errors.push(
          `"${file.name}" is too large (${sizeMB}MB). Maximum size per image is 5MB.`,
        );
        return;
      }

      // Check total size
      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        errors.push(
          `Total size of all images exceeds 50MB limit. Please select fewer or smaller images.`,
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      onImageError?.(errors.join(" "));
      return;
    }

    // Process valid files
    const newImageData: ImageData[] = [];
    let processedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        const imageId = Math.random().toString(36).substring(7);

        newImageData.push({
          file,
          previewUrl,
          id: imageId,
        });

        processedCount++;
        if (processedCount === validFiles.length) {
          // All files processed, update state at once
          setPreviewImages((prev) => [...prev, ...newImageData]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePreviewImage = (imageId: string) => {
    setPreviewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeDisplayImage = (index: number) => {
    setDisplayImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const totalImages = previewImages.length + displayImages.length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      {/* Current/Preview Images Grid */}
      {(displayImages.length > 0 || previewImages.length > 0) && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Display existing images */}
          {displayImages.map((imageUrl, index) => (
            <div key={`display-${index}`} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={
                    imageUrl.startsWith("http") || imageUrl.startsWith("data:")
                      ? imageUrl
                      : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`
                  }
                  alt={`Menu item image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain bg-gray-50"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeDisplayImage(index)}
                    className="fc-icon-button fc-icon-button-danger absolute right-1 top-1 text-sm sm:right-2 sm:top-2"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Preview new images */}
          {previewImages.map((imageData) => (
            <div key={`preview-${imageData.id}`} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-blue-300">
                <Image
                  src={imageData.previewUrl}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain bg-gray-50"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removePreviewImage(imageData.id)}
                    className="fc-icon-button fc-icon-button-danger absolute right-1 top-1 text-sm sm:right-2 sm:top-2"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                )}
                {/* New image indicator */}
                <div className="fc-badge fc-badge-brand absolute bottom-2 left-2">
                  New
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400 sm:p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={Object.keys(ACCEPTED_IMAGE_FORMATS).join(",")}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />

          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="fc-touch-target flex w-full flex-col items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-soft hover:text-ink disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm font-medium">
              {uploading
                ? "Uploading..."
                : totalImages === 0
                  ? "Add Images"
                  : `Add More Images (${totalImages}/${maxImages})`}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Click or drag to select multiple images
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Accepted formats: {ACCEPTED_EXTENSIONS} • Max 5MB per image
            </span>
          </button>
        </div>
      )}

      {/* Info text */}
      <div className="text-center text-sm text-gray-500">
        {totalImages > 0 && (
          <p>
            {totalImages} of {maxImages} images selected
            {previewImages.length > 0 && uploadMode === "deferred" && (
              <span className="text-brand-ink ml-2">
                • Changes will be saved when you save the menu item
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
