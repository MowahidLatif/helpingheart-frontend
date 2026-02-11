import React from "react";

const Comparision: React.FC = () => {
  return (
    <section className="landing-section">
      <div className="container">
        <div className="landing-section__title">
          <h2>Why Choose Us?</h2>
          <p>Compare and see what sets our platform apart</p>
        </div>

        <div className="landing-comparison">
          <table className="table landing-comparison__table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Our Platform</th>
                <th>Others</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Custom Page Builder</td>
                <td>✓ Yes</td>
                <td>✗ Limited</td>
              </tr>
              <tr>
                <td>Live Donation Updates</td>
                <td>✓ Yes</td>
                <td>✗ No</td>
              </tr>
              <tr>
                <td>Custom Subdomain (yourorg.helpinghands.ca)</td>
                <td>✓ Yes</td>
                <td>✗ No</td>
              </tr>
              <tr>
                <td>Giveaway / Raffle Support</td>
                <td>✓ Yes</td>
                <td>✗ No</td>
              </tr>
              <tr>
                <td>Transparent Platform Fees</td>
                <td>✓ Tiered (2.5–5%)</td>
                <td>✗ Hidden</td>
              </tr>
              <tr>
                <td>Stripe Integration</td>
                <td>✓ Yes</td>
                <td>✗ Varies</td>
              </tr>
              <tr>
                <td>Email Receipts</td>
                <td>✓ Yes</td>
                <td>✗ Often extra</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Comparision;
