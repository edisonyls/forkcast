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
    [],
  );
  const [customOptions, setCustomOptions] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const toggleOption = (option: CustomizationOption) => {
    setSelectedOptions((prev) =>
      prev.find((opt) => opt.id === option.id)
        ? prev.filter((opt) => opt.id !== option.id)
        : [...prev, option],
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
              : `${process.env.NEXT_PUBLIC_API_URL}${item.images[0]}`
            : "/food-placeholder.jpg",
        description: item.description,
        rating: item.rating,
        preparationTime: item.preparationTime,
        chefId: item.chefId || "",
        chefName: item.chefName || "Unknown Host",
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
    <div className="fc-dialog-backdrop" role="presentation">
      <div
        className="fc-dialog max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customisation-title"
      >
        <div className="fc-dialog-header">
          <div className="min-w-0">
            {item.chefName && <p className="fc-eyebrow">{item.chefName}</p>}
            <h2 id="customisation-title" className="fc-dialog-title">
              {item.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="fc-icon-button fc-icon-button-ghost fc-close"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="relative h-48 w-full overflow-hidden border-b border-border-theme">
          <ImageCarousel
            images={item.images || []}
            itemName={item.name}
            className="h-full w-full"
          />
        </div>

        <div className="fc-dialog-body">
          <p className="mt-0 mb-1 text-sm leading-relaxed text-text-muted">
            {item.description}
          </p>
          <p className="fc-meta mb-5">
            <span>&#9733; {item.rating}</span>
            <span>{item.preparationTime} min</span>
          </p>

          {item.customizableOptions && item.customizableOptions.length > 0 && (
            <div className="fc-field">
              <span className="fc-label">Customisations</span>
              <div className="grid gap-2">
                {item.customizableOptions.map((option) => (
                  <label key={option.id} className="fc-option items-center">
                    <input
                      type="checkbox"
                      checked={selectedOptions.some(
                        (opt) => opt.id === option.id,
                      )}
                      onChange={() => toggleOption(option)}
                    />
                    <span className="text-sm text-ink">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="fc-field">
            <label className="fc-label" htmlFor="custom-options">
              Anything else
              <span className="fc-label-note">Optional</span>
            </label>
            <textarea
              id="custom-options"
              value={customOptions}
              onChange={(e) => setCustomOptions(e.target.value)}
              placeholder="Extra spicy, no onions, gluten-free bread"
              className="fc-control resize-none px-3 py-2.5 text-sm"
              rows={3}
            />
            <p className="fc-hint">Separate several requests with commas.</p>
          </div>

          <div className="fc-field flex items-center justify-between gap-4">
            <span className="fc-label mb-0">Quantity</span>
            <span className="fc-stepper">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span className="fc-stepper-value">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </span>
          </div>
        </div>

        <div className="fc-dialog-footer">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="fc-button fc-button-primary w-full"
          >
            {isAdding ? "Adding..." : `Add ${quantity} to cart`}
          </button>
        </div>
      </div>
    </div>
  );
}
