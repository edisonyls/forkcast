"use client";

import React, { useState } from "react";
import Image from "next/image";
import CustomizationModal from "./CustomisationModal";
import ImageCarousel from "./ImageCarousel";

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
  customizableOptions: any[]; // You may want to import the CustomizationOption interface from CustomisationModal
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

export default function ChefMenu({
  chef,
  categories,
  menuItems,
  events = [],
}: ChefMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    categories.length > 0 ? categories[0].id : null,
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEventsTab, setShowEventsTab] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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
      {/* Left Side - Categories and Event Orders */}
      <div className="w-full md:w-1/4">
        <div className="space-y-4 md:sticky md:top-4">
          {/* Chef Info */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <Image
              src={
                chef.image &&
                !chef.image.startsWith("http") &&
                !chef.image.startsWith("/user.png") &&
                !chef.image.startsWith("data:")
                  ? `${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
                    }${chef.image}`
                  : chef.image || "/user.png"
              }
              alt={chef.name}
              width={80}
              height={80}
              className="rounded-full mx-auto mb-2"
              priority
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-sm">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-700 mb-2">
                  <strong>Have placed an order?</strong> Check the Events tab to
                  review and track your orders!
                </p>
                <button
                  onClick={() => setShowEventsTab(true)}
                  className="fc-touch-target border border-green-300 bg-white px-2 py-1 text-xs text-green-700 rounded hover:bg-green-50 transition-colors"
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
                    ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setShowEventsTab(true)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                  showEventsTab
                    ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Events
                {availableEvents.length > 0 && (
                  <span className="ml-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
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
                              ? "bg-green-100 text-green-700"
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
                  <h3 className="font-bold mb-4 text-green-700">
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
                          className={`border rounded-lg p-3 hover:bg-green-100 transition-colors cursor-pointer ${
                            selectedEventId === event.id
                              ? "bg-green-100 border-green-300"
                              : "bg-green-50 border-green-200"
                          }`}
                        >
                          <h4 className="font-medium text-sm text-green-900 mb-2">
                            {event.title}
                          </h4>
                          <div className="flex justify-between items-center">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                event.status === "OPEN"
                                  ? "bg-green-100 text-green-800"
                                  : event.status === "CLOSED"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {event.status || "OPEN"}
                            </span>
                            <span className="text-xs text-green-600">
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
      <div className="w-full md:w-3/4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex-shrink-0">
                        {item.preparationTime} mins
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3 overflow-hidden">
                      {item.description}
                    </p>
                    <div className="flex justify-center items-center mb-4 mt-auto">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{item.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsModalOpen(true);
                      }}
                      className="fc-touch-target w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Show Event Order Details for Selected Event
          <div className="space-y-6">
            {!selectedEventId ? (
              <div className="bg-white rounded-lg shadow-md p-5 text-center sm:p-8">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  🗓️ Event Orders Overview
                </h2>
                <p className="text-gray-600">
                  Select an event from the sidebar to view its order details.
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
                                  bg: "bg-yellow-500",
                                  text: "⏳ Pending",
                                };
                              case "CONFIRMED":
                                return {
                                  bg: "bg-green-500",
                                  text: "✓ Confirmed",
                                };
                              case "CANCELLED":
                                return { bg: "bg-red-500", text: "✗ Rejected" };
                              default:
                                return { bg: "bg-gray-500", text: "Unknown" };
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
                                className={`absolute top-2 right-2 ${statusBadge.bg} text-white text-xs px-2 py-1 rounded-full font-medium`}
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
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
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
