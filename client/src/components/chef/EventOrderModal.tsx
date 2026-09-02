"use client";

import { useState } from "react";

interface Chef {
  id: string | number;
  name: string;
  username: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  deadline: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  maxOrders?: number;
  chef: Chef;
  _count: {
    eventOrders: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: string | number;
  name: string;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  categoryId: string | number;
  chefId: string | number;
  customizableOptions: any[];
}

interface OrderItem {
  menuItemId: string | number;
  quantity: number;
  specialNotes?: string;
  selectedCustomizations?: {
    id: string | number;
    name: string;
  }[];
}

interface EventOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  menuItems: MenuItem[];
  chef: Chef;
  chefSecret: string;
}

export default function EventOrderModal({
  isOpen,
  onClose,
  event,
  menuItems,
  chef,
  chefSecret,
}: EventOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Filter menu items that belong to this chef
  const chefMenuItems = menuItems.filter(
    (item) => item.chefId.toString() === chef.id.toString(),
  );

  const addItem = (menuItemId: string | number) => {
    const existingItem = orderItems.find(
      (item) => item.menuItemId === menuItemId,
    );
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItemId,
          quantity: 1,
          specialNotes: "",
          selectedCustomizations: [],
        },
      ]);
    }
  };

  const removeItem = (menuItemId: string | number) => {
    setOrderItems(orderItems.filter((item) => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const updateSpecialNotes = (
    menuItemId: string | number,
    specialNotes: string,
  ) => {
    setOrderItems(
      orderItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, specialNotes } : item,
      ),
    );
  };

  const toggleCustomization = (
    menuItemId: string | number,
    customization: { id: string | number; name: string },
  ) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.menuItemId === menuItemId) {
          const currentCustomizations = item.selectedCustomizations || [];
          const isSelected = currentCustomizations.some(
            (c) => c.id === customization.id,
          );

          const updatedCustomizations = isSelected
            ? currentCustomizations.filter((c) => c.id !== customization.id)
            : [...currentCustomizations, customization];

          return {
            ...item,
            selectedCustomizations: updatedCustomizations,
          };
        }
        return item;
      }),
    );
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (orderItems.length === 0) {
      setError("Please add at least one item to your order");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${event.id}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim() || undefined,
            customerPhone: customerPhone.trim() || undefined,
            specialRequests: specialRequests.trim() || undefined,
            items: orderItems.map((item) => {
              let specialNotes = item.specialNotes || "";

              // Append selected customizations to special notes
              if (
                item.selectedCustomizations &&
                item.selectedCustomizations.length > 0
              ) {
                const customizationsText = `Customizations: ${item.selectedCustomizations
                  .map((c) => c.name)
                  .join(", ")}`;
                specialNotes = specialNotes
                  ? `${specialNotes}\n${customizationsText}`
                  : customizationsText;
              }

              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                specialNotes: specialNotes || undefined,
              };
            }),
          }),
        },
      );

      if (response.ok) {
        setSuccess(true);
        // Clear form
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setSpecialRequests("");
        setOrderItems([]);

        // Close modal after showing success for a bit
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("An error occurred while placing your order");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fc-dialog-backdrop bg-black/50" role="presentation">
        <div
          className="fc-dialog max-w-md rounded-lg bg-white p-5 text-center sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-order-success-title"
        >
          <div className="text-success text-6xl mb-4">✓</div>
          <h2
            id="event-order-success-title"
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Order Placed!
          </h2>
          <p className="text-gray-600">
            Your order for "{event.title}" has been successfully placed. The
            host will review and confirm your order. You can see the status
            badges on the menu items.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fc-dialog-backdrop bg-black/50" role="presentation">
      <div
        className="fc-dialog max-w-4xl rounded-lg bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-order-title"
      >
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-3">
              <h2
                id="event-order-title"
                className="text-xl font-bold text-gray-900 sm:text-2xl"
              >
                Order for {event.title}
              </h2>
              <p className="text-gray-600 mt-1">
                Event Date:{" "}
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="fc-icon-button fc-icon-button-ghost shrink-0"
              aria-label="Close order details"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && (
            <div className="fc-feedback fc-feedback-danger mb-4">
              {error}
            </div>
          )}

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="fc-control px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="fc-control px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="fc-control px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="fc-control px-3 py-2"
                  placeholder="Any special dietary requirements or requests..."
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Items
            </h3>

            {chefMenuItems.length === 0 ? (
              <p className="text-gray-500">
                No menu items available for this host.
              </p>
            ) : (
              <div className="max-h-[45dvh] space-y-4 overflow-y-auto overscroll-contain pr-1">
                {chefMenuItems.map((item) => {
                  const orderItem = orderItems.find(
                    (orderItem) => orderItem.menuItemId === item.id,
                  );
                  const quantity = orderItem?.quantity || 0;

                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Prep time: {item.preparationTime} mins
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 sm:ml-4">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, quantity - 1)
                            }
                            disabled={quantity === 0}
                            className="fc-icon-button disabled:opacity-50"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItem(item.id)}
                            className="fc-icon-button fc-icon-button-primary"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Customization Options */}
                      {quantity > 0 &&
                        item.customizableOptions &&
                        item.customizableOptions.length > 0 && (
                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Customization Options:
                            </h5>
                            <div className="space-y-2">
                              {item.customizableOptions.map((option) => {
                                const isSelected =
                                  orderItem?.selectedCustomizations?.some(
                                    (c) => c.id === option.id,
                                  ) || false;

                                return (
                                  <label
                                    key={option.id}
                                    className="flex min-h-[var(--fc-touch-target)] items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        toggleCustomization(item.id, option)
                                      }
                                      className="mr-2 text-green-600 focus:ring-green-500 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                      {option.name}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {quantity > 0 && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional special notes for this item:
                          </label>
                          <input
                            type="text"
                            value={orderItem?.specialNotes || ""}
                            onChange={(e) =>
                              updateSpecialNotes(item.id, e.target.value)
                            }
                            className="fc-control px-3 py-2 text-sm"
                            placeholder="Any additional special instructions..."
                          />
                        </div>
                      )}

                      {/* Selected Customizations Preview */}
                      {quantity > 0 &&
                        orderItem?.selectedCustomizations &&
                        orderItem.selectedCustomizations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-success font-medium mb-1">
                              Selected customizations:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {orderItem.selectedCustomizations.map(
                                (customization) => (
                                  <span
                                    key={customization.id}
                                    className="fc-badge fc-badge-success"
                                  >
                                    {customization.name}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Order Summary
              </h3>
              <p className="text-gray-600">Total items: {getTotalItems()}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="fc-button fc-button-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="fc-button fc-button-primary flex-1"
            >
              {loading
                ? "Placing Order..."
                : `Place Order (${getTotalItems()} items)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
