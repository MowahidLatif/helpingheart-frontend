import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

const stripePromise = (() => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (key && key.startsWith("pk_")) {
    return loadStripe(key);
  }
  return null;
})();

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  total_raised: number;
  page_layout?: { blocks?: Array<{ type: string; props?: Record<string, unknown> }> };
};

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

function getPresetAmounts(campaign: Campaign | null): number[] {
  if (!campaign?.page_layout?.blocks) return DEFAULT_PRESETS;
  const donateBlock = campaign.page_layout.blocks.find((b) => b.type === "donate_button");
  const presets = donateBlock?.props?.preset_amounts;
  if (Array.isArray(presets) && presets.length > 0) {
    return presets.filter((n) => typeof n === "number" && n > 0);
  }
  return DEFAULT_PRESETS;
}

function PaymentForm({
  campaignId,
  donationId,
  amount,
  onError,
}: {
  campaignId: string;
  donationId: string;
  amount: number;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    onError("");
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/${campaignId}/thank-you?donation_id=${donationId}`,
        },
      });
      if (error) {
        onError(error.message ?? "Payment failed");
      }
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="donation-payment-form">
      <div className="donation-summary">
        <p>Amount: ${amount.toFixed(2)}</p>
      </div>
      <PaymentElement />
      <button type="submit" disabled={loading} className="donation-submit-btn">
        {loading ? "Processing…" : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function DonatePage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [checkoutData, setCheckoutData] = useState<{
    clientSecret: string;
    donationId: string;
    amount: number;
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!campaignId) {
      setError("Missing campaign");
      setLoading(false);
      return;
    }
    api
      .get(API_ENDPOINTS.campaigns.public(campaignId))
      .then((res) => {
        setCampaign(res.data);
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [campaignId]);

  const presets = getPresetAmounts(campaign);
  const selectedAmount = amount ?? (customAmount ? parseFloat(customAmount) : null);

  const handleDonateClick = async () => {
    const amt = selectedAmount;
    if (!amt || amt <= 0 || !campaignId || !campaign) {
      setCheckoutError("Please enter a valid amount.");
      return;
    }
    setCheckoutError("");
    try {
      const res = await api.post(API_ENDPOINTS.donations.checkout, {
        campaign_id: campaignId,
        amount: amt,
        donor_email: donorEmail.trim() || undefined,
        message: message.trim() || undefined,
      });
      const data = res.data;
      if (data.error || !data.clientSecret) {
        setCheckoutError(data.error || "Checkout failed");
        return;
      }
      setCheckoutData({
        clientSecret: data.clientSecret,
        donationId: data.donation_id,
        amount: amt,
      });
    } catch (err) {
      setCheckoutError(getErrorMessage(err));
    }
  };

  const handleBackToForm = () => {
    setCheckoutData(null);
  };

  if (loading) {
    return (
      <div className="donate-page">
        <p>Loading campaign…</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="donate-page">
        <p className="donation-error">{error || "Campaign not found."}</p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="donate-page">
        <p className="donation-error">
          Payment is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment.
        </p>
      </div>
    );
  }

  if (checkoutData) {
    return (
      <div className="donate-page">
        <h1>Complete your donation</h1>
        <p>Campaign: {campaign.title}</p>
        {checkoutError && <p className="donation-error">{checkoutError}</p>}
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: checkoutData.clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <PaymentForm
            campaignId={campaignId!}
            donationId={checkoutData.donationId}
            amount={checkoutData.amount}
            onError={setCheckoutError}
          />
        </Elements>
        <button type="button" onClick={handleBackToForm} className="donation-back-btn">
          Change amount
        </button>
      </div>
    );
  }

  const percent = campaign.goal > 0 ? Math.min(100, (campaign.total_raised / campaign.goal) * 100) : 0;

  return (
    <div className="donate-page">
      <h1>{campaign.title}</h1>
      <div className="campaign-progress">
        <p>
          ${campaign.total_raised.toLocaleString()} of ${campaign.goal.toLocaleString()} raised
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="donation-form">
        <h2>Make a donation</h2>
        {checkoutError && <p className="donation-error">{checkoutError}</p>}

        <div className="amount-presets">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className={`preset-btn ${amount === p ? "selected" : ""}`}
              onClick={() => {
                setAmount(p);
                setCustomAmount("");
              }}
            >
              ${p}
            </button>
          ))}
        </div>

        <div className="custom-amount">
          <label htmlFor="custom-amount">Or enter amount:</label>
          <input
            id="custom-amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(null);
            }}
          />
        </div>

        <div className="form-field">
          <label htmlFor="donor-email">Email (optional, for receipt):</label>
          <input
            id="donor-email"
            type="email"
            placeholder="you@example.com"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="message">Message (optional):</label>
          <textarea
            id="message"
            placeholder="Add a message of support..."
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="donation-submit-btn"
          onClick={handleDonateClick}
          disabled={!selectedAmount || selectedAmount <= 0}
        >
          Donate ${selectedAmount ? selectedAmount.toFixed(2) : "—"}
        </button>
      </div>
    </div>
  );
}
