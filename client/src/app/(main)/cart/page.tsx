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
      return `Back to ${cartChef.name}'s menu`;
    }
    // Otherwise, use last visited chef if available
    if (lastVisitedChef?.hasAccess) {
      return `Back to ${lastVisitedChef.name}'s menu`;
    }
    return "Continue browsing";
  };

  const celebrationDialog = showCelebration ? (
    <div className="fc-dialog-backdrop" role="presentation">
      <div
        className="fc-dialog max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-celebration-title"
      >
        <div className="fc-dialog-header">
          <div>
            <p className="fc-eyebrow">Order sent</p>
            <h2 id="order-celebration-title" className="fc-dialog-title">
              You&rsquo;re on the list
            </h2>
          </div>
        </div>
        <div className="fc-dialog-body">
          <p className="mt-0 mb-3 text-sm leading-relaxed text-ink">
            {celebrationMessage}
          </p>
          <p className="fc-hint m-0">
            The host will confirm it shortly. You can check the status on their
            event page any time.
          </p>
        </div>
        <div className="fc-dialog-footer">
          <button
            onClick={() => {
              setShowCelebration(false);
              clearCart();
            }}
            className="fc-button fc-button-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (items.length === 0) {
    return (
      <>
        <div className="fc-shell fc-page">
          <header className="fc-page-header">
            <div className="min-w-0">
              <p className="fc-eyebrow">Your order</p>
              <h1 className="fc-page-title">
                Nothing here <em>yet</em>
              </h1>
              <p className="fc-page-lead">
                Pick a few dishes from a host&rsquo;s menu and they&rsquo;ll
                collect here, ready to send in one go.
              </p>
            </div>
            <div className="fc-page-actions">
              <Link
                href={getContinueShoppingLink()}
                className="fc-button fc-button-primary"
              >
                {lastVisitedChef?.hasAccess
                  ? `Browse ${lastVisitedChef.name}'s menu`
                  : "Browse hosts"}
              </Link>
            </div>
          </header>
        </div>

        {celebrationDialog}
      </>
    );
  }

  return (
    <>
      <div className="fc-shell fc-page">
        <header className="fc-page-header">
          <div className="min-w-0">
            <p className="fc-eyebrow">Your order</p>
            <h1 className="fc-page-title">
              {getTotalItems()} {getTotalItems() === 1 ? "dish" : "dishes"}
              {cartChef ? (
                <>
                  {" "}
                  from <em>{cartChef.name}</em>
                </>
              ) : null}
            </h1>
            <p className="fc-page-lead">
              Check the quantities, choose the night, and send it to the host in
              one go.
            </p>
          </div>
          <div className="fc-page-actions">
            <button
              onClick={() => setShowClearConfirmation(true)}
              className="fc-button fc-button-danger-ghost"
            >
              Clear cart
            </button>
          </div>
        </header>

        <section className="fc-panel">
          <div className="fc-panel-header">
            <h2 className="fc-panel-title">Items</h2>
            <p className="fc-stat-label m-0">
              {items.length} {items.length === 1 ? "line" : "lines"}
            </p>
          </div>

          <ul className="fc-list m-0 list-none p-0">
            {items.map((item) => (
              <li key={item.id} className="fc-row flex-nowrap items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[var(--fc-radius-control)] border border-border-theme bg-surface-muted sm:h-24 sm:w-24">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="m-0 text-base font-semibold tracking-[-0.02em] text-ink">
                      {item.name}
                    </h3>
                    <p className="fc-meta mt-1">
                      <span>by {item.chefName}</span>
                      <span>&#9733; {item.rating}</span>
                      <span>{item.preparationTime} min</span>
                    </p>

                    {item.description && (
                      <p className="mt-2 mb-0 line-clamp-2 text-sm leading-relaxed text-text-muted">
                        {item.description}
                      </p>
                    )}

                    {item.customizations.length > 0 && (
                      <div className="mt-3">
                        <span className="fc-stat-label">Customisations</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.customizations.map((customization) => (
                            <span key={customization.id} className="fc-chip">
                              {customization.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="fc-stepper">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          &minus;
                        </button>
                        <span className="fc-stepper-value">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </span>
                      <span className="fc-hint m-0">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="fc-icon-button fc-icon-button-ghost fc-close shrink-0"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </section>

        {cartChef && (
          <section className="fc-panel">
            <div className="fc-panel-header">
              <div>
                <p className="fc-eyebrow">Step two</p>
                <h2 className="fc-panel-title">
                  {events.length > 0 ? "Pick a night" : "No nights open"}
                </h2>
                <p className="fc-panel-sub">
                  {events.length > 0
                    ? "Orders go to one event, so the host knows what to cook and when."
                    : `${cartChef.name} hasn't opened an event yet.`}
                </p>
              </div>
            </div>

            <div className="fc-panel-body">
              {loadingEvents ? (
                <div className="fc-loading min-h-0" role="status">
                  <span className="fc-spinner" aria-hidden="true" />
                  Loading events
                </div>
              ) : events.length > 0 ? (
                <div className="grid gap-2">
                  {events.map((event) => (
                    <label key={event.id} className="fc-option">
                      <input
                        type="radio"
                        name="selectedEvent"
                        value={event.id}
                        checked={selectedEvent === event.id}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                          {event.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-text-muted">
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="m-0 text-sm leading-relaxed text-text-muted">
                  Orders can only be placed against an open event. Check back
                  later, or ask {cartChef.name} when the next one is.
                </p>
              )}
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={getContinueShoppingLink()}
            className="fc-button fc-button-secondary w-full sm:w-auto"
          >
            &larr; {getContinueShoppingText()}
          </Link>

          <button
            onClick={() => setShowOrderModal(true)}
            disabled={events.length === 0 || !selectedEvent}
            className="fc-button fc-button-primary w-full sm:w-auto sm:px-8"
          >
            {events.length === 0
              ? "No events available"
              : !selectedEvent
                ? "Pick a night to continue"
                : `Place order · ${getTotalItems()} ${
                    getTotalItems() === 1 ? "item" : "items"
                  }`}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleClearCart}
        title="Clear your cart?"
        message={`This removes all ${getTotalItems()} item${
          getTotalItems() === 1 ? "" : "s"
        }. There's no undo.`}
        confirmText="Clear cart"
        cancelText="Keep items"
        isDestructive={true}
      />

      <OrderPlacementModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onConfirm={handlePlaceOrder}
        events={events}
        selectedEvent={selectedEvent}
        totalItems={getTotalItems()}
      />

      {celebrationDialog}
    </>
  );
}
