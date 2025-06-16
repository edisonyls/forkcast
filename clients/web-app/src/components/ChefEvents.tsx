"use client";

import { useState } from "react";
import EventOrderModal from "./EventOrderModal";

interface Chef {
  id: string | number;
  name: string;
  username: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  deadline: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  maxOrders?: number;
  chef: Chef;
  _count: {
    eventOrders: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: string | number;
  name: string;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  categoryId: string | number;
  chefId: string | number;
  customizableOptions: any[];
}

interface ChefEventsProps {
  chef: Chef;
  events: Event[];
  menuItems: MenuItem[];
  chefSecret: string;
}

export default function ChefEvents({
  chef,
  events,
  menuItems,
  chefSecret,
}: ChefEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const isEventOrderable = (event: Event) => {
    if (event.status !== "OPEN") return false;

    const now = new Date();
    const deadline = new Date(event.deadline);

    if (deadline <= now) return false;

    if (event.maxOrders && event._count.eventOrders >= event.maxOrders) {
      return false;
    }

    return true;
  };

  const getEventStatusText = (event: Event) => {
    if (event.status !== "OPEN") {
      return `Event is ${event.status.toLowerCase()}`;
    }

    const now = new Date();
    const deadline = new Date(event.deadline);

    if (deadline <= now) {
      return "Order deadline has passed";
    }

    if (event.maxOrders && event._count.eventOrders >= event.maxOrders) {
      return "Maximum orders reached";
    }

    return "Open for orders";
  };

  const openEventsOnly = events.filter(
    (event) => event.status === "OPEN" && new Date(event.deadline) > new Date()
  );

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          This chef hasn't created any events yet.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Check back later for upcoming events!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {openEventsOnly.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No upcoming events available for ordering.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later for new events!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upcoming Events
              </h2>
              <p className="text-gray-600">
                Place your order for {chef.name}'s upcoming events!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openEventsOnly.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">
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

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-900 w-20">
                          Event:
                        </span>
                        <span className="text-gray-600">
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-900 w-20">
                          Deadline:
                        </span>
                        <span className="text-gray-600">
                          {new Date(event.deadline).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          at{" "}
                          {new Date(event.deadline).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-900 w-20">
                          Orders:
                        </span>
                        <span className="text-gray-600">
                          {event._count.eventOrders}
                          {event.maxOrders && ` / ${event.maxOrders}`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      {isEventOrderable(event) ? (
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }}
                          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                        >
                          Place Order for This Event
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            {getEventStatusText(event)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Event Order Modal */}
      {selectedEvent && (
        <EventOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          menuItems={menuItems}
          chef={chef}
          chefSecret={chefSecret}
        />
      )}
    </>
  );
}
