import { useState, useEffect } from "react";
import { Button, Input } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError } from "@/lib/notifications";

const stripePromise = (() => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (key && key.startsWith("pk_")) {
    return loadStripe(key);
  }
  return null;
})();

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

type RaffleInfo = {
  prize_name: string;
  status: string;
};

type DonationModalProps = {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  presetAmounts?: number[];
  raffle?: RaffleInfo | null;
  isOrgMember?: boolean;
};

function PaymentForm({
  campaignId,
  donationId,
  chargeAmount,
  baseAmount,
  donorCoverAmount,
  onError,
}: {
  campaignId: string;
  donationId: string;
  chargeAmount: number;
  baseAmount: number;
  donorCoverAmount: number;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      onError("Payment form is still loading. Please try again.");
      return;
    }
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
        const msg = error.message ?? "Payment failed";
        onError(msg);
        notifyError(msg);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      onError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="donation-payment-form">
      <div className="donation-summary">
        <p>Donation: ${baseAmount.toFixed(2)}</p>
        {donorCoverAmount > 0 ? (
          <p>
            Processing fee: ${donorCoverAmount.toFixed(2)} (covered by donor)
          </p>
        ) : null}
        <p>Total charge: ${chargeAmount.toFixed(2)}</p>
      </div>
      <PaymentElement />
      <Button htmlType="submit" type="primary" loading={loading} className="donation-submit-btn">
        {loading ? "Processing…" : `Pay $${chargeAmount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export function DonationModal({
  open,
  onClose,
  campaignId,
  campaignTitle,
  presetAmounts = DEFAULT_PRESETS,
  raffle = null,
  isOrgMember = false,
}: DonationModalProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorFirstName, setDonorFirstName] = useState("");
  const [donorLastName, setDonorLastName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorConfirmEmail, setDonorConfirmEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [emailMismatch, setEmailMismatch] = useState(false);
  const [message, setMessage] = useState("");
  const [raffleDisplayConsent, setRaffleDisplayConsent] = useState(false);
  const showRaffle = !!(raffle && raffle.status === "active");
  const [checkoutData, setCheckoutData] = useState<{
    clientSecret: string;
    donationId: string;
    baseAmount: number;
    chargeAmount: number;
    donorCoverAmount: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [creatingCheckout, setCreatingCheckout] = useState(false);

  const selectedAmount = amount ?? (customAmount ? parseFloat(customAmount) : null);

  useEffect(() => {
    if (!open) {
      setAmount(null);
      setCustomAmount("");
      setDonorFirstName("");
      setDonorLastName("");
      setDonorEmail("");
      setDonorConfirmEmail("");
      setDonorPhone("");
      setEmailMismatch(false);
      setMessage("");
      setRaffleDisplayConsent(false);
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

    if (showRaffle && donorEmail.trim()) {
      const mismatch = donorEmail.trim().toLowerCase() !== donorConfirmEmail.trim().toLowerCase();
      setEmailMismatch(mismatch);
      if (mismatch) return;
    }

    setCreatingCheckout(true);
    try {
      const res = await api.post(API_ENDPOINTS.donations.checkout, {
        campaign_id: campaignId,
        amount: amt,
        donor_first_name: donorFirstName.trim() || undefined,
        donor_last_name: donorLastName.trim() || undefined,
        donor_email: donorEmail.trim() || undefined,
        message: message.trim() || undefined,
        raffle_display_consent: showRaffle ? raffleDisplayConsent : undefined,
        ...(showRaffle && donorPhone.trim() ? { phone: donorPhone.trim() } : {}),
      });
      const data = res.data;
      if (data.error || !data.clientSecret) {
        const msg = data.error || "Checkout failed";
        setError(msg);
        notifyError(msg);
        return;
      }
      setCheckoutData({
        clientSecret: data.clientSecret,
        donationId: data.donation_id,
        baseAmount: ((data.base_amount_cents ?? Math.round(amt * 100)) as number) / 100,
        chargeAmount:
          ((data.charge_amount_cents ?? Math.round(amt * 100)) as number) / 100,
        donorCoverAmount:
          ((data.donor_cover_amount_cents ?? 0) as number) / 100,
      });
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setCreatingCheckout(false);
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
        aria-busy={creatingCheckout}
      >
        <Button
          type="text"
          className="donation-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </Button>
        <h2 id="donation-modal-title" className="donation-modal-title">
          {checkoutData ? "Complete your donation" : `Donate to ${campaignTitle}`}
        </h2>

        {checkoutData && stripePromise ? (
          <>
            {error && <p className="donation-error" role="alert" aria-live="polite">{error}</p>}
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
                baseAmount={checkoutData.baseAmount}
                chargeAmount={checkoutData.chargeAmount}
                donorCoverAmount={checkoutData.donorCoverAmount}
                onError={setError}
              />
            </Elements>
            <Button
              type="default"
              onClick={handleBackToForm}
              className="donation-back-btn"
            >
              Change amount
            </Button>
          </>
        ) : (
          <>
            {error && <p className="donation-error" role="alert" aria-live="polite">{error}</p>}
            <div className="donation-form">
              <div className="amount-presets">
                {presetAmounts.map((p) => (
                  <Button
                    key={p}
                    type="default"
                    className={`preset-btn ${amount === p ? "selected" : ""}`}
                    onClick={() => {
                      setAmount(p);
                      setCustomAmount("");
                    }}
                  >
                    ${p}
                  </Button>
                ))}
              </div>
              <div className="custom-amount">
                <label htmlFor="modal-custom-amount">Or enter amount:</label>
                <Input
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
              <div className="form-field" style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="modal-donor-first-name">First name:</label>
                  <Input
                    id="modal-donor-first-name"
                    placeholder="First"
                    value={donorFirstName}
                    onChange={(e) => setDonorFirstName(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="modal-donor-last-name">Last name:</label>
                  <Input
                    id="modal-donor-last-name"
                    placeholder="Last"
                    value={donorLastName}
                    onChange={(e) => setDonorLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="modal-donor-email">
                  {showRaffle ? "Email (required for raffle):" : "Email (optional, for receipt):"}
                </label>
                <Input
                  id="modal-donor-email"
                  type="email"
                  placeholder="you@example.com"
                  value={donorEmail}
                  onChange={(e) => { setDonorEmail(e.target.value); setEmailMismatch(false); }}
                  required={showRaffle}
                />
                {showRaffle && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#1d4ed8", fontWeight: 500 }}>
                    <strong>Double-check your email.</strong> If you win the raffle, this is the only way we&apos;ll contact you to claim your prize.
                  </p>
                )}
              </div>
              {showRaffle && (
                <>
                  <div className="form-field">
                    <label htmlFor="modal-confirm-email">Confirm email:</label>
                    <Input
                      id="modal-confirm-email"
                      type="email"
                      placeholder="you@example.com"
                      value={donorConfirmEmail}
                      onChange={(e) => { setDonorConfirmEmail(e.target.value); setEmailMismatch(false); }}
                    />
                    {emailMismatch && (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                        Emails don&apos;t match — please check before continuing.
                      </p>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="modal-donor-phone">Phone number (optional):</label>
                    <Input
                      id="modal-donor-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                    />
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
                      We will never call or message you — except to confirm you received our email if you win.
                    </p>
                  </div>
                </>
              )}
              <div className="form-field">
                <label htmlFor="modal-message">Message (optional):</label>
                <Input.TextArea
                  id="modal-message"
                  placeholder="Add a message of support..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {showRaffle && (
                <div className="form-field" style={{ background: "#f0f7ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                  {isOrgMember ? (
                    <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                      As a member of this organization's team, you are not eligible for the raffle. Your donation is still greatly appreciated.
                    </p>
                  ) : (
                    <>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#1d4ed8", fontWeight: 600 }}>
                        🎟 Your donation automatically enters you into the raffle for{" "}
                        <em>{raffle!.prize_name}</em>.
                      </p>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={raffleDisplayConsent}
                          onChange={(e) => setRaffleDisplayConsent(e.target.checked)}
                          style={{ marginTop: 2 }}
                        />
                        If I win, display my first name and last initial on the campaign page.
                      </label>
                    </>
                  )}
                </div>
              )}
              <Button
                type="primary"
                className="donation-submit-btn"
                onClick={handleDonateClick}
                loading={creatingCheckout}
                disabled={!selectedAmount || selectedAmount <= 0}
              >
                {creatingCheckout
                  ? "Preparing checkout..."
                  : `Donate $${selectedAmount ? selectedAmount.toFixed(2) : "—"}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
