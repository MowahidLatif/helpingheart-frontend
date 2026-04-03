import React from "react";
import { Link } from "react-router-dom";

const BADGES = [
  { icon: "📊", label: "Real-Time Tracking" },
  { icon: "🎨", label: "Custom Branding" },
  { icon: "🔒", label: "Secure Payments" },
  { icon: "🔗", label: "Shareable URL" },
  { icon: "🖼️", label: "Media Galleries" },
];

const Hero: React.FC = () => {
  return (
    <section className="landing-hero">
      <div className="container">
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            Empower Your Cause with a Personalized Fundraising Page
          </h1>
          <p className="landing-hero__subtitle">
            Create a beautiful, custom donation page in minutes. Track your
            progress, engage donors, and reach your fundraising goals — all in
            real-time.
          </p>

          <div className="landing-hero__cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-lg">
              See How It Works
            </Link>
          </div>

          <div className="landing-hero__features">
            {BADGES.map((b) => (
              <span key={b.label} className="landing-hero__feature-badge">
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
