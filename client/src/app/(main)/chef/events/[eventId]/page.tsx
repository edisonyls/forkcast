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
        },
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
    status: "CONFIRMED" | "CANCELLED",
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
        },
      );

      if (response.ok) {
        const data = await response.json();
        setEvent((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            eventOrders: prev.eventOrders.map((order) =>
              order.id === orderId ? { ...order, status } : order,
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
        return "fc-badge-success";
      case "CLOSED":
        return "fc-badge-neutral";
      case "CANCELLED":
        return "fc-badge-danger";
      case "PENDING":
        return "fc-badge-warning";
      case "CONFIRMED":
        return "fc-badge-success";
      default:
        return "fc-badge-neutral";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "fc-badge-warning";
      case "CONFIRMED":
        return "fc-badge-success";
      case "CANCELLED":
        return "fc-badge-danger";
      default:
        return "fc-badge-neutral";
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
            className="fc-button fc-button-primary"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-4 sm:py-8">
      <div className="fc-shell">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/chef/events"
                className="mb-2 inline-block text-sm font-medium text-brand-ink hover:text-ink"
              >
                ← Back to Events
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {event.title}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`fc-badge ${getStatusColor(
                    event.status,
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
        <div className="mb-6 rounded-lg bg-white p-4 shadow sm:mb-8 sm:p-6">
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
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Orders</h2>
          </div>

          {event.eventOrders.length === 0 ? (
            <div className="p-4 text-center sm:p-6">
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {event.eventOrders.map((order) => (
                <div key={order.id} className="p-4 sm:p-6">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {order.customerName}
                        </h3>
                        <span
                          className={`fc-badge ${getOrderStatusColor(
                            order.status,
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
                      <div className="flex flex-wrap gap-2">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "CONFIRMED")
                            }
                            disabled={statusUpdating === order.id}
                            className="fc-button fc-button-primary text-sm"
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
                            className="fc-button fc-button-danger text-sm"
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
                            className="fc-button fc-button-primary text-sm"
                          >
                            {statusUpdating === order.id ? "..." : "Confirm"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
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
                                  "",
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
