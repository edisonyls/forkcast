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
        return "fc-badge-success";
      case "CLOSED":
        return "fc-badge-neutral";
      case "CANCELLED":
        return "fc-badge-danger";
      default:
        return "fc-badge-neutral";
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
    (event) => event.status === "OPEN" && new Date(event.deadline) > new Date(),
  );

  if (events.length === 0) {
    return (
      <div className="fc-panel fc-empty">
        <h2 className="fc-empty-title">No events yet</h2>
        <p className="fc-empty-body">
          This host hasn&rsquo;t opened a night for orders. Check back later.
        </p>
      </div>
    );
  }

  return (
    <>
      {openEventsOnly.length === 0 ? (
        <div className="fc-panel fc-empty">
          <h2 className="fc-empty-title">Nothing open right now</h2>
          <p className="fc-empty-body">
            Every event is closed or past its deadline. New ones will show up
            here.
          </p>
        </div>
      ) : (
        <section>
          <div className="mb-5">
            <p className="fc-eyebrow">Upcoming</p>
            <h2 className="m-0 text-2xl font-semibold tracking-[-0.035em] text-ink">
              Order for one of {chef.name}&rsquo;s nights
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {openEventsOnly.map((event) => (
              <article key={event.id} className="fc-panel flex flex-col">
                <div className="fc-panel-body flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="m-0 min-w-0 text-base font-semibold tracking-[-0.02em] text-ink">
                      {event.title}
                    </h3>
                    <span
                      className={`fc-badge shrink-0 ${getStatusColor(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3">
                    <div>
                      <dt className="fc-stat-label">Event date</dt>
                      <dd className="fc-stat-value">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="fc-stat-label">Orders close</dt>
                      <dd className="fc-stat-value">
                        {new Date(event.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(event.deadline).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="fc-stat-label">Orders in</dt>
                      <dd className="fc-stat-value">
                        {event._count.eventOrders}
                        {event.maxOrders && ` / ${event.maxOrders}`}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="fc-panel-footer">
                  {isEventOrderable(event) ? (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                      }}
                      className="fc-button fc-button-primary w-full"
                    >
                      Order for this night
                    </button>
                  ) : (
                    <p className="m-0 text-center text-sm text-text-subtle">
                      {getEventStatusText(event)}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

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
