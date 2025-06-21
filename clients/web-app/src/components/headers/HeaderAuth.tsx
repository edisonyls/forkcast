"use client";

import Link from "next/link";

export default function HeaderAuth() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center min-h-[40px]">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            ForkCast
          </Link>
          {/* Empty space for visual balance */}
          <div></div>
        </div>
      </div>
    </header>
  );
}
