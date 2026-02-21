const steps = [
  {
    number: "01",
    title: "Sign Up & Create Your Organization",
    body: "Create your free account in seconds. When you sign up, your organization is set up automatically with its own subdomain — your campaigns will live at a link like helpinghands.ca/yourname. You can invite team members and assign them roles (owner, admin, or member) right from the dashboard.",
  },
  {
    number: "02",
    title: "Create a Campaign",
    body: "Inside your dashboard, create a campaign with a title, fundraising goal, and an optional giveaway prize. Set it to Draft to work on it privately, or Active to go live immediately. You can run as many campaigns as you need at the same time.",
  },
  {
    number: "03",
    title: "Build Your Campaign Page",
    body: "Use the drag-and-drop Page Layout Builder to design your campaign page without any code. Add blocks — a hero banner, rich text sections, a media gallery (images, videos, documents), a live progress bar, and a donate button — and arrange them however you like. Preview the page exactly as donors will see it before publishing.",
  },
  {
    number: "04",
    title: "Share & Collect Donations",
    body: "Share your campaign link or embed a live progress widget on your own website. Donors give securely through Stripe — no account required on their end. Every successful donation triggers an automatic, customizable email receipt sent directly to the donor.",
  },
  {
    number: "05",
    title: "Track, Engage & Celebrate",
    body: "Your dashboard gives you a real-time view of every campaign: total raised, donation count, donor messages, campaign updates, and comments. Export your donor list as a CSV, draw a giveaway winner at any time, and manage internal tasks with your team — all in one place.",
  },
];

const HowItWorks = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>How It Works</h1>
      <p style={{ color: "#555", marginBottom: "2.5rem" }}>
        Helping Hands makes it easy to launch a professional fundraising campaign
        in minutes — no coding, no complicated setup, just results.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#374151",
              }}
            >
              {step.number}
            </div>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.15rem" }}>
                {step.title}
              </h2>
              <p style={{ color: "#555", lineHeight: 1.6, margin: 0 }}>{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "3rem",
          padding: "1.5rem",
          background: "#f9fafb",
          borderRadius: "8px",
          borderLeft: "4px solid #6b7280",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Ready to get started?</p>
        <p style={{ margin: "0.5rem 0 0", color: "#555" }}>
          <a href="/signup">Create your free account</a> and launch your first
          campaign today. No credit card required.
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
