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
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Event:</strong> {selectedEventInfo.title}
            </p>
            <p className="text-sm text-green-600">
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

        <div className="mb-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-700">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="fc-touch-target flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim()}
              className="fc-touch-target flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
