"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import Toast from "@/components/Toast";

interface Chef {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  secret: string;
  rating: number;
  ratingCount: number;
  image?: string;
  createdAt: string;
}

interface ToastData {
  message: string;
  type: "success" | "info" | "error";
}

export default function ChefSettings() {
  const router = useRouter();
  const [chef, setChef] = useState<Chef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    secret: "",
    image: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchChefProfile();
  }, [router]);

  const fetchChefProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const chefData = data.data.chef;
        setChef(chefData);
        setFormData({
          name: chefData.name,
          bio: chefData.bio,
          secret: chefData.secret,
          image: chefData.image || "",
        });
      } else if (response.status === 401) {
        router.push("/chef/signin");
      } else {
        setError("Failed to load profile. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching chef profile:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePreview = (
    imageData: { file: File; previewUrl: string } | string | null
  ) => {
    if (imageData && typeof imageData === "object" && "file" in imageData) {
      // New file selected - store file for later upload and preview URL for display
      setImageFile(imageData.file);
      setPreviewImage(imageData.previewUrl);
    } else if (typeof imageData === "string") {
      // Existing image URL (for compatibility)
      setImageFile(null);
      setPreviewImage(imageData);
    } else {
      // Null/cleared
      setImageFile(null);
      setPreviewImage(null);
    }
    setImageError(null);
  };

  const handleImageError = (error: string) => {
    setImageError(error);
    setPreviewImage(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateNewSecret = () => {
    const newSecret =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setFormData((prev) => ({ ...prev, secret: newSecret }));
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(formData.secret);
      setToast({ message: "Secret copied to clipboard!", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to copy secret", type: "error" });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.bio.trim()) {
      errors.bio = "Bio is required";
    }

    if (!formData.secret.trim()) {
      errors.secret = "Menu access secret is required";
    } else if (formData.secret.length < 8) {
      errors.secret = "Secret must be at least 8 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdatingProfile(true);
    setError(null);

    try {
      let finalImageUrl = chef?.image;

      // If there's a new image file, upload it first
      if (imageFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("image", imageFile);

          const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/upload/chef-profile`,
            {
              method: "POST",
              credentials: "include",
              body: imageFormData,
            }
          );

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            finalImageUrl = uploadData.data.imageUrl;
          } else {
            throw new Error("Failed to upload image");
          }
        } catch (imageError) {
          console.error("Image upload error:", imageError);
          setError("Failed to upload image. Please try again.");
          setUpdatingProfile(false);
          return;
        }
      }

      // Update profile data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            bio: formData.bio,
            secret: formData.secret,
            image: finalImageUrl,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChef(data.data.chef);
        setPreviewImage(null); // Clear preview after successful save
        setImageFile(null); // Clear image file after successful save
        setToast({ message: "Profile updated successfully!", type: "success" });

        // Force refresh profile data to get latest image URL with cache-busting
        setTimeout(() => {
          fetchChefProfile();
        }, 500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An error occurred while updating your profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const hasChanges = () => {
    if (!chef) return false;
    return (
      formData.name !== chef.name ||
      formData.bio !== chef.bio ||
      formData.secret !== chef.secret ||
      imageFile !== null
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !chef) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchChefProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chef) return null;

  return (
    <div className="bg-gray-50 py-4 sm:py-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Settings
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage your profile and preferences
              </p>
            </div>
            <Link
              href="/chef/dashboard"
              className="bg-gray-600 text-white px-4 py-3 sm:py-2 rounded-md hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your profile details and profile picture
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column - Form */}
                <div className="space-y-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={chef.email}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Username (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      value={chef.username}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Username cannot be changed
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio *
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.bio ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Tell customers about yourself and your cooking style..."
                    />
                    {formErrors.bio && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.bio}
                      </p>
                    )}
                  </div>

                  {/* Menu Access Secret */}
                  <div>
                    <label
                      htmlFor="secret"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Menu Access Secret *
                    </label>
                    <div className="mt-1">
                      <div className="sm:flex sm:space-x-0">
                        <input
                          type="text"
                          id="secret"
                          name="secret"
                          value={formData.secret}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md sm:rounded-l-md sm:rounded-r-none shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm sm:flex-1 ${
                            formErrors.secret
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter menu access secret"
                        />
                        <div className="flex space-x-2 sm:space-x-0 mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={copySecret}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 sm:border-l-0 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-md sm:rounded-none font-medium"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={generateNewSecret}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 sm:border-l-0 rounded-md sm:rounded-l-none sm:rounded-r-md bg-blue-100 hover:bg-blue-200 text-sm text-blue-700 font-medium"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                    {formErrors.secret && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.secret}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Share this secret with guests to access your menu. Must be
                      at least 8 characters.
                    </p>
                  </div>
                </div>

                {/* Right Column - Profile Picture */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Profile Picture
                    </label>

                    {/* Current Image Display */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="inline-block">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-200 mx-auto">
                          <Image
                            src={
                              chef.image &&
                              !chef.image.startsWith("http") &&
                              !chef.image.startsWith("data:") &&
                              !chef.image.startsWith("/user.png")
                                ? `${
                                    process.env.NEXT_PUBLIC_API_URL ||
                                    "http://localhost:3000"
                                  }${chef.image}`
                                : chef.image || "/user.png"
                            }
                            alt={chef.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      <ImageUpload
                        currentImage={previewImage || chef.image}
                        onImageChange={handleImagePreview}
                        onImageError={handleImageError}
                        disabled={updatingProfile}
                        size="large"
                        allowDelete={false}
                        uploadMode="deferred"
                      />
                      {imageError && (
                        <p className="mt-2 text-sm text-red-600">
                          {imageError}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Upload a new image to see a preview. Changes will be
                        saved when you click "Save Changes".
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Profile Stats
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="font-medium sm:font-normal">
                            Rating:
                          </span>
                          <span>
                            {chef.rating.toFixed(1)} ⭐ ({chef.ratingCount}{" "}
                            reviews)
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="font-medium sm:font-normal">
                            Member since:
                          </span>
                          <span>
                            {new Date(chef.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    {hasChanges() && (
                      <p className="text-sm text-orange-600">
                        You have unsaved changes
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={updatingProfile || !hasChanges()}
                    className="bg-blue-600 text-white px-6 py-3 sm:py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-center"
                  >
                    {updatingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
