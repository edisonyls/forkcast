"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  image?: string;
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
    null
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
  const [menuItemForm, setMenuItemForm] = useState({
    id: "",
    name: "",
    description: "",
    preparationTime: 30,
    categoryId: "",
    image: "",
    customizationOptions: [] as { name: string }[],
  });
  const [menuItemLoading, setMenuItemLoading] = useState(false);
  const [isEditingMenuItem, setIsEditingMenuItem] = useState(false);

  // Dropdown state for menu items and categories
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");

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
        }
      );

      if (response.ok) {
        const data = await response.json();
        const chefData = data.data.chef;
        setChef(chefData);
        fetchCategories(chefData.id);
        fetchMenuItems(chefData.id);
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

  // Set first category as selected when categories load
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
        }
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

  const fetchMenuItems = async (chefId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items?chefId=${chefId}&secret=${chef?.secret}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.data.menuItems || []);
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
        }
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

    const requestBody: any = {
      name: menuItemForm.name,
      description: menuItemForm.description,
      preparationTime: menuItemForm.preparationTime,
      categoryId: menuItemForm.categoryId,
      chefId: chef.id,
    };

    // Only include image if it's not empty
    if (menuItemForm.image.trim()) {
      requestBody.image = menuItemForm.image.trim();
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newMenuItem = data.data.menuItem;

        // Create customization options if any
        if (menuItemForm.customizationOptions.length > 0) {
          const validOptions = menuItemForm.customizationOptions.filter((opt) =>
            opt.name.trim()
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
                }
              );
            } catch (error) {
              console.error("Failed to create customization option:", error);
            }
          }
        }

        // Refresh menu items to get the complete data including customization options
        await fetchMenuItems(chef.id);

        setMenuItemForm({
          id: "",
          name: "",
          description: "",
          preparationTime: 30,
          categoryId: selectedCategoryId || "",
          image: "",
          customizationOptions: [],
        });
        setShowMenuItemModal(false);
      } else {
        const errorData = await response.json();
        // Show validation errors if available
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(
              ([field, messages]: [string, any]) =>
                `${field}: ${messages.join(", ")}`
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
    >
  ) => {
    const { name, value } = e.target;
    setMenuItemForm({
      ...menuItemForm,
      [name]: name === "preparationTime" ? parseInt(value) || 30 : value,
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
      image: "",
      customizationOptions: [],
    });
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
      image: item.image || "",
      customizationOptions: [],
    });
    setIsEditingMenuItem(true);
    setShowMenuItemModal(true);
    setError("");

    // Load existing customization options
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/${item.id}/customizations`,
        {
          credentials: "include",
        }
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

    const requestBody: any = {
      name: menuItemForm.name,
      description: menuItemForm.description,
      preparationTime: menuItemForm.preparationTime,
      categoryId: menuItemForm.categoryId,
      chefId: chef.id,
    };

    // Only include image if it's not empty
    if (menuItemForm.image.trim()) {
      requestBody.image = menuItemForm.image.trim();
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu/items/${menuItemForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
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
            }
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
                }
              );
            } catch (error) {
              console.error("Failed to delete customization option:", error);
            }
          }

          // Create new options
          const validOptions = menuItemForm.customizationOptions.filter((opt) =>
            opt.name.trim()
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
                }
              );

              if (!optionResponse.ok) {
                const errorData = await optionResponse.json();
                console.error(
                  "Failed to create customization option:",
                  errorData
                );
                setError(
                  `Failed to create customization option "${option.name}": ${
                    errorData.error || "Unknown error"
                  }`
                );
              }
            } catch (error) {
              console.error("Failed to create customization option:", error);
              setError(
                `Failed to create customization option "${option.name}"`
              );
            }
          }
        } catch (error) {
          console.error("Failed to update customization options:", error);
        }

        // Refresh menu items to get the complete data including updated customization options
        await fetchMenuItems(chef.id);

        setMenuItemForm({
          id: "",
          name: "",
          description: "",
          preparationTime: 30,
          categoryId: selectedCategoryId || "",
          image: "",
          customizationOptions: [],
        });
        setIsEditingMenuItem(false);
        setShowMenuItemModal(false);
      } else {
        const errorData = await response.json();
        // Show validation errors if available
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(
              ([field, messages]: [string, any]) =>
                `${field}: ${messages.join(", ")}`
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
        }
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
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedCategory = data.data.category;

        // Update the category in the state
        setCategories(
          categories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
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
      (item) => item.categoryId === categoryId
    );

    if (categoryHasItems) {
      setError(
        "Cannot delete category that contains menu items. Please delete all items first."
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
        }
      );

      if (response.ok) {
        // Remove the category from the state
        setCategories(
          categories.filter((category) => category.id !== categoryId)
        );

        // If this was the selected category, select another one or null
        if (selectedCategoryId === categoryId) {
          const remainingCategories = categories.filter(
            (category) => category.id !== categoryId
          );
          setSelectedCategoryId(
            remainingCategories.length > 0 ? remainingCategories[0].id : null
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
    (cat) => cat.id === selectedCategoryId
  );
  const filteredMenuItems = selectedCategoryId
    ? menuItems.filter((item) => item.categoryId === selectedCategoryId)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Menu Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your categories and menu items
              </p>
            </div>
            <Link
              href="/chef/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Categories */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Categories
                  </h2>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="p-6">
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      No categories yet. Create your first category to get
                      started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const isSelected = selectedCategoryId === category.id;
                      const itemCount = menuItems.filter(
                        (item) => item.categoryId === category.id
                      ).length;
                      return (
                        <div
                          key={category.id}
                          className={`relative rounded-md transition-colors ${
                            isSelected
                              ? "bg-blue-50 border border-blue-200"
                              : "border border-transparent"
                          }`}
                        >
                          <button
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={`w-full text-left p-3 pr-10 ${
                              isSelected ? "text-blue-700" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500">
                              {itemCount} items
                            </div>
                          </button>

                          {/* Three-dot menu for category */}
                          <div className="absolute top-2 right-2">
                            <div className="relative dropdown-container">
                              <button
                                onClick={() =>
                                  setOpenCategoryDropdown(
                                    openCategoryDropdown === category.id
                                      ? null
                                      : category.id
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {/* Dropdown menu */}
                              {openCategoryDropdown === category.id && (
                                <div className="absolute right-0 top-6 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        openEditCategoryModal(category);
                                        setOpenCategoryDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteCategory(category.id);
                                        setOpenCategoryDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Menu Items */}
          <div className="flex-1">
            {categories.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to Menu Management
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by creating your first category, then add menu items to
                  it.
                </p>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Create Your First Category
                </button>
              </div>
            ) : selectedCategory ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedCategory.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {filteredMenuItems.length} items in this category
                      </p>
                    </div>
                    <button
                      onClick={() => openMenuItemModal(selectedCategory.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">
                        No items in this category yet.
                      </p>
                      <button
                        onClick={() => openMenuItemModal(selectedCategory.id)}
                        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                      >
                        Add Your First Item
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMenuItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <h3 className="font-medium text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Customization Options */}
                          {item.customizationOptions &&
                            item.customizationOptions.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-gray-500 mb-1">
                                  Customization Options:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {item.customizationOptions.map((option) => (
                                    <span
                                      key={option.id}
                                      className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                    >
                                      {option.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{item.preparationTime} min</span>
                            <span>
                              {item.rating}/5 ({item.ratingCount})
                            </span>
                          </div>

                          {/* Three-dot menu */}
                          <div className="absolute top-2 right-2">
                            <div className="relative dropdown-container">
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === item.id ? null : item.id
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {/* Dropdown menu */}
                              {openDropdownId === item.id && (
                                <div className="absolute right-0 top-8 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        openEditMenuItemModal(item);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteMenuItem(item.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <form
              onSubmit={
                isEditingCategory ? handleUpdateCategory : handleCreateCategory
              }
            >
              <div className="mb-4">
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Appetizers, Main Courses, Desserts"
                  autoFocus
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {categoryLoading
                    ? isEditingCategory
                      ? "Updating..."
                      : "Creating..."
                    : isEditingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryForm({ id: "", name: "" });
                    setIsEditingCategory(false);
                    setError("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showMenuItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditingMenuItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>
            <form
              onSubmit={
                isEditingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={menuItemForm.name}
                    onChange={handleMenuItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Grilled Salmon"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={menuItemForm.categoryId}
                    onChange={handleMenuItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <div>
                  <label
                    htmlFor="preparationTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Preparation Time (minutes) *
                  </label>
                  <input
                    type="number"
                    id="preparationTime"
                    name="preparationTime"
                    value={menuItemForm.preparationTime}
                    onChange={handleMenuItemInputChange}
                    min="5"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={menuItemForm.image}
                    onChange={handleMenuItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={menuItemForm.description}
                  onChange={handleMenuItemInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your dish, ingredients, and what makes it special..."
                  required
                />
              </div>

              {/* Customization Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customization Options (optional)
                </label>
                <div className="space-y-2">
                  {menuItemForm.customizationOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Extra cheese, No onions, Spice level"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOptions =
                            menuItemForm.customizationOptions.filter(
                              (_, i) => i !== index
                            );
                          setMenuItemForm({
                            ...menuItemForm,
                            customizationOptions: updatedOptions,
                          });
                        }}
                        className="text-red-600 hover:text-red-800 px-2 py-1"
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
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Customization Option
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={menuItemLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {menuItemLoading
                    ? isEditingMenuItem
                      ? "Updating..."
                      : "Creating..."
                    : isEditingMenuItem
                    ? "Update Menu Item"
                    : "Create Menu Item"}
                </button>
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
                      image: "",
                      customizationOptions: [],
                    });
                    setIsEditingMenuItem(false);
                    setError("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
