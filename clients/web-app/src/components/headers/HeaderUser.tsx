"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function HeaderUser() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if user is on chef dashboard pages
  const isChefDashboard = pathname?.startsWith("/chef/");
  // Check if user is on host-focused pages
  const isHostPage = pathname === "/host";
  // Check if user is on guest-focused pages
  const isGuestPage = pathname === "/guest" || pathname?.startsWith("/chefs");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/signout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Failed to sign out");
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            ForkCast
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Show cart only for guest pages and general pages (not host or chef dashboard) */}
            {!isChefDashboard && !isHostPage && (
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
            )}

            {isChefDashboard ? (
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            ) : isHostPage ? (
              // Host page navigation: Sign In + Become a Host
              <>
                <Link
                  href="/chef/signin"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/chef/signup"
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Become a Host
                </Link>
              </>
            ) : isGuestPage ? (
              // Guest page navigation: Browse Hosts
              <Link
                href="/chefs"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Browse Hosts
              </Link>
            ) : (
              // Default navigation: Become a Host
              <Link
                href="/chef/signup"
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Become a Host
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button and Cart Icon */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Show cart only for guest pages and general pages (not host or chef dashboard) */}
            {!isChefDashboard && !isHostPage && (
              <Link
                href="/cart"
                className="relative flex items-center text-gray-600 hover:text-orange-600 transition-colors p-2"
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
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              {isChefDashboard ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors text-center font-medium"
                >
                  Sign Out
                </button>
              ) : isHostPage ? (
                // Host page mobile navigation
                <>
                  <Link
                    href="/chef/signin"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 px-3 rounded-md hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/chef/signup"
                    className="bg-orange-600 text-white px-4 py-3 rounded-md hover:bg-orange-700 transition-colors text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Become a Host
                  </Link>
                </>
              ) : isGuestPage ? (
                // Guest page mobile navigation
                <Link
                  href="/chefs"
                  className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse Hosts
                </Link>
              ) : (
                // Default mobile navigation
                <Link
                  href="/chef/signup"
                  className="bg-orange-600 text-white px-4 py-3 rounded-md hover:bg-orange-700 transition-colors text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Host
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
