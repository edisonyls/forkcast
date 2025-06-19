"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  menuItemId: string | number;
  name: string;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  chefId: string | number;
  chefName: string;
  quantity: number;
  customizations: {
    id: string | number;
    name: string;
  }[];
  addedAt: Date;
}

export interface LastVisitedChef {
  id: string | number;
  name: string;
  hasAccess: boolean; // Whether the user has already verified the secret
  accessedAt: Date;
}

export interface CartChef {
  id: string | number;
  name: string;
}

interface CartContextType {
  items: CartItem[];
  cartChef: CartChef | null; // Which chef the current cart belongs to
  lastVisitedChef: LastVisitedChef | null;
  isLoading: boolean; // Whether the context is still loading from localStorage
  addToCart: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  setLastVisitedChef: (
    chef: Omit<LastVisitedChef, "accessedAt">,
    secret?: string
  ) => void;
  clearLastVisitedChef: () => void;
  getStoredSecret: (chefId: string | number) => string | null;
  isCartFromDifferentChef: (chefId: string | number) => boolean;
  clearCartAndSetChef: (chef: CartChef) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartChef, setCartChef] = useState<CartChef | null>(null);
  const [lastVisitedChef, setLastVisitedChefState] =
    useState<LastVisitedChef | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart, cart chef, and last visited chef from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("forkcast-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        setItems(cartWithDates);
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }

    const savedCartChef = localStorage.getItem("forkcast-cart-chef");
    if (savedCartChef) {
      try {
        const parsedCartChef = JSON.parse(savedCartChef);
        setCartChef(parsedCartChef);
      } catch (error) {
        console.error("Failed to load cart chef from localStorage:", error);
      }
    }

    const savedLastChef = localStorage.getItem("forkcast-last-chef");
    if (savedLastChef) {
      try {
        const parsedChef = JSON.parse(savedLastChef);
        // Convert accessedAt back to Date object
        const chefWithDate = {
          ...parsedChef,
          accessedAt: new Date(parsedChef.accessedAt),
        };

        // Only restore if accessed within the last 4 hours (to prevent stale access)
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        if (chefWithDate.accessedAt > fourHoursAgo) {
          setLastVisitedChefState(chefWithDate);
        } else {
          localStorage.removeItem("forkcast-last-chef");
          // Also clear any stored secrets for expired sessions
          clearExpiredSecrets();
        }
      } catch (error) {
        console.error(
          "Failed to load last visited chef from localStorage:",
          error
        );
      }
    }

    // Mark loading as complete
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("forkcast-cart", JSON.stringify(items));
  }, [items]);

  // Save cart chef to localStorage whenever it changes
  useEffect(() => {
    if (cartChef) {
      localStorage.setItem("forkcast-cart-chef", JSON.stringify(cartChef));
    } else {
      localStorage.removeItem("forkcast-cart-chef");
    }
  }, [cartChef]);

  // Save last visited chef to localStorage whenever it changes
  useEffect(() => {
    if (lastVisitedChef) {
      localStorage.setItem(
        "forkcast-last-chef",
        JSON.stringify(lastVisitedChef)
      );
    } else {
      localStorage.removeItem("forkcast-last-chef");
    }
  }, [lastVisitedChef]);

  const clearExpiredSecrets = () => {
    // Clear all stored secrets when session expires
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("forkcast-secret-")) {
        localStorage.removeItem(key);
      }
    });
  };

  const addToCart = (newItem: Omit<CartItem, "id" | "addedAt">) => {
    const cartItem: CartItem = {
      ...newItem,
      id: `${newItem.menuItemId}-${Date.now()}-${Math.random()}`,
      addedAt: new Date(),
    };

    setItems((prevItems) => [...prevItems, cartItem]);

    // Set the cart chef if not already set
    if (!cartChef) {
      setCartChef({
        id: newItem.chefId,
        name: newItem.chefName,
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== itemId);

      // If cart becomes empty, clear the cart chef
      if (newItems.length === 0) {
        setCartChef(null);
      }

      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCartChef(null);
  };

  const clearCartAndSetChef = (chef: CartChef) => {
    setItems([]);
    setCartChef(chef);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const isCartFromDifferentChef = (chefId: string | number): boolean => {
    return (
      cartChef !== null &&
      items.length > 0 &&
      cartChef.id.toString() !== chefId.toString()
    );
  };

  const setLastVisitedChef = (
    chef: Omit<LastVisitedChef, "accessedAt">,
    secret?: string
  ) => {
    setLastVisitedChefState({
      ...chef,
      accessedAt: new Date(),
    });

    // Store the secret in localStorage if provided
    if (secret && chef.hasAccess) {
      localStorage.setItem(`forkcast-secret-${chef.id}`, secret);
    }
  };

  const clearLastVisitedChef = () => {
    if (lastVisitedChef) {
      // Clear the stored secret when clearing last visited chef
      localStorage.removeItem(`forkcast-secret-${lastVisitedChef.id}`);
    }
    setLastVisitedChefState(null);
  };

  const getStoredSecret = (chefId: string | number): string | null => {
    // First check localStorage (new location)
    let secret = localStorage.getItem(`forkcast-secret-${chefId}`);

    // If not found, check sessionStorage (old location) for backward compatibility
    if (!secret) {
      secret = sessionStorage.getItem(`forkcast-secret-${chefId}`);

      // If found in sessionStorage, migrate it to localStorage
      if (secret) {
        localStorage.setItem(`forkcast-secret-${chefId}`, secret);
        sessionStorage.removeItem(`forkcast-secret-${chefId}`);
      }
    }

    return secret;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartChef,
        lastVisitedChef,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        setLastVisitedChef,
        clearLastVisitedChef,
        getStoredSecret,
        isCartFromDifferentChef,
        clearCartAndSetChef,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
