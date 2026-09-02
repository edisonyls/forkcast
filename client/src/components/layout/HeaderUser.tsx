"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const hostNavigation = [
  { href: "/chef/dashboard", label: "Dashboard" },
  { href: "/chef/menu", label: "Menu" },
  { href: "/chef/events", label: "Events" },
  { href: "/chef/settings", label: "Settings" },
];

export default function HeaderUser() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if user is on chef dashboard pages
  const isChefDashboard = pathname?.startsWith("/chef/");
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
        },
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
    <header className="relative z-50 border-b border-border-inverse bg-ink text-text-inverse">
      <div className="fc-shell min-h-[var(--fc-header-height)]">
        <div className="flex min-h-[var(--fc-header-height)] items-center justify-between">
          <Link
            href={isChefDashboard ? "/chef/dashboard" : "/"}
            className="fc-touch-target flex items-center gap-3 text-[1.05rem] font-semibold tracking-[-0.03em]"
            aria-label={
              isChefDashboard ? "ForkCast dashboard" : "ForkCast home"
            }
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-black text-ink">
              F
            </span>
            ForkCast
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Show cart only for guest pages and general pages (not host or chef dashboard) */}
            {!isChefDashboard && (
              <Link
                href="/cart"
                className="relative flex items-center text-text-inverse-muted transition-colors hover:text-brand"
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
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-ink">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {isChefDashboard ? (
              <>
                {hostNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/chef/dashboard" &&
                      pathname?.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`transition-colors ${
                        isActive
                          ? "text-brand"
                          : "text-text-inverse-muted hover:text-text-inverse"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-border-inverse px-4 py-2 text-text-inverse-muted transition-colors hover:border-text-inverse-muted hover:bg-overlay-inverse hover:text-text-inverse"
                >
                  Sign out
                </button>
              </>
            ) : isGuestPage ? (
              // Guest page navigation: Browse Hosts
              <Link
                href="/chefs"
                className="rounded-full bg-brand px-4 py-2 text-ink transition-colors hover:bg-brand-strong"
              >
                Browse Hosts
              </Link>
            ) : (
              // Default navigation: Become a Host
              <Link
                href="/chef/signup"
                className="rounded-full bg-brand px-4 py-2 text-ink transition-colors hover:bg-brand-strong"
              >
                Become a Host
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button and Cart Icon */}
          <div className="flex items-center space-x-4 lg:hidden">
            {/* Show cart only for guest pages and general pages (not host or chef dashboard) */}
            {!isChefDashboard && (
              <Link
                href="/cart"
                className="fc-touch-target relative flex items-center justify-center text-text-inverse-muted transition-colors hover:text-brand"
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
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-ink">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="fc-touch-target rounded-md p-2 text-text-inverse-muted transition-colors hover:bg-overlay-inverse hover:text-text-inverse focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="user-mobile-menu"
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
          <nav
            id="user-mobile-menu"
            className="border-t border-border-inverse pb-4 lg:hidden"
          >
            <div className="flex flex-col space-y-3 pt-4">
              {isChefDashboard ? (
                <>
                  {hostNavigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/chef/dashboard" &&
                        pathname?.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-xl px-4 py-3 text-center font-medium transition-colors ${
                          isActive
                            ? "bg-brand text-ink"
                            : "text-text-inverse-muted hover:bg-overlay-inverse hover:text-text-inverse"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-full border border-border-inverse px-4 py-3 text-center font-medium text-text-inverse-muted transition-colors hover:bg-overlay-inverse hover:text-text-inverse"
                  >
                    Sign out
                  </button>
                </>
              ) : isGuestPage ? (
                // Guest page mobile navigation
                <Link
                  href="/chefs"
                  className="rounded-full bg-brand px-4 py-3 text-center font-medium text-ink transition-colors hover:bg-brand-strong"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse Hosts
                </Link>
              ) : (
                // Default mobile navigation
                <Link
                  href="/chef/signup"
                  className="rounded-full bg-brand px-4 py-3 text-center font-medium text-ink transition-colors hover:bg-brand-strong"
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
