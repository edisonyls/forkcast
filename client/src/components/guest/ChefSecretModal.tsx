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
    <div className="fc-dialog-backdrop" role="presentation">
      <div
        className="fc-dialog max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chef-secret-title"
      >
        <div className="fc-dialog-header">
          <div className="min-w-0">
            <p className="fc-eyebrow">Private menu</p>
            <h2 id="chef-secret-title" className="fc-dialog-title">
              Access {chefName}&rsquo;s menu
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="fc-icon-button fc-icon-button-ghost fc-close"
            disabled={isLoading}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="fc-dialog-body">
          <p className="mt-0 mb-5 text-sm leading-relaxed text-text-muted">
            This host shares their menu by invitation. Enter the secret they
            sent you to see what they&rsquo;re cooking.
          </p>

          <form onSubmit={handleSubmit} id="chef-secret-form">
            <div className="fc-field">
              <label className="fc-label" htmlFor="secret">
                Secret
              </label>
              <input
                type="password"
                id="secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="fc-control px-3 py-2"
                placeholder="Enter the host's secret"
                disabled={isLoading}
                autoFocus
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
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="chef-secret-form"
            className="fc-button fc-button-primary"
            disabled={isLoading || !secret.trim()}
          >
            {isLoading ? "Verifying..." : "Access menu"}
          </button>
        </div>
      </div>
    </div>
  );
}
