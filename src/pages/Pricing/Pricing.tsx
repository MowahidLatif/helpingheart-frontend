import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import {
  TIER_LIMITS,
  TIER_PRICE,
  annualPriceForTier,
  getAiGenLabel,
  getTierCardFeatures,
} from "@/lib/tierFeatures";
import type { BillingInterval, TierKey } from "@/lib/tierFeatures";

type FeatureRow = {
  label: string;
  t1: string | boolean;
  t2: string | boolean;
  t3: string | boolean;
};

const featureRows: FeatureRow[] = [
  {
    label: "Monthly price",
    t1: `$${TIER_PRICE[1]}`,
    t2: `$${TIER_PRICE[2]}`,
    t3: `$${TIER_PRICE[3]}`,
  },
  {
    label: "Annual price (2 months free)",
    t1: `$${annualPriceForTier(1)}/yr`,
    t2: `$${annualPriceForTier(2)}/yr`,
    t3: `$${annualPriceForTier(3)}/yr`,
  },
  {
    label: "Team members",
    t1: "1 admin",
    t2: `Up to ${TIER_LIMITS[2].max_members}`,
    t3: "Unlimited",
  },
  {
    label: "Active campaigns",
    t1: `${TIER_LIMITS[1].max_active_campaigns}`,
    t2: `Up to ${TIER_LIMITS[2].max_active_campaigns}`,
    t3: "Unlimited",
  },
  {
    label: "AI site generations",
    t1: getAiGenLabel(1),
    t2: getAiGenLabel(2),
    t3: getAiGenLabel(3),
  },
  { label: "Custom campaign subdomain", t1: true, t2: true, t3: true },
  { label: "Real-time donation feed", t1: true, t2: true, t3: true },
  { label: "Automated donor email receipts", t1: true, t2: true, t3: true },
  { label: "Stripe Connect payouts", t1: true, t2: true, t3: true },
  { label: "Basic task management", t1: false, t2: true, t3: true },
  { label: "iFrame embedding (widget + full page)", t1: false, t2: true, t3: true },
  { label: "Campaign update notifications", t1: false, t2: true, t3: true },
  { label: "Basic analytics dashboard", t1: false, t2: true, t3: true },
  {
    label: "Full task suite (checklists, attachments, blockers, time entries, @mentions)",
    t1: false,
    t2: false,
    t3: true,
  },
  { label: "Email marketing with open + click tracking", t1: false, t2: false, t3: true },
  { label: "Donor segmentation", t1: false, t2: false, t3: true },
  { label: "Giveaway / lottery feature", t1: false, t2: false, t3: true },
  { label: "Campaign raffles (auto-entry, auto-draw, winner management)", t1: false, t2: true, t3: true },
  { label: "Advanced analytics + CSV export", t1: false, t2: false, t3: true },
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
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <div className="info-page pricing-page">
      <h1>Pricing</h1>
      <p className="mb-md">
        Simple, flat plans — no percentage taken from your donations. Every plan includes a{" "}
        <strong>7-day free trial</strong> (card required; cancel before trial ends — no charge).
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <Button
          type={interval === "monthly" ? "primary" : "default"}
          onClick={() => setInterval("monthly")}
        >
          Monthly
        </Button>
        <Button
          type={interval === "annual" ? "primary" : "default"}
          onClick={() => setInterval("annual")}
        >
          Annual — 2 months free
        </Button>
      </div>

      <div className="pricing-tiers-grid mb-2xl">
        {tiers.map(({ key, popular }) => {
          const limits = TIER_LIMITS[key];
          const features = getTierCardFeatures(key);
          const priceDisplay =
            interval === "annual" ? (
              <>
                <span className="pricing-tier__pct">${annualPriceForTier(key)}</span>
                <span className="pricing-tier__fee-label">/year</span>
              </>
            ) : (
              <>
                <span className="pricing-tier__pct">${limits.monthly_price}</span>
                <span className="pricing-tier__fee-label">/month</span>
              </>
            );
          return (
            <div
              key={key}
              className={`card pricing-tier${popular ? " pricing-tier--popular" : ""}`}
            >
              {popular && <div className="pricing-tier__badge">Most Popular</div>}
              {interval === "annual" && (
                <div className="pricing-tier__badge" style={{ top: popular ? "2.5rem" : undefined }}>
                  2 months free
                </div>
              )}
              <div className="pricing-tier__header">
                <h2 className="pricing-tier__name m-0">{limits.name}</h2>
                <p className="m-0" style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.2rem" }}>
                  {key === 1 && "For individuals and small projects getting started."}
                  {key === 2 && "For active organizations running multiple campaigns."}
                  {key === 3 && "For high-volume fundraisers who need every feature."}
                </p>
                <div className="pricing-tier__fee">{priceDisplay}</div>
              </div>
              <ul className="pricing-tier__features">
                {features.map((feat) => (
                  <li key={feat} className="pricing-tier__feat">
                    <span className="tier-check">✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link
                to="/waitlist"
                className={`btn ${popular ? "btn-primary" : "btn-outline"} pricing-tier__cta`}
              >
                Get started
              </Link>
              <Link
                to={`/signup?tier=${key}&interval=${interval}`}
                className="btn btn-outline pricing-tier__cta"
                style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}
              >
                Start free trial
              </Link>
            </div>
          );
        })}
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
    </div>
  );
};

export default Pricing;
