import React from "react";

const FAQ_ITEMS = [
  {
    question: "How much does HelpingHandsFund cost?",
    answer:
      "Nothing upfront. We charge a platform fee of 3–5% only on donations you collect — which tier you're on determines the exact rate. No monthly subscription, no setup fees.",
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
      "Yes. The number of simultaneous active campaigns depends on your plan tier: 2 on Starter, 5 on Grow, unlimited on Scale.",
  },
  {
    question: "What is the cancellation fee?",
    answer:
      "If you cancel a campaign before it reaches its goal, a flat 5% is deducted from what was raised at that point. If the campaign runs to completion, only the standard tier fee applies.",
  },
  {
    question: "Can I embed this on my own website?",
    answer:
      "Yes. Copy one iframe snippet from your campaign dashboard and paste it anywhere. It shows a live progress bar and recent donations. Available on the Scale plan.",
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
