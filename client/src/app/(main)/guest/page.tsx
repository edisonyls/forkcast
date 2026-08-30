import Link from "next/link";
import GuestFAQ from "@/components/GuestFAQ";

export default function GuestHomePage() {
  const guestFeatures = [
    {
      title: "Discover Amazing Hosts",
      description:
        "Browse talented local hosts and their unique cooking styles, from home cooks to seasoned professionals.",
      icon: "👨‍🍳",
      color: "bg-green-50",
    },
    {
      title: "Pre-Select Your Favorites",
      description:
        "Choose exactly what you want to eat before arriving. No more disappointment with unexpected dishes.",
      icon: "🍽️",
      color: "bg-orange-50",
    },
    {
      title: "No Account Required",
      description:
        "Simply click a menu link from your host. Browse and select dishes without any sign-up process.",
      icon: "🔗",
      color: "bg-blue-50",
    },
    {
      title: "Dietary Preferences",
      description:
        "Filter for vegetarian, vegan, gluten-free options and communicate any allergies or preferences.",
      icon: "🥗",
      color: "bg-yellow-50",
    },
    {
      title: "Real-time Updates",
      description:
        "See live updates on menu availability and get notified about any changes to your selections.",
      icon: "📱",
      color: "bg-purple-50",
    },
    {
      title: "Guaranteed Satisfaction",
      description:
        "Arrive knowing your favorite dishes will be prepared just the way you like them.",
      icon: "✨",
      color: "bg-pink-50",
    },
  ];

  const guestSteps = [
    {
      step: "1",
      title: "Get Invited",
      description:
        "Receive a menu link from your host via text, email, or social media. No app download needed!",
      icon: "📱",
    },
    {
      step: "2",
      title: "Browse & Choose",
      description:
        "Explore all available dishes and select exactly what you'd love to eat.",
      icon: "🍽️",
    },
    {
      step: "3",
      title: "Add Preferences",
      description:
        "Note any dietary restrictions, allergies, or special requests for the host.",
      icon: "✅",
    },
    {
      step: "4",
      title: "Enjoy Your Meal",
      description: "Arrive knowing your perfect meal is waiting for you!",
      icon: "🎉",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Joining a meal?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Your invitation is the way in.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Open the menu link your host sent and use their shared secret. No
              account is required. If you do not have an invitation yet, you
              can browse available hosts and menus below.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/chefs"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Browse Hosts & Menus
              </Link>
              <Link
                href="#how-it-works"
                className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-medium border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all"
              >
                How Guest Access Works
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No Account Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pre-Select Favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Guaranteed Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Guests Love ForkCast
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience gatherings where every meal is exactly what you want to
              eat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guestFeatures.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} p-8 rounded-xl hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            How It Works for Guests
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guestSteps.map((step, index) => (
              <div key={index} className="relative h-full">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {step.step}
                    </div>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 flex-grow">{step.description}</p>
                </div>
                {index < guestSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 transform -translate-y-1/2">
                    <svg
                      className="w-6 h-6 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to discover amazing local hosts?
              </h3>
              <p className="text-gray-700 mb-6">
                Browse hosts in your area and experience meals tailored to your
                preferences
              </p>
              <Link
                href="/chefs"
                className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Start Exploring Hosts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guest FAQ */}
      <GuestFAQ />
    </>
  );
}
