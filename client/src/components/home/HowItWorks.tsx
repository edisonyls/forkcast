export default function HowItWorks() {
  const hostSteps = [
    {
      step: "1",
      title: "Create Your Menu",
      description:
        "Sign up and add all the dishes you're willing to cook for your gathering.",
      icon: "📝",
    },
    {
      step: "2",
      title: "Share with Guests",
      description:
        "Send your unique menu link to your friends via text, email, or social media.",
      icon: "📤",
    },
    {
      step: "3",
      title: "Track Selections",
      description:
        "Watch in real-time as guests pick their favorites from your menu.",
      icon: "📊",
    },
    {
      step: "4",
      title: "Cook with Confidence",
      description:
        "Prepare exactly what your guests want - no waste, no guessing!",
      icon: "👨‍🍳",
    },
  ];

  const guestSteps = [
    {
      step: "1",
      title: "Receive Menu Link",
      description:
        "Get a link from your host - no sign-up or app download needed.",
      icon: "📱",
    },
    {
      step: "2",
      title: "Browse Dishes",
      description: "See all the delicious options your host can prepare.",
      icon: "🍽️",
    },
    {
      step: "3",
      title: "Select Favorites",
      description: "Pick the dishes you'd love to eat at the gathering.",
      icon: "✅",
    },
    {
      step: "4",
      title: "Enjoy the Party",
      description: "Show up knowing your favorite dishes will be waiting!",
      icon: "🎉",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="fc-shell">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 sm:mb-16 md:text-4xl">
          How It Works
        </h2>

        {/* Host Flow */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            For Hosts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {hostSteps.map((step, index) => (
              <div key={index} className="relative h-full">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {step.step}
                    </div>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 flex-grow">{step.description}</p>
                </div>
                {index < hostSteps.length - 1 && (
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
        </div>

        {/* Guest Flow */}
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            For Guests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guestSteps.map((step, index) => (
              <div key={index} className="relative h-full">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
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
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-5 sm:p-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Ready to simplify your next gathering?
            </h3>
            <p className="text-gray-700 mb-6">
              Join hosts who are making their parties more enjoyable for
              everyone
            </p>
            <a
              href="/chef/signup"
              className="inline-block w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-white font-medium transition-all hover:from-orange-700 hover:to-amber-700 sm:w-auto sm:px-8"
            >
              Start Creating Your Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
