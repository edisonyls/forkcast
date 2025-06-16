"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChefMenu from "@/components/ChefMenu";
import ChefSecretModal from "@/components/ChefSecretModal";
import ChefSwitchModal from "@/components/ChefSwitchModal";
import { apiService } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

export default function ChefPage() {
  const params = useParams();
  const router = useRouter();
  const chefId = params.chefId as string;
  const {
    setLastVisitedChef,
    lastVisitedChef,
    getStoredSecret,
    isCartFromDifferentChef,
    cartChef,
    getTotalItems,
    clearCartAndSetChef,
  } = useCart();

  const [chef, setChef] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showChefSwitchModal, setShowChefSwitchModal] = useState(false);
  const [secretVerifying, setSecretVerifying] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);
  const [isMenuAccessible, setIsMenuAccessible] = useState(false);

  // Check if user already has access to this chef
  const hasExistingAccess = () => {
    return (
      lastVisitedChef?.hasAccess &&
      lastVisitedChef.id.toString() === chefId.toString()
    );
  };

  // Load chef basic info
  useEffect(() => {
    const loadChef = async () => {
      try {
        setLoading(true);
        const { chef } = await apiService.getChefById(chefId);
        setChef(chef);

        // Check if switching to a different chef with items in cart
        if (isCartFromDifferentChef(chefId)) {
          setShowChefSwitchModal(true);
          return; // Don't proceed further until user decides
        }

        // Check if user already has access to this chef
        if (hasExistingAccess()) {
          const storedSecret = getStoredSecret(chefId);
          if (storedSecret) {
            // User has existing access and stored secret, load menu directly
            try {
              await loadMenuDataWithStoredSecret(storedSecret);
              setIsMenuAccessible(true);
            } catch (err) {
              // If loading fails, fall back to showing secret modal
              console.warn(
                "Failed to load with stored secret, showing secret modal:",
                err
              );
              setShowSecretModal(true);
            }
          } else {
            // Has access flag but no stored secret, show modal
            setShowSecretModal(true);
          }
        } else {
          // Since all chefs require secrets and no existing access, show the modal
          setShowSecretModal(true);
        }
      } catch (err) {
        console.error("Failed to fetch chef:", err);
        setError(
          "Failed to load chef information. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChef();
  }, [chefId]);

  const handleChefSwitchConfirm = async () => {
    if (chef) {
      // Clear cart and set new chef
      clearCartAndSetChef({
        id: chef.id,
        name: chef.name,
      });

      // Now proceed with normal chef loading logic
      proceedWithChefAccess();
    }
  };

  const handleChefSwitchCancel = () => {
    // Navigate back to chefs list
    router.push("/chefs");
  };

  const proceedWithChefAccess = async () => {
    try {
      // Check if user already has access to this chef
      if (hasExistingAccess()) {
        const storedSecret = getStoredSecret(chefId);
        if (storedSecret) {
          // User has existing access and stored secret, load menu directly
          try {
            await loadMenuDataWithStoredSecret(storedSecret);
            setIsMenuAccessible(true);
          } catch (err) {
            // If loading fails, fall back to showing secret modal
            console.warn(
              "Failed to load with stored secret, showing secret modal:",
              err
            );
            setShowSecretModal(true);
          }
        } else {
          // Has access flag but no stored secret, show modal
          setShowSecretModal(true);
        }
      } else {
        // Since all chefs require secrets and no existing access, show the modal
        setShowSecretModal(true);
      }
    } catch (err) {
      console.error("Error in proceedWithChefAccess:", err);
      setShowSecretModal(true);
    }
  };

  const loadMenuDataWithStoredSecret = async (secret: string) => {
    try {
      const categoriesData = await apiService.getCategories({ chefId });
      setCategories(categoriesData.categories);

      // Use the stored secret to get menu data
      const menuData = await apiService.getChefMenuItems(chefId, secret);
      setMenuItems(menuData.menuItems);
    } catch (err) {
      console.error("Failed to fetch menu data with stored secret:", err);
      throw new Error("Failed to load menu data. Please try again.");
    }
  };

  const loadMenuData = async (secret: string) => {
    try {
      // Get categories specific to this chef
      const categoriesData = await apiService.getCategories({ chefId });
      setCategories(categoriesData.categories);

      // Use the secret-protected endpoint
      const menuData = await apiService.getChefMenuItems(chefId, secret);
      setMenuItems(menuData.menuItems);
    } catch (err) {
      console.error("Failed to fetch menu data:", err);
      throw new Error("Failed to load menu data. Please try again.");
    }
  };

  const handleSecretSubmit = async (secret: string) => {
    try {
      setSecretVerifying(true);
      setSecretError(null);

      // Verify the secret and get chef with menu
      const { chef: verifiedChef } = await apiService.verifyChefSecret(
        chefId,
        secret
      );
      setChef(verifiedChef);

      // Load menu data with the verified secret
      await loadMenuData(secret);

      // Set this chef as the last visited with access granted and store the secret
      setLastVisitedChef(
        {
          id: verifiedChef.id,
          name: verifiedChef.name,
          hasAccess: true,
        },
        secret
      );

      setIsMenuAccessible(true);
      setShowSecretModal(false);
    } catch (err: any) {
      console.error("Secret verification failed:", err);
      if (
        err.message.includes("403") ||
        err.message.includes("Invalid secret")
      ) {
        setSecretError("Invalid secret. Please try again.");
      } else {
        setSecretError(
          "Failed to verify secret. Please check your connection and try again."
        );
      }
    } finally {
      setSecretVerifying(false);
    }
  };

  const handleSecretModalClose = () => {
    // Navigate back to chefs list
    router.push("/chefs");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chef information...</p>
        </div>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Chef not found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The chef you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/chefs")}
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Back to Chefs
          </button>
        </div>
      </div>
    );
  }

  // If menu is not accessible yet, show the chef info and secret modal
  if (!isMenuAccessible) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {chef.name}
              </h1>
              <p className="text-gray-600 mb-4">{chef.bio}</p>
              <p className="text-orange-600 font-medium">
                🔒 This chef requires a secret to access their menu.
              </p>
            </div>
          </div>
        </div>

        <ChefSecretModal
          isOpen={showSecretModal}
          onClose={handleSecretModalClose}
          onSubmit={handleSecretSubmit}
          chefName={chef.name}
          isLoading={secretVerifying}
          error={secretError || undefined}
        />

        <ChefSwitchModal
          isOpen={showChefSwitchModal}
          onClose={handleChefSwitchCancel}
          onConfirm={handleChefSwitchConfirm}
          currentChef={cartChef?.name || ""}
          newChef={chef.name}
          itemCount={getTotalItems()}
        />
      </>
    );
  }

  // Show all categories for this chef, even if they don't have menu items yet
  const availableCategories = categories;

  if (availableCategories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/chefs")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Chefs</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{chef.name}</h1>
          <p className="text-gray-600">
            This chef hasn't added any menu categories yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/chefs")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Chefs</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <ChefMenu
          chef={{
            id: chef.id,
            name: chef.name,
            image: chef.image || "/chef-placeholder.jpg",
            rating: chef.rating,
          }}
          categories={availableCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
          }))}
          menuItems={menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image || "/food-placeholder.jpg",
            description: item.description,
            rating: item.rating,
            preparationTime: item.preparationTime,
            categoryId: item.category.id,
            chefId: chef.id,
            customizableOptions: item.customizationOptions.map((opt: any) => ({
              id: opt.id,
              name: opt.name,
            })),
          }))}
        />
      </div>
    </div>
  );
}
