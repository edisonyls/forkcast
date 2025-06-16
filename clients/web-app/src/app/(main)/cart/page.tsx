"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";
import OrderPlacementModal from "@/components/OrderPlacementModal";

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
  } = useCart();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch events when cart chef changes
  useEffect(() => {
    if (cartChef) {
      fetchEvents(cartChef.id);
    }
  }, [cartChef]);

  const fetchEvents = async (chefId: string | number) => {
    try {
      setLoadingEvents(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chefId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const availableEvents = (data.data.events || []).filter(
          (event: Event) => event.status === "OPEN"
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
            items: items.map((item) => {
              let specialNotes = "";

              // Include customizations in special notes
              if (item.customizations && item.customizations.length > 0) {
                specialNotes = `Customizations: ${item.customizations
                  .map((c) => c.name)
                  .join(", ")}`;
              }

              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                specialNotes: specialNotes || undefined,
              };
            }),
          }),
        }
      );

      if (response.ok) {
        const eventInfo = events.find((e) => e.id === selectedEvent);
        alert(
          `Order placed successfully for: ${eventInfo?.title}!\n\nYou can see your order status on the menu items.`
        );
        // Clear the cart after successful order
        clearCart();
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
      <div className="container mx-auto px-4 py-8">
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
            Start exploring our amazing chefs and add some delicious items to
            your cart!
          </p>
          <Link
            href={getContinueShoppingLink()}
            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
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
              : "Browse Chefs"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Order</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <p className="text-gray-600">
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in
                your cart
              </p>
              {cartChef && (
                <>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <p className="text-orange-600 font-medium">
                    from {cartChef.name}
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowClearConfirmation(true)}
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
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
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Item Image */}
                <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-orange-600 font-medium">
                        by {item.chefName}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
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
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        Quantity:
                      </span>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l transition-colors"
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
                          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r transition-colors"
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
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
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
                          className="text-orange-600 focus:ring-orange-500"
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
                  chef about upcoming events.
                </p>
              </>
            )}
          </div>
        )}

        {/* Cart Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link
            href={getContinueShoppingLink()}
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2"
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

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (events.length === 0) {
                  alert(
                    "No events available from this chef. Orders can only be placed for events."
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
              className="bg-orange-600 text-white px-8 py-3 rounded-md hover:bg-orange-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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
    </>
  );
}
