import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Donation = {
  id: string;
  campaign_id: string;
  amount_cents: number;
  currency: string;
  donor?: string;
  message?: string | null;
  status: string;
};

export default function ThankYouPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donation_id");

  const [donation, setDonation] = useState<Donation | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>("");
  const [campaignLatestWinner, setCampaignLatestWinner] = useState<{ donor: string; created_at?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [pollVersion, setPollVersion] = useState(0);

  useEffect(() => {
    if (!donationId) {
      setError("Missing donation reference.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    const pollStatus = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.donations.get(donationId));
        const d = res.data;
        setDonation(d);

        if (d.status === "succeeded") {
          if (campaignId) {
            try {
              const campRes = await api.get(API_ENDPOINTS.campaigns.public(campaignId));
              setCampaignTitle(campRes.data.title ?? "");
              if (campRes.data.latest_winner) {
                setCampaignLatestWinner(campRes.data.latest_winner);
              }
            } catch {
              // ignore
            }
          }
          return true;
        }
        if (d.status === "failed" || d.status === "canceled") {
          setError("Your payment could not be completed.");
          return true;
        }
        if (d.status === "refunded") {
          setError("This donation was refunded.");
          return true;
        }
        return false;
      } catch (err) {
        setError(getErrorMessage(err));
        return true;
      }
    };

    let attempts = 0;
    const maxAttempts = 20;

    const runPoll = async () => {
      const done = await pollStatus();
      if (done || attempts >= maxAttempts) {
        if (!done && attempts >= maxAttempts) {
          setError("Payment confirmation is taking longer than expected. Please retry in a moment.");
        }
        setLoading(false);
        return;
      }
      attempts += 1;
      const nextDelayMs = Math.min(2000 + attempts * 300, 5000);
      setTimeout(runPoll, nextDelayMs);
    };

    runPoll();
  }, [donationId, campaignId, pollVersion]);

  const shareUrl = campaignId
    ? `${window.location.origin}/donate/${campaignId}`
    : window.location.origin;
  const shareText = campaignTitle
    ? `I just donated to ${campaignTitle}!`
    : "I just made a donation!";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Campaign link copied.");
    } catch {
      setCopyStatus("Unable to copy link. Please copy it manually.");
    }
  };

  if (loading) {
    return (
      <div className="thank-you-page">
        <h1>Thank you!</h1>
        <p>Confirming your donation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="thank-you-page">
        <h1>Something went wrong</h1>
        <p className="donation-error">{error}</p>
        {donationId && (
          <button
            type="button"
            className="thank-you-link"
            onClick={() => setPollVersion((v) => v + 1)}
          >
            Retry status check
          </button>
        )}
        {campaignId && (
          <Link to={`/donate/${campaignId}`} className="thank-you-link">
            Try again
          </Link>
        )}
      </div>
    );
  }

  const amount = donation ? (donation.amount_cents / 100).toFixed(2) : "—";
  const currency = donation?.currency?.toUpperCase() ?? "USD";

  return (
    <div className="thank-you-page">
      <h1>Thank you for your donation!</h1>
      <p className="thank-you-amount">
        You donated {currency} ${amount}
        {campaignTitle && ` to ${campaignTitle}`}.
      </p>
      {donation?.message && (
        <p className="thank-you-message">"{donation.message}"</p>
      )}
      {campaignLatestWinner && (
        <p className="thank-you-winner" style={{ marginTop: "0.5rem" }}>
          Giveaway winner: Congratulations to <strong>{campaignLatestWinner.donor}</strong>!
        </p>
      )}

      <div className="share-section">
        <h2>Share your support</h2>
        {copyStatus && (
          <p className="thank-you-share-status" role="status" aria-live="polite">
            {copyStatus}
          </p>
        )}
        <div className="share-buttons">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
          >
            Share on X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
          >
            Share on Facebook
          </a>
          <button type="button" onClick={handleCopyLink} className="share-btn">
            Copy link
          </button>
        </div>
      </div>

      {campaignId && (
        <Link to={`/donate/${campaignId}`} className="thank-you-link">
          Back to campaign
        </Link>
      )}
    </div>
  );
}
