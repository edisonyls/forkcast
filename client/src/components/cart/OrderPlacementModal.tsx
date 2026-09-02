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
    <div className="fc-dialog-backdrop bg-black/50" role="presentation">
      <div
        className="fc-dialog max-w-md rounded-lg bg-white p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-placement-title"
      >
        <div className="flex justify-between items-start mb-4">
          <h2
            id="order-placement-title"
            className="min-w-0 pr-3 text-xl font-bold text-gray-900"
          >
            Place Your Order
          </h2>
          <button
            onClick={handleClose}
            className="fc-touch-target flex shrink-0 items-center justify-center text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {selectedEventInfo && (
          <div className="fc-feedback fc-feedback-success mb-4">
            <p className="text-sm">
              <strong>Event:</strong> {selectedEventInfo.title}
            </p>
            <p className="text-sm">
              📅{" "}
              {new Date(selectedEventInfo.eventDate).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                },
              )}
            </p>
          </div>
        )}

        <div className="fc-feedback fc-feedback-success mb-4">
          <p className="text-sm">
            <strong>Order Summary:</strong> {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="fc-control px-3 py-2 text-sm"
              placeholder="Enter your full name"
              required
            />
          </div>

          {error && (
            <div className="fc-feedback fc-feedback-danger">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="fc-button fc-button-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim()}
              className="fc-button fc-button-primary flex-1"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
