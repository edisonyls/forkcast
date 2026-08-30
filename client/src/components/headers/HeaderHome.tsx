"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border-inverse bg-ink text-text-inverse">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-3 text-[1.05rem] font-semibold tracking-[-0.03em]"
          aria-label="ForkCast home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-black text-ink">
            F
          </span>
          ForkCast
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm md:flex"
          aria-label="Primary navigation"
        >
          <Link
            href="#how-it-works"
            className="text-text-inverse-muted transition-colors hover:text-text-inverse"
          >
            How it works
          </Link>
          <Link
            href="/guest"
            className="text-text-inverse-muted transition-colors hover:text-text-inverse"
          >
            Join a meal
          </Link>
          <Link
            href="/chef/signin"
            className="rounded-full border border-border-inverse px-5 py-2.5 transition-colors hover:border-text-inverse-muted hover:bg-overlay-inverse"
          >
            Host sign in
          </Link>
          <Link
            href="/chef/signup"
            className="rounded-full bg-surface px-5 py-2.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Host a meal
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border-inverse md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="home-mobile-menu"
          aria-label="Toggle navigation"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-5 bg-current transition-transform ${isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="home-mobile-menu"
          className="absolute left-0 top-full flex w-full flex-col gap-2 border-t border-border-inverse bg-ink p-5 text-sm shadow-2xl md:hidden"
          aria-label="Mobile navigation"
        >
          <Link
            href="#how-it-works"
            className="rounded-xl px-4 py-3 hover:bg-overlay-inverse"
            onClick={() => setIsMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/guest"
            className="rounded-xl px-4 py-3 hover:bg-overlay-inverse"
            onClick={() => setIsMenuOpen(false)}
          >
            Join a meal
          </Link>
          <Link
            href="/chef/signin"
            className="rounded-xl px-4 py-3 hover:bg-overlay-inverse"
            onClick={() => setIsMenuOpen(false)}
          >
            Host sign in
          </Link>
          <Link
            href="/chef/signup"
            className="mt-2 rounded-full bg-brand px-5 py-3 text-center font-semibold text-ink"
            onClick={() => setIsMenuOpen(false)}
          >
            Host a meal
          </Link>
        </nav>
      )}
    </header>
  );
}
