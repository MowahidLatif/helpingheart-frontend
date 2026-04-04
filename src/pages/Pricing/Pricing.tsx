type FeeOption = {
  title: string;
  subtitle: string;
  details: string[];
  pros: string[];
};

const feeOptions: FeeOption[] = [
  {
    title: "Option 1 - Donor Pays Fees (Default)",
    subtitle: "Predictable, safe, and recommended as the default for all campaigns.",
    details: [
      "Who chooses: Default for all campaigns",
      "Platform fee: 5 / 4 / 3% (small -> medium -> large campaigns)",
      "Stripe fees: Paid by donor",
      "Max campaign cap: > $500k -> 3% (lowest tier)",
    ],
    pros: [
      "Platform revenue is predictable and safe",
      "Avoids absorbing Stripe fees, especially on large campaigns",
      "Attractive to high-volume or large campaigns",
    ],
  },
  {
    title: "Option 2 - Platform Absorbs Fees (Optional)",
    subtitle:
      "Optional toggle for campaign managers who want to offer a donor-first payment experience.",
    details: [
      "Who chooses: Campaign manager, optional toggle",
      "Default: OFF",
      "Platform fee: 8 / 7 / 6% (small -> medium -> large campaigns)",
      "Stripe fees: Covered by platform (absorbed)",
      "Donation size considerations: absorb fees only for donations >= $10",
      "Very small micro-donations ($5) remain donor-paid to avoid losses",
      "Max campaign cap: > $500k -> 6-7% fee (lower % for bigger totals)",
    ],
    pros: [
      "Organizations receive full donations minus platform fee",
      "Attractive for small and medium campaigns",
      "Marketing message: We cover processing fees for you",
      "Encourages adoption and positive user experience",
    ],
  },
];

const uxPositioning = [
  "Default: Donor pays fees for predictable, safe, and simple operations",
  "Optional toggle: Platform absorbs fees to attract small-medium campaigns",
  "Marketing advantage: Competitors often allow one model, while this platform offers flexibility",
  "Dashboard: Clearly show selected fee option and total net donations to avoid confusion",
];

const Pricing = () => {
  return (
    <div className="info-page">
      <h1>Pricing</h1>
      <p className="mb-2xl">
        Helping Hands supports two clear fee models so organizations can choose
        what best fits their campaign strategy, while keeping fee behavior
        transparent for donors.
      </p>

      {feeOptions.map((option) => (
        <section key={option.title} className="card mb-2xl" style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2 className="m-0">{option.title}</h2>
            <p className="text-secondary mt-xs m-0">{option.subtitle}</p>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {option.details.map((item) => (
              <li key={item} className="d-flex" style={{ alignItems: "flex-start", gap: "0.6rem" }}>
                <span className="text-success font-bold">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="info-callout" style={{ marginTop: "1.5rem" }}>
            <h3 className="m-0 mb-sm">Pros</h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {option.pros.map((pro) => (
                <li key={pro} className="d-flex" style={{ alignItems: "flex-start", gap: "0.6rem" }}>
                  <span className="text-success font-bold">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="card mb-2xl" style={{ padding: "2rem" }}>
        <h2 className="m-0">UX &amp; Positioning</h2>
        <p className="text-secondary mt-xs">
          Product messaging and dashboard clarity should make fee selection
          obvious at every step.
        </p>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
          }}
        >
          {uxPositioning.map((point) => (
            <li key={point} className="d-flex" style={{ alignItems: "flex-start", gap: "0.6rem" }}>
              <span className="text-success font-bold">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="info-callout" style={{ marginTop: 0 }}>
        <h3 className="m-0 mb-sm">Why this strategy works</h3>
        <p>
          The donor-paid default protects predictable platform economics, while
          the optional absorb-fees model creates a strong campaign-level
          marketing lever when organizations want it.
        </p>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <div className="d-flex" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h3 className="m-0">No monthly subscription</h3>
            <p className="text-secondary mt-xs m-0">
              Start for free and choose the fee model that fits each campaign.
            </p>
          </div>
          <div className="text-right">
            <span className="font-bold" style={{ fontSize: "2rem" }}>$0</span>
            <span className="text-secondary">/month</span>
          </div>
        </div>
        <a href="/signup" className="btn btn-primary mt-xl d-inline-block">
          Get started for free
        </a>
      </div>
    </div>
  );
};

export default Pricing;
