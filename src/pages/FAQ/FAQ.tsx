const faqs = [
  {
    q: "Is Helping Hands free to use?",
    a: "Yes. Creating an account, launching campaigns, uploading media, and collecting donations are all free. We take a small platform percentage from each successful donation to keep the service running — you will always see the exact fee before a donation is processed.",
  },
  {
    q: "How does payment processing work?",
    a: "Donations are processed securely through Stripe. Donors enter their card details on your campaign page, and Stripe handles the entire transaction. You do not need to set up your own Stripe account — Helping Hands manages that for you.",
  },
  {
    q: "What is a campaign?",
    a: "A campaign is a fundraising page you create inside your organization. Each campaign has its own title, goal amount, progress bar, and shareable link. You can run as many campaigns as you need simultaneously.",
  },
  {
    q: "Can I customize the look of my campaign page?",
    a: "Yes. The Page Layout Builder lets you add and arrange blocks — including a hero banner, text sections, media gallery, progress bar, and donate button — to create a page that matches your brand and message. No coding required.",
  },
  {
    q: "What is a giveaway and how does it work?",
    a: "You can optionally set a giveaway prize on any campaign. When you are ready, the dashboard lets you draw a winner at random from everyone who has donated. You choose whether to include all donors or only those above a minimum amount. The winner is announced on the campaign page.",
  },
  {
    q: "Do donors receive a receipt?",
    a: "Yes. Every successful donation triggers an automatic email receipt to the donor's email address. You can customize the receipt subject line, body text, and branding from the organization settings page.",
  },
  {
    q: "Can I add team members to my organization?",
    a: "Yes. Owners and admins can invite team members and assign them roles (owner, admin, or member). Granular permissions let you control exactly what each member can do — such as creating campaigns, editing campaigns, or managing tasks.",
  },
  {
    q: "How do I share my campaign?",
    a: "Each campaign has a unique public link based on your organization subdomain and campaign slug. You can also embed a live progress widget on your own website by copying the iframe snippet from your campaign dashboard.",
  },
  {
    q: "Is my account secure?",
    a: "Yes. Passwords are hashed with bcrypt and never stored in plain text. You can enable two-factor authentication (TOTP) from the Settings page for an extra layer of security. All API communication uses JWT tokens that expire after 15 minutes.",
  },
  {
    q: "Can I delete my account?",
    a: "Yes. You can permanently delete your account from the Settings page. We anonymize your personal data rather than hard-deleting it to allow for dispute resolution, but your email and name are immediately removed from all systems.",
  },
];

const FAQ = () => {
  return (
    <div className="info-page">
      <h1>Frequently Asked Questions</h1>
      <p className="mb-xl">
        Everything you need to know about Helping Hands. Can't find an answer?{" "}
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
