export default function ProblemSolution() {
  const problems = [
    {
      title: "The Guessing Game",
      description: "Cooking multiple dishes hoping someone will eat them",
      icon: "🤔",
      solution: "Let guests pick their favorites ahead of time",
    },
    {
      title: "Food Waste",
      description: "Preparing dishes that nobody touches",
      icon: "🗑️",
      solution: "Cook only what people actually want",
    },
    {
      title: "Dietary Surprises",
      description: "Finding out about allergies at the last minute",
      icon: "😰",
      solution: "Guests can indicate preferences upfront",
    },
    {
      title: "Overwhelming Choices",
      description: "Asking everyone what they want and getting chaos",
      icon: "🤯",
      solution: "Organized selection process for everyone",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Stop the Hosting Stress
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've all been there - the anxiety of not knowing what to cook for
            guests. ForkCast eliminates the guesswork.
          </p>
        </div>

        {/* Problems & Solutions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {problems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-700 font-medium">
                      {item.solution}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Ready to host with confidence?
            </h3>
            <p className="text-gray-700 mb-6">
              Join the stress-free hosting revolution. Your guests will thank
              you.
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
