import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-inverse bg-ink pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-text-inverse">
      <div className="fc-shell">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          {/* Brand and Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Link href="/" className="text-lg font-bold text-brand">
              ForkCast
            </Link>
            <span className="text-xs text-text-inverse-muted sm:text-sm">
              © {new Date().getFullYear()} Connecting hosts & guests
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <Link
              href="/"
              className="fc-touch-target flex items-center text-text-inverse-muted transition-colors hover:text-text-inverse"
            >
              For Hosts
            </Link>
            <Link
              href="/guest"
              className="fc-touch-target flex items-center text-text-inverse-muted transition-colors hover:text-text-inverse"
            >
              For Guests
            </Link>
            <a
              href="mailto:support@forkcast.app"
              className="fc-touch-target flex items-center text-text-inverse-muted transition-colors hover:text-text-inverse"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
