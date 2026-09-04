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
      <div className="fc-loading" role="status">
        <span className="fc-spinner" aria-hidden="true" />
        Loading event
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="fc-shell fc-page">
        <div className="fc-panel fc-empty">
          <h1 className="fc-empty-title">Event not found</h1>
          <p className="fc-empty-body">
            {error || "This event may have been deleted."}
          </p>
          <div className="fc-empty-actions">
            <Link href="/chef/events" className="fc-button fc-button-primary">
              Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fc-shell fc-page">
      <header className="fc-page-header">
        <div className="min-w-0">
          <Link
            href="/chef/events"
            className="fc-button fc-button-ghost -ml-2 mb-2 px-2 text-sm"
          >
            &larr; Back to events
          </Link>
          <p className="fc-eyebrow">Event orders</p>
          <h1 className="fc-page-title">{event.title}</h1>
          <p className="fc-meta mt-3">
            <span className={`fc-badge ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
            <span>
              {event._count.eventOrders}{" "}
              {event._count.eventOrders === 1 ? "order" : "orders"}
            </span>
          </p>
        </div>
      </header>

      <section className="fc-panel">
        <div className="fc-panel-header">
          <h2 className="fc-panel-title">Event details</h2>
        </div>
        <div className="fc-panel-body">
          {event.description && (
            <p className="mt-0 mb-5 max-w-[70ch] text-sm leading-relaxed text-text-muted">
              {event.description}
            </p>
          )}

          <dl className="fc-stat-grid">
            <div>
              <dt className="fc-stat-label">Event date</dt>
              <dd
                className={`fc-stat-value ${
                  isEventPast(event.eventDate) ? "text-danger" : ""
                }`}
              >
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="fc-stat-label">Orders</dt>
              <dd className="fc-stat-value">
                {event._count.eventOrders}
                {event.maxOrders && ` / ${event.maxOrders}`}
              </dd>
            </div>
            <div>
              <dt className="fc-stat-label">Created</dt>
              <dd className="fc-stat-value">
                {new Date(event.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="fc-panel">
        <div className="fc-panel-header">
          <h2 className="fc-panel-title">Orders</h2>
          <p className="fc-stat-label m-0">
            {event.eventOrders.length}{" "}
            {event.eventOrders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        {event.eventOrders.length === 0 ? (
          <div className="fc-empty">
            <h3 className="fc-empty-title">No orders yet</h3>
            <p className="fc-empty-body">
              Share your menu secret with guests and their orders will land
              here.
            </p>
          </div>
        ) : (
          <ul className="fc-list m-0 list-none p-0">
            {event.eventOrders.map((order) => (
              <li key={order.id} className="fc-row flex-col">
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="m-0 text-base font-semibold tracking-[-0.02em] text-ink">
                        {order.customerName}
                      </h3>
                      <span
                        className={`fc-badge ${getOrderStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status === "CANCELLED" ? "REJECTED" : order.status}
                      </span>
                    </div>

                    <p className="fc-meta mt-1.5">
                      {order.customerEmail && <span>{order.customerEmail}</span>}
                      {order.customerPhone && <span>{order.customerPhone}</span>}
                      <span>
                        Ordered {new Date(order.createdAt).toLocaleDateString()}{" "}
                        at {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status !== "CONFIRMED" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                        disabled={statusUpdating === order.id}
                        className="fc-button fc-button-primary text-sm"
                      >
                        {statusUpdating === order.id ? "Saving..." : "Confirm"}
                      </button>
                    )}
                    {order.status !== "CANCELLED" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        disabled={statusUpdating === order.id}
                        className="fc-button fc-button-danger-ghost text-sm"
                      >
                        {statusUpdating === order.id ? "Saving..." : "Reject"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <span className="fc-stat-label">
                    {calculateOrderTotal(order.eventOrderItems)} items
                  </span>
                  <ul className="fc-card m-0 list-none p-0">
                    {order.eventOrderItems.map((item, index) => (
                      <li
                        key={item.id}
                        className={`flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 ${
                          index > 0 ? "border-t border-border-theme" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="text-sm font-medium text-ink">
                            {item.menuItem.name}
                          </span>
                          {item.specialNotes && (
                            <span className="mt-1 block text-xs text-text-muted">
                              {item.specialNotes.replace(
                                /^Customizations:\s*/,
                                "",
                              )}
                            </span>
                          )}
                        </span>
                        <span className="fc-mono text-sm text-text-muted">
                          &times;{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.specialRequests && (
                    <div className="mt-3">
                      <span className="fc-stat-label">Special requests</span>
                      <p className="m-0 text-sm leading-relaxed text-text-muted">
                        {order.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
