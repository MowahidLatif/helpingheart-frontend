import React from "react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    number: 1,
    title: "Sign Up",
    text: "Create an account in seconds. Add your organization and you're ready to go.",
  },
  {
    number: 2,
    title: "Build Your Page",
    text: "Use our drag-and-drop builder to add blocks, set your goal, and customize your design.",
  },
  {
    number: 3,
    title: "Share Your Link",
    text: "Send your unique URL to friends, family, and supporters. Your org gets its own subdomain.",
  },
  {
    number: 4,
    title: "Watch It Grow",
    text: "Get real-time updates as donations roll in. Draw giveaway winners when you're ready.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="landing-section">
      <div className="container">
        <div className="landing-section__title">
          <h2>How It Works</h2>
          <p>Four simple steps to start raising funds for your cause</p>
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
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
