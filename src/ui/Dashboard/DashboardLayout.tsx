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
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "25%", borderRight: "1px solid #eee" }}>
        <Sidebar
          onSelectCampaign={handleSelectCampaign}
          orgId={orgId}
          role={role}
        />
      </div>
      <div style={{ flexGrow: 1, overflow: "auto" }}>
        {meError && (
          <div style={{ padding: "1rem", color: "red" }}>{meError}</div>
        )}
        <Outlet context={{ orgId, role }} />
      </div>
    </div>
  );
}
