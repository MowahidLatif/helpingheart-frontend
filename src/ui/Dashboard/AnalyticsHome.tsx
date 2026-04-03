import { useState, useEffect } from "react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  donations_count?: number;
  created_at?: string;
};

type Props = {
  campaigns: Campaign[];
  orgId: string | null;
  role: string | null;
  onSelectCampaign?: (campaign: Campaign) => void;
};

const STATUS_CLASS: Record<string, string> = {
  active: "status-badge--active",
  completed: "status-badge--completed",
  paused: "status-badge--paused",
  draft: "status-badge--draft",
  archived: "status-badge--archived",
};

export default function AnalyticsHome({ campaigns, orgId, role, onSelectCampaign }: Props) {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const openMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await api.get<string>(API_ENDPOINTS.admin.metrics, {
        responseType: "text",
      });
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<pre style="font-family:monospace;white-space:pre-wrap">${res.data}</pre>`);
        win.document.title = "Server Metrics";
      }
    } catch {
      // silently ignore
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (orgId && (role === "admin" || role === "owner")) {
      api
        .get(API_ENDPOINTS.orgs.members(orgId))
        .then((res) => {
          const data = res.data;
          setMemberCount(Array.isArray(data) ? data.length : null);
        })
        .catch(() => setMemberCount(null));
    }
  }, [orgId, role]);

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.total_raised ?? 0), 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const completedCount = campaigns.filter((c) => c.status === "completed").length;

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userName = user.name || user.email || "there";
  const firstName = userName.split(" ")[0];

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>Welcome back, {firstName}!</h1>
        <p>Here's an overview of your fundraising campaigns</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Raised</span>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">${Number(totalRaised).toLocaleString()}</div>
          <div className="stat-description">All time across all campaigns</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Campaigns</span>
            <span className="stat-icon">🌐</span>
          </div>
          <div className="stat-value">{campaigns.length}</div>
          <div className="stat-description">
            {activeCount} active, {completedCount} completed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Campaigns</span>
            <span className="stat-icon">📈</span>
          </div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-description">Currently accepting donations</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">
              {role === "admin" || role === "owner" ? "Team Members" : "Completed"}
            </span>
            <span className="stat-icon">👥</span>
          </div>
          <div className="stat-value">
            {role === "admin" || role === "owner"
              ? memberCount !== null
                ? memberCount
                : "—"
              : completedCount}
          </div>
          <div className="stat-description">
            {role === "admin" || role === "owner"
              ? "Collaborating on campaigns"
              : "Finished campaigns"}
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-secondary">No campaigns yet. Create one to get started.</p>
      ) : (
        <div className="campaign-progress">
          <div className="campaign-progress__header">
            <h2>Campaign Progress</h2>
            <p>Click on any campaign to view details and manage donations</p>
          </div>
          <div className="campaign-progress__list">
            {campaigns.map((c) => {
              const percent =
                c.goal > 0 ? Math.min(100, ((c.total_raised ?? 0) / c.goal) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="campaign-progress-card"
                  onClick={() => onSelectCampaign?.(c)}
                >
                  <div className="campaign-progress-card__top">
                    <div>
                      <div className="campaign-progress-card__title">{c.title}</div>
                      <div className="campaign-progress-card__meta">
                        {c.donations_count != null
                          ? `${c.donations_count} donations`
                          : ""}{" "}
                        &middot; ${Number(c.total_raised ?? 0).toLocaleString()} raised
                      </div>
                    </div>
                    <span className={`status-badge ${STATUS_CLASS[c.status] ?? "status-badge--draft"}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="campaign-progress-card__amounts">
                    <span>
                      ${Number(c.total_raised ?? 0).toLocaleString()} / $
                      {Number(c.goal).toLocaleString()}
                    </span>
                    <span className="campaign-progress-card__percent">
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(role === "admin" || role === "owner") && (
        <div className="dashboard-admin">
          <h2>Admin</h2>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={openMetrics}
            disabled={metricsLoading}
          >
            {metricsLoading ? "Loading..." : "View Server Metrics"}
          </button>
        </div>
      )}
    </div>
  );
}
