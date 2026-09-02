"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import ConfirmationModal from "@/components/cart/ConfirmationModal";
import OrderPlacementModal from "@/components/cart/OrderPlacementModal";

interface Event {
  id: string;
  title: string;
  eventDate: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
}

export default function CartPage() {
  const {
    items,
    cartChef,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    lastVisitedChef,
    getStoredSecret,
  } = useCart();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  // Fetch events when cart chef changes
  useEffect(() => {
    if (cartChef) {
      fetchEvents(cartChef.id);
    }
  }, [cartChef]);

  const fetchEvents = async (chefId: string | number) => {
    try {
      setLoadingEvents(true);

      // Get the stored secret for the cart chef
      const secret = getStoredSecret(chefId);

      const url = secret
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chefId}&secret=${secret}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chefId}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const availableEvents = (data.data.events || []).filter(
          (event: Event) => event.status === "OPEN",
        );
        setEvents(availableEvents);

        // Auto-select first event if only one available
        if (availableEvents.length === 1) {
          setSelectedEvent(availableEvents[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirmation(false);
  };

  const handlePlaceOrder = async (orderData: { customerName: string }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${selectedEvent}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            customerName: orderData.customerName,
            items: (() => {
              // Aggregate items by menuItemId with detailed breakdown
              const aggregatedItems = new Map<
                string | number,
                {
                  menuItemId: string | number;
                  quantity: number;
                  specialNotes?: string;
                  customizationBreakdown: Map<string, number>;
                }
              >();

              items.forEach((item) => {
                const key = item.menuItemId.toString();
                const existing = aggregatedItems.get(key);
                const customizationKey =
                  item.specialNotes || "No customizations";

                if (existing) {
                  // Item already exists, add to quantity and track customizations
                  existing.quantity += item.quantity;

                  // Track customization breakdown
                  const currentCount =
                    existing.customizationBreakdown.get(customizationKey) || 0;
                  existing.customizationBreakdown.set(
                    customizationKey,
                    currentCount + item.quantity,
                  );
                } else {
                  // New item, add to map
                  const customizationBreakdown = new Map<string, number>();
                  customizationBreakdown.set(customizationKey, item.quantity);

                  aggregatedItems.set(key, {
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    specialNotes: undefined, // We'll build this from the breakdown
                    customizationBreakdown,
                  });
                }
              });

              // Convert map to array and build detailed notes
              return Array.from(aggregatedItems.values()).map((item) => {
                // Build detailed breakdown notes
                const breakdownEntries = Array.from(
                  item.customizationBreakdown.entries(),
                );

                if (
                  breakdownEntries.length === 1 &&
                  breakdownEntries[0][0] === "No customizations"
                ) {
                  // All items have no customizations
                  return {
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    specialNotes: undefined,
                  };
                } else {
                  // Build detailed breakdown
                  const breakdown = breakdownEntries
                    .map(([customization, qty]) => {
                      if (customization === "No customizations") {
                        return `${qty}x No customizations`;
                      } else {
                        return `${qty}x ${customization}`;
                      }
                    })
                    .join("; ");

                  return {
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    specialNotes: `BREAKDOWN: ${breakdown}`,
                  };
                }
              });
            })(),
          }),
        },
      );

      if (response.ok) {
        const eventInfo = events.find((e) => e.id === selectedEvent);
        setCelebrationMessage(
          `Order placed successfully for: ${eventInfo?.title}!`,
        );
        setShowCelebration(true);
        // Don't clear cart immediately - wait for celebration modal to be dismissed
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  };

  // Determine the continue shopping destination
  const getContinueShoppingLink = () => {
    // If there's a cart with items, prioritize going back to that chef
    if (cartChef) {
      return `/chefs/${cartChef.id}`;
    }
    // Otherwise, use last visited chef if available
    if (lastVisitedChef?.hasAccess) {
      return `/chefs/${lastVisitedChef.id}`;
    }
    return "/chefs";
  };

  const getContinueShoppingText = () => {
    // If there's a cart with items, prioritize that chef
    if (cartChef) {
      return `Back to ${cartChef.name}'s Menu`;
    }
    // Otherwise, use last visited chef if available
    if (lastVisitedChef?.hasAccess) {
      return `Back to ${lastVisitedChef.name}'s Menu`;
    }
    return "Continue Shopping";
  };

  if (items.length === 0) {
    return (
      <>
        <div className="fc-shell py-6 sm:py-8">
          <div className="text-center py-16">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5m2.5-5h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start exploring our amazing hosts and add some delicious items to
              your cart!
            </p>
            <Link
              href={getContinueShoppingLink()}
              className="fc-button fc-button-primary"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {lastVisitedChef?.hasAccess
                ? `Browse ${lastVisitedChef.name}'s Menu`
                : "Browse Hosts"}
            </Link>
          </div>
        </div>

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fc-dialog-backdrop bg-black/50" role="presentation">
            <div
              className="fc-dialog max-w-md rounded-lg bg-white p-5 text-center sm:p-8"
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-success mb-2">
                  Order Placed Successfully!
                </h2>
                <p className="text-gray-700">{celebrationMessage}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  You can check your order status by visiting the host's event
                  page.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  clearCart();
                }}
                className="fc-button fc-button-primary"
              >
                Awesome! 🎊
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="fc-shell py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Your Order
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <p className="text-gray-600">
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in
                your cart
              </p>
              {cartChef && (
                <>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <p className="text-brand-ink font-medium">
                    from {cartChef.name}
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowClearConfirmation(true)}
            className="fc-button fc-button-danger-ghost self-start"
          >
            <svg
              className="w-4 h-4"
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
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-white p-4 shadow-md sm:p-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Item Image */}
                <div className="relative h-44 w-full flex-shrink-0 sm:h-52 md:h-32 md:w-32">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Item Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-brand-ink font-medium">
                        by {item.chefName}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="fc-icon-button fc-icon-button-ghost"
                      aria-label={`Remove ${item.name} from cart`}
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Customizations */}
                  {item.customizations.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Customizations:
                      </span>
                      <div className="mt-1">
                        {item.customizations.map((customization, index) => (
                          <span
                            key={customization.id}
                            className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full mr-1 mb-1 inline-block"
                          >
                            {customization.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Item Meta */}
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{item.preparationTime} mins</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        Quantity:
                      </span>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="fc-touch-target bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l transition-colors"
                        >
                          -
                        </button>
                        <span className="bg-gray-100 px-4 py-1 border-t border-b border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="fc-touch-target bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Selection or No Events Message */}
        {cartChef && (
          <div className="mt-8 rounded-lg bg-white p-4 shadow-md sm:p-6">
            {events.length > 0 ? (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Select an Event
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Choose which event you'd like to place this order for:
                </p>

                {loadingEvents ? (
                  <div className="text-center py-4">
                    <div className="text-gray-500">Loading events...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <label
                        key={event.id}
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="selectedEvent"
                          value={event.id}
                          checked={selectedEvent === event.id}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-800">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            Event Date:{" "}
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  No Events Available
                </h3>
                <p className="text-gray-600 text-sm">
                  {cartChef.name} hasn't created any events yet. Orders can only
                  be placed for events. Please check back later or contact the
                  host about upcoming events.
                </p>
              </>
            )}
          </div>
        )}

        {/* Cart Actions */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={getContinueShoppingLink()}
            className="fc-button fc-button-secondary w-full sm:w-auto"
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
            {getContinueShoppingText()}
          </Link>

          <div className="flex w-full gap-4 sm:w-auto">
            <button
              onClick={() => {
                if (events.length === 0) {
                  alert(
                    "No events available from this host. Orders can only be placed for events.",
                  );
                  return;
                }
                if (!selectedEvent) {
                  alert("Please select an event for your order.");
                  return;
                }
                setShowOrderModal(true);
              }}
              disabled={events.length === 0 || !selectedEvent}
              className="fc-button fc-button-primary w-full sm:w-auto sm:px-8"
            >
              {events.length === 0 ? (
                <>No Events Available</>
              ) : (
                <>
                  Place Order ({getTotalItems()}{" "}
                  {getTotalItems() === 1 ? "item" : "items"})
                  {selectedEvent && events.length > 0 && (
                    <span className="block text-xs opacity-90">
                      for {events.find((e) => e.id === selectedEvent)?.title}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleClearCart}
        title="Clear Cart?"
        message={`Are you sure you want to remove all ${getTotalItems()} item${
          getTotalItems() === 1 ? "" : "s"
        } from your cart? This action cannot be undone.`}
        confirmText="Clear Cart"
        cancelText="Keep Items"
        isDestructive={true}
      />

      {/* Order Placement Modal */}
      <OrderPlacementModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onConfirm={handlePlaceOrder}
        events={events}
        selectedEvent={selectedEvent}
        totalItems={getTotalItems()}
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fc-dialog-backdrop bg-black/50" role="presentation">
          <div
            className="fc-dialog max-w-md rounded-lg bg-white p-5 text-center sm:p-8"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-success mb-2">
                Order Placed Successfully!
              </h2>
              <p className="text-gray-700">{celebrationMessage}</p>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                You can check your order status by visiting the host's event
                page.
              </p>
            </div>
            <button
              onClick={() => {
                setShowCelebration(false);
                clearCart();
              }}
              className="fc-button fc-button-primary"
            >
              Awesome! 🎊
            </button>
          </div>
        </div>
      )}
    </>
  );
}
