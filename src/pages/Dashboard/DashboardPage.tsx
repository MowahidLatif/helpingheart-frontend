import CampaignDetails from "@/ui/Dashboard/CampaignDetails";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at?: string;
};

export default function DashboardPage() {
  const location = useLocation();
  const stateCampaign = (location.state as { selectedCampaign?: Campaign } | null)
    ?.selectedCampaign ?? null;
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(stateCampaign);

  useEffect(() => {
    setSelectedCampaign(stateCampaign);
  }, [location.pathname, stateCampaign]);

  return (
    <div style={{ padding: "2rem" }}>
      <CampaignDetails campaign={selectedCampaign} onCampaignUpdated={setSelectedCampaign} />
    </div>
  );
}
