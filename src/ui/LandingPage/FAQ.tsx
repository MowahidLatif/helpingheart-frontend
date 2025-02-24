import React from "react";

const FAQ: React.FC = () => {
  return (
    <section>
      <h2>Frequently Asked Questions</h2>
      <details>
        <summary>How do I withdraw funds?</summary>
        <p>You can withdraw funds via Stripe or PayPal directly to your bank account.</p>
      </details>
      <details>
        <summary>What payment methods are supported?</summary>
        <p>We support major credit cards, PayPal, and other secure payment gateways.</p>
      </details>
      <details>
        <summary>Is it free to use?</summary>
        <p>Yes! We charge no platform fees, only standard payment processing fees apply.</p>
      </details>
    </section>
  );
};

export default FAQ;
