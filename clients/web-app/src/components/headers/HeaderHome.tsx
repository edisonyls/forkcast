import Link from "next/link";

export default function HeaderHome() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          Forkcast
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/chefs"
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Browse Chefs
          </Link>
        </nav>
      </div>
    </header>
  );
}
