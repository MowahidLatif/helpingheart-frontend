import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { TIER_NAMES } from "@/lib/tierFeatures";
import type { OrgTierInfo, TierKey } from "@/lib/tierFeatures";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AuthenticatedNavBar = () => {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState<string>("");
  const [orgLogoUrl, setOrgLogoUrl] = useState<string>("");
  const [planName, setPlanName] = useState<string>("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const userName = user.name || user.email || "";
  const initials = getInitials(userName) || "U";

  useEffect(() => {
    api
      .get<Array<{ id: string; name: string; role: string }>>(API_ENDPOINTS.orgs.list)
      .then((res) => {
        const first = res.data?.[0];
        if (!first) return;
        const orgId = first.id;
        return Promise.all([
          api.get<{ id: string; name: string; logo_url?: string }>(
            API_ENDPOINTS.orgs.get(orgId)
          ),
          api.get<OrgTierInfo>(API_ENDPOINTS.orgs.tierInfo(orgId)),
        ]).then(([orgRes, tierRes]) => {
          setOrgName(orgRes.data.name ?? "");
          setOrgLogoUrl(orgRes.data.logo_url ?? "");
          const tier = tierRes.data.tier as TierKey;
          setPlanName(TIER_NAMES[tier] ?? tierRes.data.tier_name ?? "");
        });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <nav className="navbar navbar--auth">
      <Link to="/dashboard" className="navbar-brand">
        {orgLogoUrl ? (
          <img
            src={orgLogoUrl}
            alt={orgName || "Logo"}
            className="navbar-logo-img"
          />
        ) : (
          <span className="navbar-logo">HH</span>
        )}
        <span className="d-tablet-none">{orgName || "Helping Hands"}</span>
        {planName && (
          <span className="plan-badge navbar-plan-badge">{planName}</span>
        )}
      </Link>
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">
          Campaigns
        </Link>
        <Link to="/settings" className="navbar-link">
          Settings
        </Link>
        <div className="navbar-user">
          <span className="navbar-avatar">{initials}</span>
          <span className="d-tablet-none">{userName}</span>
        </div>
        <button type="button" className="btn btn-sm btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AuthenticatedNavBar;
