import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-orange-50 to-amber-50 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Discover Amazing Home-Cooked Meals
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Connect with local chefs and enjoy authentic homemade cuisines
          delivered to your door or ready for pickup.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/chefs"
            className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-orange-700"
          >
            Browse Chefs
          </Link>
          <Link
            href="/register"
            className="border-2 border-orange-600 text-orange-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-orange-50"
          >
            Become a Chef
          </Link>
        </div>
      </div>
    </section>
  );
}
