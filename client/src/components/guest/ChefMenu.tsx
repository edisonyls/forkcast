"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomizationModal from "./CustomizationModal";
import ImageCarousel from "./ImageCarousel";
import { useCart } from "@/contexts/CartContext";

interface Chef {
  id: string | number;
  name: string;
  image?: string;
  rating: number;
  bio?: string;
}

interface Category {
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
  categoryId: string | number;
  chefId: string | number;
  customizableOptions: any[]; // You may want to import the CustomizationOption interface from CustomizationModal
}

interface EventOrderItem {
  id: string;
  quantity: number;
  specialNotes?: string;
  menuItem: {
    id: string;
    name: string;
  };
}

interface EventOrder {
  id: string;
  customerName: string;
  customerEmail?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  eventOrderItems: EventOrderItem[];
}

interface Event {
  id: string;
  title: string;
  eventDate: string;
  status?: "OPEN" | "CLOSED" | "CANCELLED";
  eventOrders: EventOrder[];
}

interface ChefMenuProps {
  chef: Chef;
  categories: Category[];
  menuItems: MenuItem[];
  events?: Event[]; // Optional for backward compatibility
}

interface MenuItemThumbnailProps {
  imageSource: string | null;
  itemName: string;
  eager?: boolean;
}

function MenuItemThumbnail({
  imageSource,
  itemName,
  eager = false,
}: MenuItemThumbnailProps) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <span className="fc-mobile-meal-image">
      {imageSource && !hasImageError ? (
        <Image
          src={imageSource}
          alt=""
          fill
          sizes="7rem"
          className="object-cover"
          loading={eager ? "eager" : "lazy"}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-3xl"
          aria-label={`${itemName} image unavailable`}
        >
          🍽️
        </span>
      )}
      <span className="fc-mobile-add-icon" aria-hidden="true">
        +
      </span>
    </span>
  );
}

