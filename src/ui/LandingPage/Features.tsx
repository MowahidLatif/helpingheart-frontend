import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🎨",
    title: "Custom Page Builder",
    description:
      "Drag-and-drop blocks to design your donation page. Add hero sections, media galleries, donate buttons, and embeds—no coding required.",
  },
  {
    icon: "📊",
    title: "Real-Time Progress",
    description:
      "Watch donations roll in with live updates. Track goals, see donor counts, and display progress bars that inspire more giving.",
  },
  {
    icon: "💳",
    title: "Secure Stripe Payments",
    description:
      "Accept donations via Stripe. Credit cards, Apple Pay, and more. Secure, compliant, and trusted by millions worldwide.",
  },
  {
    icon: "🔗",
    title: "Custom URLs",
    description:
      "Your own subdomain: yourorg.helpinghands.ca. Brand your fundraising page with a professional, memorable URL.",
  },
  {
    icon: "🎁",
    title: "Giveaway & Raffles",
    description:
      "Add optional giveaways to campaigns. Randomly select a winner and optionally offer cash prizes. Perfect for raffles and contests.",
  },
  {
    icon: "📧",
    title: "Email Receipts",
    description:
      "Automatic donation receipts for donors. Customizable templates. Build trust and keep donors engaged.",
  },
];

const Features: React.FC = () => {
  return (
    <section className="landing-section landing-features">
      <div className="container">
        <div className="landing-section__title">
          <h2>Everything You Need to Fundraise</h2>
          <p>
            Powerful features to help you reach your goals—without the complexity
          </p>
        </div>

        <div className="landing-features__grid">
          {FEATURES.map((feature, index) => (
            <div key={index} className="landing-feature-card">
              <div className="landing-feature-card__icon">{feature.icon}</div>
              <h3 className="landing-feature-card__title">{feature.title}</h3>
              <p className="landing-feature-card__description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-xl">
          <Link to="/signup" className="btn btn-outline btn-lg">
            Explore All Features
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
