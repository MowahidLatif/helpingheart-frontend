const features = [
  {
    title: "Block-based campaign page editor",
    description:
      "A drag-and-drop layout builder lets campaign owners compose their donation page from reusable blocks — hero banner, text sections, media gallery, progress bar, donate button, and more.",
  },
  {
    title: "Secure payments via Stripe",
    description:
      "Every donation is processed through Stripe with full PCI compliance. Donors never leave your campaign page, and a customizable email receipt is sent automatically after every successful transaction.",
  },
  {
    title: "Real-time dashboard",
    description:
      "Track every campaign's progress live: total raised, donation count, recent donors, and messages. Export donor data as a CSV at any time.",
  },
  {
    title: "Giveaway engine",
    description:
      "Run a prize draw directly from the dashboard. Choose to include all donors or only those above a minimum amount, and the winner is announced automatically on the campaign page.",
  },
  {
    title: "Team & permissions management",
    description:
      "Invite team members to your organization with owner, admin, or member roles. Fine-grained permissions control who can create campaigns, edit content, or manage tasks.",
  },
  {
    title: "Campaign updates & comments",
    description:
      "Post updates to keep donors informed and allow supporters to leave comments. Internal task management lets your team coordinate work without leaving the platform.",
  },
  {
    title: "Embeddable progress widget",
    description:
      "Copy a single iframe snippet to embed a live donation progress bar on any external website — your blog, your org's homepage, anywhere.",
  },
  {
    title: "Security-first",
    description:
      "Two-factor authentication (TOTP), bcrypt-hashed passwords, short-lived JWT access tokens, and automatic refresh token rotation keep every account safe.",
  },
];

const About = () => {
  return (
    <div className="info-page">
      <h1>About Helping Hands</h1>
      <p className="mb-md">
        Helping Hands is a fundraising platform built for individuals,
        nonprofits, and community organizations who want to launch professional
        donation campaigns without the complexity of traditional fundraising
        software.
      </p>
      <p className="mb-2xl">
        We believe that collecting donations online should be as simple as
        writing a message and sharing a link. Everything else — payments,
        receipts, campaign pages, donor management — should happen
        automatically.
      </p>

      <h2>What we have built</h2>
      <div className="mb-2xl" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {features.map((f) => (
          <div key={f.title} className="card" style={{ padding: "1.25rem" }}>
            <h3 className="m-0 mb-xs" style={{ fontSize: "1rem" }}>{f.title}</h3>
            <p className="text-secondary m-0" style={{ lineHeight: 1.6 }}>{f.description}</p>
          </div>
        ))}
      </div>

      <h2>Our mission</h2>
      <p className="mb-xl">
        Our mission is to lower the barrier to fundraising for everyone. Whether
        you are helping a neighbor, running a community project, or growing a
        nonprofit, Helping Hands gives you the infrastructure to do it
        professionally — for free.
      </p>

      <div className="info-callout">
        <p>We are just getting started.</p>
        <p>
          Have a question or want to get in touch?{" "}
          <a href="/contact">Send us a message</a>.
        </p>
      </div>
    </div>
  );
};

export default About;
