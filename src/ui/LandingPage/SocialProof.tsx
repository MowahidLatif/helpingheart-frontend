import React from "react";

const SocialProof: React.FC = () => {
  return (
    <section className="landing-section landing-social-proof">
      <div className="container">
        <div className="landing-section__title">
          <h2>What People Are Saying</h2>
          <p>Organizations trust us to power their fundraising</p>
        </div>

        <div className="landing-testimonial">
          <blockquote>
            "This platform made it so easy to raise money for my cause! The
            page builder let me create exactly what I needed, and within a few
            days we reached our goal. The real-time donation feed kept everyone
            excited."
          </blockquote>
          <cite>— Sarah, Nonprofit Organizer</cite>
        </div>

        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat__value">$50K+</div>
            <div className="landing-stat__label">Raised for causes</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat__value">100+</div>
            <div className="landing-stat__label">Campaigns created</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat__value">500+</div>
            <div className="landing-stat__label">Active donors</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
