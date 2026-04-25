import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "⚡",
    title: "Quick Setup",
    description:
      "Create your fundraising page in minutes. No technical skills required — just sign up, set your goal, and start accepting donations.",
  },
  {
    icon: "🎨",
    title: "Custom Branding",
    description:
      "Make your page truly yours. Add your organization's logo, colors, images, and messaging with the drag-and-drop page builder.",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    description:
      "Accept donations safely through Stripe. Credit cards, Apple Pay, Google Pay, and more — fully PCI compliant and trusted by millions.",
  },
  {
    icon: "📊",
    title: "Real-Time Analytics",
    description:
      "Track donations as they come in. Monitor your progress, see donor counts, and export data — all from a live dashboard.",
  },
  {
    icon: "🔗",
    title: "Easy Sharing",
    description:
      "Get a branded URL for your organization. Share your campaign link anywhere, or embed a live progress widget on your own website.",
  },
  {
    icon: "📱",
    title: "Mobile Optimized",
    description:
      "Your donation pages look great on every device. Responsive design ensures donors can give easily from phones, tablets, or desktops.",
  },
  {
    icon: "✅",
    title: "Task Collaboration",
    description:
      "Keep campaign work organized with assignable tasks, team comments, progress updates, and checklist tracking in one place.",
  },
  {
    icon: "🤖",
    title: "Smart-Brand AI Scraper",
    description:
      "Design your platform in seconds with AI. Paste your website link to auto-match your colors, fonts, and visual style, or describe your vision in plain text to generate a polished draft with zero coding.",
  },
  {
    icon: "🪟",
    title: "Seamless Iframe Donation Widgets",
    description:
      "Embed your mission directly into your website with simple copy-paste code. Add live progress bars, real-time donation activity, and full campaign embeds that feel like a native part of your brand.",
  },
];

const Features: React.FC = () => {
  return (
    <section className="landing-section landing-features">
      <div className="container">
        <div className="landing-section__title">
          <h2>Everything You Need to Succeed</h2>
          <p>
            Powerful features to help you reach your goals — without the complexity
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
