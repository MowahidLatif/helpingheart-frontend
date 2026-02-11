import React from "react";
import { Link } from "react-router-dom";

const FinalCTA: React.FC = () => {
  return (
    <section className="landing-cta">
      <div className="container">
        <h2>Start Your Fundraiser Today—It's Free</h2>
        <p>
          Sign up in seconds. No credit card required. Create your first
          campaign and start accepting donations right away.
        </p>
        <Link to="/signup" className="btn btn-lg">
          Get Started Free
        </Link>
        <p className="mt-lg text-sm" style={{ opacity: 0.8 }}>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "white", textDecoration: "underline" }}>
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
