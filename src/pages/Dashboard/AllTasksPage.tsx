import { useCallback, useEffect, useState } from "react";
import { Button, Checkbox, Input, Select } from "antd";
import { useOutletContext } from "react-router-dom";
import api from "@/lib/api";
import { API_ENDPOINTS, TASK_TITLE_SUGGESTIONS } from "@/lib/constants";
import Modal from "@/components/Modal";
import { notifyError, notifySuccess } from "@/lib/notifications";

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
  assignees?: { user_id: string; name: string | null; email: string | null }[];
  assignee_user_id?: string | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
  status_name: string | null;
  status_id?: string | null;
};

export default function AllTasksPage() {
  const { orgId = null } = useOutletContext<OutletContext>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCampaignId, setFilterCampaignId] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<"details" | "assign">("details");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedSuggestionTitle, setSelectedSuggestionTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [details, setDetails] = useState("");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const isOwnerOrAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    assignees:
      task.assignees && task.assignees.length
        ? task.assignees
        : task.assignee_user_id
          ? [{ user_id: task.assignee_user_id, name: task.assignee_name ?? null, email: task.assignee_email ?? null }]
          : [],
  }));
  const selectedTitle = customTitle.trim() || selectedSuggestionTitle;

  const loadTasks = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get<TaskRow[]>(API_ENDPOINTS.orgs.tasks(orgId), {
        params: filterCampaignId ? { campaign_id: filterCampaignId } : undefined,
      });
      setTasks(res.data || []);
    } catch (err) {
      notifyError(err, "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [filterCampaignId, orgId]);

  useEffect(() => {
    if (!orgId) return;
    api
      .get<{ user_id: string; role?: string }>(API_ENDPOINTS.me.info)
      .then((res) => {
        setCurrentUserId(res.data.user_id ?? null);
        setCurrentUserRole(res.data.role ?? null);
      })
      .catch(() => {});
    api
      .get<Campaign[]>(API_ENDPOINTS.campaigns.list)
      .then((res) => setCampaigns(res.data || []))
      .catch(() => setCampaigns([]));
    api
      .get<{ id: string; name: string | null; email: string }[]>(API_ENDPOINTS.orgs.members(orgId))
      .then((res) => setMembers(res.data || []))
      .catch(() => setMembers([]));
  }, [orgId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTakeTask = async (task: TaskRow) => {
    if (!currentUserId) return;
    setClaimingTaskId(task.id);
    try {
      await api.patch(API_ENDPOINTS.campaigns.task(task.campaign_id, task.id), {
        assignee_user_ids: [currentUserId],
      });
      await loadTasks();
      notifySuccess("Task assigned to you.");
    } catch (err) {
      notifyError(err, "Failed to take task.");
    } finally {
      setClaimingTaskId(null);
    }
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedTitle.trim()) return;
    setCreateLoading(true);
    try {
      await api.post(API_ENDPOINTS.campaigns.tasks(selectedCampaignId), {
        title: selectedTitle.trim(),
        description: details.trim() || undefined,
        assignee_user_ids: selectedAssigneeIds,
      });
      setShowCreateModal(false);
      setCreateStep("details");
      setSelectedCampaignId("");
      setSelectedSuggestionTitle("");
      setCustomTitle("");
      setDetails("");
      setSelectedAssigneeIds([]);
      await loadTasks();
      notifySuccess("Task created.");
    } catch (err) {
      notifyError(err, "Failed to create task.");
    } finally {
      setCreateLoading(false);
    }
  };

  if (!orgId) return <p>Loading organization...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>All Tasks</h1>
      {isOwnerOrAdmin && (
        <Button type="primary" onClick={() => setShowCreateModal(true)} style={{ marginBottom: "0.75rem" }}>
          Create Task
        </Button>
      )}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label htmlFor="task-campaign-filter">Campaign:</label>
        <Select
          value={filterCampaignId}
          onChange={setFilterCampaignId}
          style={{ minWidth: 220 }}
          options={[
            { value: "", label: "All campaigns" },
            ...campaigns.map((campaign) => ({ value: campaign.id, label: campaign.title })),
          ]}
        />
      </div>

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
            {normalizedTasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem" }}>
                  <strong>{task.title}</strong>
                  {task.description && (
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>{task.description}</div>
                  )}
                </td>
                <td style={{ padding: "0.5rem" }}>{task.campaign_title}</td>
                <td style={{ padding: "0.5rem" }}>
                  {task.assignees.length
                    ? task.assignees.map((a) => a.name || a.email).join(", ")
                    : "Unassigned"}
                </td>
                <td style={{ padding: "0.5rem" }}>{task.status_name || "—"}</td>
                <td style={{ padding: "0.5rem" }}>
                  {!task.assignees.length && currentUserId ? (
                    <Button
                      type="default"
                      onClick={() => handleTakeTask(task)}
                      loading={claimingTaskId === task.id}
                    >
                      {claimingTaskId === task.id ? "Taking..." : "Take task"}
                    </Button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={showCreateModal} onClose={() => !createLoading && setShowCreateModal(false)}>
        <h3 style={{ marginTop: 0 }}>Create Task</h3>
        {createStep === "details" ? (
          <>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Campaign *
              <Select
                value={selectedCampaignId}
                onChange={setSelectedCampaignId}
                style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                options={[
                  { value: "", label: "Select campaign" },
                  ...campaigns.map((campaign) => ({
                    value: campaign.id,
                    label: campaign.title,
                  })),
                ]}
              />
            </label>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #eee", borderRadius: "6px", padding: "0.5rem" }}>
              {TASK_TITLE_SUGGESTIONS.map((group) => (
                <details key={group.category} style={{ marginBottom: "0.35rem" }}>
                  <summary>{group.category}</summary>
                  <ul style={{ margin: "0.35rem 0 0.2rem 1.2rem" }}>
                    {group.items.map((item) => (
                      <li key={item}>
                        <Button
                          onClick={() => setSelectedSuggestionTitle(item)}
                          type="link"
                          style={{ padding: 0, textAlign: "left" }}
                        >
                          {item}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
            <label style={{ display: "block", marginTop: "0.5rem" }}>
              Title
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={selectedSuggestionTitle || "Add your own task title"}
                style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
              />
            </label>
            <label style={{ display: "block", marginTop: "0.5rem" }}>
              Details
              <Input.TextArea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Further details or paste URL link"
                style={{ display: "block", width: "100%", minHeight: "80px", marginTop: "0.25rem" }}
              />
            </label>
            <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setCreateStep("assign")}
                disabled={!selectedCampaignId || !selectedTitle.trim()}
              >
                Assign Task Next
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateComplete}>
            <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #eee", borderRadius: "6px", padding: "0.5rem" }}>
              {members.map((member) => (
                <label key={member.id} style={{ display: "block", marginBottom: "0.2rem" }}>
                  <Checkbox
                    checked={selectedAssigneeIds.includes(member.id)}
                    onChange={() => toggleAssignee(member.id)}
                    style={{ marginRight: "0.35rem" }}
                  />
                  {member.name || member.email}
                </label>
              ))}
            </div>
            <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
              <Button type="default" onClick={() => setCreateStep("details")} disabled={createLoading}>
                Back
              </Button>
              <Button htmlType="submit" type="primary" loading={createLoading}>
                {createLoading ? "Saving..." : "Complete"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
