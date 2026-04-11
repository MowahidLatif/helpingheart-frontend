import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type OutletContext = { orgId?: string | null };

type Campaign = {
  id: string;
  title: string;
};

type TaskRow = {
  id: string;
  campaign_id: string;
  campaign_title: string;
  title: string;
  description: string | null;
  assignee_user_id: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  status_name: string | null;
};

export default function AllTasksPage() {
  const { orgId = null } = useOutletContext<OutletContext>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCampaignId, setFilterCampaignId] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!orgId) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.get<TaskRow[]>(API_ENDPOINTS.orgs.tasks(orgId), {
        params: filterCampaignId ? { campaign_id: filterCampaignId } : undefined,
      });
      setTasks(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filterCampaignId, orgId]);

  useEffect(() => {
    if (!orgId) return;
    api
      .get<{ user_id: string }>(API_ENDPOINTS.me.info)
      .then((res) => setCurrentUserId(res.data.user_id ?? null))
      .catch(() => {});
    api
      .get<Campaign[]>(API_ENDPOINTS.campaigns.list)
      .then((res) => setCampaigns(res.data || []))
      .catch(() => setCampaigns([]));
  }, [orgId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTakeTask = async (task: TaskRow) => {
    if (!currentUserId) return;
    setClaimingTaskId(task.id);
    setError("");
    try {
      await api.patch(API_ENDPOINTS.campaigns.task(task.campaign_id, task.id), {
        assignee_user_id: currentUserId,
      });
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setClaimingTaskId(null);
    }
  };

  if (!orgId) return <p>Loading organization...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>All Tasks</h1>
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label htmlFor="task-campaign-filter">Campaign:</label>
        <select
          id="task-campaign-filter"
          value={filterCampaignId}
          onChange={(e) => setFilterCampaignId(e.target.value)}
        >
          <option value="">All campaigns</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: "#666" }}>No tasks found.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Task</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Campaign</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Assignee</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem" }}>
                  <strong>{task.title}</strong>
                  {task.description && (
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>{task.description}</div>
                  )}
                </td>
                <td style={{ padding: "0.5rem" }}>{task.campaign_title}</td>
                <td style={{ padding: "0.5rem" }}>
                  {task.assignee_name || task.assignee_email || "Unassigned"}
                </td>
                <td style={{ padding: "0.5rem" }}>{task.status_name || "—"}</td>
                <td style={{ padding: "0.5rem" }}>
                  {!task.assignee_user_id && currentUserId ? (
                    <button
                      type="button"
                      onClick={() => handleTakeTask(task)}
                      disabled={claimingTaskId === task.id}
                    >
                      {claimingTaskId === task.id ? "Taking..." : "Take task"}
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
