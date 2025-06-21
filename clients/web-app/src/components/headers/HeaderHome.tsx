"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            ForkCast
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/host"
              className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all font-medium"
            >
              For Host
            </Link>
            <Link
              href="/guest"
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all font-medium"
            >
              For Guests
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/host"
                className="bg-orange-600 text-white px-5 py-3 rounded-lg hover:bg-orange-700 transition-all font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                For Host
              </Link>
              <Link
                href="/guest"
                className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-all font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                For Guests
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
