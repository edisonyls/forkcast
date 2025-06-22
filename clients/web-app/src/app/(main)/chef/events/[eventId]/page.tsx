"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Chef {
  id: string;
  name: string;
  username: string;
}

interface MenuItemBasic {
  id: string;
  name: string;
}

interface EventOrderItem {
  id: string;
  quantity: number;
  specialNotes?: string;
  menuItem: MenuItemBasic;
  createdAt: string;
  updatedAt: string;
}

interface EventOrder {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  specialRequests?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  eventOrderItems: EventOrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  maxOrders?: number;
  chef: Chef;
  eventOrders: EventOrder[];
  _count: {
    eventOrders: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvent(data.data.event);
      } else if (response.status === 401) {
        router.push("/chef/signin");
      } else if (response.status === 404) {
        setError("Event not found");
      } else {
        setError("Failed to load event. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: "CONFIRMED" | "CANCELLED"
  ) => {
    setStatusUpdating(orderId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvent((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            eventOrders: prev.eventOrders.map((order) =>
              order.id === orderId ? { ...order, status } : order
            ),
          };
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("An error occurred while updating the order status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isEventPast = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);

    // Set both dates to start of day for fair comparison
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);

    return event < today;
  };

  const calculateOrderTotal = (orderItems: EventOrderItem[]) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || "Event not found"}</div>
          <Link
            href="/chef/events"
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/chef/events"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium mb-2 inline-block"
              >
                ← Back to Events
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {event._count.eventOrders}{" "}
                  {event._count.eventOrders === 1 ? "order" : "orders"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Event Details
          </h2>

          {event.description && (
            <p className="text-gray-700 mb-4">{event.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Event Date:</span>
              <p
                className={`mt-1 ${
                  isEventPast(event.eventDate)
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-900">Orders:</span>
              <p className="mt-1 text-gray-600">
                {event._count.eventOrders}
                {event.maxOrders && ` / ${event.maxOrders}`}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Created:</span>
              <p className="mt-1 text-gray-600">
                {new Date(event.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Orders</h2>
          </div>

          {event.eventOrders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {event.eventOrders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {order.customerName}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status === "CANCELLED"
                            ? "REJECTED"
                            : order.status}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-gray-600">
                        {order.customerEmail && (
                          <p>Email: {order.customerEmail}</p>
                        )}
                        {order.customerPhone && (
                          <p>Phone: {order.customerPhone}</p>
                        )}
                        <p>
                          Ordered:{" "}
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {(order.status === "PENDING" ||
                      order.status === "CONFIRMED" ||
                      order.status === "CANCELLED") && (
                      <div className="flex space-x-2">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "CONFIRMED")
                            }
                            disabled={statusUpdating === order.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            {statusUpdating === order.id ? "..." : "Confirm"}
                          </button>
                        )}
                        {(order.status === "PENDING" ||
                          order.status === "CONFIRMED") && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "CANCELLED")
                            }
                            disabled={statusUpdating === order.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            {statusUpdating === order.id ? "..." : "Reject"}
                          </button>
                        )}
                        {order.status === "CANCELLED" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "CONFIRMED")
                            }
                            disabled={statusUpdating === order.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            {statusUpdating === order.id ? "..." : "Confirm"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Order Items ({calculateOrderTotal(order.eventOrderItems)}{" "}
                      items)
                    </h4>
                    <div className="space-y-2">
                      {order.eventOrderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <span className="font-medium">
                              {item.menuItem.name}
                            </span>
                            <span className="text-gray-600 ml-2">
                              x{item.quantity}
                            </span>
                            {item.specialNotes && (
                              <p className="text-sm text-gray-600 mt-1">
                                Note:{" "}
                                {item.specialNotes.replace(
                                  /^Customizations:\s*/,
                                  ""
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.specialRequests && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Special Requests:
                        </h5>
                        <p className="text-sm text-gray-700">
                          {order.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
