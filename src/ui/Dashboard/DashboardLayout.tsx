import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import Sidebar from "./Sidebar";
import type { OrgTierInfo } from "@/lib/tierFeatures";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgTierInfo, setOrgTierInfo] = useState<OrgTierInfo | null>(null);

  const onRefreshCampaigns = () => setRefreshCampaignsTrigger((t) => t + 1);
  const onCampaignDeleted = () => navigate("/dashboard", { replace: true });

  useEffect(() => {
    api
      .get<MeInfo>(API_ENDPOINTS.me.info)
      .then((res) => {
        const oid = res.data.org_id ?? null;
        setOrgId(oid);
        setRole(res.data.role ?? null);
        if (oid) {
          api
            .get<OrgTierInfo>(API_ENDPOINTS.orgs.tierInfo(oid))
            .then((r) => setOrgTierInfo(r.data))
            .catch(() => null);
        }
      })
      .catch((err) => {
        setMeError(getErrorMessage(err));
      });
  }, []);

  const handleSelectCampaign = (c: Campaign | null) => {
    setSidebarOpen(false);
    navigate("/dashboard", { state: c ? { selectedCampaign: c } : {} });
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar${sidebarOpen ? " dashboard-sidebar--open" : ""}`}>
        <button
          type="button"
          className="dashboard-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        <Sidebar
          onSelectCampaign={handleSelectCampaign}
          orgId={orgId}
          role={role}
          refreshCampaignsTrigger={refreshCampaignsTrigger}
          onClose={() => setSidebarOpen(false)}
          orgTierInfo={orgTierInfo}
        />
      </aside>

      <main className="dashboard-main">
        <button
          type="button"
          className="dashboard-sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <span>☰</span> Campaigns
        </button>

        {meError && <div className="form-error mb-md">{meError}</div>}
        <Outlet context={{ orgId, role, onRefreshCampaigns, onCampaignDeleted, orgTierInfo }} />
      </main>
    </div>
  );
}
