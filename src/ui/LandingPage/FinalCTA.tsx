import React from "react";
import { Link } from "react-router-dom";

const FinalCTA: React.FC = () => {
  return (
    <section className="landing-cta">
      <div className="container">
        <h2>Ready to Make a Difference?</h2>
        <p>
          Sign up in seconds. No credit card required. Create your first
          campaign and start accepting donations right away.
        </p>
        <div className="btn-group" style={{ justifyContent: "center" }}>
          <Link to="/signup" className="btn btn-lg">
            Get Started Free
          </Link>
          <Link to="/contact" className="btn btn-lg btn-outline" style={{ borderColor: "white", color: "white" }}>
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
