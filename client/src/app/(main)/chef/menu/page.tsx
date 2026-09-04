"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MultipleImageUpload from "@/components/ui/MultipleImageUpload";

interface ImageData {
  file: File;
  previewUrl: string;
  id: string;
}

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

interface Category {
  id: string;
  name: string;
  chefId: string;
  createdAt: string;
  menuItems?: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  preparationTime: number;
  rating: number;
  ratingCount: number;
  images: string[];
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  customizationOptions?: {
    id: string;
    name: string;
  }[];
}

export default function MenuManagement() {
  const router = useRouter();
  const [chef, setChef] = useState<Chef | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Menu item form state
  const [menuItemForm, setMenuItemForm] = useState<{
    id: string;
    name: string;
    description: string;
    preparationTime: number | string;
    categoryId: string;
    images: string[];
    customizationOptions: { name: string }[];
  }>({
    id: "",
    name: "",
    description: "",
    preparationTime: 30,
    categoryId: "",
    images: [],
    customizationOptions: [],
  });
  const [menuItemImages, setMenuItemImages] = useState<ImageData[]>([]);
  const [menuItemLoading, setMenuItemLoading] = useState(false);
  const [isEditingMenuItem, setIsEditingMenuItem] = useState(false);

  // Dropdown state for menu items and categories
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");

  // Handle image changes for multiple upload
  const handleImagesChange = useCallback(
    (imageData: ImageData[] | string[] | null) => {
      if (imageData && Array.isArray(imageData) && imageData.length > 0) {
        if (typeof imageData[0] === "object" && "file" in imageData[0]) {
          // New image files selected
          setMenuItemImages(imageData as ImageData[]);
          // Don't clear existing images when editing - they should be preserved
        } else {
          // Existing image URLs (could be remaining images after removal)
          setMenuItemForm((prev) => ({
            ...prev,
            images: imageData as string[],
          }));
          // Clear new images if we're just dealing with existing ones
          setMenuItemImages([]);
        }
      } else {
        // Clear all images
        setMenuItemImages([]);
        setMenuItemForm((prev) => ({ ...prev, images: [] }));
      }
    },
    [],
  );

  const handleImageError = (error: string) => {
    setError(error);
  };

  useEffect(() => {
    // Fetch chef profile using secure authentication
    fetchChefProfile();
  }, [router]);

  const fetchChefProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "GET",
          credentials: "include", // Include cookies in the request
        },
      );

      if (response.ok) {
        const data = await response.json();
        const chefData = data.data.chef;
        setChef(chefData);
        fetchCategories(chefData.id);
        fetchMenuItems(chefData.id, chefData.secret);
      } else if (response.status === 401) {
        // Unauthorized - redirect to signin
        router.push("/chef/signin");
      } else {
        console.error("Failed to fetch chef profile");
        router.push("/chef/signin");
      }
    } catch (error) {
      console.error("Error fetching chef profile:", error);
      router.push("/chef/signin");
    }
  };

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
        setOpenCategoryDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCategories = async (chefId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories?chefId=${chefId}`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (chefId: string, secret?: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/menu/items?chefId=${chefId}&secret=${secret || chef?.secret}`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.data.menuItems || []);
      } else {
        console.error(
          "Failed to fetch menu items:",
          response.status,
          await response.text(),
        );
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chef || !categoryForm.name.trim()) return;

    setCategoryLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: categoryForm.name.trim(),
            chefId: chef.id,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const newCategory = data.data.category;
        setCategories([...categories, newCategory]);
        setCategoryForm({ id: "", name: "" });
        setIsEditingCategory(false);
        setShowCategoryModal(false);
        // Auto-select the new category
        setSelectedCategoryId(newCategory.id);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create category");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !chef ||
      !menuItemForm.name.trim() ||
      !menuItemForm.description.trim() ||
      !menuItemForm.categoryId
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setMenuItemLoading(true);
    setError("");

    // Ensure preparation time has a valid value
    const preparationTime =
      !menuItemForm.preparationTime ||
      isNaN(Number(menuItemForm.preparationTime))
        ? 30
        : Number(menuItemForm.preparationTime);

    try {
      // First create the menu item
      const requestBody = {
        name: menuItemForm.name,
        description: menuItemForm.description,
        preparationTime: preparationTime,
        categoryId: menuItemForm.categoryId,
        chefId: chef.id,
        images: [], // Start with empty array
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const newMenuItem = data.data.menuItem;

        // Upload images if any
        let finalImageUrls: string[] = [];
        if (menuItemImages.length > 0) {
          try {
            const imageFormData = new FormData();
            menuItemImages.forEach((imageData) => {
              imageFormData.append("images", imageData.file);
            });

            const imageResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/upload/menu-item/${newMenuItem.id}`,
              {
                method: "POST",
                credentials: "include",
                body: imageFormData,
              },
            );

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              finalImageUrls = imageData.data.imageUrls;
            } else {
              console.warn(
                "Failed to upload images:",
                await imageResponse.text(),
              );
            }
          } catch (imageError) {
            console.warn("Failed to upload images:", imageError);
            // Don't fail the menu item creation for image upload errors
          }
        }

        // Update menu item with image URLs if any were uploaded
        if (finalImageUrls.length > 0) {
          try {
            const updateResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items/${newMenuItem.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  ...requestBody,
                  images: finalImageUrls,
                }),
              },
            );

            if (updateResponse.ok) {
              // Successfully updated menu item with image URLs
            } else {
              const updateErrorData = await updateResponse.json();
              console.error(
                "Failed to update menu item with images:",
                updateErrorData,
              );
              setError(
                `Failed to save image URLs: ${
                  updateErrorData.error || "Unknown error"
                }`,
              );
            }
          } catch (updateError) {
            console.error(
              "Failed to update menu item with image URLs:",
              updateError,
            );
            setError("Failed to save image URLs to menu item");
          }
        }

        // Create customization options if any
        if (menuItemForm.customizationOptions.length > 0) {
          const validOptions = menuItemForm.customizationOptions.filter((opt) =>
            opt.name.trim(),
          );

          for (const option of validOptions) {
            try {
              const optionResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menu/${newMenuItem.id}/customizations`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    name: option.name.trim(),
                  }),
                },
              );

              if (!optionResponse.ok) {
                const errorData = await optionResponse.json();
                console.error(
                  "Failed to create customization option:",
                  errorData,
                );
                setError(
                  `Failed to create customization option "${option.name}": ${
                    errorData.error || "Unknown error"
                  }`,
                );
              } else {
                console.log(
                  `Successfully created customization option: ${option.name}`,
                );
              }
            } catch (error) {
              console.error("Failed to create customization option:", error);
              setError(
                `Failed to create customization option "${option.name}"`,
              );
            }
          }
        }

        // Refresh menu items to get the complete data
        await fetchMenuItems(chef.id, chef.secret);

        // Reset form
        setMenuItemForm({
          id: "",
          name: "",
          description: "",
          preparationTime: 30,
          categoryId: selectedCategoryId || "",
          images: [],
          customizationOptions: [],
        });
        setMenuItemImages([]);
        setShowMenuItemModal(false);
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(
              ([field, messages]: [string, any]) =>
                `${field}: ${messages.join(", ")}`,
            )
            .join("; ");
          setError(`Validation errors: ${errorMessages}`);
        } else {
          setError(errorData.error || "Failed to create menu item");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setMenuItemLoading(false);
    }
  };

  const handleMenuItemInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setMenuItemForm({
      ...menuItemForm,
      [name]:
        name === "preparationTime"
          ? value === ""
            ? ""
            : parseInt(value) || 30
          : value,
    });
  };

  const openMenuItemModal = (categoryId?: string) => {
    const targetCategoryId = categoryId || selectedCategoryId || "";
    setMenuItemForm({
      id: "",
      name: "",
      description: "",
      preparationTime: 30,
      categoryId: targetCategoryId,
      images: [],
      customizationOptions: [],
    });
    setMenuItemImages([]);
    setIsEditingMenuItem(false);
    setShowMenuItemModal(true);
    setError("");
  };

  const openEditMenuItemModal = async (item: MenuItem) => {
    setMenuItemForm({
      id: item.id,
      name: item.name,
      description: item.description,
      preparationTime: item.preparationTime,
      categoryId: item.categoryId,
      images: item.images || [],
      customizationOptions: [],
    });

    // Clear any previous new images, but existing images will be passed via currentImages prop
    setMenuItemImages([]);
    setIsEditingMenuItem(true);
    setShowMenuItemModal(true);
    setError("");

    // Load existing customization options
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/${item.id}/customizations`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        const existingOptions = data.data.customizationOptions || [];
        setMenuItemForm((prev) => ({
          ...prev,
          customizationOptions: existingOptions.map((opt: any) => ({
            name: opt.name,
          })),
        }));
      }
    } catch (error) {
      console.error("Failed to load customization options:", error);
    }
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !chef ||
      !menuItemForm.name.trim() ||
      !menuItemForm.description.trim() ||
      !menuItemForm.categoryId ||
      !menuItemForm.id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setMenuItemLoading(true);
    setError("");

    // Ensure preparation time has a valid value
    const preparationTime =
      !menuItemForm.preparationTime ||
      isNaN(Number(menuItemForm.preparationTime))
        ? 30
        : Number(menuItemForm.preparationTime);

    try {
      // Handle image uploads if there are new images
      let finalImageUrls: string[] = [];

      // Check if there are new images to upload
      const newImages = menuItemImages.filter((img) => img.file !== null);

      if (newImages.length > 0) {
        // Upload new images
        try {
          const imageFormData = new FormData();
          newImages.forEach((imageData) => {
            imageFormData.append("images", imageData.file);
          });

          const imageResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/upload/menu-item/${menuItemForm.id}`,
            {
              method: "POST",
              credentials: "include",
              body: imageFormData,
            },
          );

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            // Merge existing images (that weren't deleted) with newly uploaded images
            finalImageUrls = [
              ...menuItemForm.images,
              ...imageData.data.imageUrls,
            ];
          } else {
            console.warn(
              "Failed to upload images:",
              await imageResponse.text(),
            );
            // Continue with update even if image upload fails
            finalImageUrls = menuItemForm.images; // Keep existing images
          }
        } catch (imageError) {
          console.warn("Failed to upload images:", imageError);
          finalImageUrls = menuItemForm.images; // Keep existing images
        }
      } else {
        // No new images, use whatever is in the form (could be existing images or empty)
        finalImageUrls = menuItemForm.images;
      }

      const requestBody: any = {
        name: menuItemForm.name,
        description: menuItemForm.description,
        preparationTime: preparationTime,
        categoryId: menuItemForm.categoryId,
        chefId: chef.id,
        images: finalImageUrls,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items/${menuItemForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const updatedMenuItem = data.data.menuItem;

        // Update customization options
        try {
          // First, get existing options to compare
          const existingResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/menu/${menuItemForm.id}/customizations`,
            {
              credentials: "include",
            },
          );
          const existingData = existingResponse.ok
            ? await existingResponse.json()
            : { data: { customizationOptions: [] } };
          const existingOptions = existingData.data.customizationOptions || [];

          // Delete all existing options first (simpler approach)
          for (const option of existingOptions) {
            try {
              await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menu/${menuItemForm.id}/customizations/${option.id}`,
                {
                  method: "DELETE",
                  credentials: "include",
                },
              );
            } catch (error) {
              console.error("Failed to delete customization option:", error);
            }
          }

          // Create new options
          const validOptions = menuItemForm.customizationOptions.filter((opt) =>
            opt.name.trim(),
          );
          for (const option of validOptions) {
            try {
              const optionResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menu/${menuItemForm.id}/customizations`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    name: option.name.trim(),
                  }),
                },
              );

              if (!optionResponse.ok) {
                const errorData = await optionResponse.json();
                console.error(
                  "Failed to create customization option:",
                  errorData,
                );
                setError(
                  `Failed to create customization option "${option.name}": ${
                    errorData.error || "Unknown error"
                  }`,
                );
              }
            } catch (error) {
              console.error("Failed to create customization option:", error);
              setError(
                `Failed to create customization option "${option.name}"`,
              );
            }
          }
        } catch (error) {
          console.error("Failed to update customization options:", error);
        }

        // Refresh menu items to get the complete data including updated customization options
        await fetchMenuItems(chef.id, chef.secret);

        setMenuItemForm({
          id: "",
          name: "",
          description: "",
          preparationTime: 30,
          categoryId: selectedCategoryId || "",
          images: [],
          customizationOptions: [],
        });
        setMenuItemImages([]);
        setIsEditingMenuItem(false);
        setShowMenuItemModal(false);
      } else {
        const errorData = await response.json();
        // Show validation errors if available
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(
              ([field, messages]: [string, any]) =>
                `${field}: ${messages.join(", ")}`,
            )
            .join("; ");
          setError(`Validation errors: ${errorMessages}`);
        } else {
          setError(errorData.error || "Failed to update menu item");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setMenuItemLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        // Remove the menu item from the state
        setMenuItems(menuItems.filter((item) => item.id !== itemId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete menu item");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
    });
    setIsEditingCategory(true);
    setShowCategoryModal(true);
    setError("");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chef || !categoryForm.name.trim() || !categoryForm.id) {
      setError("Please fill in all required fields");
      return;
    }

    setCategoryLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: categoryForm.name.trim(),
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const updatedCategory = data.data.category;

        // Update the category in the state
        setCategories(
          categories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        );

        setCategoryForm({ id: "", name: "" });
        setIsEditingCategory(false);
        setShowCategoryModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update category");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if category has menu items
    const categoryHasItems = menuItems.some(
      (item) => item.categoryId === categoryId,
    );

    if (categoryHasItems) {
      setError(
        "Cannot delete category that contains menu items. Please delete all items first.",
      );
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        // Remove the category from the state
        setCategories(
          categories.filter((category) => category.id !== categoryId),
        );

        // If this was the selected category, select another one or null
        if (selectedCategoryId === categoryId) {
          const remainingCategories = categories.filter(
            (category) => category.id !== categoryId,
          );
          setSelectedCategoryId(
            remainingCategories.length > 0 ? remainingCategories[0].id : null,
          );
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );
  const filteredMenuItems = selectedCategoryId
    ? menuItems.filter((item) => item.categoryId === selectedCategoryId)
    : [];

  if (loading) {
    return (
      <div className="fc-loading" role="status">
        <span className="fc-spinner" aria-hidden="true" />
        Loading menu
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  const categoryActions = (category: Category, dropdownKey: string) => (
    <div className="relative dropdown-container">
      <button
        type="button"
        onClick={() =>
          setOpenCategoryDropdown(
            openCategoryDropdown === dropdownKey ? null : dropdownKey,
          )
        }
        className="fc-menu-trigger"
        aria-label={`Open actions for ${category.name}`}
        aria-haspopup="menu"
        aria-expanded={openCategoryDropdown === dropdownKey}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {openCategoryDropdown === dropdownKey && (
        <div className="fc-menu-panel absolute right-0 top-12 z-10 w-40" role="menu">
          <button
            onClick={() => {
              openEditCategoryModal(category);
              setOpenCategoryDropdown(null);
            }}
            className="fc-menu-item"
            role="menuitem"
          >
            Rename
          </button>
          <button
            onClick={() => {
              handleDeleteCategory(category.id);
              setOpenCategoryDropdown(null);
            }}
            className="fc-menu-item fc-menu-item-danger"
            role="menuitem"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fc-shell fc-page">
      <header className="fc-page-header">
        <div className="min-w-0">
          <p className="fc-eyebrow">Host menu</p>
          <h1 className="fc-page-title">
            What you&rsquo;re <em>offering</em>
          </h1>
          <p className="fc-page-lead">
            Group your dishes into categories. Guests browse them in the order
            you set here.
          </p>
        </div>
        <div className="fc-page-actions">
          <Link href="/chef/dashboard" className="fc-button fc-button-secondary">
            &larr; Dashboard
          </Link>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="fc-button fc-button-primary"
          >
            Add category
          </button>
        </div>
      </header>

      {error && (
        <p className="fc-feedback fc-feedback-danger mb-6 text-sm">{error}</p>
      )}

      {categories.length === 0 ? (
        <div className="fc-panel fc-empty">
          <h2 className="fc-empty-title">Start with a category</h2>
          <p className="fc-empty-body">
            Appetisers, mains, desserts &mdash; whatever suits the night. Dishes
            live inside categories.
          </p>
          <div className="fc-empty-actions">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="fc-button fc-button-primary"
            >
              Create your first category
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Desktop category rail */}
          <aside className="hidden lg:block lg:w-72 lg:shrink-0">
            <div className="fc-panel lg:sticky lg:top-6">
              <div className="fc-panel-header">
                <h2 className="fc-panel-title">Categories</h2>
                <p className="fc-stat-label m-0">{categories.length}</p>
              </div>
              <div className="fc-panel-body">
                <div className="fc-navlist">
                  {categories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    const itemCount = menuItems.filter(
                      (item) => item.categoryId === category.id,
                    ).length;

                    return (
                      <div
                        key={category.id}
                        className="flex items-center gap-1"
                      >
                        <button
                          onClick={() => setSelectedCategoryId(category.id)}
                          className="fc-navlist-item flex-1"
                          aria-current={isSelected}
                        >
                          <span className="block text-sm font-semibold text-ink">
                            {category.name}
                          </span>
                          <span className="fc-mono mt-0.5 block text-xs text-text-subtle">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </span>
                        </button>
                        {categoryActions(category, `rail-${category.id}`)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Items */}
          <div className="min-w-0 flex-1">
            {/* Mobile category picker */}
            <div className="fc-panel mb-6 lg:hidden">
              <div className="fc-panel-body">
                <div className="fc-field">
                  <label className="fc-label" htmlFor="mobile-category-select">
                    Category
                  </label>
                  <select
                    id="mobile-category-select"
                    value={selectedCategoryId || ""}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="fc-control px-3 py-2.5 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => {
                      const itemCount = menuItems.filter(
                        (item) => item.categoryId === category.id,
                      ).length;
                      return (
                        <option key={category.id} value={category.id}>
                          {category.name} ({itemCount})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedCategory && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEditCategoryModal(selectedCategory)}
                      className="fc-button fc-button-secondary flex-1 text-sm"
                    >
                      Rename category
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(selectedCategory.id)}
                      className="fc-button fc-button-danger-ghost flex-1 text-sm"
                    >
                      Delete category
                    </button>
                  </div>
                )}
              </div>
            </div>

            {selectedCategory ? (
              <section className="fc-panel">
                <div className="fc-panel-header">
                  <div>
                    <p className="fc-eyebrow">Category</p>
                    <h2 className="fc-panel-title">{selectedCategory.name}</h2>
                    <p className="fc-panel-sub">
                      {filteredMenuItems.length}{" "}
                      {filteredMenuItems.length === 1 ? "dish" : "dishes"}
                    </p>
                  </div>
                  <button
                    onClick={() => openMenuItemModal(selectedCategory.id)}
                    className="fc-button fc-button-primary"
                  >
                    Add dish
                  </button>
                </div>

                {filteredMenuItems.length === 0 ? (
                  <div className="fc-empty">
                    <h3 className="fc-empty-title">Nothing in here yet</h3>
                    <p className="fc-empty-body">
                      Add a dish so guests have something to choose from.
                    </p>
                    <div className="fc-empty-actions">
                      <button
                        onClick={() => openMenuItemModal(selectedCategory.id)}
                        className="fc-button fc-button-primary"
                      >
                        Add your first dish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="fc-panel-body">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredMenuItems.map((item) => (
                        <article key={item.id} className="fc-card relative">
                          <div className="absolute right-3 top-3">
                            <div className="relative dropdown-container">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === item.id ? null : item.id,
                                  )
                                }
                                className="fc-menu-trigger"
                                aria-label={`Open actions for ${item.name}`}
                                aria-haspopup="menu"
                                aria-expanded={openDropdownId === item.id}
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {openDropdownId === item.id && (
                                <div
                                  className="fc-menu-panel absolute right-0 top-12 z-10 w-40"
                                  role="menu"
                                >
                                  <button
                                    onClick={() => {
                                      openEditMenuItemModal(item);
                                      setOpenDropdownId(null);
                                    }}
                                    className="fc-menu-item"
                                    role="menuitem"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteMenuItem(item.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="fc-menu-item fc-menu-item-danger"
                                    role="menuitem"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {item.images && item.images.length > 0 && (
                            <div className="mb-4 grid grid-cols-2 gap-1 overflow-hidden rounded-[var(--fc-radius-control)]">
                              {item.images.slice(0, 4).map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={
                                    imageUrl.startsWith("http") ||
                                    imageUrl.startsWith("data:")
                                      ? imageUrl
                                      : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`
                                  }
                                  alt=""
                                  className={`w-full object-cover ${
                                    item.images.length === 1
                                      ? "col-span-2 h-32"
                                      : "h-20"
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          <h3 className="m-0 pr-10 text-base font-semibold tracking-[-0.02em] text-ink">
                            {item.name}
                          </h3>
                          <p className="mt-1.5 mb-0 line-clamp-2 text-sm leading-relaxed text-text-muted">
                            {item.description}
                          </p>

                          {item.customizationOptions &&
                            item.customizationOptions.length > 0 && (
                              <div className="mt-3">
                                <span className="fc-stat-label">
                                  Customisations
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.customizationOptions.map((option) => (
                                    <span key={option.id} className="fc-chip">
                                      {option.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <p className="fc-meta mt-4">
                            <span>{item.preparationTime} min</span>
                            <span>
                              &#9733; {item.rating} ({item.ratingCount})
                            </span>
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <div className="fc-panel fc-empty">
                <h2 className="fc-empty-title">Pick a category</h2>
                <p className="fc-empty-body">
                  Choose a category to see and edit the dishes inside it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category modal */}
      {showCategoryModal && (
        <div className="fc-dialog-backdrop" role="presentation">
          <div
            className="fc-dialog max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="fc-dialog-header">
              <div>
                <p className="fc-eyebrow">Category</p>
                <h2 id="category-modal-title" className="fc-dialog-title">
                  {isEditingCategory ? "Rename category" : "New category"}
                </h2>
              </div>
            </div>

            <form
              id="category-form"
              onSubmit={
                isEditingCategory ? handleUpdateCategory : handleCreateCategory
              }
            >
              <div className="fc-dialog-body">
                <div className="fc-field">
                  <label htmlFor="categoryName" className="fc-label">
                    Category name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    className="fc-control px-3 py-2.5 text-sm"
                    placeholder="Appetisers, mains, desserts"
                    autoFocus
                    required
                  />
                </div>
              </div>
            </form>

            <div className="fc-dialog-footer fc-dialog-footer-split">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryForm({ id: "", name: "" });
                  setIsEditingCategory(false);
                  setError("");
                }}
                className="fc-button fc-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="category-form"
                disabled={categoryLoading}
                className="fc-button fc-button-primary"
              >
                {categoryLoading
                  ? "Saving..."
                  : isEditingCategory
                    ? "Save category"
                    : "Create category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu item modal */}
      {showMenuItemModal && (
        <div className="fc-dialog-backdrop" role="presentation">
          <div
            className="fc-dialog max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-item-modal-title"
          >
            <div className="fc-dialog-header">
              <div>
                <p className="fc-eyebrow">Dish</p>
                <h2 id="menu-item-modal-title" className="fc-dialog-title">
                  {isEditingMenuItem ? "Edit dish" : "New dish"}
                </h2>
              </div>
            </div>

            <form
              id="menu-item-form"
              onSubmit={
                isEditingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem
              }
            >
              <div className="fc-dialog-body">
                {error && (
                  <p className="fc-feedback fc-feedback-danger mb-5 text-sm">
                    {error}
                  </p>
                )}

                <div className="grid gap-x-4 sm:grid-cols-2">
                  <div className="fc-field">
                    <label htmlFor="name" className="fc-label">
                      Dish name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={menuItemForm.name}
                      onChange={handleMenuItemInputChange}
                      className="fc-control px-3 py-2.5 text-sm"
                      placeholder="Grilled salmon"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="fc-field sm:mt-0">
                    <label htmlFor="categoryId" className="fc-label">
                      Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={menuItemForm.categoryId}
                      onChange={handleMenuItemInputChange}
                      className="fc-control px-3 py-2.5 text-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="fc-field">
                  <label htmlFor="preparationTime" className="fc-label">
                    Preparation time
                    <span className="fc-label-note">Minutes</span>
                  </label>
                  <input
                    type="number"
                    id="preparationTime"
                    name="preparationTime"
                    value={menuItemForm.preparationTime}
                    onChange={handleMenuItemInputChange}
                    min="5"
                    max="480"
                    className="fc-control px-3 py-2.5 text-sm"
                    required
                  />
                </div>

                <div className="fc-field">
                  <label htmlFor="description" className="fc-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={menuItemForm.description}
                    onChange={handleMenuItemInputChange}
                    className="fc-control px-3 py-2.5 text-sm"
                    placeholder="Ingredients, and what makes it worth ordering"
                    required
                  />
                </div>

                <div className="fc-field">
                  <span className="fc-label">
                    Images
                    <span className="fc-label-note">Optional</span>
                  </span>
                  <MultipleImageUpload
                    currentImages={menuItemForm.images}
                    onImagesChange={handleImagesChange}
                    onImageError={handleImageError}
                    disabled={menuItemLoading}
                    maxImages={8}
                    uploadMode="deferred"
                  />
                </div>

                <div className="fc-field">
                  <span className="fc-label">
                    Customisation options
                    <span className="fc-label-note">Optional</span>
                  </span>
                  <div className="grid gap-2">
                    {menuItemForm.customizationOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => {
                            const updatedOptions = [
                              ...menuItemForm.customizationOptions,
                            ];
                            updatedOptions[index].name = e.target.value;
                            setMenuItemForm({
                              ...menuItemForm,
                              customizationOptions: updatedOptions,
                            });
                          }}
                          className="fc-control px-3 py-2.5 text-sm"
                          placeholder="Extra cheese, no onions, spice level"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOptions =
                              menuItemForm.customizationOptions.filter(
                                (_, i) => i !== index,
                              );
                            setMenuItemForm({
                              ...menuItemForm,
                              customizationOptions: updatedOptions,
                            });
                          }}
                          className="fc-button fc-button-danger-ghost shrink-0 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuItemForm({
                          ...menuItemForm,
                          customizationOptions: [
                            ...menuItemForm.customizationOptions,
                            { name: "" },
                          ],
                        });
                      }}
                      className="fc-button fc-button-secondary justify-self-start text-sm"
                    >
                      Add an option
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="fc-dialog-footer fc-dialog-footer-split">
              <button
                type="button"
                onClick={() => {
                  setShowMenuItemModal(false);
                  setMenuItemForm({
                    id: "",
                    name: "",
                    description: "",
                    preparationTime: 30,
                    categoryId: "",
                    images: [],
                    customizationOptions: [],
                  });
                  setIsEditingMenuItem(false);
                  setError("");
                }}
                className="fc-button fc-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="menu-item-form"
                disabled={menuItemLoading}
                className="fc-button fc-button-primary"
              >
                {menuItemLoading
                  ? "Saving..."
                  : isEditingMenuItem
                    ? "Save dish"
                    : "Create dish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
