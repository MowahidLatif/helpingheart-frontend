const included = [
  "Unlimited campaigns",
  "Custom organization subdomain",
  "Drag-and-drop page layout builder",
  "Media gallery — images, videos, documents",
  "Live progress bar and donation tracking",
  "Secure payments via Stripe",
  "Automatic email receipts to donors",
  "Giveaway winner draw",
  "Team members with role-based permissions",
  "Campaign comments and updates",
  "Internal task management",
  "Embeddable progress widget for your website",
  "CSV export of donor data",
  "Two-factor authentication (2FA)",
];

const Pricing = () => {
  return (
    <div className="info-page">
      <h1>Pricing</h1>
      <p className="mb-2xl">
        Helping Hands is free to use. We only make money when you do — by
        taking a small platform percentage from each successful donation. You
        will always see the exact fee before a transaction is processed. No
        monthly fees, no setup costs, no surprises.
      </p>

      <div className="card mb-2xl" style={{ padding: "2rem" }}>
        <div className="d-flex" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 className="m-0">Free</h2>
            <p className="text-secondary mt-xs m-0">Everything you need to fundraise professionally</p>
          </div>
          <div className="text-right">
            <span className="font-bold" style={{ fontSize: "2rem" }}>$0</span>
            <span className="text-secondary">/month</span>
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {included.map((item) => (
            <li key={item} className="d-flex" style={{ alignItems: "center", gap: "0.6rem" }}>
              <span className="text-success font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <a href="/signup" className="btn btn-primary mt-xl d-inline-block">
          Get started for free
        </a>
      </div>

      <div className="info-callout" style={{ marginTop: 0 }}>
        <h3 className="m-0 mb-sm">How we make money</h3>
        <p>
          We take a small percentage from each donation processed through the
          platform. This covers payment processing, hosting, and ongoing
          development. The exact percentage is shown transparently at the time
          of donation — you and your donors always know what to expect.
        </p>
      </div>

      <p className="text-secondary text-sm mt-xl">
        More plans with advanced features are on the roadmap. If you have
        specific needs — custom domains, white-labeling, or high-volume
        support — <a href="/contact">get in touch</a>.
      </p>
    </div>
  );
};

export default Pricing;
