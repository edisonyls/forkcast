export default function HowItWorks() {
  const steps = [
    {
      step: "1",
      title: "Browse Chefs",
      description:
        "Explore chefs in your area and view their culinary specialties.",
    },
    {
      step: "2",
      title: "Select Dishes",
      description: "Choose from available dishes and add them to your order.",
    },
    {
      step: "3",
      title: "Place Order",
      description:
        "Confirm your order and wait for the chef to prepare your meal.",
    },
    {
      step: "4",
      title: "Enjoy!",
      description:
        "Pick up your order or have it delivered and savor authentic flavors.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
