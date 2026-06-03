import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "antd";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { notifyError } from "@/lib/notifications";
import { TIER_LIMITS } from "@/lib/tierFeatures";
import type { TierKey } from "@/lib/tierFeatures";

type BillingStatus = {
  subscription_status?: string;
  billing_active?: boolean;
  billing_required?: boolean;
  is_trialing?: boolean;
  trial_ends_at?: string | null;
  trial_days_remaining?: number | null;
  billing_interval?: string;
  next_charge_amount?: number;
  next_charge_currency?: string;
  tier?: number;
  payout_account_ready?: boolean;
};

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    const orgId = user?.org_id;
    if (!orgId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await api.get<BillingStatus>(API_ENDPOINTS.orgs.billingStatus(orgId));
        setStatus(res.data);
        if (!res.data.payout_account_ready) {
          await api.post(API_ENDPOINTS.orgs.billingSetup(orgId));
          const linkRes = await api.post<{ url?: string }>(
            API_ENDPOINTS.orgs.payoutOnboarding(orgId)
          );
          if (linkRes.data.url) {
            setConnectUrl(linkRes.data.url);
          }
        }
      } catch (err) {
        notifyError(err, "Could not verify subscription status.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const isTrialing =
    status?.is_trialing || status?.subscription_status === "trialing";
  const tier = (status?.tier ?? 1) as TierKey;
  const planName = TIER_LIMITS[tier]?.name ?? "Starter";
  const interval = status?.billing_interval === "annual" ? "year" : "month";
  const chargeLabel =
    status?.next_charge_amount != null
      ? `$${status.next_charge_amount}/${interval}`
      : null;

  return (
    <div className="info-page" style={{ maxWidth: 560, margin: "3rem auto" }}>
      <h1>{isTrialing ? "Your free trial has started" : "Subscription confirmed"}</h1>
      {loading ? (
        <p>Verifying your subscription…</p>
      ) : (
        <>
          {isTrialing ? (
            <div className="info-callout mb-lg">
              <p style={{ marginTop: 0 }}>
                You&apos;re on the <strong>{planName}</strong> plan. Your card is on file but you
                won&apos;t be charged until{" "}
                {status?.trial_ends_at
                  ? new Date(status.trial_ends_at).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "your trial ends"}
                .
              </p>
              {chargeLabel && (
                <p style={{ marginBottom: 0 }}>
                  After your trial, you&apos;ll be charged <strong>{chargeLabel}</strong>. Cancel
                  anytime before then from Settings — no charge if you cancel during the trial.
                </p>
              )}
              {status?.trial_days_remaining != null && (
                <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.75rem" }}>
                  {status.trial_days_remaining} day
                  {status.trial_days_remaining === 1 ? "" : "s"} remaining in your trial.
                </p>
              )}
            </div>
          ) : (
            <p>
              {status?.billing_active
                ? "Your plan is active. You can start creating campaigns."
                : "Payment received — your plan will activate shortly once Stripe confirms."}
            </p>
          )}
          {connectUrl && (
            <div className="info-callout mb-lg">
              <p style={{ marginTop: 0 }}>
                <strong>Next step:</strong> Connect your payout account so donations can be
                transferred when campaigns complete.
              </p>
              <Button type="primary" href={connectUrl}>
                Complete payout setup
              </Button>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/dashboard" className="btn btn-primary">
              Go to dashboard
            </Link>
            <Link to="/settings" className="btn btn-outline">
              Settings
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
