import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useCampaignLiveTotals } from "@/lib/useCampaignLiveTotals";

const ALLOWED_FONTS = ["Inter", "Georgia", "Roboto", "Merriweather", "Lato"];
const DEFAULT_ACCENT = "#1D9E75";
const DEFAULT_FONT = "Inter";

type Progress = {
  goal: number;
  total_raised: number;
  percent: number;
  donations_count?: number;
};

type CampaignPublic = {
  id: string;
  title?: string;
  goal?: number;
  total_raised?: number;
};

type DonationFeedItem = {
  id: string;
  amount_cents: number;
  donor_email: string | null;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function donorLabel(email: string | null): string {
  if (!email) return "Anonymous";
  const name = email.split("***")[0] || email.split("@")[0];
  return (name.charAt(0).toUpperCase() + name.slice(1)) || "Donor";
}

export default function ProgressEmbedPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();

  const colorParam = searchParams.get("color") ?? "";
  const fontParam = searchParams.get("font") ?? DEFAULT_FONT;
  const accent = colorParam ? `#${colorParam.replace(/^#/, "")}` : DEFAULT_ACCENT;
  const font = ALLOWED_FONTS.includes(fontParam) ? fontParam : DEFAULT_FONT;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [campaign, setCampaign] = useState<CampaignPublic | null>(null);
  const [feed, setFeed] = useState<DonationFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeed = () => {
    if (!campaignId) return;
    api
      .get<DonationFeedItem[]>(API_ENDPOINTS.campaigns.donationsRecent(campaignId))
      .then((res) => setFeed(Array.isArray(res.data) ? res.data : []))
      .catch(() => { });
  };

  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      setError("Missing campaign.");
      return;
    }
    Promise.all([
      api.get<Progress>(API_ENDPOINTS.campaigns.progress(campaignId)),
      api.get<CampaignPublic>(API_ENDPOINTS.campaigns.public(campaignId)).catch(() => null),
    ])
      .then(([progRes, campRes]) => {
        setProgress(progRes.data);
        setCampaign(campRes?.data ?? null);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    fetchFeed();
  }, [campaignId]);

  useCampaignLiveTotals(campaignId, Boolean(campaignId), (patch) => {
    setProgress((prev) => {
      if (!prev) return prev;
      const goal = prev.goal ?? 0;
      const raised = patch.total_raised;
      const percent =
        goal > 0 ? Math.min(100, Math.round((raised / goal) * 100 * 100) / 100) : 0;
      return {
        ...prev,
        total_raised: raised,
        percent,
        donations_count:
          patch.donations_count !== undefined ? patch.donations_count : prev.donations_count,
      };
    });
    fetchFeed();
  });

  const containerStyle: React.CSSProperties = {
    padding: "1rem",
    fontFamily: `'${font}', sans-serif`,
    fontSize: 14,
    boxSizing: "border-box",
  };

  if (loading) {
    return <div style={containerStyle}>Loading…</div>;
  }

  if (error || !progress) {
    return (
      <div style={{ ...containerStyle, color: "#666" }}>{error || "Campaign not found."}</div>
    );
  }

  const percent = progress.percent ?? 0;
  const goal = progress.goal ?? 0;
  const raised = progress.total_raised ?? 0;
  const donateUrl = `${window.location.origin}/donate/${campaignId}`;

  return (
    <div style={containerStyle}>
      <style>{`
        .hhf-embed-widget { display: flex; gap: 1.25rem; min-width: 300px; }
        .hhf-embed-progress { flex: 1 1 160px; min-width: 140px; }
        .hhf-embed-feed { flex: 1 1 160px; min-width: 140px; max-height: 200px; overflow-y: auto; }
        @media (max-width: 479px) { .hhf-embed-feed { display: none; } }
      `}</style>
      <div className="hhf-embed-widget">
        {/* Progress column */}
        <div className="hhf-embed-progress">
          {campaign?.title && (
            <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: 14 }}>
              {campaign.title}
            </p>
          )}
          <p style={{ margin: "0 0 0.5rem", fontSize: 13, color: "#555" }}>
            ${Number(raised).toLocaleString()} of ${Number(goal).toLocaleString()} goal
          </p>
          <div style={{ background: "#eee", borderRadius: 99, overflow: "hidden", height: 8 }}>
            <div
              style={{
                width: `${Math.min(100, percent)}%`,
                height: "100%",
                background: accent,
                borderRadius: 99,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <a
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "0.75rem",
              padding: "0.35rem 1rem",
              background: accent,
              color: "#fff",
              borderRadius: 6,
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Donate
          </a>
        </div>

        {/* Live donations feed */}
        {feed.length > 0 && (
          <div className="hhf-embed-feed">
            <p style={{ margin: "0 0 0.4rem", fontWeight: 600, fontSize: 12, color: "#333" }}>
              Recent donations
            </p>
            {feed.slice(0, 8).map((d) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  gap: "0.35rem",
                  fontSize: 12,
                  color: "#555",
                  padding: "0.2rem 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {donorLabel(d.donor_email)}
                </span>
                <span style={{ color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>
                  ${(d.amount_cents / 100).toFixed(2)}
                </span>
                <span style={{ color: "#aaa", whiteSpace: "nowrap" }}>{timeAgo(d.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
