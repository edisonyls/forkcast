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
    isLoading: contextLoading,
  } = useCart();

  const [chef, setChef] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showChefSwitchModal, setShowChefSwitchModal] = useState(false);
  const [secretVerifying, setSecretVerifying] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);
  const [isMenuAccessible, setIsMenuAccessible] = useState(false);

  const [storedSecret, setStoredSecret] = useState<string>("");

  // Check if user already has access to this chef
  const hasExistingAccess = () => {
    return (
      lastVisitedChef?.hasAccess &&
      lastVisitedChef.id.toString() === chefId.toString()
    );
  };

  // Load chef basic info
  useEffect(() => {
    // Don't proceed if the cart context is still loading
    if (contextLoading) {
      return;
    }

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

        // If cart is from same chef, update the cart chef to ensure consistency
        if (cartChef && cartChef.id.toString() === chefId.toString()) {
          // Update cart chef name if it might have changed
          if (cartChef.name !== chef.name) {
            clearCartAndSetChef({
              id: chef.id,
              name: chef.name,
            });
          }
        }

        // Check if user already has access to this chef
        if (hasExistingAccess()) {
          const secret = getStoredSecret(chefId);

          if (secret) {
            // User has existing access and stored secret, load menu directly
            try {
              await loadMenuDataWithStoredSecret(secret);
              setStoredSecret(secret);
              setIsMenuAccessible(true);
            } catch (err) {
              // If loading fails, fall back to showing secret modal
              console.warn(
                "Failed to load with stored secret, showing secret modal:",
                err,
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
          "Failed to load host information. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadChef();
  }, [chefId, contextLoading]);

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
        const secret = getStoredSecret(chefId);
        if (secret) {
          // User has existing access and stored secret, load menu directly
          try {
            await loadMenuDataWithStoredSecret(secret);
            setStoredSecret(secret);
            setIsMenuAccessible(true);
          } catch (err) {
            // If loading fails, fall back to showing secret modal
            console.warn(
              "Failed to load with stored secret, showing secret modal:",
              err,
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

      // Fetch events with orders (public endpoint)
      await loadEventOrders(secret);
    } catch (err) {
      console.error("Failed to fetch menu data with stored secret:", err);
      throw new Error("Failed to load menu data. Please try again.");
    }
  };

  const loadEventOrders = async (secret: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chefId}&secret=${secret}`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events || []);
      }
    } catch (err) {
      console.error("Failed to fetch event orders:", err);
      // Don't throw error here as events are optional
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

      // Fetch events with orders (public endpoint)
      await loadEventOrders(secret);
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
        secret,
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
        secret,
      );

      setStoredSecret(secret);
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
          "Failed to verify secret. Please check your connection and try again.",
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
      <div className="fc-shell py-6 sm:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading host information...</p>
        </div>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="fc-shell py-6 sm:py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Host not found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The host you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/chefs")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Back to Hosts
          </button>
        </div>
      </div>
    );
  }

  // If menu is not accessible yet, show the chef info and secret modal
  if (!isMenuAccessible) {
    return (
      <>
        <div className="fc-shell py-6 sm:py-8">
          <div className="text-center">
            <div className="mx-auto max-w-md rounded-lg bg-white p-5 shadow-md sm:p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {chef.name}
              </h1>
              <p className="text-gray-600 mb-4">{chef.bio}</p>
              <p className="text-green-600 font-medium">
                🔒 This host requires a secret to access their menu.
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
      <div className="fc-shell py-6 sm:py-8">
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
            <span>Back to Hosts</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{chef.name}</h1>
          <p className="text-gray-600">
            This host hasn't added any menu categories yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fc-shell py-6 sm:py-8">
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
          <span>Back to Hosts</span>
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col md:flex-row gap-8">
        <ChefMenu
          chef={{
            id: chef.id,
            name: chef.name,
            image: chef.image || "/user.png",
            rating: chef.rating,
            bio: chef.bio,
          }}
          categories={availableCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
          }))}
          menuItems={menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            images: item.images || [],
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
          events={events}
        />
      </div>
    </div>
  );
}
