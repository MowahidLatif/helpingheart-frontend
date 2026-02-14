import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  total_raised: number;
};

type Progress = {
  goal: number;
  total_raised: number;
  percent: number;
  donations_count: number;
};

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const campaignId = location.state?.campaignId;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      setError("No campaign selected. Go to Dashboard and click a campaign to preview.");
      return;
    }

    Promise.all([
      api.get(API_ENDPOINTS.campaigns.public(campaignId)),
      api.get(API_ENDPOINTS.campaigns.progress(campaignId)),
    ])
      .then(([campRes, progRes]) => {
        setCampaign(campRes.data);
        setProgress(progRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const handleDonate = () => {
    if (campaignId) {
      navigate(`/donate/${campaignId}`);
    }
  };

  if (loading) {
    return (
      <div className="preview-page">
        <p>Loading preview…</p>
      </div>
    );
  }

  if (error || !campaignId) {
    return (
      <div className="preview-page">
        <h1>Preview Campaign</h1>
        <p className="preview-error">{error || "Campaign not found."}</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  const percent = progress?.percent ?? 0;

  return (
    <div className="preview-page">
      <h1>Preview: {campaign?.title ?? "Campaign"}</h1>
      <p className="preview-hint">This is how donors will see your campaign.</p>

      <div className="preview-content">
        <div className="campaign-progress">
          <p>
            ${(progress?.total_raised ?? 0).toLocaleString()} of $
            {(progress?.goal ?? 0).toLocaleString()} raised
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <button className="donate-cta-btn" onClick={handleDonate}>
          Donate Now
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;
