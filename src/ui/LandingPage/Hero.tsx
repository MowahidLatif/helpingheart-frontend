import React from "react";
import { Link } from "react-router-dom";

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
            progress, engage donors, and reach your fundraising goals—all in
            real-time.
          </p>

          <div className="landing-hero__cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Your Page Now
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-lg">
              See How It Works
            </Link>
          </div>

          <ul className="landing-hero__features">
            <li className="landing-hero__feature-item">
              Live donation tracking with real-time updates
            </li>
            <li className="landing-hero__feature-item">
              Custom branding—add your logo, colors, and messaging
            </li>
            <li className="landing-hero__feature-item">
              Secure payments through Stripe
            </li>
            <li className="landing-hero__feature-item">
              Unique shareable URL for easy fundraising
            </li>
            <li className="landing-hero__feature-item">
              Engaging visuals and media galleries
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Hero;
