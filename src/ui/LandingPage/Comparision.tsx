import React from "react";

const Comparision: React.FC = () => {
  return (
    <section className="landing-section">
      <div className="container">
        <div className="landing-section__title">
          <h2>Not all fundraising platforms are the same.</h2>
          <p>HelpingHandsFund is built around your campaign — not around upsells.</p>
        </div>

        <div className="landing-comparison">
          <table className="table landing-comparison__table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>HelpingHandsFund</th>
                <th>Others</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AI-generated campaign site</td>
                <td>✓ Yes</td>
                <td>✗ Not available</td>
              </tr>
              <tr>
                <td>Live donation feed on campaign page</td>
                <td>✓ Yes</td>
                <td>✗ No</td>
              </tr>
              <tr>
                <td>Custom org subdomain</td>
                <td>✓ yourname.helpinghands.ca</td>
                <td>✗ No</td>
              </tr>
              <tr>
                <td>Giveaway / prize draw built in</td>
                <td>✓ Yes</td>
                <td>✗ No</td>
              </tr>
              <tr>
                <td>Flat monthly subscription (no % of raised)</td>
                <td>✓ From $10/mo</td>
                <td>✗ Monthly fee + %</td>
              </tr>
              <tr>
                <td>Stripe Connect (funds go directly to you)</td>
                <td>✓ Yes</td>
                <td>✗ Varies</td>
              </tr>
              <tr>
                <td>Automatic donor email receipts</td>
                <td>✓ Yes</td>
                <td>✗ Often paid add-on</td>
              </tr>
              <tr>
                <td>Embeddable progress widget</td>
                <td>✓ Yes</td>
                <td>✗ No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Comparision;
