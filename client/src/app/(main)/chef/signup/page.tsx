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
    <div className="fc-auth-page flex min-h-[calc(100svh-var(--fc-header-height))] items-center justify-center px-[var(--fc-page-gutter)] py-8 sm:py-12">
      <div className="fc-auth-card w-full max-w-md">
        <p className="fc-eyebrow">Host sign up</p>
        <h1 className="fc-page-title text-[2rem] sm:text-[2.25rem]">
          Cook for people who <em>told you</em> what they want
        </h1>
        <p className="fc-page-lead">
          Set up a menu, share one secret, and let your guests order before you
          shop.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          {errors.general && (
            <p className="fc-feedback fc-feedback-danger mb-6 text-sm">
              {errors.general}
            </p>
          )}

          <div className="fc-field">
            <label htmlFor="email" className="fc-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 text-sm ${
                errors.email ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.email)}
              placeholder="you@example.com"
            />
            {errors.email && <p className="fc-error-text">{errors.email}</p>}
          </div>

          <div className="fc-field">
            <label htmlFor="username" className="fc-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 text-sm ${
                errors.username ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.username)}
              placeholder="How guests will find you"
            />
            {errors.username && (
              <p className="fc-error-text">{errors.username}</p>
            )}
          </div>

          <div className="fc-field">
            <label htmlFor="name" className="fc-label">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 text-sm ${
                errors.name ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.name)}
              placeholder="The name on your menu"
            />
            {errors.name && <p className="fc-error-text">{errors.name}</p>}
          </div>

          <div className="fc-field">
            <span className="fc-label">
              Profile picture
              <span className="fc-label-note">Optional</span>
            </span>
            <ImageUpload
              currentImage={formData.image}
              onImageChange={handleImageChange}
              onImageError={handleImageError}
              disabled={loading}
              size="large"
              uploadMode="deferred"
            />
            {errors.image && <p className="fc-error-text">{errors.image}</p>}
          </div>

          <div className="fc-field">
            <label htmlFor="bio" className="fc-label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              required
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 text-sm ${
                errors.bio ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.bio)}
              placeholder="What you cook, and who you cook it for"
            />
            {errors.bio && <p className="fc-error-text">{errors.bio}</p>}
          </div>

          <div className="fc-field">
            <label htmlFor="password" className="fc-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 text-sm ${
                errors.password ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.password)}
              placeholder="8-32 characters"
            />
            {errors.password ? (
              <p className="fc-error-text">{errors.password}</p>
            ) : (
              <p className="fc-hint">
                8&ndash;32 characters, with both letters and numbers.
              </p>
            )}
          </div>

          <div className="fc-field">
            <label htmlFor="confirmPassword" className="fc-label">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 text-sm ${
                errors.confirmPassword ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.confirmPassword)}
              placeholder="Type it once more"
            />
            {errors.confirmPassword && (
              <p className="fc-error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="fc-field">
            <label htmlFor="secret" className="fc-label">
              Menu access secret
            </label>
            <input
              id="secret"
              name="secret"
              type="text"
              required
              value={formData.secret}
              onChange={handleInputChange}
              className={`fc-control px-3 py-2.5 font-mono text-sm ${
                errors.secret ? "fc-control-error" : ""
              }`}
              aria-invalid={Boolean(errors.secret)}
              placeholder="supper-club-42"
            />
            {errors.secret ? (
              <p className="fc-error-text">{errors.secret}</p>
            ) : (
              <p className="fc-hint">
                The one code you share with guests to unlock your menu.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="fc-button fc-button-primary mt-7 w-full"
          >
            {loading ? "Creating account..." : "Create host account"}
          </button>

          <p className="mt-6 mb-0 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href="/chef/signin"
              className="font-semibold text-brand-ink underline underline-offset-4 hover:text-ink"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
