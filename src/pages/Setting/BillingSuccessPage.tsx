import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "antd";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { notifyError } from "@/lib/notifications";

type BillingStatus = {
  subscription_status?: string;
  billing_active?: boolean;
  billing_required?: boolean;
  payout_account_ready?: boolean;
  payouts_enabled?: boolean;
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

  return (
    <div className="info-page" style={{ maxWidth: 560, margin: "3rem auto" }}>
      <h1>Subscription confirmed</h1>
      {loading ? (
        <p>Verifying your subscription…</p>
      ) : (
        <>
          <p>
            {status?.billing_active
              ? "Your plan is active. You can start creating campaigns."
              : "Payment received — your plan will activate shortly once Stripe confirms."}
          </p>
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
