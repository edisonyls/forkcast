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
        }
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
        }
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
        }
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
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pending Orders Alert - Detailed by Event */}
        {(() => {
          const eventsWithPendingOrders = events
            .map((event) => ({
              ...event,
              pendingOrdersCount:
                event.eventOrders?.filter((order) => order.status === "PENDING")
                  .length || 0,
            }))
            .filter((event) => event.pendingOrdersCount > 0);

          return eventsWithPendingOrders.length > 0 ? (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-sm font-medium text-yellow-800 mb-3">
                    Pending Orders Awaiting Confirmation
                  </h3>
                  <div className="space-y-2">
                    {eventsWithPendingOrders.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between bg-white rounded-md p-3 border border-yellow-300"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {event.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({new Date(event.eventDate).toLocaleDateString()})
                            </span>
                          </div>
                          <div className="text-sm text-yellow-700 mt-1">
                            <strong>{event.pendingOrdersCount}</strong> pending
                            order
                            {event.pendingOrdersCount === 1 ? "" : "s"} need
                            {event.pendingOrdersCount === 1 ? "s" : ""}{" "}
                            confirmation
                          </div>
                        </div>
                        <Link
                          href={`/chef/events/${event.id}`}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                        >
                          Review Orders
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Event Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create events for friends to place orders
              </p>
            </div>
            <Link
              href="/chef/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Create Event Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Create New Event
          </button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No events created yet.</p>
            <button
              onClick={() => setShowEventModal(true)}
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <>
            {/* Upcoming Events Section */}
            {(() => {
              const now = new Date();
              const upcomingEvents = events
                .filter((event) => new Date(event.eventDate) >= now)
                .sort(
                  (a, b) =>
                    new Date(a.eventDate).getTime() -
                    new Date(b.eventDate).getTime()
                );

              return (
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Upcoming Events
                    </h2>
                  </div>

                  {upcomingEvents.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">
                        No upcoming events scheduled.
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Create your next culinary experience!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-gray-300">
                      {upcomingEvents.map((event) => {
                        const pendingOrdersCount =
                          event.eventOrders?.filter(
                            (order) => order.status === "PENDING"
                          ).length || 0;

                        return (
                          <div
                            key={event.id}
                            className={`p-6 ${
                              pendingOrdersCount > 0
                                ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-lg font-medium text-gray-900 truncate">
                                    {event.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      event.status
                                    )}`}
                                  >
                                    {event.status}
                                  </span>
                                  {pendingOrdersCount > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      {pendingOrdersCount} Pending
                                    </span>
                                  )}
                                </div>

                                {event.description && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Description:
                                      </span>{" "}
                                      {event.description}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">
                                      Event Date:
                                    </span>
                                    <br />
                                    <span
                                      className={
                                        isEventPast(event.eventDate)
                                          ? "text-red-600"
                                          : ""
                                      }
                                    >
                                      {new Date(
                                        event.eventDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Orders:</span>
                                    <br />
                                    <span>{event._count.eventOrders}</span>
                                  </div>
                                </div>

                                {/* Order Details Section */}
                                {event.eventOrders &&
                                  event.eventOrders.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                      {(() => {
                                        // Get all confirmed order items
                                        const confirmedItems = event.eventOrders
                                          .filter(
                                            (order) =>
                                              order.status === "CONFIRMED"
                                          )
                                          .flatMap(
                                            (order) => order.eventOrderItems
                                          );

                                        if (confirmedItems.length === 0)
                                          return null;

                                        // Group items by menu item name and notes
                                        const groupedItems =
                                          confirmedItems.reduce(
                                            (acc, item) => {
                                              const key = `${
                                                item.menuItem.name
                                              }${
                                                item.specialNotes
                                                  ? `_${item.specialNotes}`
                                                  : ""
                                              }`;
                                              if (!acc[key]) {
                                                acc[key] = {
                                                  name: item.menuItem.name,
                                                  totalQuantity: 0,
                                                  notes: item.specialNotes,
                                                };
                                              }
                                              acc[key].totalQuantity +=
                                                item.quantity;
                                              return acc;
                                            },
                                            {} as Record<
                                              string,
                                              {
                                                name: string;
                                                totalQuantity: number;
                                                notes?: string;
                                              }
                                            >
                                          );

                                        return (
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                              Confirmed Items (
                                              {confirmedItems.length} items)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                              {Object.values(groupedItems).map(
                                                (item, index) => (
                                                  <div
                                                    key={index}
                                                    className="bg-green-50 border border-green-200 rounded px-3 py-2"
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-gray-900 truncate">
                                                          {item.name}
                                                        </div>
                                                        {item.notes && (
                                                          <div className="text-xs text-gray-600 mt-1">
                                                            Note:{" "}
                                                            {item.notes.replace(
                                                              /^Customizations:\s*/,
                                                              ""
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="ml-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                        {item.totalQuantity}x
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                              </div>

                              <div className="relative dropdown-container">
                                <button
                                  onClick={() =>
                                    setOpenDropdownId(
                                      openDropdownId === event.id
                                        ? null
                                        : event.id
                                    )
                                  }
                                  className="bg-white rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {openDropdownId === event.id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <Link
                                      href={`/chef/events/${event.id}`}
                                      onClick={() => setOpenDropdownId(null)}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      View Orders
                                    </Link>
                                    {event._count.eventOrders === 0 && (
                                      <button
                                        onClick={() => {
                                          handleDeleteEvent(event.id);
                                          setOpenDropdownId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        Delete Event
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Past Events Section */}
            {(() => {
              const now = new Date();
              const pastEvents = events
                .filter((event) => new Date(event.eventDate) < now)
                .sort(
                  (a, b) =>
                    new Date(b.eventDate).getTime() -
                    new Date(a.eventDate).getTime()
                );

              return (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Past Events
                    </h2>
                  </div>

                  {pastEvents.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No past events yet.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Your event history will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-gray-300">
                      {pastEvents.map((event) => (
                        <div key={event.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {event.title}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    event.status
                                  )}`}
                                >
                                  {event.status}
                                </span>
                              </div>

                              {event.description && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">
                                      Description:
                                    </span>{" "}
                                    {event.description}
                                  </p>
                                </div>
                              )}

                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">
                                    Event Date:
                                  </span>
                                  <br />
                                  <span className="text-red-600">
                                    {new Date(
                                      event.eventDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Orders:</span>
                                  <br />
                                  <span>{event._count.eventOrders}</span>
                                </div>
                              </div>

                              {/* Order Details Section */}
                              {event.eventOrders &&
                                event.eventOrders.length > 0 && (
                                  <div className="mt-4 border-t border-gray-200 pt-4">
                                    {(() => {
                                      // Get all confirmed order items
                                      const confirmedItems = event.eventOrders
                                        .filter(
                                          (order) =>
                                            order.status === "CONFIRMED"
                                        )
                                        .flatMap(
                                          (order) => order.eventOrderItems
                                        );

                                      if (confirmedItems.length === 0)
                                        return null;

                                      // Group items by menu item name and notes
                                      const groupedItems =
                                        confirmedItems.reduce(
                                          (acc, item) => {
                                            const key = `${item.menuItem.name}${
                                              item.specialNotes
                                                ? `_${item.specialNotes}`
                                                : ""
                                            }`;
                                            if (!acc[key]) {
                                              acc[key] = {
                                                name: item.menuItem.name,
                                                totalQuantity: 0,
                                                notes: item.specialNotes,
                                              };
                                            }
                                            acc[key].totalQuantity +=
                                              item.quantity;
                                            return acc;
                                          },
                                          {} as Record<
                                            string,
                                            {
                                              name: string;
                                              totalQuantity: number;
                                              notes?: string;
                                            }
                                          >
                                        );

                                      return (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                                            Confirmed Items (
                                            {confirmedItems.length} items)
                                          </h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {Object.values(groupedItems).map(
                                              (item, index) => (
                                                <div
                                                  key={index}
                                                  className="bg-green-50 border border-green-200 rounded px-3 py-2"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                      <div className="font-medium text-sm text-gray-900 truncate">
                                                        {item.name}
                                                      </div>
                                                      {item.notes && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                          Note:{" "}
                                                          {item.notes.replace(
                                                            /^Customizations:\s*/,
                                                            ""
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <div className="ml-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                      {item.totalQuantity}x
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                            </div>

                            <div className="relative dropdown-container">
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === event.id
                                      ? null
                                      : event.id
                                  )
                                }
                                className="bg-white rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {openDropdownId === event.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                  <Link
                                    href={`/chef/events/${event.id}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    View Orders
                                  </Link>
                                  {event._count.eventOrders === 0 && (
                                    <button
                                      onClick={() => {
                                        handleDeleteEvent(event.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      Delete Event
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}

        {/* Create Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New Event
                </h3>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateEvent}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Select the date for your event
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Add a description for your event (only visible to you)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This description is only visible to you and helps you keep
                      track of event details
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={eventLoading}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      {eventLoading ? "Creating..." : "Create Event"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
