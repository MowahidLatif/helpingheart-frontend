import React from "react";
import { Link } from "react-router-dom";

const FinalCTA: React.FC = () => {
  return (
    <section className="landing-cta">
      <div className="container">
        <h2>Launching August 1, 2026.</h2>
        <p>
          We're putting the final touches on HelpingHandsFund. Join the waitlist
          and be first in line when we open our doors.
        </p>
        <div className="btn-group" style={{ justifyContent: "center" }}>
          <Link to="/waitlist" className="btn btn-primary btn-lg">
            Join the Waitlist
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
