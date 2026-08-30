"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is ForkCast really free?",
      answer:
        "Yes! ForkCast is completely free for both hosts and guests. We believe in making gatherings easier for everyone.",
    },
    {
      question: "Do my guests need to sign up or download an app?",
      answer:
        "No! Guests can view your menu and select dishes with just the link you share. No sign-ups, no downloads, no hassle.",
    },
    {
      question: "Can I reuse menus for future events?",
      answer:
        "Absolutely! Save your menus and reuse them for future gatherings. You can edit them anytime to add seasonal dishes or remove items.",
    },
    {
      question: "How do I know what my guests selected?",
      answer:
        "You'll see real-time updates on your dashboard showing which dishes your guests are interested in and how many servings you might need to prepare.",
    },
    {
      question: "Can guests indicate dietary restrictions?",
      answer:
        "Yes! Guests can leave notes about allergies or dietary preferences when selecting dishes, helping you accommodate everyone's needs.",
    },
    {
      question: "What if I change my mind about a dish?",
      answer:
        "You can update your menu anytime before your event. If guests have already made selections for a removed dish, you'll be notified.",
    },
    {
      question: "Can I see who selected what?",
      answer:
        "Yes, if guests provide their names (optional), you can see individual preferences. Otherwise, you'll see anonymous selections.",
    },
    {
      question: "Is there a limit to how many dishes I can add?",
      answer:
        "No limits! Add as many dishes as you want. We recommend keeping it manageable - your guests will appreciate focused options.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-4">
              We're here to help make your gathering perfect.
            </p>
            <a
              href="mailto:support@forkcast.app"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              Contact Support
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
