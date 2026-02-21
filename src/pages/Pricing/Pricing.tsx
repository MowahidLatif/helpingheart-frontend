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
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Pricing</h1>
      <p style={{ color: "#555", marginBottom: "2rem" }}>
        Helping Hands is free to use. We only make money when you do — by
        taking a small platform percentage from each successful donation. You
        will always see the exact fee before a transaction is processed. No
        monthly fees, no setup costs, no surprises.
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>Free</h2>
            <p style={{ color: "#6b7280", margin: "0.25rem 0 0" }}>Everything you need to fundraise professionally</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "2rem", fontWeight: 700 }}>$0</span>
            <span style={{ color: "#6b7280" }}>/month</span>
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {included.map((item) => (
            <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <a
          href="/signup"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            padding: "0.65rem 1.5rem",
            background: "#111827",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Get started for free
        </a>
      </div>

      <div
        style={{
          background: "#f9fafb",
          borderRadius: "8px",
          padding: "1.5rem",
          borderLeft: "4px solid #6b7280",
        }}
      >
        <h3 style={{ marginTop: 0 }}>How we make money</h3>
        <p style={{ color: "#555", margin: 0, lineHeight: 1.6 }}>
          We take a small percentage from each donation processed through the
          platform. This covers payment processing, hosting, and ongoing
          development. The exact percentage is shown transparently at the time
          of donation — you and your donors always know what to expect.
        </p>
      </div>

      <div style={{ marginTop: "2rem", color: "#6b7280", fontSize: "0.9rem" }}>
        <p>
          More plans with advanced features are on the roadmap. If you have
          specific needs — custom domains, white-labeling, or high-volume
          support — <a href="/contact">get in touch</a>.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
