const steps = [
  {
    number: "01",
    title: "Create your account and organization",
    body: "Sign up with your email and password. Your organization is created automatically and assigned a subdomain (yourname.helpinghands.ca). Invite team members immediately or add them later. There is no approval queue or manual review.",
  },
  {
    number: "02",
    title: "Create a campaign",
    body: "From your dashboard, create a campaign with a title and fundraising goal. Optionally add a giveaway prize — a cash amount or description of what the winner receives. Set it to Draft to keep it private while you build, or Active to go live immediately.",
  },
  {
    number: "03",
    title: "Generate your campaign site with AI",
    body: "HelpingHandsFund's AI site builder creates your campaign page from a prompt. Paste your organization's website URL and the AI extracts your colors, fonts, and brand style. Or describe your cause in plain language. The result is a fully structured campaign page — hero section, story, media, progress bar, and donate button — generated in under 30 seconds. On Grow and Scale plans you can also upload images, videos, and documents.",
  },
  {
    number: "04",
    title: "Share your campaign",
    body: "Your campaign has a permanent public URL at yourname.helpinghands.ca/campaign-name. Share the link directly, or copy the iframe snippet from your dashboard to embed a live progress widget on any external website. Donors can give by card, Apple Pay, or Google Pay — no account required.",
  },
  {
    number: "05",
    title: "Track donations and close out",
    body: "Every donation appears in your dashboard in real time. When your campaign ends, draw a giveaway winner directly from the dashboard — choose all donors or those above a minimum amount, and the winner is announced on the campaign page. Export your donor list as a CSV at any time. Your Stripe account receives the net payout after the platform fee.",
  },
];

const HowItWorks = () => {
  return (
    <div className="info-page">
      <h1>How HelpingHandsFund Works</h1>
      <p className="mb-2xl">
        From first login to funded campaign — here's exactly what happens at
        each step.
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

      <div className="info-callout" style={{ marginTop: "3rem" }}>
        <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Ready to start?</p>
        <p>
          <a href="/waitlist">Join the waitlist</a> and be first to launch your
          campaign when we open on September 1, 2026.
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
