"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Auto-hide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div
      className={`fixed left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 flex min-w-0 items-center space-x-2 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 transform sm:left-auto sm:max-w-md ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getToastStyles()}`}
    >
      <span className="font-medium">{getIcon()}</span>
      <span className="min-w-0 flex-1 text-sm">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="fc-touch-target ml-2 flex shrink-0 items-center justify-center text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
