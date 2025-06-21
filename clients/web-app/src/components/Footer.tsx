import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4 mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          {/* Brand and Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Link href="/" className="text-lg font-bold text-orange-400">
              ForkCast
            </Link>
            <span className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} Made with ❤️ for hosts
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <a
              href="mailto:support@forkcast.app"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
            <Link
              href="/chef/signup"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Create Menu
            </Link>
            <Link
              href="/chefs"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Browse Menus
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
