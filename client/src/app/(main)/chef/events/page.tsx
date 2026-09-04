"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Chef {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  secret: string;
  rating: number;
  ratingCount: number;
  image?: string;
  createdAt: string;
}

interface EventOrderItem {
  id: string;
  quantity: number;
  specialNotes?: string;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    customizationOptions?: {
      id: string;
      name: string;
    }[];
  };
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
  chefId: string;
  chef: {
    id: string;
    name: string;
    username: string;
  };
  eventOrders?: EventOrder[];
  _count: {
    eventOrders: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EventsManagement() {
  const router = useRouter();
  const [chef, setChef] = useState<Chef | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchChefProfile();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchChefProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        const chefData = data.data.chef;
        setChef(chefData);
        fetchEvents(chefData.id, chefData.secret);
      } else if (response.status === 401) {
        router.push("/chef/signin");
      } else {
        console.error("Failed to fetch chef profile");
        router.push("/chef/signin");
      }
    } catch (error) {
      console.error("Error fetching chef profile:", error);
      router.push("/chef/signin");
    }
  };

  const fetchEvents = async (chefId: string, chefSecret?: string) => {
    try {
      // Fetch events with secret to get order details if secret is available
      const url = chefSecret
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chefId}&secret=${chefSecret}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/events?chefId=${chefId}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chef || !eventDate) return;

    setEventLoading(true);
    setError("");

    try {
      const selectedDate = new Date(eventDate);
      const deadline = new Date(selectedDate);
      deadline.setDate(deadline.getDate() - 1); // Deadline is day before event
      deadline.setHours(23, 59, 59); // End of day before

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            description: eventDescription.trim() || undefined,
            eventDate: eventDate,
            deadline: deadline.toISOString(),
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setEvents([data.data.event, ...events]);
        setShowEventModal(false);
        setEventDate("");
        setEventDescription("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError("An error occurred while creating the event");
    } finally {
      setEventLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("An error occurred while deleting the event");
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

  const confirmedItemSummary = (event: Event) => {
    const confirmedItems = (event.eventOrders || [])
      .filter((order) => order.status === "CONFIRMED")
      .flatMap((order) => order.eventOrderItems);

    if (confirmedItems.length === 0) return null;

    const grouped = confirmedItems.reduce(
      (acc, item) => {
        const key = `${item.menuItem.name}${
          item.specialNotes ? `_${item.specialNotes}` : ""
        }`;
        if (!acc[key]) {
          acc[key] = {
            name: item.menuItem.name,
            totalQuantity: 0,
            notes: item.specialNotes,
          };
        }
        acc[key].totalQuantity += item.quantity;
        return acc;
      },
      {} as Record<
        string,
        { name: string; totalQuantity: number; notes?: string }
      >,
    );

    return { count: confirmedItems.length, groups: Object.values(grouped) };
  };

  const renderEvent = (event: Event, options: { past: boolean }) => {
    const pendingOrdersCount =
      event.eventOrders?.filter((order) => order.status === "PENDING").length ||
      0;
    const summary = confirmedItemSummary(event);

    return (
      <li
        key={event.id}
        className={`fc-row flex-col ${
          pendingOrdersCount > 0 ? "fc-row-flagged" : ""
        }`}
      >
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-base font-semibold tracking-[-0.02em] text-ink">
                {event.title}
              </h3>
              <span className={`fc-badge ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              {pendingOrdersCount > 0 && (
                <span className="fc-badge fc-badge-warning">
                  {pendingOrdersCount} pending
                </span>
              )}
            </div>

            <p className="fc-meta mt-1.5">
              <span className={options.past ? "text-text-subtle" : ""}>
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>
                {event._count.eventOrders}{" "}
                {event._count.eventOrders === 1 ? "order" : "orders"}
              </span>
            </p>

            {event.description && (
              <p className="mt-2 mb-0 max-w-[70ch] text-sm leading-relaxed text-text-muted">
                {event.description}
              </p>
            )}
          </div>

          <div className="relative dropdown-container flex sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setOpenDropdownId(openDropdownId === event.id ? null : event.id)
              }
              className="fc-menu-trigger"
              aria-label={`Open actions for ${event.title}`}
              aria-haspopup="menu"
              aria-expanded={openDropdownId === event.id}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {openDropdownId === event.id && (
              <div
                className="fc-menu-panel absolute right-0 top-12 z-10 w-44"
                role="menu"
              >
                <Link
                  href={`/chef/events/${event.id}`}
                  onClick={() => setOpenDropdownId(null)}
                  className="fc-menu-item"
                  role="menuitem"
                >
                  View orders
                </Link>
                {event._count.eventOrders === 0 && (
                  <button
                    onClick={() => {
                      handleDeleteEvent(event.id);
                      setOpenDropdownId(null);
                    }}
                    className="fc-menu-item fc-menu-item-danger"
                    role="menuitem"
                  >
                    Delete event
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {summary && (
          <div className="mt-4 w-full">
            <span className="fc-stat-label">
              Confirmed &mdash; {summary.count} items
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {summary.groups.map((item, index) => (
                <div
                  key={index}
                  className="fc-card flex items-start justify-between gap-3 px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {item.name}
                    </span>
                    {item.notes && (
                      <span className="mt-0.5 block text-xs text-text-muted">
                        {item.notes.replace(/^Customizations:\s*/, "")}
                      </span>
                    )}
                  </span>
                  <span className="fc-badge fc-badge-brand shrink-0">
                    {item.totalQuantity}&times;
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <div className="fc-loading" role="status">
        <span className="fc-spinner" aria-hidden="true" />
        Loading events
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );

  const pastEvents = events
    .filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    })
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    );

  const eventsWithPendingOrders = events
    .map((event) => ({
      ...event,
      pendingOrdersCount:
        event.eventOrders?.filter((order) => order.status === "PENDING")
          .length || 0,
    }))
    .filter((event) => event.pendingOrdersCount > 0);

  return (
    <div className="fc-shell fc-page">
      <header className="fc-page-header">
        <div className="min-w-0">
          <p className="fc-eyebrow">Host events</p>
          <h1 className="fc-page-title">
            The nights you&rsquo;re <em>cooking</em>
          </h1>
          <p className="fc-page-lead">
            Guests can only order while an event is open. Create one, share your
            secret, then confirm what comes in.
          </p>
        </div>
        <div className="fc-page-actions">
          <Link href="/chef/dashboard" className="fc-button fc-button-secondary">
            &larr; Dashboard
          </Link>
          <button
            onClick={() => setShowEventModal(true)}
            className="fc-button fc-button-primary"
          >
            Create event
          </button>
        </div>
      </header>

      {eventsWithPendingOrders.length > 0 && (
        <div className="fc-feedback fc-feedback-warning mb-6">
          <h2 className="fc-stat-label">Waiting on you</h2>
          <ul className="m-0 grid list-none gap-2 p-0">
            {eventsWithPendingOrders.map((event) => (
              <li
                key={event.id}
                className="fc-card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {event.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-text-muted">
                    {event.pendingOrdersCount} order
                    {event.pendingOrdersCount === 1 ? "" : "s"} to confirm
                    &middot; {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                </span>
                <Link
                  href={`/chef/events/${event.id}`}
                  className="fc-button fc-button-warning self-start text-sm sm:self-auto"
                >
                  Review orders
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {events.length === 0 ? (
        <div className="fc-panel fc-empty">
          <h2 className="fc-empty-title">No events yet</h2>
          <p className="fc-empty-body">
            An event is one night of cooking. Open one and your guests can start
            picking dishes.
          </p>
          <div className="fc-empty-actions">
            <button
              onClick={() => setShowEventModal(true)}
              className="fc-button fc-button-primary"
            >
              Create your first event
            </button>
          </div>
        </div>
      ) : (
        <>
          <section className="fc-panel">
            <div className="fc-panel-header">
              <h2 className="fc-panel-title">Upcoming</h2>
              <p className="fc-stat-label m-0">
                {upcomingEvents.length}{" "}
                {upcomingEvents.length === 1 ? "event" : "events"}
              </p>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="fc-empty">
                <h3 className="fc-empty-title">Nothing scheduled</h3>
                <p className="fc-empty-body">
                  Create an event to start collecting orders again.
                </p>
              </div>
            ) : (
              <ul className="fc-list m-0 list-none p-0">
                {upcomingEvents.map((event) => renderEvent(event, { past: false }))}
              </ul>
            )}
          </section>

          <section className="fc-panel">
            <div className="fc-panel-header">
              <h2 className="fc-panel-title">Past</h2>
              <p className="fc-stat-label m-0">
                {pastEvents.length}{" "}
                {pastEvents.length === 1 ? "event" : "events"}
              </p>
            </div>

            {pastEvents.length === 0 ? (
              <div className="fc-empty">
                <h3 className="fc-empty-title">No history yet</h3>
                <p className="fc-empty-body">
                  Events move here the day after they happen.
                </p>
              </div>
            ) : (
              <ul className="fc-list m-0 list-none p-0">
                {pastEvents.map((event) => renderEvent(event, { past: true }))}
              </ul>
            )}
          </section>
        </>
      )}

      {showEventModal && (
        <div className="fc-dialog-backdrop" role="presentation">
          <div
            className="fc-dialog max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
          >
            <div className="fc-dialog-header">
              <div>
                <p className="fc-eyebrow">New event</p>
                <h2 id="create-event-title" className="fc-dialog-title">
                  Open a night for orders
                </h2>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} id="create-event-form">
              <div className="fc-dialog-body">
                {error && (
                  <p className="fc-feedback fc-feedback-danger mb-5 text-sm">
                    {error}
                  </p>
                )}

                <div className="fc-field">
                  <label className="fc-label" htmlFor="event-date">
                    Event date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="fc-control px-3 py-2.5 text-sm"
                    required
                  />
                </div>

                <div className="fc-field">
                  <label className="fc-label" htmlFor="event-description">
                    Description
                    <span className="fc-label-note">Optional</span>
                  </label>
                  <textarea
                    id="event-description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={3}
                    className="fc-control px-3 py-2.5 text-sm"
                    placeholder="A note to yourself about this night"
                  />
                  <p className="fc-hint">Only you can see this.</p>
                </div>
              </div>
            </form>

            <div className="fc-dialog-footer fc-dialog-footer-split">
              <button
                type="button"
                onClick={() => {
                  setShowEventModal(false);
                  setEventDate("");
                  setEventDescription("");
                  setError("");
                }}
                className="fc-button fc-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-event-form"
                disabled={eventLoading}
                className="fc-button fc-button-primary"
              >
                {eventLoading ? "Creating..." : "Create event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
