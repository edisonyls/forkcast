export default function HowItWorksHost() {
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

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
          How It Works for Hosts
        </h2>

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

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Ready to simplify your next gathering?
            </h3>
            <p className="text-gray-700 mb-6">
              Start hosting with confidence and eliminate the guesswork from
              your gatherings
            </p>
            <a
              href="/chef/signup"
              className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-amber-700 transition-all"
            >
              Create Your First Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
