"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ui/ImageUpload";

export default function ChefSignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    name: "",
    bio: "",
    secret: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8 || password.length > 32) {
      return "Password must be between 8-32 characters";
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      return "Password must contain both letters and numbers";
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Required field validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    }

    if (!formData.secret.trim()) {
      newErrors.secret = "Secret is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username,
            name: formData.name,
            bio: formData.bio,
            secret: formData.secret,
          }),
        },
      );

      if (response.ok) {
        // If registration successful and has image file, upload it
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
              },
            );

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              const imageUrl = uploadData?.data?.imageUrl;

              if (typeof imageUrl !== "string") {
                throw new Error("Upload response did not include an image URL");
              }

              const profileResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({ image: imageUrl }),
                },
              );

              if (!profileResponse.ok) {
                throw new Error("Failed to save profile image URL");
              }
            } else {
              console.warn(
                "Failed to upload profile image:",
                await uploadResponse.text(),
              );
            }
          } catch (imageError) {
            console.warn("Failed to upload profile image:", imageError);
            // Don't block the registration flow for image upload errors
          }
        }

        router.push("/chef/dashboard");
      } else {
        const errorData = await response.json();
        if (errorData.field) {
          setErrors({
            [errorData.field]: errorData.message || errorData.error,
          });
        } else {
          setErrors({
            general: errorData.message || errorData.error || "Sign up failed",
          });
        }
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleImageChange = (
    imageData: { file: File; previewUrl: string } | string | null,
  ) => {
    if (imageData && typeof imageData === "object" && "file" in imageData) {
      // New file selected - store file for later upload and preview URL for display
      setImageFile(imageData.file);
      setFormData({
        ...formData,
        image: imageData.previewUrl,
      });
    } else if (typeof imageData === "string") {
      // Existing image URL (for compatibility)
      setImageFile(null);
      setFormData({
        ...formData,
        image: imageData,
      });
    } else {
      // Null/cleared
      setImageFile(null);
      setFormData({
        ...formData,
        image: "",
      });
    }

    // Clear image error if any
    if (errors.image) {
      setErrors({
        ...errors,
        image: "",
      });
    }
  };

  const handleImageError = (error: string) => {
    setErrors({
      ...errors,
      image: error,
    });
  };

  return (
    <div className="flex min-h-[calc(100svh-var(--fc-header-height))] items-center justify-center bg-gray-50 px-[var(--fc-page-gutter)] py-8 sm:py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Become a Host
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our platform and start sharing your culinary creations
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <ImageUpload
                currentImage={formData.image}
                onImageChange={handleImageChange}
                onImageError={handleImageError}
                disabled={loading}
                size="large"
                uploadMode="deferred"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

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
                required
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.bio ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Tell us about yourself and your cooking style"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="8-32 characters with letters and numbers"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be 8-32 characters and contain both letters and
                numbers
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="secret"
                className="block text-sm font-medium text-gray-700"
              >
                Menu Access Secret *
              </label>
              <input
                id="secret"
                name="secret"
                type="text"
                required
                value={formData.secret}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.secret ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="A unique code guests will use to access your menu"
              />
              {errors.secret && (
                <p className="mt-1 text-sm text-red-600">{errors.secret}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This secret code will be shared with guests to access your menu
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="fc-touch-target group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Host Account"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/chef/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
