import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

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

export default function ProgressEmbedPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [campaign, setCampaign] = useState<CampaignPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [campaignId]);

  if (loading) {
    return (
      <div className="embed-progress" style={{ padding: "1rem", fontSize: "14px" }}>
        Loading…
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="embed-progress" style={{ padding: "1rem", fontSize: "14px", color: "#666" }}>
        {error || "Campaign not found."}
      </div>
    );
  }

  const percent = progress.percent ?? 0;
  const goal = progress.goal ?? 0;
  const raised = progress.total_raised ?? 0;
  const donateUrl = typeof window !== "undefined" ? `${window.location.origin}/donate/${campaignId}` : "#";

  return (
    <div className="embed-progress campaign-progress" style={{ padding: "1rem", minWidth: "200px", boxSizing: "border-box" }}>
      {campaign?.title && (
        <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "14px" }}>{campaign.title}</p>
      )}
      <p style={{ margin: "0 0 0.5rem", fontSize: "13px", color: "#555" }}>
        ${Number(raised).toLocaleString()} of ${Number(goal).toLocaleString()} goal
      </p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <a
        href={donateUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "0.75rem",
          fontSize: "13px",
          color: "#2563eb",
          textDecoration: "none",
        }}
      >
        Donate
      </a>
    </div>
  );
}
