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
          } fc-avatar relative cursor-pointer transition-colors duration-200 hover:border-brand-ink ${
            disabled || uploading ? "cursor-not-allowed opacity-50" : ""
          }`}
          onClick={handleClick}
        >
          {previewUrl ? (
            <Image
              src={
                previewUrl.startsWith("http") || previewUrl.startsWith("data:")
                  ? previewUrl
                  : `${process.env.NEXT_PUBLIC_API_URL}${previewUrl}`
              }
              alt="Profile preview"
              fill
              sizes="(max-width: 768px) 128px, 128px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-surface-muted">
              <span className="fc-stat-label m-0">Photo</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-ink/55">
              <span className="fc-spinner h-5 w-5 border-text-inverse/40 border-t-brand" />
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
            className="fc-icon-button fc-icon-button-danger absolute -right-3 -top-3 text-sm"
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
          className="fc-button fc-button-secondary px-3 text-sm"
        >
          {uploading
            ? "Uploading..."
            : previewUrl
              ? "Change image"
              : "Add image"}
        </button>
        <p className="fc-hint">
          {allowDelete
            ? "Optional \u00b7 max 5MB \u00b7 JPG, PNG, GIF"
            : "Max 5MB \u00b7 JPG, PNG, GIF"}
        </p>
      </div>
    </div>
  );
}
