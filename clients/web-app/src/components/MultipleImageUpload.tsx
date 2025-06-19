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
      onImageError?.(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 5MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      onImageError?.(errors.join(", "));
      return;
    }

    // Process valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        const imageId = Math.random().toString(36).substring(7);

        const newImageData: ImageData = {
          file,
          previewUrl,
          id: imageId,
        };

        setPreviewImages((prev) => [...prev, newImageData]);
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Display existing images */}
          {displayImages.map((imageUrl, index) => (
            <div key={`display-${index}`} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={
                    imageUrl.startsWith("http") || imageUrl.startsWith("data:")
                      ? imageUrl
                      : `${
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:3000"
                        }${imageUrl}`
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                )}
                {/* New image indicator */}
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  New
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />

          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="flex flex-col items-center justify-center w-full text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
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
              Click to select multiple images • Max {maxImages} images • 5MB
              each
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
              <span className="text-blue-600 ml-2">
                • Changes will be saved when you save the menu item
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
