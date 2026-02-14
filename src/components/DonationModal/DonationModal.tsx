import { useState, useEffect } from "react";
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

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

type DonationModalProps = {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  presetAmounts?: number[];
};

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

export function DonationModal({
  open,
  onClose,
  campaignId,
  campaignTitle,
  presetAmounts = DEFAULT_PRESETS,
}: DonationModalProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [checkoutData, setCheckoutData] = useState<{
    clientSecret: string;
    donationId: string;
    amount: number;
  } | null>(null);
  const [error, setError] = useState("");

  const selectedAmount = amount ?? (customAmount ? parseFloat(customAmount) : null);

  useEffect(() => {
    if (!open) {
      setAmount(null);
      setCustomAmount("");
      setDonorEmail("");
      setMessage("");
      setCheckoutData(null);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleDonateClick = async () => {
    const amt = selectedAmount;
    if (!amt || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError("");
    try {
      const res = await api.post(API_ENDPOINTS.donations.checkout, {
        campaign_id: campaignId,
        amount: amt,
        donor_email: donorEmail.trim() || undefined,
        message: message.trim() || undefined,
      });
      const data = res.data;
      if (data.error || !data.clientSecret) {
        setError(data.error || "Checkout failed");
        return;
      }
      setCheckoutData({
        clientSecret: data.clientSecret,
        donationId: data.donation_id,
        amount: amt,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleBackToForm = () => {
    setCheckoutData(null);
  };

  if (!open) return null;

  return (
    <div
      className="donation-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-modal-title"
    >
      <div
        className="donation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="donation-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="donation-modal-title" className="donation-modal-title">
          {checkoutData ? "Complete your donation" : `Donate to ${campaignTitle}`}
        </h2>

        {checkoutData && stripePromise ? (
          <>
            {error && <p className="donation-error">{error}</p>}
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: checkoutData.clientSecret,
                appearance: { theme: "stripe" },
              }}
            >
              <PaymentForm
                campaignId={campaignId}
                donationId={checkoutData.donationId}
                amount={checkoutData.amount}
                onError={setError}
              />
            </Elements>
            <button
              type="button"
              onClick={handleBackToForm}
              className="donation-back-btn"
            >
              Change amount
            </button>
          </>
        ) : (
          <>
            {error && <p className="donation-error">{error}</p>}
            <div className="donation-form">
              <div className="amount-presets">
                {presetAmounts.map((p) => (
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
                <label htmlFor="modal-custom-amount">Or enter amount:</label>
                <input
                  id="modal-custom-amount"
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
                <label htmlFor="modal-donor-email">Email (optional, for receipt):</label>
                <input
                  id="modal-donor-email"
                  type="email"
                  placeholder="you@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="modal-message">Message (optional):</label>
                <textarea
                  id="modal-message"
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
          </>
        )}
      </div>
    </div>
  );
}
