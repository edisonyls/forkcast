"use client";

import { useState } from "react";

interface Event {
  id: string;
  title: string;
  eventDate: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
}

interface OrderPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: { customerName: string }) => void;
  events: Event[];
  selectedEvent: string | null;
  totalItems: number;
}

export default function OrderPlacementModal({
  isOpen,
  onClose,
  onConfirm,
  events,
  selectedEvent,
  totalItems,
}: OrderPlacementModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onConfirm({
        customerName: customerName.trim(),
      });

      // Reset form
      setCustomerName("");
      onClose();
    } catch (err) {
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const selectedEventInfo = events.find((e) => e.id === selectedEvent);

  return (
    <div className="fc-dialog-backdrop" role="presentation">
      <div
        className="fc-dialog max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-placement-title"
      >
        <div className="fc-dialog-header">
          <div className="min-w-0">
            <p className="fc-eyebrow">Final step</p>
            <h2 id="order-placement-title" className="fc-dialog-title">
              Place your order
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="fc-icon-button fc-icon-button-ghost fc-close"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="fc-dialog-body">
          <dl className="fc-stat-grid mb-6">
            {selectedEventInfo && (
              <div>
                <dt className="fc-stat-label">Event</dt>
                <dd className="fc-stat-value">
                  {selectedEventInfo.title}
                  <span className="block text-sm text-text-muted">
                    {new Date(selectedEventInfo.eventDate).toLocaleDateString(
                      "en-US",
                      { weekday: "long", month: "long", day: "numeric" },
                    )}
                  </span>
                </dd>
              </div>
            )}
            <div>
              <dt className="fc-stat-label">Order size</dt>
              <dd className="fc-stat-value">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </dd>
            </div>
          </dl>

          <form onSubmit={handleSubmit} id="order-placement-form">
            <div className="fc-field">
              <label className="fc-label" htmlFor="order-customer-name">
                Your name
              </label>
              <input
                id="order-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="fc-control px-3 py-2 text-sm"
                placeholder="So the host knows whose plate this is"
                required
              />
            </div>

            {error && (
              <p className="fc-feedback fc-feedback-danger mt-4 text-sm">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="fc-dialog-footer fc-dialog-footer-split">
          <button
            type="button"
            onClick={handleClose}
            className="fc-button fc-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="order-placement-form"
            disabled={isSubmitting || !customerName.trim()}
            className="fc-button fc-button-primary"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}
