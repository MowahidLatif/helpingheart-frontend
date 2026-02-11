import React from "react";

const FAQ_ITEMS = [
  {
    question: "How do I withdraw funds?",
    answer:
      "Funds are processed through Stripe. Once donations are received, you can transfer them directly to your bank account via your Stripe dashboard. Payouts typically take 2–7 business days.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We use Stripe, which supports major credit cards (Visa, Mastercard, American Express), debit cards, Apple Pay, Google Pay, and more. Donors can choose their preferred method at checkout.",
  },
  {
    question: "What are the platform fees?",
    answer:
      "We use a tiered fee structure when your campaign reaches its goal: 5% for campaigns under $50K, 4% for $50K–$500K, 3% for $500K–$1M, and 2.5% for $1M+. Stripe payment processing fees apply separately.",
  },
  {
    question: "Can I run a giveaway or raffle?",
    answer:
      "Yes! You can add an optional giveaway to any campaign. When you're ready, randomly select one donor as the winner. You can also set an optional cash prize amount.",
  },
  {
    question: "How do custom subdomains work?",
    answer:
      "When you sign up, you get a unique subdomain like yourorg.helpinghands.ca. All your campaigns can be accessed through this branded URL for a professional, memorable presence.",
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
