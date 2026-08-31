"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (
    imageData: { file: File; previewUrl: string } | string | null,
  ) => void;
  onImageError?: (error: string) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  allowDelete?: boolean;
  uploadMode?: "immediate" | "deferred"; // New prop to control when to upload
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  onImageError,
  disabled = false,
  size = "medium",
  allowDelete = false,
  uploadMode = "immediate",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external currentImage prop
  useEffect(() => {
    setPreviewUrl(currentImage || null);
  }, [currentImage]);

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onImageError?.("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onImageError?.("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setPreviewUrl(previewUrl);

      // For deferred mode, pass file and preview to parent
      // For immediate mode, upload immediately
      if (uploadMode === "deferred") {
        onImageChange({ file, previewUrl });
      } else {
        uploadImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Use chef-profile endpoint for immediate uploads
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/upload/chef-profile`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${data.data.imageUrl}`;
        onImageChange(imageUrl);
      } else {
        const errorData = await response.json();
        onImageError?.(errorData.message || "Failed to upload image");
        setPreviewUrl(currentImage || null);
      }
    } catch (error) {
      onImageError?.("Network error. Please try again.");
      setPreviewUrl(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`${
            sizeClasses[size]
          } relative rounded-full overflow-hidden border-4 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 ${
            disabled || uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleClick}
        >
          {previewUrl ? (
            <Image
              src={
                previewUrl.startsWith("http") || previewUrl.startsWith("data:")
                  ? previewUrl
                  : `${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
                    }${previewUrl}`
              }
              alt="Profile preview"
              fill
              sizes="(max-width: 768px) 128px, 128px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {allowDelete && previewUrl && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="fc-touch-target absolute -right-3 -top-3 flex items-center justify-center rounded-full bg-red-500 text-sm text-white transition-colors hover:bg-red-600"
            aria-label="Remove image"
          >
            ×
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || uploading}
          className="fc-touch-target px-3 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Uploading..."
            : previewUrl
              ? "Change Image"
              : "Add Image"}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          {allowDelete
            ? "Optional • Max 5MB • JPG, PNG, GIF"
            : "Max 5MB • JPG, PNG, GIF"}
        </p>
      </div>
    </div>
  );
}
