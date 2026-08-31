"use client";

import { useState } from "react";

interface ChefSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (secret: string) => void;
  chefName: string;
  isLoading?: boolean;
  error?: string;
}

export default function ChefSecretModal({
  isOpen,
  onClose,
  onSubmit,
  chefName,
  isLoading = false,
  error,
}: ChefSecretModalProps) {
  const [secret, setSecret] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) {
      onSubmit(secret.trim());
    }
  };

  const handleClose = () => {
    setSecret("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fc-dialog-backdrop bg-black/50" role="presentation">
      <div
        className="fc-dialog max-w-md rounded-lg bg-white p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chef-secret-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="chef-secret-title" className="min-w-0 pr-3 text-xl font-bold">
            Access {chefName}'s Menu
          </h2>
          <button
            onClick={handleClose}
            className="fc-touch-target flex shrink-0 items-center justify-center text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            This host requires a secret to access their menu. Please enter the
            secret to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="secret"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Secret
            </label>
            <input
              type="password"
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter host's secret"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="fc-touch-target flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fc-touch-target flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading || !secret.trim()}
            >
              {isLoading ? "Verifying..." : "Access Menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
