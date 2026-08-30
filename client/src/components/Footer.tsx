import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-inverse bg-ink py-4 text-text-inverse">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/"
              className="text-text-inverse-muted transition-colors hover:text-text-inverse"
            >
              For Hosts
            </Link>
            <Link
              href="/guest"
              className="text-text-inverse-muted transition-colors hover:text-text-inverse"
            >
              For Guests
            </Link>
            <a
              href="mailto:support@forkcast.app"
              className="text-text-inverse-muted transition-colors hover:text-text-inverse"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
