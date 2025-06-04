export default function Features() {
  const features = [
    {
      title: "Authentic Cuisines",
      description:
        "Enjoy meals cooked by chefs specializing in their cultural cuisines.",
      icon: "🍜",
    },
    {
      title: "Local Chefs",
      description:
        "Support chefs in your community and discover hidden culinary talents.",
      icon: "👩‍🍳",
    },
    {
      title: "Easy Ordering",
      description:
        "Simple process to browse, select, and order your favorite dishes.",
      icon: "📱",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Why Choose ChefConnect?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-orange-50 p-8 rounded-lg text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
