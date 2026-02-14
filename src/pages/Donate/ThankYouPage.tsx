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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!donationId) {
      setError("Missing donation reference.");
      setLoading(false);
      return;
    }

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
        return false;
      } catch (err) {
        setError(getErrorMessage(err));
        return true;
      }
    };

    let attempts = 0;
    const maxAttempts = 15;

    const runPoll = async () => {
      const done = await pollStatus();
      if (done || attempts >= maxAttempts) {
        setLoading(false);
        return;
      }
      attempts += 1;
      setTimeout(runPoll, 2000);
    };

    runPoll();
  }, [donationId, campaignId]);

  const shareUrl = campaignId
    ? `${window.location.origin}/donate/${campaignId}`
    : window.location.origin;
  const shareText = campaignTitle
    ? `I just donated to ${campaignTitle}!`
    : "I just made a donation!";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
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

      <div className="share-section">
        <h2>Share your support</h2>
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
