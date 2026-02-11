import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at: string;
  giveaway_prize_cents?: number;
  platform_fee_cents?: number;
  platform_fee_percent?: number;
};

type CampaignDetailsProps = {
  campaign: Campaign | null;
};

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaign?.id) {
      loadProgress();
    }
  }, [campaign?.id]);

  const loadProgress = async () => {
    if (!campaign?.id) return;
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.progress(campaign.id));
      setProgress(response.data);
    } catch (err) {
      console.error("Failed to load progress:", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return <p>Select a campaign to view details.</p>;

  const handlePublish = () => {
    navigate("/preview", { state: { campaignId: campaign.id } });
  };

  const handleEditMedia = () => {
    navigate(`/campaign/layout-builder/${campaign.id}`);
  };

  const handleEditLayout = () => {
    navigate(`/campaign/page-layout/${campaign.id}`);
  };

  const progressPercent = progress?.percent || 0;
  const donationsCount = progress?.donations_count || 0;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{campaign.title}</h2>
      <p>Slug: {campaign.slug}</p>

      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <strong>🎯 Goal:</strong> ${campaign.goal}
        <br />
        <strong>💰 Raised:</strong> ${campaign.total_raised || 0}
        <br />
        <strong>📈 Progress:</strong> {progressPercent.toFixed(1)}%
        <br />
        <strong>🧍 Donations:</strong> {donationsCount}
        <br />
        <strong>📆 Created:</strong> {new Date(campaign.created_at).toLocaleDateString()}
        <br />
        <strong>✅ Status:</strong> {campaign.status}
        <br />
        {campaign.giveaway_prize_cents && (
          <>
            <strong>🎁 Giveaway Prize:</strong> ${(campaign.giveaway_prize_cents / 100).toFixed(2)}
            <br />
          </>
        )}
        {campaign.platform_fee_cents && (
          <>
            <strong>💳 Platform Fee:</strong> ${(campaign.platform_fee_cents / 100).toFixed(2)} ({campaign.platform_fee_percent}%)
            <br />
          </>
        )}
      </div>

      <button onClick={handlePublish} style={{ marginRight: "0.5rem" }}>Preview & Publish</button>
      <button onClick={handleEditMedia} style={{ marginRight: "0.5rem" }}>Edit Media</button>
      <button onClick={handleEditLayout}>Edit Page Layout</button>
    </div>
  );
};

export default CampaignDetails;
