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
    <div className="info-page">
      <h1>How It Works</h1>
      <p className="mb-2xl">
        Helping Hands makes it easy to launch a professional fundraising campaign
        in minutes — no coding, no complicated setup, just results.
      </p>

      <div className="d-flex" style={{ flexDirection: "column", gap: "2rem" }}>
        {steps.map((step) => (
          <div key={step.number} className="d-flex" style={{ gap: "1.5rem", alignItems: "flex-start" }}>
            <div className="landing-step__number" style={{ flexShrink: 0 }}>
              {step.number}
            </div>
            <div>
              <h2 className="mb-xs" style={{ fontSize: "1.15rem", marginTop: 0 }}>
                {step.title}
              </h2>
              <p className="text-secondary" style={{ lineHeight: 1.6, margin: 0 }}>
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="info-callout">
        <p>Ready to get started?</p>
        <p>
          <a href="/signup">Create your free account</a> and launch your first
          campaign today. No credit card required.
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
