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
          className="fc-stat-label grid h-full w-full place-items-center"
          aria-label={`${itemName} image unavailable`}
        >
          No photo
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
      <div className="fc-panel fc-empty w-full">
        <h2 className="fc-empty-title">Menu not ready</h2>
        <p className="fc-empty-body">
          This host hasn&rsquo;t added any categories yet. Check back once
          they&rsquo;ve planned the night.
        </p>
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
            className="fc-avatar h-16 w-16 shrink-0 object-cover"
            priority
            onError={() => setHasProfileImageError(true)}
          />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-xl font-semibold tracking-[-0.03em] text-ink">
              {chef.name}
            </h1>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-text-muted">
              <span className="fc-badge fc-badge-brand">
                &#9733; {chef.rating}
              </span>
              <span>
                {menuItems.length}{" "}
                {menuItems.length === 1 ? "dish" : "dishes"}
              </span>
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
        <div className="space-y-4 md:sticky md:top-6">
          <div className="fc-card">
            <div className="flex items-start gap-3">
              <span className="fc-avatar h-14 w-14">
                <Image
                  src={profileImageSource}
                  alt=""
                  width={56}
                  height={56}
                  priority
                  onError={() => setHasProfileImageError(true)}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">
                  {chef.name}
                </span>
                <span className="fc-badge fc-badge-brand mt-1.5">
                  &#9733; {chef.rating}
                </span>
              </span>
            </div>
            {chef.bio && (
              <p className="mt-3 mb-0 line-clamp-3 text-xs leading-relaxed text-text-muted">
                {chef.bio}
              </p>
            )}
          </div>

          <div className="fc-panel overflow-hidden">
            <div className="fc-tabs" role="tablist">
              <button
                role="tab"
                onClick={() => setShowEventsTab(false)}
                className="fc-tab"
                aria-selected={!showEventsTab}
              >
                Menu
              </button>
              <button
                role="tab"
                onClick={openEventsTab}
                className="fc-tab"
                aria-selected={showEventsTab}
              >
                Events
                {availableEvents.length > 0 && (
                  <span className="fc-badge fc-badge-brand ml-1.5">
                    {availableEvents.length}
                  </span>
                )}
              </button>
            </div>

            <div className="fc-panel-body">
              {!showEventsTab ? (
                <>
                  <p className="fc-stat-label">Categories</p>
                  <div className="fc-navlist">
                    {categories.map((category: Category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="fc-navlist-item text-sm font-medium"
                        aria-current={selectedCategory === category.id}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <p className="fc-hint mt-5 border-t border-border-theme pt-4">
                    Already ordered? Your order and its status live in the
                    Events tab.
                  </p>
                </>
              ) : (
                <>
                  <p className="fc-stat-label">Upcoming events</p>

                  {availableEvents.length === 0 ? (
                    <p className="m-0 text-sm leading-relaxed text-text-muted">
                      No upcoming events from this host yet.
                    </p>
                  ) : (
                    <div className="fc-navlist">
                      {availableEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEventId(event.id)}
                          className="fc-navlist-item"
                          aria-current={selectedEventId === event.id}
                        >
                          <span className="block text-sm font-medium text-ink">
                            {event.title}
                          </span>
                          <span className="mt-1.5 flex items-center gap-2">
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
                            <span className="fc-mono text-xs text-text-subtle">
                              {event.eventOrders?.length || 0} orders
                            </span>
                          </span>
                        </button>
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
            <div className="fc-panel fc-empty">
              <h2 className="fc-empty-title">Nothing in this category</h2>
              <p className="fc-empty-body">
                The host is still building this part of the menu. Try another
                category.
              </p>
            </div>
          ) : (
            <>
              <div className="md:hidden">
                <div className="fc-mobile-meal-list">
                  <div className="mb-2 flex items-end justify-between gap-3 px-1">
                    <div>
                      <p className="fc-eyebrow">
                        {categories.find(
                          (category) => category.id === selectedCategory,
                        )?.name || "Menu"}
                      </p>
                      <h2 className="m-0 text-2xl font-semibold tracking-[-0.035em] text-ink">
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
                          <span className="fc-meta mt-3 text-xs">
                            <span>&#9733; {item.rating}</span>
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

              <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item: MenuItem) => (
                  <article
                    key={item.id}
                    className="fc-panel flex flex-col overflow-hidden"
                  >
                    <div className="relative h-44 w-full shrink-0 overflow-hidden border-b border-border-theme">
                      <ImageCarousel
                        images={item.images || []}
                        itemName={item.name}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="m-0 line-clamp-2 text-base font-semibold leading-snug tracking-[-0.02em] text-ink">
                        {item.name}
                      </h3>
                      <p className="fc-meta mt-1.5">
                        <span>&#9733; {item.rating}</span>
                        <span>{item.preparationTime} min</span>
                      </p>
                      <p className="mt-2.5 mb-0 line-clamp-3 text-sm leading-relaxed text-text-muted">
                        {item.description}
                      </p>
                      <button
                        onClick={() => openItem(item)}
                        className="fc-button fc-button-primary mt-4 w-full"
                      >
                        Add to order
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )
        ) : (
          // Show Event Order Details for Selected Event
          <div className="space-y-6">
            <div className="md:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="m-0 text-xl font-semibold tracking-[-0.03em] text-ink">
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
              <div className="fc-panel fc-empty">
                <h2 className="fc-empty-title">
                  {availableEvents.length > 0
                    ? "Pick an event"
                    : "No upcoming meals yet"}
                </h2>
                <p className="fc-empty-body">
                  {availableEvents.length > 0
                    ? "Choose an event to see who ordered what."
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
                  <section className="fc-panel">
                    <div className="fc-panel-header">
                      <div>
                        <p className="fc-eyebrow">Event</p>
                        <h2 className="fc-panel-title">
                          {selectedEvent.title}
                        </h2>
                        <p className="fc-panel-sub">
                          {new Date(selectedEvent.eventDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <p className="fc-stat-label m-0">
                        {selectedEvent.eventOrders.length}{" "}
                        {selectedEvent.eventOrders.length === 1
                          ? "order"
                          : "orders"}
                      </p>
                    </div>

                    {selectedEvent.eventOrders.length === 0 ? (
                      <div className="fc-empty">
                        <h3 className="fc-empty-title">No orders yet</h3>
                        <p className="fc-empty-body">
                          Orders appear here as guests place them.
                        </p>
                      </div>
                    ) : (
                      <div className="fc-panel-body">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {selectedEvent.eventOrders.map((order) => {
                            const statusBadge =
                              order.status === "PENDING"
                                ? { variant: "fc-badge-warning", text: "Pending" }
                                : order.status === "CONFIRMED"
                                  ? {
                                      variant: "fc-badge-success",
                                      text: "Confirmed",
                                    }
                                  : order.status === "CANCELLED"
                                    ? {
                                        variant: "fc-badge-danger",
                                        text: "Rejected",
                                      }
                                    : {
                                        variant: "fc-badge-neutral",
                                        text: "Unknown",
                                      };

                            return (
                              <article key={order.id} className="fc-card">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="m-0 min-w-0 truncate text-sm font-semibold text-ink">
                                    {order.customerName}
                                  </h4>
                                  <span
                                    className={`fc-badge shrink-0 ${statusBadge.variant}`}
                                  >
                                    {statusBadge.text}
                                  </span>
                                </div>

                                <ul className="mt-3 mb-0 list-none p-0">
                                  {order.eventOrderItems.map((item, index) => (
                                    <li
                                      key={item.id}
                                      className={`flex items-baseline justify-between gap-3 py-2 ${
                                        index > 0
                                          ? "border-t border-border-theme"
                                          : ""
                                      }`}
                                    >
                                      <span className="min-w-0">
                                        <span className="block text-sm text-ink">
                                          {item.menuItem.name}
                                        </span>
                                        {item.specialNotes && (
                                          <span className="mt-0.5 block text-xs text-text-subtle">
                                            {item.specialNotes}
                                          </span>
                                        )}
                                      </span>
                                      <span className="fc-mono shrink-0 text-sm text-text-muted">
                                        &times;{item.quantity}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
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
