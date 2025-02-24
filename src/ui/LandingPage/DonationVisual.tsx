import React, { useState, useEffect } from "react";

const DonationVisualization: React.FC = () => {
  const [donations, setDonations] = useState<string[]>([
    "🔹 John donated $50!",
    "🔹 Sarah helped reach 80% of the goal!",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDonation = `🔹 [Donor] donated $${Math.floor(
        Math.random() * 100
      )}!`;
      setDonations((prev) => [newDonation, ...prev].slice(0, 5)); 
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section>
      <h2>Live Donation Feed</h2>
      <div>
        {donations.map((donation, index) => (
          <p key={index}>{donation}</p>
        ))}
      </div>
    </section>
  );
};

export default DonationVisualization;
