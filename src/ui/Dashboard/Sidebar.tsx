import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError } from "@/lib/notifications";
import { TIER_NAMES, TIER_FEE } from "@/lib/tierFeatures";
import type { OrgTierInfo } from "@/lib/tierFeatures";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  giveaway_prize_cents?: number;
  locked_tier?: number;
};

type SidebarProps = {
  onSelectCampaign: (campaign: Campaign | null) => void;
  orgId?: string | null;
  role?: string | null;
  refreshCampaignsTrigger?: number;
  onClose?: () => void;
  orgTierInfo?: OrgTierInfo | null;
};

const STATUS_CLASS: Record<string, string> = {
  active: "status-badge--active",
  completed: "status-badge--completed",
  paused: "status-badge--paused",
  draft: "status-badge--draft",
  archived: "status-badge--archived",
};

const Sidebar: React.FC<SidebarProps> = ({
  onSelectCampaign,
  role,
  refreshCampaignsTrigger = 0,
  onClose,
  orgTierInfo,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const showUsers = role === "owner" || role === "admin";

  useEffect(() => {
    loadCampaigns();
  }, [refreshCampaignsTrigger]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.list);
      setCampaigns(response.data);
    } catch (err) {
      notifyError(err, "Failed to load campaigns.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const go = (path: string) => {
    onClose?.();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar-nav">
      <nav className="sidebar-main-nav">
        <button
          type="button"
          className={`sidebar-nav-item${isActive("/dashboard") ? " active" : ""}`}
          onClick={() => go("/dashboard")}
        >
          <span className="sidebar-nav-icon">🏠</span>
          <span className="sidebar-nav-label">Dashboard</span>
        </button>

        {showUsers && (
          <button
            type="button"
            className={`sidebar-nav-item${isActive("/dashboard/users") ? " active" : ""}`}
            onClick={() => go("/dashboard/users")}
          >
            <span className="sidebar-nav-icon">👥</span>
            <span className="sidebar-nav-label">Users</span>
          </button>
        )}

        <button
          type="button"
          className={`sidebar-nav-item${isActive("/dashboard/tasks") ? " active" : ""}`}
          onClick={() => go("/dashboard/tasks")}
        >
          <span className="sidebar-nav-icon">✅</span>
          <span className="sidebar-nav-label">Tasks</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item${isActive("/settings") ? " active" : ""}`}
          onClick={() => go("/settings")}
        >
          <span className="sidebar-nav-icon">⚙️</span>
          <span className="sidebar-nav-label">Settings</span>
        </button>

        <button
          type="button"
          className="sidebar-nav-item sidebar-nav-item--logout"
          onClick={handleLogout}
        >
          <span className="sidebar-nav-icon">↩</span>
          <span className="sidebar-nav-label">Logout</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      <button
        type="button"
        className="btn btn-primary btn-block mb-lg"
        onClick={() => go("/campaign/new")}
      >
        + Add Campaign
      </button>

      <div className="sidebar-section-label">Campaigns</div>

      {loading && <p className="text-sm text-secondary">Loading...</p>}

      {!loading && campaigns.length === 0 ? (
        <p className="text-sm text-secondary">No campaigns yet.</p>
      ) : (
        campaigns.map((c) => {
          const percent =
            c.goal > 0 ? Math.min(100, ((c.total_raised ?? 0) / c.goal) * 100) : 0;

          return (
            <div
              key={c.id}
              className="sidebar-campaign-card"
              onClick={() => { onClose?.(); onSelectCampaign(c); }}
            >
              <div className="sidebar-campaign-card__top">
                <span className="sidebar-campaign-card__title">{c.title}</span>
                <span className={`status-badge ${STATUS_CLASS[c.status] ?? "status-badge--draft"}`}>
                  {c.status}
                </span>
              </div>
              {c.locked_tier != null && (
                <div className="sidebar-campaign-card__tier">
                  {["Starter", "Grow", "Scale"][(c.locked_tier ?? 1) - 1] ?? "Starter"} · {[3, 4, 5][(c.locked_tier ?? 1) - 1] ?? 3}% fee
                </div>
              )}
              <div className="sidebar-campaign-card__amount">
                ${Number(c.total_raised ?? 0).toLocaleString()} / ${Number(c.goal).toLocaleString()}
              </div>
              <div className="sidebar-campaign-card__progress">
                <div
                  className="sidebar-campaign-card__progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })
      )}
      {orgTierInfo && (
        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.25rem" }}>Current plan</div>
          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#333" }}>
            {TIER_NAMES[orgTierInfo.tier]} · {TIER_FEE[orgTierInfo.tier]}% fee
          </div>
          {orgTierInfo.tier < 3 && (
            <Link
              to="/settings"
              style={{ fontSize: "0.8rem", color: "#1D9E75", textDecoration: "none", fontWeight: 500 }}
            >
              Upgrade plan →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
