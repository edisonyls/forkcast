"use client";

import Link from "next/link";

export default function HeaderAuth() {
  return (
    <header className="relative z-50 border-b border-border-inverse bg-ink text-text-inverse">
      <div className="fc-shell flex min-h-[var(--fc-header-height)] items-center">
        <Link
          href="/"
          className="fc-touch-target flex items-center gap-3 text-[1.05rem] font-semibold tracking-[-0.03em]"
          aria-label="ForkCast home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-black text-ink">
            F
          </span>
          ForkCast
        </Link>
      </div>
    </header>
  );
}
