"use client";

import { useState } from "react";

export default function HostFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How much does it cost to use ForkCast as a host?",
      answer:
        "ForkCast is completely free for hosts! Create unlimited menus, share with as many guests as you want, and track all selections without any charges.",
    },
    {
      question: "Is my personal data and menu information safe?",
      answer:
        "Yes! As a small, personally-run project, we take your privacy seriously. Your personal information, menu details, and guest data are stored securely on our private server with regular backups. We never share your personal data with third parties or use it for any purpose other than providing the service. While we're not a large company with enterprise-grade infrastructure, we follow good security practices and are committed to protecting your information.",
    },
    {
      question: "How do I get my menu link to share with guests?",
      answer:
        "Once you create a menu, you'll get a unique link that you can share via text, email, social media, or any messaging platform. Guests click the link to view and select from your menu.",
    },
    {
      question: "Can I see who selected what dishes?",
      answer:
        "Yes! Your dashboard shows real-time selections. If guests provide their names, you'll see individual preferences. You can also see total counts for each dish to plan quantities.",
    },
    {
      question:
        "What if I need to change a dish after guests have selected it?",
      answer:
        "You can update your menu anytime. If you remove a dish that guests have selected, they'll be notified and can make new selections. You can also add new dishes whenever you want.",
    },
    {
      question: "How do guests handle payment?",
      answer:
        "Payment is flexible and up to you! You can cover all costs, ask guests to contribute via Venmo/PayPal, or handle payment in person. You set the expectations when creating your event.",
    },
    {
      question: "Can I reuse my menus for different events?",
      answer:
        "Absolutely! Save your menus as templates and reuse them for future gatherings. You can make adjustments for seasonal dishes or different guest groups.",
    },
    {
      question: "How do I handle dietary restrictions and allergies?",
      answer:
        "Guests can add notes about dietary restrictions when selecting dishes. You'll see all special requests in your dashboard and can plan accordingly or reach out for clarification.",
    },
    {
      question: "What if more people want a dish than I planned to make?",
      answer:
        "Your dashboard shows real-time demand for each dish. You can adjust quantities as needed or set limits on popular items. This helps you plan portions perfectly!",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Host Questions & Answers
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about hosting with ForkCast
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
              Ready to become a confident host?
            </h3>
            <p className="text-gray-700 mb-4">
              Transform your gathering experience and start hosting with
              confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/chef/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-amber-700 transition-all"
              >
                Create Your First Menu
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a
                href="mailto:support@forkcast.app"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Contact Host Support
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
      </div>
    </section>
  );
}
