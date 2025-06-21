"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import ImageCarousel from "./ImageCarousel";

interface CustomizationOption {
  id: string | number;
  name: string;
}

interface MenuItem {
  id: string | number;
  name: string;
  images: string[];
  description: string;
  rating: number;
  preparationTime: number;
  customizableOptions: CustomizationOption[];
  chefId?: string | number;
  chefName?: string;
}

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

export default function CustomizationModal({
  isOpen,
  onClose,
  item,
}: CustomizationModalProps) {
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<CustomizationOption[]>(
    []
  );
  const [customOptions, setCustomOptions] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const toggleOption = (option: CustomizationOption) => {
    setSelectedOptions((prev) =>
      prev.find((opt) => opt.id === option.id)
        ? prev.filter((opt) => opt.id !== option.id)
        : [...prev, option]
    );
  };

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      // Combine selected options with custom options
      const allCustomizations = [
        ...selectedOptions.map((opt) => ({
          id: opt.id,
          name: opt.name,
        })),
        // Add custom options as separate entries
        ...(customOptions.trim()
          ? customOptions.split(",").map((option, index) => ({
              id: `custom-${Date.now()}-${index}`,
              name: option.trim(),
            }))
          : []),
      ];

      // Generate special notes from customizations
      const specialNotes =
        allCustomizations.length > 0
          ? `Customizations: ${allCustomizations.map((c) => c.name).join(", ")}`
          : undefined;

      // Add item to cart with selected customizations
      addToCart({
        menuItemId: item.id,
        name: item.name,
        image:
          item.images && item.images.length > 0
            ? item.images[0].startsWith("http") ||
              item.images[0].startsWith("data:")
              ? item.images[0]
              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${
                  item.images[0]
                }`
            : "/food-placeholder.jpg",
        description: item.description,
        rating: item.rating,
        preparationTime: item.preparationTime,
        chefId: item.chefId || "",
        chefName: item.chefName || "Unknown Chef",
        quantity,
        customizations: allCustomizations,
        specialNotes,
      });

      // Reset modal state
      setSelectedOptions([]);
      setCustomOptions("");
      setQuantity(1);

      // Close modal
      onClose();

      // Optional: Show success feedback
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="relative h-48 w-full mb-4 rounded overflow-hidden">
          <ImageCarousel
            images={item.images || []}
            itemName={item.name}
            className="h-full w-full"
          />
        </div>

        <p className="text-gray-600 mb-4">{item.description}</p>

        {/* Chef info */}
        {item.chefName && (
          <div className="mb-4 p-3 bg-orange-50 rounded-md">
            <p className="text-sm text-orange-700">
              By <span className="font-semibold">{item.chefName}</span>
            </p>
          </div>
        )}

        {item.customizableOptions && item.customizableOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Customization Options</h3>
            {item.customizableOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                    checked={selectedOptions.some(
                      (opt) => opt.id === option.id
                    )}
                    onChange={() => toggleOption(option)}
                  />
                  <span>{option.name}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Custom Options Section */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Additional Custom Options</h3>
          <p className="text-sm text-gray-600 mb-2">
            Add your own customization preferences (separate multiple options
            with commas)
          </p>
          <textarea
            value={customOptions}
            onChange={(e) => setCustomOptions(e.target.value)}
            placeholder="e.g., extra spicy, no onions, gluten-free bread"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="font-semibold">Quantity:</span>
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-gray-200 px-3 py-1 rounded-l hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <span className="bg-gray-100 px-4 py-1 border-t border-b border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-gray-200 px-3 py-1 rounded-r hover:bg-gray-300 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isAdding ? "Adding to Cart..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
