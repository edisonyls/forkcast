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
      <div className="fc-dialog-backdrop" role="presentation">
        <div
          className="fc-dialog max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-order-success-title"
        >
          <div className="fc-dialog-header">
            <div>
              <p className="fc-eyebrow">Order sent</p>
              <h2 id="event-order-success-title" className="fc-dialog-title">
                You&rsquo;re on the list
              </h2>
            </div>
          </div>
          <div className="fc-dialog-body">
            <p className="m-0 text-sm leading-relaxed text-text-muted">
              Your order for &ldquo;{event.title}&rdquo; is with the host. Watch
              the status badge on the menu for their confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fc-dialog-backdrop" role="presentation">
      <div
        className="fc-dialog max-w-4xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-order-title"
      >
        <div className="fc-dialog-header">
          <div className="min-w-0">
            <p className="fc-eyebrow">
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 id="event-order-title" className="fc-dialog-title">
              Order for {event.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="fc-icon-button fc-icon-button-ghost fc-close shrink-0"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} id="event-order-form">
          <div className="fc-dialog-body">
            {error && (
              <p className="fc-feedback fc-feedback-danger mb-6 text-sm">
                {error}
              </p>
            )}

            <section className="mb-8">
              <p className="fc-stat-label">Your details</p>
              <div className="grid gap-x-4 md:grid-cols-2">
                <div className="fc-field">
                  <label className="fc-label" htmlFor="order-name">
                    Name
                  </label>
                  <input
                    id="order-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="fc-control px-3 py-2.5 text-sm"
                    required
                  />
                </div>
                <div className="fc-field md:mt-0">
                  <label className="fc-label" htmlFor="order-email">
                    Email
                    <span className="fc-label-note">Optional</span>
                  </label>
                  <input
                    id="order-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="fc-control px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="fc-field">
                  <label className="fc-label" htmlFor="order-phone">
                    Phone
                    <span className="fc-label-note">Optional</span>
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="fc-control px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="fc-field">
                  <label className="fc-label" htmlFor="order-requests">
                    Special requests
                    <span className="fc-label-note">Optional</span>
                  </label>
                  <textarea
                    id="order-requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="fc-control px-3 py-2.5 text-sm"
                    placeholder="Allergies, dietary needs, anything else"
                  />
                </div>
              </div>
            </section>

            <section>
              <p className="fc-stat-label">Choose dishes</p>

              {chefMenuItems.length === 0 ? (
                <p className="m-0 text-sm text-text-muted">
                  This host has no dishes on their menu yet.
                </p>
              ) : (
                <div className="grid max-h-[45dvh] gap-3 overflow-y-auto overscroll-contain pr-1">
                  {chefMenuItems.map((item) => {
                    const orderItem = orderItems.find(
                      (orderItem) => orderItem.menuItemId === item.id,
                    );
                    const quantity = orderItem?.quantity || 0;

                    return (
                      <div key={item.id} className="fc-card">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="m-0 text-sm font-semibold text-ink">
                              {item.name}
                            </h4>
                            <p className="mt-1 mb-0 text-sm leading-relaxed text-text-muted">
                              {item.description}
                            </p>
                            <p className="fc-meta mt-1.5">
                              <span>{item.preparationTime} min</span>
                            </p>
                          </div>

                          <span className="fc-stepper shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              disabled={quantity === 0}
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              &minus;
                            </button>
                            <span className="fc-stepper-value">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => addItem(item.id)}
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </span>
                        </div>

                        {quantity > 0 &&
                          item.customizableOptions &&
                          item.customizableOptions.length > 0 && (
                            <div className="mt-4 border-t border-border-theme pt-4">
                              <span className="fc-stat-label">
                                Customisations
                              </span>
                              <div className="grid gap-2">
                                {item.customizableOptions.map((option) => {
                                  const isSelected =
                                    orderItem?.selectedCustomizations?.some(
                                      (c) => c.id === option.id,
                                    ) || false;

                                  return (
                                    <label
                                      key={option.id}
                                      className="fc-option items-center py-2"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          toggleCustomization(item.id, option)
                                        }
                                      />
                                      <span className="text-sm text-ink">
                                        {option.name}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {quantity > 0 && (
                          <div className="fc-field mt-4">
                            <label
                              className="fc-label"
                              htmlFor={`notes-${item.id}`}
                            >
                              Notes for this dish
                              <span className="fc-label-note">Optional</span>
                            </label>
                            <input
                              id={`notes-${item.id}`}
                              type="text"
                              value={orderItem?.specialNotes || ""}
                              onChange={(e) =>
                                updateSpecialNotes(item.id, e.target.value)
                              }
                              className="fc-control px-3 py-2.5 text-sm"
                              placeholder="Anything the host should know"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </form>

        <div className="fc-dialog-footer fc-dialog-footer-split">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="fc-button fc-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-order-form"
            disabled={loading || orderItems.length === 0}
            className="fc-button fc-button-primary"
          >
            {loading
              ? "Placing order..."
              : orderItems.length === 0
                ? "Pick at least one dish"
                : `Place order · ${getTotalItems()} items`}
          </button>
        </div>
      </div>
    </div>
  );
}
