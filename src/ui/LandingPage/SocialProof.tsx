import React from "react";

const SocialProof: React.FC = () => {
  return (
    <section className="landing-section landing-social-proof">
      <div className="container">
        <div className="landing-section__title">
          <h2>Organizations raising real money.</h2>
        </div>

        <div className="landing-testimonial">
          <blockquote>
            "We described our shelter's brand and the AI had our campaign page
            ready in under a minute. We raised $8,400 in three weeks."
          </blockquote>
          <cite>— Animal rescue nonprofit, Ontario</cite>
        </div>

        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat__value">$50K+</div>
            <div className="landing-stat__label">Total raised across campaigns</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat__value">100+</div>
            <div className="landing-stat__label">Campaigns completed</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat__value">3–5%</div>
            <div className="landing-stat__label">Platform fee, no monthly cost</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
