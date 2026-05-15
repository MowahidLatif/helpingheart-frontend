import React, { useState, useEffect } from "react";

const FEED_ENTRIES = [
  "A donor in Toronto gave $100",
  "Anonymous gave $25",
  "A donor gave $250 — 68% of goal reached",
  "A donor in Vancouver gave $75",
  "A donor gave $50",
  "Anonymous gave $200 — goal is close",
  "A donor in Calgary gave $40",
  "A donor gave $150",
];

const DonationVisualization: React.FC = () => {
  const [donations, setDonations] = useState<string[]>([
    FEED_ENTRIES[2],
    FEED_ENTRIES[0],
    FEED_ENTRIES[3],
  ]);

  useEffect(() => {
    let idx = 4;
    const interval = setInterval(() => {
      setDonations((prev) => [FEED_ENTRIES[idx % FEED_ENTRIES.length], ...prev].slice(0, 6));
      idx++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="landing-section landing-donation-feed">
      <div className="container">
        <div className="landing-section__title">
          <h2>Your donation feed, live.</h2>
          <p>
            Donors see every contribution the moment it clears — driving urgency
            and social proof on your campaign page.
          </p>
        </div>

        <div className="landing-feed__list">
          {donations.map((donation, index) => (
            <div key={`${donation}-${index}`} className="landing-feed__item">
              {donation}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DonationVisualization;
