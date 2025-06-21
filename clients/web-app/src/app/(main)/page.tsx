import Link from "next/link";

export default function HomePage() {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
              ForkCast
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            The perfect platform for food lovers and hosts to connect. Choose
            your journey below to get started.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Host Option */}
            <Link href="/host" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-orange-200">
                <div className="text-6xl mb-6">👨‍🍳</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  I'm a Host
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create and share menus for your gatherings. Let your guests
                  choose what they'd love to eat before you cook.
                </p>
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-medium group-hover:from-orange-700 group-hover:to-amber-700 transition-all">
                  Start Hosting →
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  ✓ Create menus ✓ Manage events ✓ Track orders
                </div>
              </div>
            </Link>

            {/* Guest Option */}
            <Link href="/guest" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-green-200">
                <div className="text-6xl mb-6">🍽️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  I'm a Guest
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Discover amazing local hosts and browse their delicious menus.
                  Find your next favorite meal experience.
                </p>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium group-hover:from-green-700 group-hover:to-emerald-700 transition-all">
                  Explore Menus →
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  ✓ Browse hosts ✓ View menus ✓ Place orders
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">Not sure which one you are?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/host"
                className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
              >
                Learn more about hosting
              </Link>
              <Link
                href="/guest"
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Learn more about being a guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
