"use client";

import Link from "next/link";

export default function HeaderHome() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            ForkCast
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/chefs"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Browse Menus
            </Link>
            <Link
              href="/chef/signin"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/chef/signup"
              className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all font-medium"
            >
              Create Menu
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
