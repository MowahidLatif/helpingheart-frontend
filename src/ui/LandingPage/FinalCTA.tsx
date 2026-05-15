import React from "react";
import { Link } from "react-router-dom";

const FinalCTA: React.FC = () => {
  return (
    <section className="landing-cta">
      <div className="container">
        <h2>Your next campaign starts today.</h2>
        <p>
          No monthly fee. No credit card required to sign up. Connect Stripe
          when you're ready to go live.
        </p>
        <div className="btn-group" style={{ justifyContent: "center" }}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create your campaign
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
