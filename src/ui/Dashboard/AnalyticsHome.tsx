import { useState, useEffect } from "react";
import api from "@/lib/api";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at?: string;
};

type Props = {
  campaigns: Campaign[];
  orgId: string | null;
  role: string | null;
  onSelectCampaign?: (campaign: Campaign) => void;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

export default function AnalyticsHome({ campaigns, orgId, role, onSelectCampaign }: Props) {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const openMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await api.get<string>(`${API_BASE_URL}/admin/metrics`, {
        responseType: "text",
      });
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<pre style="font-family:monospace;white-space:pre-wrap">${res.data}</pre>`);
        win.document.title = "Server Metrics";
      }
    } catch {
      // silently ignore — user will see nothing opened
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

  return (
    <div className="dashboard-page" style={{ padding: "2rem" }}>
      <div className="dashboard-welcome">
        <h1>Welcome back, {userName}</h1>
        <p>Here's a summary of your organization's campaigns.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total Raised</div>
          <div className="stat-value">${Number(totalRaised).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Campaigns</div>
          <div className="stat-value">{campaigns.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            {role === "admin" || role === "owner" ? "Team Members" : "Completed"}
          </div>
          <div className="stat-value">
            {role === "admin" || role === "owner"
              ? memberCount !== null
                ? memberCount
                : "—"
              : completedCount}
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <p style={{ color: "#666" }}>No campaigns yet. Create one to get started.</p>
      ) : (
        <div>
          <h2 style={{ marginBottom: "1rem" }}>Campaign Progress</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {campaigns.map((c) => {
              const percent =
                c.goal > 0 ? Math.min(100, ((c.total_raised ?? 0) / c.goal) * 100) : 0;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCampaign?.(c)}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "1rem 1.25rem",
                    cursor: onSelectCampaign ? "pointer" : "default",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong style={{ fontSize: "1rem" }}>{c.title}</strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        background:
                          c.status === "active"
                            ? "#d1fae5"
                            : c.status === "completed"
                            ? "#dbeafe"
                            : c.status === "paused"
                            ? "#fef3c7"
                            : "#f3f4f6",
                        color:
                          c.status === "active"
                            ? "#065f46"
                            : c.status === "completed"
                            ? "#1e40af"
                            : c.status === "paused"
                            ? "#92400e"
                            : "#374151",
                      }}
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ${Number(c.total_raised ?? 0).toLocaleString()} of $
                    {Number(c.goal).toLocaleString()} raised &middot;{" "}
                    {Math.round(percent)}%
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
        <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
          <h2 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Admin</h2>
          <button
            type="button"
            onClick={openMetrics}
            disabled={metricsLoading}
          >
            {metricsLoading ? "Loading…" : "View Server Metrics"}
          </button>
        </div>
      )}
    </div>
  );
}
