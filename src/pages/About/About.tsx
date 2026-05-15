const features = [
  {
    title: "AI-generated campaign sites",
    description:
      "Describe your cause or paste your organization's website URL. The AI builds a complete campaign page — styled to match your brand — in under 30 seconds. Available on all plans.",
  },
  {
    title: "Stripe Connect payments",
    description:
      "Donors pay by card, Apple Pay, or Google Pay. Every donation flows directly to your connected Stripe account. HelpingHandsFund never holds your funds.",
  },
  {
    title: "Live donation dashboard",
    description:
      "Track total raised, donation count, and individual donor messages from your dashboard. The campaign page updates in real time so supporters see momentum as it builds.",
  },
  {
    title: "Giveaway engine",
    description:
      "Attach a prize to any campaign and draw a winner from your donor pool when you're ready. Filter by donation amount; the announcement posts automatically on the campaign page.",
  },
  {
    title: "Team and permissions",
    description:
      "Invite staff or volunteers with owner, admin, or member roles. Each role controls access to campaign creation, editing, media uploads, and task management.",
  },
  {
    title: "Campaign updates",
    description:
      "Post updates to keep donors informed as your campaign progresses. Available on Grow and Scale plans.",
  },
  {
    title: "Embeddable progress widget",
    description:
      "Copy an iframe snippet from your dashboard and paste it on any website. It renders a live progress bar with donation totals — no coding required. Available on the Scale plan.",
  },
  {
    title: "Account security",
    description:
      "Passwords are bcrypt-hashed. Two-factor authentication (TOTP) is available from Settings. All sessions use short-lived JWT tokens with automatic rotation.",
  },
];

const About = () => {
  return (
    <div className="info-page">
      <h1>About HelpingHandsFund</h1>
      <p className="mb-md">
        HelpingHandsFund is a fundraising platform built for nonprofits,
        community groups, and anyone organizing a cause. We give you an
        AI-generated campaign site, live donation tracking, and direct Stripe
        payouts — in one product, with no monthly fee.
      </p>
      <p className="mb-2xl">
        The platform is built on a simple idea: the hardest part of fundraising
        should be the cause itself, not the software. Every feature — from the
        AI site builder to the embeddable progress widget — exists to remove
        friction between you and your donors.
      </p>

      <h2>What the platform includes</h2>
      <div className="about-features-list mb-2xl">
        {features.map((f) => (
          <div key={f.title} className="card about-feature-card">
            <h3 className="m-0 mb-xs about-feature-title">{f.title}</h3>
            <p className="text-secondary m-0 about-feature-description">{f.description}</p>
          </div>
        ))}
      </div>

      <h2>Our approach</h2>
      <p className="mb-xl">
        We charge a percentage of what you raise because our incentives should
        match yours. If your campaign raises more, we earn more — so we have
        every reason to make the platform work well for you.
      </p>

      <div className="info-callout">
        <p>Questions? <a href="/contact">Send us a message.</a></p>
      </div>
    </div>
  );
};

export default About;
