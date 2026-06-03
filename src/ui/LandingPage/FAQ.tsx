import React from "react";

const FAQ_ITEMS = [
  {
    question: "How much does HelpingHandsFund cost?",
    answer:
      "Plans start at $10/month (Starter), $40/month (Grow), and $100/month (Scale). There is no percentage taken from your donations — just a flat monthly subscription for the features you need.",
  },
  {
    question: "Do I need technical skills?",
    answer:
      "No. The AI generates your campaign site from a description or a URL. You don't write code or design anything.",
  },
  {
    question: "How do I receive donations?",
    answer:
      "You connect a Stripe account from your Settings page. Funds are transferred directly to your bank — HelpingHandsFund never holds your money.",
  },
  {
    question: "Can I run multiple campaigns at once?",
    answer:
      "Yes. The number of simultaneous active campaigns depends on your plan: 1 on Starter, up to 3 on Grow, unlimited on Scale.",
  },
  {
    question: "Can I change or cancel my plan?",
    answer:
      "Yes. Upgrade or downgrade anytime from Settings. Plan changes take effect immediately and update features and limits for your active campaigns.",
  },
  {
    question: "Can I embed this on my own website?",
    answer:
      "Yes. Copy one iframe snippet from your campaign dashboard and paste it anywhere. It shows a live progress bar and recent donations. Available on Grow and Scale plans.",
  },
];

const FAQ: React.FC = () => {
  return (
    <section className="landing-section">
      <div className="container">
        <div className="landing-section__title">
          <h2>Common questions.</h2>
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
