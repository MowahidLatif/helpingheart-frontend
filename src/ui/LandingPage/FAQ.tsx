import React from "react";

const FAQ_ITEMS = [
  {
    question: "How much does it cost?",
    answer:
      "Helping Hands is completely free to use. We only take a small platform percentage from each successful donation — you'll always see the exact fee before a transaction is processed. No monthly fees, no setup costs.",
  },
  {
    question: "Do I need technical skills?",
    answer:
      "Not at all. Our drag-and-drop page builder lets you create professional campaign pages without writing a single line of code. Just pick your blocks, customize the content, and publish.",
  },
  {
    question: "How do I receive donations?",
    answer:
      "Donations are processed securely through Stripe. Funds are transferred directly to your connected bank account. Payouts typically take 2–7 business days depending on your region.",
  },
  {
    question: "Can I run multiple campaigns?",
    answer:
      "Yes! You can create and manage as many campaigns as you need, all from a single dashboard. Each campaign gets its own page, goal, and shareable link.",
  },
  {
    question: "Is there a transaction fee?",
    answer:
      "We use a tiered fee structure: 5% for campaigns under $50K, 4% for $50K–$500K, 3% for $500K–$1M, and 2.5% for $1M+. Standard Stripe payment processing fees apply separately.",
  },
  {
    question: "Can I add team members?",
    answer:
      "Absolutely. Invite team members to your organization and assign them roles (owner, admin, or member). Control who can create campaigns, edit content, manage tasks, and more.",
  },
];

const FAQ: React.FC = () => {
  return (
    <section className="landing-section">
      <div className="container">
        <div className="landing-section__title">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know to get started</p>
        </div>

        <div className="landing-faq">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="landing-faq__item">
              <details>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
