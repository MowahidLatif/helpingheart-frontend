const faqs = [
  {
    q: "Is HelpingHandsFund free to use?",
    a: "Signing up, creating campaigns, and managing your organization are all free. We take a platform fee of 3%, 4%, or 5% (depending on your plan tier) only on donations collected. You see the exact fee before any donation is processed.",
  },
  {
    q: "How does payment processing work?",
    a: "Donations are processed through Stripe. You connect a Stripe account from your Settings page. Funds go directly from the donor to your Stripe account — HelpingHandsFund does not hold or intermediate your money.",
  },
  {
    q: "What is a campaign?",
    a: "A campaign is a fundraising page with a goal, a public URL, and a Stripe-connected donation button. Each campaign tracks its own total raised, donor list, and progress. You can run multiple campaigns simultaneously.",
  },
  {
    q: "How is my campaign page built?",
    a: "The AI site builder generates your page from a description or your organization's website URL. It produces a structured page with a hero section, story text, optional media, a live progress bar, and a donate button. On Grow and Scale plans you can also upload images, videos, and documents.",
  },
  {
    q: "What is a giveaway and how does it work?",
    a: "Any campaign can have an attached giveaway prize. When you're ready to close the campaign, you draw a winner from your donor list — choose all donors or only those above a minimum amount. The winner is announced on the campaign page.",
  },
  {
    q: "Do donors receive a receipt?",
    a: "Yes. Every successful donation triggers an automatic email receipt to the donor. You can customize the sender name, subject line, and email body from your organization settings.",
  },
  {
    q: "Can I add team members?",
    a: "Yes. Owners and admins can invite team members and assign roles. The number of allowed members depends on your plan: 1 on Starter (owner only), up to 5 on Grow, unlimited on Scale.",
  },
  {
    q: "How do I share my campaign?",
    a: "Each campaign has a permanent public URL at yourname.helpinghands.ca/campaign-name. You can also copy an iframe snippet from your campaign dashboard to embed a live progress widget on any external website.",
  },
  {
    q: "Is my account secure?",
    a: "Yes. Passwords are stored as bcrypt hashes. Two-factor authentication (TOTP) is available in Settings. API sessions use JWT access tokens that expire every 15 minutes with automatic refresh token rotation.",
  },
  {
    q: "Can I cancel or delete my account?",
    a: "You can delete your account from the Settings page at any time. Donor data linked to completed donations is anonymized rather than hard-deleted to support payment dispute resolution. Your name and email are removed from all systems immediately.",
  },
];

const FAQ = () => {
  return (
    <div className="info-page">
      <h1>Frequently Asked Questions</h1>
      <p className="mb-xl">
        Everything you need to know before you start. Something missing?{" "}
        <a href="/contact">Contact us</a>.
      </p>

      <div className="landing-faq">
        {faqs.map((item, i) => (
          <div key={i} className="landing-faq__item">
            <details>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
