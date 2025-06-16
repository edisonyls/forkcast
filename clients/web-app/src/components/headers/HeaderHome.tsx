"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function HeaderHome() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          Forkcast
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/cart"
            className="relative flex items-center text-gray-600 hover:text-orange-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5m2.5-5h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/chefs"
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Browse Chefs
          </Link>
        </nav>
      </div>
    </header>
  );
}