export default function ChefMenu({
  chef,
  categories,
  menuItems,
  events = [],
}: ChefMenuProps) {
  const { cartChef, getTotalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(
    categories.length > 0 ? categories[0].id : null,
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEventsTab, setShowEventsTab] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [hasProfileImageError, setHasProfileImageError] = useState(false);

  const filteredItems = selectedCategory
    ? menuItems.filter(
        (item: MenuItem) =>
          item.categoryId === selectedCategory && item.chefId === chef.id,
      )
    : [];

  // Get upcoming events with orders
  const upcomingEventsWithOrders = events.filter((event) => {
    const today = new Date();
    const eventDate = new Date(event.eventDate);

    // Set both dates to start of day for fair comparison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate >= today && event.eventOrders.length > 0;
  });

  // Filter events to only show upcoming/open events
  const availableEvents = events.filter((event) => {
    const today = new Date();
    const eventDate = new Date(event.eventDate);

    // Set both dates to start of day for fair comparison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate >= today && event.status !== "CANCELLED";
  });

  const totalCartItems = getTotalItems();
  const showCartDock =
    totalCartItems > 0 && cartChef?.id.toString() === chef.id.toString();

  const openEventsTab = () => {
    setShowEventsTab(true);
    if (!selectedEventId && availableEvents.length > 0) {
      setSelectedEventId(availableEvents[0].id);
    }
  };

  const openItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const getMenuImageSource = (image?: string) => {
    if (!image) return null;
    if (image.startsWith("http") || image.startsWith("data:")) {
      return image;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}${image}`;
  };

  const profileImageSource = hasProfileImageError
    ? "/user.png"
    : chef.image &&
        !chef.image.startsWith("http") &&
        !chef.image.startsWith("/user.png") &&
        !chef.image.startsWith("data:")
      ? `${process.env.NEXT_PUBLIC_API_URL}${chef.image}`
      : chef.image || "/user.png";

  // Aggregate orders by menu item across all events
  const getOrderSummary = () => {
    const summary: {
      [key: string]: { name: string; totalQuantity: number; events: string[] };
    } = {};

    upcomingEventsWithOrders.forEach((event) => {
      event.eventOrders.forEach((order) => {
        order.eventOrderItems.forEach((item) => {
          const menuItemId = item.menuItem.id;
          if (!summary[menuItemId]) {
            summary[menuItemId] = {
              name: item.menuItem.name,
              totalQuantity: 0,
              events: [],
            };
          }
          summary[menuItemId].totalQuantity += item.quantity;
          if (!summary[menuItemId].events.includes(event.title)) {
            summary[menuItemId].events.push(event.title);
          }
        });
      });
    });

    return summary;
  };

  const orderSummary = getOrderSummary();

  // If no categories are available, show a message
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          This host hasn't added any menu categories yet.
        </p>
        <p className="text-gray-400 text-sm mt-2">Please check back later!</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* Mobile-first host summary and sticky meal navigation */}
      <div className="md:hidden">
        <section className="fc-mobile-host-summary">
          <Image
            src={profileImageSource}
            alt={chef.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            priority
            onError={() => setHasProfileImageError(true)}
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-ink">{chef.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
              <span className="fc-badge fc-badge-brand">★ {chef.rating}</span>
              <span>{menuItems.length} meals</span>
            </div>
            {chef.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                {chef.bio}
              </p>
            )}
          </div>
        </section>

        <div className="fc-mobile-meal-nav">
          <div className="fc-mobile-segmented-control" aria-label="Meal views">
            <button
              type="button"
              onClick={() => setShowEventsTab(false)}
              className="fc-mobile-segment"
              aria-pressed={!showEventsTab}
            >
              Menu
            </button>
            <button
              type="button"
              onClick={openEventsTab}
              className="fc-mobile-segment"
              aria-pressed={showEventsTab}
            >
              Orders
              {availableEvents.length > 0 && (
                <span className="fc-badge fc-badge-brand">
                  {availableEvents.length}
                </span>
              )}
            </button>
          </div>

          {!showEventsTab && (
            <div
              className="fc-mobile-category-strip"
              aria-label="Meal categories"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className="fc-category-chip"
                  aria-pressed={selectedCategory === category.id}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Side - Categories and Event Orders */}
      <div className="hidden md:block md:w-1/4">
        <div className="space-y-4 md:sticky md:top-4">
          {/* Chef Info */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <Image
              src={profileImageSource}
              alt={chef.name}
              width={80}
              height={80}
              className="rounded-full mx-auto mb-2"
              priority
              onError={() => setHasProfileImageError(true)}
            />
            <h2 className="text-sm font-bold text-center">{chef.name}</h2>
            {chef.bio && (
              <p className="text-xs text-gray-600 text-center mt-1 mb-2 line-clamp-2">
                {chef.bio}
              </p>
            )}
            <div className="flex justify-center items-center">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="ml-1 text-sm">{chef.rating}</span>
            </div>
          </div>

          {/* Information Panel for Finding Orders */}
          <div className="fc-feedback fc-feedback-info">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <span className="text-sm">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-2">
                  <strong>Have placed an order?</strong> Check the Events tab to
                  review and track your orders!
                </p>
                <button
                  onClick={openEventsTab}
                  className="fc-button fc-button-secondary text-xs"
                >
                  🗓️ View Orders
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setShowEventsTab(false)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  !showEventsTab
                    ? "bg-brand-soft text-brand-ink border-b-2 border-brand-strong"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Menu
              </button>
              <button
                onClick={openEventsTab}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                  showEventsTab
                    ? "bg-brand-soft text-brand-ink border-b-2 border-brand-strong"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Events
                {availableEvents.length > 0 && (
                  <span className="fc-badge fc-badge-brand ml-1">
                    {availableEvents.length}
                  </span>
                )}
              </button>
            </div>

            <div className="p-4">
              {!showEventsTab ? (
                // Menu Categories
                <>
                  <h3 className="font-bold mb-4">Menu Categories</h3>
                  <ul className="space-y-2">
                    {categories.map((category: Category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => setSelectedCategory(category.id)}
                          className={`min-h-[var(--fc-touch-target)] w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCategory === category.id
                              ? "bg-brand-soft text-brand-ink"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                // Events Tab
                <>
                  <h3 className="font-bold mb-4 text-brand-ink">
                    🗓️ Available Events
                  </h3>

                  {availableEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 mb-2">
                        No upcoming events available from this host
                      </p>
                      <p className="text-xs text-gray-400">
                        Check back later for upcoming events!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEventId(event.id)}
                          className={`rounded-lg border p-3 transition-colors cursor-pointer hover:bg-brand-soft ${
                            selectedEventId === event.id
                              ? "bg-brand-soft border-brand-strong"
                              : "bg-surface border-border-theme"
                          }`}
                        >
                          <h4 className="font-medium text-sm text-ink mb-2">
                            {event.title}
                          </h4>
                          <div className="flex justify-between items-center">
                            <span
                              className={`fc-badge ${
                                event.status === "OPEN"
                                  ? "fc-badge-success"
                                  : event.status === "CLOSED"
                                    ? "fc-badge-neutral"
                                    : "fc-badge-danger"
                              }`}
                            >
                              {event.status || "OPEN"}
                            </span>
                            <span className="text-xs text-brand-ink">
                              {event.eventOrders?.length || 0} orders
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Menu Items */}
      <div className={`w-full md:w-3/4 ${showCartDock ? "pb-24 md:pb-0" : ""}`}>
        {!showEventsTab ? (
          // Show Menu Items
          filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No menu items in this category yet.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                The host is still building their menu!
              </p>
            </div>
          ) : (
            <>
              <div className="md:hidden">
                <div className="fc-mobile-meal-list">
                  <div className="mb-2 flex items-end justify-between gap-3 px-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink">
                        {categories.find(
                          (category) => category.id === selectedCategory,
                        )?.name || "Menu"}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-ink">
                        Choose your meal
                      </h2>
                    </div>
                    <span className="text-sm text-text-muted">
                      {filteredItems.length} items
                    </span>
                  </div>

                  {filteredItems.map((item: MenuItem, itemIndex) => {
                    const imageSource = getMenuImageSource(item.images?.[0]);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openItem(item)}
                        className="fc-mobile-meal-row"
                        aria-label={`View ${item.name}`}
                      >
                        <span className="min-w-0 flex-1 py-1 text-left">
                          <span className="line-clamp-2 text-base font-bold leading-snug text-ink">
                            {item.name}
                          </span>
                          <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
                            {item.description}
                          </span>
                          <span className="mt-3 flex items-center gap-2 text-xs font-medium text-text-muted">
                            <span className="text-warning">
                              ★ {item.rating}
                            </span>
                            <span aria-hidden="true">•</span>
                            <span>{item.preparationTime} min</span>
                          </span>
                        </span>

                        <MenuItemThumbnail
                          imageSource={imageSource}
                          itemName={item.name}
                          eager={itemIndex === 0}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3">
                {filteredItems.map((item: MenuItem) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col"
                  >
                    <div className="relative h-48 w-full flex-shrink-0 overflow-hidden">
                      <ImageCarousel
                        images={item.images || []}
                        itemName={item.name}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold flex-1 mr-2 line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        <span className="fc-badge fc-badge-brand flex-shrink-0">
                          {item.preparationTime} mins
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3 overflow-hidden">
                        {item.description}
                      </p>
                      <div className="flex justify-center items-center mb-4 mt-auto">
                        <div className="flex items-center">
                          <span className="text-warning">★</span>
                          <span className="ml-1">{item.rating}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openItem(item)}
                        className="fc-button fc-button-primary w-full"
                      >
                        Add to Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          // Show Event Order Details for Selected Event
          <div className="space-y-6">
            <div className="md:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">
                  Your upcoming meals
                </h2>
                <span className="text-sm text-text-muted">
                  {availableEvents.length} events
                </span>
              </div>
              {availableEvents.length > 0 && (
                <div
                  className="fc-mobile-category-strip"
                  aria-label="Upcoming events"
                >
                  {availableEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEventId(event.id)}
                      className="fc-category-chip"
                      aria-pressed={selectedEventId === event.id}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!selectedEventId ? (
              <div className="bg-white rounded-lg shadow-md p-5 text-center sm:p-8">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  {availableEvents.length > 0
                    ? "🗓️ Event Orders Overview"
                    : "🗓️ No upcoming meals yet"}
                </h2>
                <p className="text-gray-600">
                  {availableEvents.length > 0
                    ? "Select an event to view its order details."
                    : "New events from this host will appear here."}
                </p>
              </div>
            ) : (
              (() => {
                const selectedEvent = availableEvents.find(
                  (e) => e.id === selectedEventId,
                );
                if (!selectedEvent) return null;

                return (
                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <div className="border-l-4 border-green-500 pl-4 mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedEvent.title}
                      </h2>
                      <p className="text-gray-600">
                        📅{" "}
                        {new Date(selectedEvent.eventDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedEvent.eventOrders.length} total orders
                      </p>
                    </div>

                    {selectedEvent.eventOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                          No orders placed for this event yet.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Orders will appear here once customers start placing
                          them.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedEvent.eventOrders.map((order) => {
                          // Determine status badge color and text
                          const getStatusBadge = (status: string) => {
                            switch (status) {
                              case "PENDING":
                                return {
                                  variant: "fc-badge-warning",
                                  text: "⏳ Pending",
                                };
                              case "CONFIRMED":
                                return {
                                  variant: "fc-badge-success",
                                  text: "✓ Confirmed",
                                };
                              case "CANCELLED":
                                return {
                                  variant: "fc-badge-danger",
                                  text: "✗ Rejected",
                                };
                              default:
                                return {
                                  variant: "fc-badge-neutral",
                                  text: "Unknown",
                                };
                            }
                          };

                          const statusBadge = getStatusBadge(order.status);

                          return (
                            <div
                              key={order.id}
                              className="bg-gray-50 rounded-lg p-4 border relative"
                            >
                              {/* Status Badge */}
                              <div
                                className={`fc-badge absolute top-2 right-2 ${statusBadge.variant}`}
                              >
                                {statusBadge.text}
                              </div>

                              <h4 className="font-medium text-gray-900 mb-3 pr-20">
                                👤 {order.customerName}
                              </h4>
                              <div className="space-y-2">
                                {order.eventOrderItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="border-b border-gray-200 pb-2 last:border-b-0"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-gray-700 font-medium text-sm">
                                        {item.menuItem.name}
                                      </span>
                                      <span className="fc-badge fc-badge-brand">
                                        {item.quantity}x
                                      </span>
                                    </div>
                                    {item.specialNotes && (
                                      <p className="text-xs text-gray-500 italic">
                                        📝 {item.specialNotes}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {showCartDock && (
        <div className="fc-mobile-cart-dock md:hidden">
          <Link
            href="/cart"
            className="fc-button fc-button-primary w-full justify-between"
          >
            <span className="fc-mobile-cart-count">{totalCartItems}</span>
            <span>View cart</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      {/* Customization Modal */}
      {selectedItem && (
        <CustomizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={{
            ...selectedItem,
            chefId: chef.id,
            chefName: chef.name,
          }}
        />
      )}
    </React.Fragment>
  );
}
