"use client";

import styles from "./GuestExperience.module.css";

const faqs = [
  {
    question: "Do I need a guest account?",
    answer:
      "No. The invitation link and shared secret from your host give you access to that menu without a sign-up or download.",
  },
  {
    question: "What if my invitation does not open?",
    answer:
      "Ask your host to confirm that you have the complete menu link and the current shared secret. Guest access belongs to a specific host menu, so there is no universal code-entry page.",
  },
  {
    question: "Can I change my choices later?",
    answer:
      "Yes, while the menu is still accepting responses. Return through the same invitation before the host’s stated deadline.",
  },
  {
    question: "Can I add dietary requirements?",
    answer:
      "You can add dietary requirements or special requests with your selections so the host sees them while planning. For serious allergies, contact the host directly as well.",
  },
  {
    question: "Can I browse without an invitation?",
    answer:
      "You can browse available host profiles and menus. A host’s invitation and shared secret are still required to unlock a private menu and submit choices.",
  },
];

export default function GuestFAQ() {
  return (
    <section className={styles.faqSection}>
      <div className={styles.faqIntro} data-reveal>
        <p className={styles.sectionIndex}>03 · Good to know</p>
        <h2>Guest questions, answered clearly.</h2>
        <p>
          The short version: your host owns the gathering, and their
          invitation is the way in.
        </p>
      </div>
      <div className={styles.faqList} data-reveal>
        {faqs.map((faq, index) => (
          <details className={styles.faqItem} key={faq.question}>
            <summary>
              <span className={styles.faqNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{faq.question}</span>
              <span className={styles.faqPlus} aria-hidden="true" />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
