import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import Sidebar from "./Sidebar";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  fee_option?: "donor_pays" | "platform_absorbs";
  fee_policy_version?: string;
  fee_option_locked?: boolean;
};

type MeInfo = {
  user_id: string;
  org_id: string;
  role: string;
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [meError, setMeError] = useState("");
  const [refreshCampaignsTrigger, setRefreshCampaignsTrigger] = useState(0);

  const onRefreshCampaigns = () => setRefreshCampaignsTrigger((t) => t + 1);
  const onCampaignDeleted = () => navigate("/dashboard", { replace: true });

  useEffect(() => {
    api
      .get<MeInfo>(API_ENDPOINTS.me.info)
      .then((res) => {
        setOrgId(res.data.org_id ?? null);
        setRole(res.data.role ?? null);
      })
      .catch((err) => {
        setMeError(getErrorMessage(err));
      });
  }, []);

  const handleSelectCampaign = (c: Campaign | null) => {
    navigate("/dashboard", { state: c ? { selectedCampaign: c } : {} });
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Sidebar
          onSelectCampaign={handleSelectCampaign}
          orgId={orgId}
          role={role}
          refreshCampaignsTrigger={refreshCampaignsTrigger}
        />
      </aside>
      <main className="dashboard-main">
        {meError && <div className="form-error mb-md">{meError}</div>}
        <Outlet context={{ orgId, role, onRefreshCampaigns, onCampaignDeleted }} />
      </main>
    </div>
  );
}
