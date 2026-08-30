export default function Features() {
  const features = [
    {
      title: "Know What to Cook",
      description:
        "Stop guessing! Let your guests browse your menu and select what they'd actually enjoy eating.",
      icon: "🎯",
      color: "bg-orange-50",
    },
    {
      title: "Save Time & Money",
      description:
        "Prepare only what your guests want. No more cooking dishes that go untouched or buying unnecessary ingredients.",
      icon: "💰",
      color: "bg-green-50",
    },
    {
      title: "Happy Guests",
      description:
        "Everyone gets to eat what they love. Accommodate preferences and dietary restrictions easily.",
      icon: "😊",
      color: "bg-yellow-50",
    },
    {
      title: "Privacy Focused",
      description:
        "We care about your privacy. Your personal information stays private and will never be sold or shared with others.",
      icon: "🔒",
      color: "bg-emerald-50",
    },
    {
      title: "Easy Sharing",
      description:
        "Share your menu with a simple link. Guests can browse and select without creating an account.",
      icon: "🔗",
      color: "bg-amber-50",
    },
    {
      title: "Real-time Updates",
      description:
        "See what your guests are selecting in real-time. Adjust quantities and plan your cooking accordingly.",
      icon: "📊",
      color: "bg-blue-50",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Why Hosts Love ForkCast
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your hosting experience from stressful guessing to
            confident preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>
              Start hosting with confidence and eliminate the guesswork
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
