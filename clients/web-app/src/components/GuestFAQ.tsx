"use client";

import { useState } from "react";

export default function GuestFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need to create an account to browse menus?",
      answer:
        "No! You can browse host menus and place orders using just the link your host shares with you. No sign-ups, no downloads, no hassle.",
    },
    {
      question: "How do I know if a host is reliable?",
      answer:
        "All hosts on our platform have detailed profiles with photos and information about their cooking experience and style.",
    },
    {
      question: "Can I specify dietary restrictions or allergies?",
      answer:
        "Absolutely! When selecting dishes, you can add notes about allergies, dietary preferences, or special requests. Hosts can see these and accommodate your needs.",
    },
    {
      question: "What if I change my mind about my selections?",
      answer:
        "You can update your selections anytime before the host's deadline (usually a day or two before the event). Just use the same link to modify your choices.",
    },
    {
      question: "How do I pay for my food?",
      answer:
        "Payment methods vary by host. Some events are free (host covers costs), others may use apps like Venmo, or direct payment at the event. Check with your host for details.",
    },
    {
      question: "What if I don't see anything I like on the menu?",
      answer:
        "Most hosts are happy to accommodate special requests! Use the notes section to ask about modifications or alternative dishes that aren't listed.",
    },
    {
      question: "Can I see photos of the food before choosing?",
      answer:
        "Yes! Most hosts include photos of their dishes in their menus. You can also check their profile to get a sense of their cooking style.",
    },
    {
      question: "What happens if I have to cancel last minute?",
      answer:
        "Just let your host know as soon as possible. Most hosts are understanding, especially for emergencies. The earlier you notify them, the better they can adjust their prep.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Guest Questions & Answers
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about being a guest on ForkCast
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 transition-colors"
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

          <div className="mt-12 text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-4">
              We're here to help you have the best guest experience possible.
            </p>
            <a
              href="mailto:support@forkcast.app"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              Contact Guest Support
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
