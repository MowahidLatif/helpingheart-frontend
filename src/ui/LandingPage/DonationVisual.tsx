import React, { useState, useEffect } from "react";

const DONORS = [
  "Sarah",
  "Michael",
  "Emily",
  "James",
  "Emma",
  "David",
  "Olivia",
  "Alex",
  "Jordan",
  "Taylor",
];

const DonationVisualization: React.FC = () => {
  const [donations, setDonations] = useState<string[]>([
    "Sarah donated $50",
    "Michael helped reach 80% of the goal",
    "Emily donated $25",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const donor = DONORS[Math.floor(Math.random() * DONORS.length)];
      const amount = Math.floor(Math.random() * 100) + 10;
      const messages = [
        `${donor} donated $${amount}`,
        `${donor} helped push the campaign forward`,
        `${donor} donated $${amount}—thank you!`,
      ];
      const newDonation =
        messages[Math.floor(Math.random() * messages.length)];
      setDonations((prev) => [newDonation, ...prev].slice(0, 6));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="landing-section landing-donation-feed">
      <div className="container">
        <div className="landing-section__title">
          <h2>Live Donation Feed</h2>
          <p>See donations roll in real-time—just like on your campaign page</p>
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
