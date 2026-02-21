import { useState, useEffect } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import CampaignDetails from "@/ui/Dashboard/CampaignDetails";
import AnalyticsHome from "@/ui/Dashboard/AnalyticsHome";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at?: string;
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
  const [campaignsError, setCampaignsError] = useState("");

  useEffect(() => {
    setSelectedCampaign(stateCampaign);
  }, [location.pathname, stateCampaign]);

  useEffect(() => {
    setCampaignsLoading(true);
    setCampaignsError("");
    api
      .get<Campaign[]>(API_ENDPOINTS.campaigns.list)
      .then((res) => setCampaigns(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setCampaignsError(getErrorMessage(err)))
      .finally(() => setCampaignsLoading(false));
  }, []);

  const handleSelectCampaign = (c: Campaign) => {
    setSelectedCampaign(c);
    navigate("/dashboard", { state: { selectedCampaign: c } });
  };

  if (selectedCampaign) {
    return (
      <div style={{ padding: "2rem" }}>
        <CampaignDetails
          campaign={selectedCampaign}
          onCampaignUpdated={setSelectedCampaign}
        />
      </div>
    );
  }

  if (campaignsLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Loading…</p>
      </div>
    );
  }

  if (campaignsError) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>{campaignsError}</p>
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
