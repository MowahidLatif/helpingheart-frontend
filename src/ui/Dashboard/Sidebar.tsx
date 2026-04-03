import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  giveaway_prize_cents?: number;
};

type SidebarProps = {
  onSelectCampaign: (campaign: Campaign | null) => void;
  orgId?: string | null;
  role?: string | null;
  refreshCampaignsTrigger?: number;
};

const STATUS_CLASS: Record<string, string> = {
  active: "status-badge--active",
  completed: "status-badge--completed",
  paused: "status-badge--paused",
  draft: "status-badge--draft",
  archived: "status-badge--archived",
};

const Sidebar: React.FC<SidebarProps> = ({ onSelectCampaign, role, refreshCampaignsTrigger = 0 }) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showUsers = role === "owner" || role === "admin";

  useEffect(() => {
    loadCampaigns();
  }, [refreshCampaignsTrigger]);

  const loadCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.list);
      setCampaigns(response.data);
    } catch (err) {
      const errMsg = getErrorMessage(err);
      console.error("Failed to load campaigns:", errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-nav">
      {showUsers && (
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={() => navigate("/dashboard/users")}
        >
          <span>👥</span> Users
        </button>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block mb-lg"
        onClick={() => navigate("/campaign/new")}
      >
        + Add Campaign
      </button>

      <div className="sidebar-section-label">Campaigns</div>

      {loading && <p className="text-sm text-secondary">Loading...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

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
              onClick={() => onSelectCampaign(c)}
            >
              <div className="sidebar-campaign-card__top">
                <span className="sidebar-campaign-card__title">{c.title}</span>
                <span className={`status-badge ${STATUS_CLASS[c.status] ?? "status-badge--draft"}`}>
                  {c.status}
                </span>
              </div>
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
    </div>
  );
};

export default Sidebar;
