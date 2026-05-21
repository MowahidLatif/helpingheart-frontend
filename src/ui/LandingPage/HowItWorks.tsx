import React from "react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    number: 1,
    title: "Create your account",
    text: "Sign up with your email. Your organization and its subdomain are set up automatically — no approval process.",
  },
  {
    number: 2,
    title: "Start a campaign",
    text: "Give your campaign a title, goal amount, and optional giveaway prize. Set it live immediately or keep it in draft while you build.",
  },
  {
    number: 3,
    title: "Generate your campaign site",
    text: "Paste your organization's website URL or describe your brand. The AI builds a complete, styled campaign page in under 30 seconds.",
  },
  {
    number: 4,
    title: "Share your link",
    text: "Your campaign has a permanent public URL. Share it anywhere: social, email, or embed it on your website as a live progress widget.",
  },
  {
    number: 5,
    title: "Track every donation",
    text: "Your dashboard shows each donation as it arrives — amount, donor message, and running total. Draw a giveaway winner when your campaign ends.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="landing-section">
      <div className="container">
        <div className="landing-section__title">
          <h2>From zero to funded in five steps.</h2>
          <p>No technical setup. No design experience needed.</p>
        </div>

        <div className="landing-how-it-works__steps">
          {STEPS.map((step) => (
            <div key={step.number} className="landing-step">
              <div className="landing-step__number">{step.number}</div>
              <h3 className="landing-step__title">{step.title}</h3>
              <p className="landing-step__text">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-xl">
          <Link to="/waitlist" className="btn btn-primary btn-lg">
            Join the Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
