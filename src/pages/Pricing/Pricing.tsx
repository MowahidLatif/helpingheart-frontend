import { Link } from "react-router-dom";
import { TIER_LIMITS, getAiGenLabel } from "@/lib/tierFeatures";
import type { TierKey } from "@/lib/tierFeatures";

type FeatureRow = {
  label: string;
  t1: string | boolean;
  t2: string | boolean;
  t3: string | boolean;
};

const featureRows: FeatureRow[] = [
  {
    label: "Platform fee (% of total raised)",
    t1: "3%",
    t2: "4%",
    t3: "5%",
  },
  {
    label: "Active campaigns",
    t1: `Up to ${TIER_LIMITS[1].max_active_campaigns}`,
    t2: `Up to ${TIER_LIMITS[2].max_active_campaigns}`,
    t3: "Unlimited",
  },
  {
    label: "Team members",
    t1: "Owner only",
    t2: `Up to ${TIER_LIMITS[2].max_members}`,
    t3: "Unlimited",
  },
  {
    label: "AI site generations",
    t1: getAiGenLabel(1),
    t2: getAiGenLabel(2),
    t3: getAiGenLabel(3),
  },
  { label: "Stripe Connect payouts", t1: true, t2: true, t3: true },
  { label: "Custom campaign subdomain", t1: true, t2: true, t3: true },
  { label: "Real-time donation feed", t1: true, t2: true, t3: true },
  { label: "Donor email receipts (SendGrid)", t1: true, t2: true, t3: true },
  { label: "Campaign update posts", t1: false, t2: true, t3: true },
  { label: "iFrame embed (HTML / WP / React)", t1: false, t2: true, t3: true },
  { label: "Basic task management", t1: false, t2: true, t3: true },
  { label: "Full task suite (checklists, files, blockers, time entries, @mentions)", t1: false, t2: false, t3: true },
  { label: "Email marketing to donor list", t1: false, t2: false, t3: true },
  { label: "Donor segmentation & open/click tracking", t1: false, t2: false, t3: true },
  { label: "Giveaway / lottery feature", t1: false, t2: false, t3: true },
  { label: "Advanced analytics & exportable reports", t1: false, t2: false, t3: true },
];

const tiers: { key: TierKey; popular?: boolean }[] = [
  { key: 1 },
  { key: 2, popular: true },
  { key: 3 },
];

function FeatureVal({ val }: { val: string | boolean }) {
  if (val === true) return <span className="tier-check">✓</span>;
  if (val === false) return <span className="tier-dash">–</span>;
  return <span className="tier-val-text">{val}</span>;
}

const Pricing = () => {
  return (
    <div className="info-page pricing-page">
      <h1>Pricing</h1>
      <p className="mb-2xl">
        Simple, performance-based pricing — HelpingHandsFund only earns when you
        do. No monthly subscription, no setup fees. Choose the plan that fits
        your organization and upgrade any time.
      </p>

      <div className="pricing-tiers-grid mb-2xl">
        {tiers.map(({ key, popular }) => {
          const limits = TIER_LIMITS[key];
          return (
            <div
              key={key}
              className={`card pricing-tier${popular ? " pricing-tier--popular" : ""}`}
            >
              {popular && (
                <div className="pricing-tier__badge">Most Popular</div>
              )}
              <div className="pricing-tier__header">
                <h2 className="pricing-tier__name m-0">{limits.name}</h2>
                <div className="pricing-tier__fee">
                  <span className="pricing-tier__pct">{limits.platform_fee_percent}%</span>
                  <span className="pricing-tier__fee-label"> of total raised</span>
                </div>
              </div>
              <ul className="pricing-tier__features">
                {key === 1 && (
                  <>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Up to 2 active campaigns</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> {getAiGenLabel(1)} AI site generations</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Stripe Connect payouts</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Custom subdomain</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Donor email receipts</li>
                    <li className="pricing-tier__feat pricing-tier__feat--muted"><span className="tier-dash">–</span> Team members</li>
                    <li className="pricing-tier__feat pricing-tier__feat--muted"><span className="tier-dash">–</span> Task management</li>
                    <li className="pricing-tier__feat pricing-tier__feat--muted"><span className="tier-dash">–</span> iFrame embeds</li>
                  </>
                )}
                {key === 2 && (
                  <>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Up to 5 active campaigns</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> {getAiGenLabel(2)} AI generations</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Up to 5 team members</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Basic task management</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> iFrame embedding</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Campaign update posts</li>
                    <li className="pricing-tier__feat pricing-tier__feat--muted"><span className="tier-dash">–</span> Email marketing</li>
                    <li className="pricing-tier__feat pricing-tier__feat--muted"><span className="tier-dash">–</span> Giveaway / lottery</li>
                  </>
                )}
                {key === 3 && (
                  <>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Unlimited campaigns</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> {getAiGenLabel(3)} AI generations</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Unlimited team members</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Full task suite</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Email marketing & segmentation</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Giveaway / lottery feature</li>
                    <li className="pricing-tier__feat"><span className="tier-check">✓</span> Advanced analytics & exports</li>
                  </>
                )}
              </ul>
              <Link
                to={`/signup?tier=${key}`}
                className={`btn ${popular ? "btn-primary" : "btn-outline"} pricing-tier__cta`}
              >
                Get started
              </Link>
            </div>
          );
        })}
      </div>

      <div className="info-callout mb-2xl" style={{ marginTop: 0 }}>
        <h3 className="m-0 mb-sm">Early cancellation fee</h3>
        <p>
          If you cancel a campaign before it reaches its goal, a flat{" "}
          <strong>5% fee</strong> is automatically deducted from the total raised
          at time of cancellation before the remainder is paid out. This fee
          applies to all tiers. If a campaign runs to completion or hits its
          goal, only the standard tier fee applies — no cancellation fee.
        </p>
      </div>

      <section className="card pricing-compare-card mb-2xl">
        <h2 className="m-0 mb-md">Full feature comparison</h2>
        <div className="pricing-compare-table-wrap">
          <table className="pricing-compare-table">
            <thead>
              <tr>
                <th className="pricing-compare-table__feature-col">Feature</th>
                <th>Starter</th>
                <th>Grow</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row) => (
                <tr key={row.label}>
                  <td className="pricing-compare-table__feature-col">{row.label}</td>
                  <td><FeatureVal val={row.t1} /></td>
                  <td><FeatureVal val={row.t2} /></td>
                  <td><FeatureVal val={row.t3} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="info-callout" style={{ marginTop: 0 }}>
        <h3 className="m-0 mb-sm">Why performance-based pricing?</h3>
        <p>
          HelpingHandsFund's incentives are aligned with yours: we only earn when
          you raise money. The higher-tier plans fund the additional compute,
          email infrastructure, and AI credits required for advanced features —
          so heavier usage is always accompanied by proportionally higher
          platform revenue.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
