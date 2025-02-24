import React from "react";

const Comparision: React.FC = () => {
  return (
    <section>
      <h2>Why Choose Us?</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Your Platform</th>
            <th>Others</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Custom Branding</td>
            <td>✅ Yes</td>
            <td>❌ No</td>
          </tr>
          <tr>
            <td>Live Donation Updates</td>
            <td>✅ Yes</td>
            <td>❌ No</td>
          </tr>
          <tr>
            <td>No Platform Fees</td>
            <td>✅ Yes</td>
            <td>❌ No</td>
          </tr>
          <tr>
            <td>Easy Payouts</td>
            <td>✅ Yes</td>
            <td>❌ No</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default Comparision;
