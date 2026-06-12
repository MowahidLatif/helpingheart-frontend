import React, { useState } from "react";
import { Button, Input } from "antd";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { decodeTokenClaims } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError } from "@/lib/notifications";
import {
  TIER_LIMITS,
  TRIAL_DAYS,
  annualPriceForTier,
  formatPriceForInterval,
  getTierCardFeatures,
  trialChargeDateLabel,
} from "@/lib/tierFeatures";
import type { BillingInterval, TierKey } from "@/lib/tierFeatures";

type StepTierCardProps = {
  tierKey: TierKey;
  interval: BillingInterval;
  selected: boolean;
  popular?: boolean;
  onSelect: () => void;
};

function TierCard({ tierKey, interval, selected, popular, onSelect }: StepTierCardProps) {
  const limits = TIER_LIMITS[tierKey];
  const highlights = getTierCardFeatures(tierKey).slice(0, 5);
  const displayPrice =
    interval === "annual" ? (
      <>
        ${annualPriceForTier(tierKey)}
        <span className="signup-tier-card__fee-label">/year</span>
      </>
    ) : (
      <>
        ${limits.monthly_price}
        <span className="signup-tier-card__fee-label">/month</span>
      </>
    );
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`signup-tier-card${selected ? " signup-tier-card--selected" : ""}${popular ? " signup-tier-card--popular" : ""}`}
    >
      {popular && <span className="signup-tier-card__badge">Most Popular</span>}
      {interval === "annual" && (
        <span className="signup-tier-card__badge signup-tier-card__badge--save">2 months free</span>
      )}
      <div className="signup-tier-card__header">
        <span className="signup-tier-card__name">{limits.name}</span>
        <span className="signup-tier-card__fee">{displayPrice}</span>
      </div>
      <ul className="signup-tier-card__features">
        {highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </button>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTier = (parseInt(searchParams.get("tier") || "0") as TierKey) || 2;
  const validInitial: TierKey = [1, 2, 3].includes(initialTier) ? initialTier : 2;
  const initialInterval = searchParams.get("interval") === "annual" ? "annual" : "monthly";

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTier, setSelectedTier] = useState<TierKey>(validInitial);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(initialInterval);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSubdomain, setOrgSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  const trialEndLabel = trialChargeDateLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password || !orgName) return;
    setLoading(true);
    try {
      const detectedTimezone = (() => {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; }
        catch { return "UTC"; }
      })();
      const response = await api.post(API_ENDPOINTS.auth.register, {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        org_name: orgName,
        org_subdomain: orgSubdomain || undefined,
        org_tier: selectedTier,
        timezone: detectedTimezone,
      });
      const { access_token, refresh_token, id, email: userEmail, name, org_id } = response.data;
      localStorage.setItem("token", access_token);
      if (refresh_token) {
        localStorage.setItem("refreshToken", refresh_token);
      } else {
        localStorage.removeItem("refreshToken");
      }
      const claims = decodeTokenClaims(access_token);
      const resolvedOrgId = org_id ?? claims?.org_id ?? null;
      localStorage.setItem(
        "user",
        JSON.stringify({
          id,
          email: userEmail,
          name,
          org_id: resolvedOrgId,
          role: claims?.role ?? null,
          permissions: claims?.permissions ?? [],
        })
      );
      if (resolvedOrgId) {
        await api.post(API_ENDPOINTS.orgs.billingSetup(resolvedOrgId));
        const checkoutRes = await api.post<{ url?: string }>(
          API_ENDPOINTS.orgs.billingCheckout(resolvedOrgId),
          { tier: selectedTier, interval: billingInterval }
        );
        if (checkoutRes.data.url) {
          window.location.href = checkoutRes.data.url;
          return;
        }
      }
      navigate("/dashboard");
    } catch (err) {
      notifyError(err, "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card${step === 1 ? " auth-card--wide" : ""}`}>
        <div className="auth-header">
          <h1>Sign Up</h1>
          {step === 1 ? (
            <p>
              Start your {TRIAL_DAYS}-day free trial. Card required — you won&apos;t be charged until{" "}
              {trialEndLabel}.
            </p>
          ) : (
            <p>
              <button type="button" className="link-btn" onClick={() => setStep(1)}>
                ← Change plan
              </button>{" "}
              <strong>{TIER_LIMITS[selectedTier].name}</strong> —{" "}
              {formatPriceForInterval(selectedTier, billingInterval)}
            </p>
          )}
        </div>

        {step === 1 && (
          <div>
            <div
              className="billing-interval-toggle"
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Button
                type={billingInterval === "monthly" ? "primary" : "default"}
                onClick={() => setBillingInterval("monthly")}
              >
                Monthly
              </Button>
              <Button
                type={billingInterval === "annual" ? "primary" : "default"}
                onClick={() => setBillingInterval("annual")}
              >
                Annual — 2 months free
              </Button>
            </div>
            <div className="signup-tier-grid">
              {([1, 2, 3] as TierKey[]).map((k) => (
                <TierCard
                  key={k}
                  tierKey={k}
                  interval={billingInterval}
                  popular={k === 2}
                  selected={selectedTier === k}
                  onSelect={() => setSelectedTier(k)}
                />
              ))}
            </div>
            <p style={{ color: "#666", fontSize: "0.9rem", textAlign: "center", marginTop: "1rem" }}>
              {TRIAL_DAYS}-day free trial · Cancel anytime before {trialEndLabel} — no charge
            </p>
            <Button type="primary" block className="mt-xl" onClick={() => setStep(2)}>
              Continue with {TIER_LIMITS[selectedTier].name} →
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <p
              style={{
                background: "#f0f7ff",
                border: "1px solid #cce0ff",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Your free trial starts when you add your card on the next screen. You won&apos;t be
              charged until <strong>{trialEndLabel}</strong>. Cancel anytime before then.
            </p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required" htmlFor="signup-first-name">
                  First Name
                </label>
                <Input
                  id="signup-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label className="form-label required" htmlFor="signup-last-name">
                  Last Name
                </label>
                <Input
                  id="signup-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="signup-email">
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="signup-password">
                Password
              </label>
              <Input.Password
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="signup-org-name">
                Organization Name
              </label>
              <Input
                id="signup-org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                placeholder="My Organization"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-org-subdomain">
                Organization Subdomain (optional)
              </label>
              <Input
                id="signup-org-subdomain"
                type="text"
                value={orgSubdomain}
                onChange={(e) => setOrgSubdomain(e.target.value)}
                placeholder="e.g., myorg"
              />
              <span className="form-help-text">
                Your donation page will be at: {orgSubdomain || "yourorg"}.helpinghands.ca
              </span>
            </div>
            <div className="form-actions">
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Creating account..." : "Continue to secure checkout"}
              </Button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
