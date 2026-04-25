import { useState, useEffect } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import CampaignDetails from "@/ui/Dashboard/CampaignDetails";
import AnalyticsHome from "@/ui/Dashboard/AnalyticsHome";
import { notifyError } from "@/lib/notifications";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at?: string;
  fee_option?: "donor_pays" | "platform_absorbs";
  fee_policy_version?: string;
  fee_option_locked?: boolean;
  platform_fee_cents?: number;
  platform_fee_percent?: number;
};

type OutletContext = {
  orgId?: string | null;
  role?: string | null;
  onRefreshCampaigns?: () => void;
  onCampaignDeleted?: () => void;
};

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContext>();
  const { orgId = null, role = null } = outletContext || {};

  const stateCampaign =
    (location.state as { selectedCampaign?: Campaign } | null)?.selectedCampaign ?? null;

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(stateCampaign);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    setSelectedCampaign(stateCampaign);
  }, [location.pathname, stateCampaign]);

  useEffect(() => {
    setCampaignsLoading(true);
    api
      .get<Campaign[]>(API_ENDPOINTS.campaigns.list)
      .then((res) => setCampaigns(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        notifyError(err, "Failed to load campaigns.");
        setCampaigns([]);
      })
      .finally(() => setCampaignsLoading(false));
  }, []);

  const handleSelectCampaign = (c: Campaign) => {
    setSelectedCampaign(c);
    navigate("/dashboard", { state: { selectedCampaign: c } });
  };

  if (selectedCampaign) {
    return (
      <div className="dashboard-page">
        <CampaignDetails
          campaign={selectedCampaign}
          onCampaignUpdated={setSelectedCampaign}
        />
      </div>
    );
  }

  if (campaignsLoading) {
    return (
      <div className="dashboard-page">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <AnalyticsHome
      campaigns={campaigns}
      orgId={orgId}
      role={role}
      onSelectCampaign={handleSelectCampaign}
    />
  );
}
