"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ui/ImageUpload";
import Toast from "@/components/ui/Toast";

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
      <div className="fc-loading" role="status">
        <span className="fc-spinner" aria-hidden="true" />
        Loading settings
      </div>
    );
  }

  if (error && !chef) {
    return (
      <div className="fc-shell fc-page">
        <div className="fc-panel fc-empty">
          <h1 className="fc-empty-title">We couldn&rsquo;t load your profile</h1>
          <p className="fc-empty-body">{error}</p>
          <div className="fc-empty-actions">
            <button
              onClick={fetchChefProfile}
              className="fc-button fc-button-primary"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chef) return null;

  return (
    <div className="fc-shell fc-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="fc-page-header">
        <div className="min-w-0">
          <p className="fc-eyebrow">Host settings</p>
          <h1 className="fc-page-title">
            Your <em>profile</em>
          </h1>
          <p className="fc-page-lead">
            This is what guests see before they open your menu, plus the secret
            that lets them in.
          </p>
        </div>
        <div className="fc-page-actions">
          <Link href="/chef/dashboard" className="fc-button fc-button-secondary">
            &larr; Back to dashboard
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <section className="fc-panel">
          <div className="fc-panel-header">
            <div>
              <h2 className="fc-panel-title">Profile information</h2>
              <p className="fc-panel-sub">
                Name, bio, and picture &mdash; the things guests read first.
              </p>
            </div>
          </div>

          <div className="fc-panel-body">
            {error && (
              <p className="fc-feedback fc-feedback-danger mb-6 text-sm">
                {error}
              </p>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className="fc-field">
                  <label className="fc-label" htmlFor="settings-email">
                    Email address
                    <span className="fc-label-note">Locked</span>
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={chef.email}
                    disabled
                    className="fc-control px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="fc-field">
                  <label className="fc-label" htmlFor="settings-username">
                    Username
                    <span className="fc-label-note">Locked</span>
                  </label>
                  <input
                    id="settings-username"
                    type="text"
                    value={chef.username}
                    disabled
                    className="fc-control px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="fc-field">
                  <label htmlFor="name" className="fc-label">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`fc-control px-3 py-2.5 text-sm ${
                      formErrors.name ? "fc-control-error" : ""
                    }`}
                    aria-invalid={Boolean(formErrors.name)}
                    placeholder="The name on your menu"
                  />
                  {formErrors.name && (
                    <p className="fc-error-text">{formErrors.name}</p>
                  )}
                </div>

                <div className="fc-field">
                  <label htmlFor="bio" className="fc-label">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className={`fc-control px-3 py-2.5 text-sm ${
                      formErrors.bio ? "fc-control-error" : ""
                    }`}
                    aria-invalid={Boolean(formErrors.bio)}
                    placeholder="What you cook, and who you cook it for"
                  />
                  {formErrors.bio && (
                    <p className="fc-error-text">{formErrors.bio}</p>
                  )}
                </div>

                <div className="fc-field">
                  <label htmlFor="secret" className="fc-label">
                    Menu access secret
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      id="secret"
                      name="secret"
                      value={formData.secret}
                      onChange={handleInputChange}
                      className={`fc-control px-3 py-2.5 font-mono text-sm sm:flex-1 ${
                        formErrors.secret ? "fc-control-error" : ""
                      }`}
                      aria-invalid={Boolean(formErrors.secret)}
                      placeholder="supper-club-42"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={copySecret}
                        className="fc-button fc-button-secondary flex-1 text-sm sm:flex-none"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={generateNewSecret}
                        className="fc-button fc-button-secondary flex-1 text-sm sm:flex-none"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  {formErrors.secret ? (
                    <p className="fc-error-text">{formErrors.secret}</p>
                  ) : (
                    <p className="fc-hint">
                      At least 8 characters. Changing it locks out anyone using
                      the old one.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="fc-field">
                  <span className="fc-label">Profile picture</span>
                  <div className="fc-card">
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
                      <p className="fc-error-text">{imageError}</p>
                    )}
                    <p className="fc-hint">
                      A new image previews here and is saved with the rest of
                      the form.
                    </p>
                  </div>
                </div>

                <dl className="fc-stat-grid mt-6">
                  <div>
                    <dt className="fc-stat-label">Rating</dt>
                    <dd className="fc-stat-value">
                      {chef.rating.toFixed(1)}{" "}
                      <span className="text-text-subtle">
                        from {chef.ratingCount}{" "}
                        {chef.ratingCount === 1 ? "review" : "reviews"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="fc-stat-label">Hosting since</dt>
                    <dd className="fc-stat-value">
                      {new Date(chef.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="fc-panel-footer flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-sm text-text-muted">
              {hasChanges()
                ? "You have unsaved changes."
                : "Everything is saved."}
            </p>
            <button
              type="submit"
              disabled={updatingProfile || !hasChanges()}
              className="fc-button fc-button-primary"
            >
              {updatingProfile ? "Saving..." : "Save changes"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
