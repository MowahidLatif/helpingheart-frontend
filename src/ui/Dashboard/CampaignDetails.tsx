import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import Modal from "@/components/Modal";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at?: string;
  org_id?: string;
  giveaway_prize_cents?: number;
  platform_fee_cents?: number;
  platform_fee_percent?: number;
};

type GiveawayLog = {
  campaign_id: string;
  winner_donation_id: string;
  mode: string;
  population_count: number;
  created_at: string;
  winner_donor?: string;
};

type DrawResult = {
  winner: { donor: string; amount_cents: number; created_at?: string };
  draw: { mode: string; population_count: number; created_at: string };
};

type CampaignDetailsProps = {
  campaign: Campaign | null;
};

type OutletContext = {
  orgId?: string | null;
  role?: string | null;
  onRefreshCampaigns?: () => void;
  onCampaignDeleted?: () => void;
};

type DonationRow = {
  id: string;
  campaign_id: string;
  amount_cents: number;
  currency: string;
  donor_email: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
};

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContext>();
  const { onRefreshCampaigns, onCampaignDeleted, role } = outletContext || {};
  const [progress, setProgress] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawError, setDrawError] = useState("");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [giveawayLogs, setGiveawayLogs] = useState<GiveawayLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [donationsTotal, setDonationsTotal] = useState(0);
  const [donationsPage, setDonationsPage] = useState(1);
  const [donationsPerPage] = useState(20);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationsError, setDonationsError] = useState("");
  const [donationsSort, setDonationsSort] = useState<"created_at" | "amount_cents" | "donor_email" | "status">("created_at");
  const [donationsOrder, setDonationsOrder] = useState<"asc" | "desc">("desc");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportCsvLoading, setExportCsvLoading] = useState(false);

  useEffect(() => {
    if (campaign?.id) {
      loadProgress();
      if (campaign.giveaway_prize_cents) {
        loadGiveawayLogs();
      } else {
        setGiveawayLogs([]);
      }
    }
  }, [campaign?.id, campaign?.giveaway_prize_cents]);

  const orgId = campaign?.org_id;
  const showDonations = role === "admin" || role === "owner";

  const loadDonations = async () => {
    if (!campaign?.id || !showDonations) return;
    setDonationsLoading(true);
    setDonationsError("");
    try {
      const params: Record<string, string | number> = {
        page: donationsPage,
        per_page: donationsPerPage,
        sort: donationsSort,
        order: donationsOrder,
      };
      if (searchQuery) params.search = searchQuery;
      const res = await api.get<{ items: DonationRow[]; total: number; page: number; per_page: number }>(
        API_ENDPOINTS.campaigns.donations(campaign.id),
        { params }
      );
      setDonations(res.data.items || []);
      setDonationsTotal(res.data.total ?? 0);
    } catch (err) {
      setDonationsError(getErrorMessage(err));
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setDonationsPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (campaign?.id && showDonations) {
      loadDonations();
    }
  }, [campaign?.id, showDonations, donationsPage, donationsPerPage, donationsSort, donationsOrder, searchQuery]);

  const handleDonationsSort = (col: "created_at" | "amount_cents" | "donor_email" | "status") => {
    if (donationsSort === col) {
      setDonationsOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setDonationsSort(col);
      setDonationsOrder("desc");
    }
    setDonationsPage(1);
  };

  const handleExportCsv = async () => {
    if (!campaign?.id) return;
    setExportCsvLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.campaigns.donationsExportCsv(campaign.id), {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `campaign_${campaign.id}_donations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDonationsError(getErrorMessage(err));
    } finally {
      setExportCsvLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!campaign?.id) return;
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.progress(campaign.id));
      setProgress(response.data);
    } catch (err) {
      console.error("Failed to load progress:", getErrorMessage(err));
    }
  };

  const loadGiveawayLogs = async () => {
    if (!campaign?.id) return;
    setLogsLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.giveawayLogs(campaign.id));
      setGiveawayLogs(response.data || []);
    } catch (err) {
      console.error("Failed to load giveaway logs:", getErrorMessage(err));
      setGiveawayLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleDrawWinner = async () => {
    if (!campaign?.id) return;
    setDrawError("");
    setDrawLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.campaigns.drawWinner(campaign.id), {
        mode: "per_donation",
        min_amount_cents: 0,
      });
      setDrawResult(response.data);
      setShowConfirmModal(false);
      loadGiveawayLogs();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      const errData = err?.response?.data;
      const serverMsg = errData?.error;
      setDrawError(serverMsg || msg);
    } finally {
      setDrawLoading(false);
    }
  };

  const handleCloseDrawResult = () => setDrawResult(null);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleConfirmDelete = async () => {
    if (!campaign?.id) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await api.delete(API_ENDPOINTS.campaigns.delete(campaign.id));
      setShowDeleteConfirmModal(false);
      setSuccessMessage("Campaign deleted.");
      onRefreshCampaigns?.();
      onCampaignDeleted?.();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!campaign) return <p>Select a campaign to view details.</p>;

  const handlePublish = () => {
    navigate("/preview", { state: { campaignId: campaign.id } });
  };

  const handleEditMedia = () => {
    navigate(`/campaign/layout-builder/${campaign.id}`);
  };

  const handleEditLayout = () => {
    navigate(`/campaign/page-layout/${campaign.id}`);
  };

  const progressPercent = progress?.percent || 0;
  const donationsCount = progress?.donations_count || 0;
  const isGiveaway = !!campaign.giveaway_prize_cents;

  return (
    <div style={{ padding: "2rem" }}>
      {successMessage && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: "6px",
          }}
        >
          {successMessage}
        </div>
      )}
      <h2>{campaign.title}</h2>
      <p>Slug: {campaign.slug}</p>

      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <strong>🎯 Goal:</strong> ${campaign.goal}
        <br />
        <strong>💰 Raised:</strong> ${campaign.total_raised || 0}
        <br />
        <strong>📈 Progress:</strong> {progressPercent.toFixed(1)}%
        <br />
        <strong>🧍 Donations:</strong> {donationsCount}
        <br />
        <strong>📆 Created:</strong> {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : "—"}
        <br />
        <strong>✅ Status:</strong> {campaign.status}
        <br />
        {campaign.giveaway_prize_cents && (
          <>
            <strong>🎁 Giveaway Prize:</strong> ${(campaign.giveaway_prize_cents / 100).toFixed(2)}
            <br />
          </>
        )}
        {campaign.platform_fee_cents && (
          <>
            <strong>💳 Platform Fee:</strong> ${(campaign.platform_fee_cents / 100).toFixed(2)} ({campaign.platform_fee_percent}%)
            <br />
          </>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handlePublish} style={{ marginRight: "0.5rem" }}>Preview & Publish</button>
        <button onClick={handleEditMedia} style={{ marginRight: "0.5rem" }}>Edit Media</button>
        <button onClick={handleEditLayout} style={{ marginRight: "0.5rem" }}>Edit Page Layout</button>
        {isGiveaway && (
          <button
            onClick={() => setShowConfirmModal(true)}
            style={{ marginRight: "0.5rem" }}
          >
            🎲 Draw Winner
          </button>
        )}
        <button
          onClick={() => {
            setShowDeleteConfirmModal(true);
            setDeleteError("");
          }}
          style={{ marginRight: "0.5rem", color: "#b91c1c", borderColor: "#b91c1c" }}
        >
          Delete campaign
        </button>
      </div>

      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => !deleteLoading && setShowDeleteConfirmModal(false)}
      >
        <h3 style={{ marginTop: 0 }}>Delete campaign?</h3>
        <p style={{ color: "#666" }}>
          This action is permanent and cannot be undone. The campaign and its data will be removed.
        </p>
        {deleteError && (
          <p style={{ color: "#b91c1c", marginBottom: "0.5rem" }}>{deleteError}</p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            style={{ backgroundColor: "#b91c1c", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: deleteLoading ? "not-allowed" : "pointer" }}
          >
            {deleteLoading ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={() => setShowDeleteConfirmModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {drawResult && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #4ade80",
            borderRadius: "8px",
            backgroundColor: "#f0fdf4",
          }}
        >
          <strong>Winner drawn!</strong>
          <p>
            Congratulations to <strong>{drawResult.winner.donor}</strong> — ${(drawResult.winner.amount_cents / 100).toFixed(2)} donation
          </p>
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            Pool: {drawResult.draw.population_count} eligible donations · {drawResult.draw.created_at ? new Date(drawResult.draw.created_at).toLocaleString() : ""}
          </p>
          <button onClick={handleCloseDrawResult} style={{ marginTop: "0.5rem" }}>
            Dismiss
          </button>
        </div>
      )}

      {isGiveaway && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Giveaway History</h3>
          {logsLoading ? (
            <p>Loading history…</p>
          ) : giveawayLogs.length === 0 ? (
            <p>No draws yet.</p>
          ) : (
            <table style={{ borderCollapse: "collapse", marginTop: "0.5rem" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>Date</th>
                  <th style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>Winner</th>
                  <th style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>Mode</th>
                  <th style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "right" }}>Pool</th>
                </tr>
              </thead>
              <tbody>
                {giveawayLogs.map((log, i) => (
                  <tr key={log.winner_donation_id + String(i)}>
                    <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                      {log.winner_donor ?? "—"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>{log.mode}</td>
                    <td style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "right" }}>{log.population_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !drawLoading && setShowConfirmModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Draw Winner</h3>
            <p>
              Draw a random winner from eligible donations? This will select one donor and send them a notification email.
            </p>
            {drawError && (
              <p style={{ color: "red", marginBottom: "0.5rem" }}>
                {drawError === "no eligible donations"
                  ? "No eligible donations to draw from. Make sure you have at least one successful donation."
                  : drawError}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button onClick={() => handleDrawWinner()} disabled={drawLoading}>
                {drawLoading ? "Drawing…" : "Draw"}
              </button>
              <button onClick={() => setShowConfirmModal(false)} disabled={drawLoading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDonations && campaign.id && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <h3>Donations</h3>
          <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <label>
              Search by donor or message:{" "}
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Filter..."
                style={{ padding: "0.25rem 0.5rem", width: "200px" }}
              />
            </label>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportCsvLoading || donationsLoading}
            >
              {exportCsvLoading ? "Exporting…" : "Export CSV"}
            </button>
          </div>
          {donationsError && <p style={{ color: "red", marginBottom: "0.5rem" }}>{donationsError}</p>}
          {donationsLoading ? (
            <p>Loading donations…</p>
          ) : (
            <>
              <table style={{ borderCollapse: "collapse", marginTop: "0.5rem", width: "100%", maxWidth: "900px" }}>
                <thead>
                  <tr>
                    <th
                      style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left", cursor: "pointer" }}
                      onClick={() => handleDonationsSort("created_at")}
                    >
                      Date {donationsSort === "created_at" ? (donationsOrder === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left", cursor: "pointer" }}
                      onClick={() => handleDonationsSort("donor_email")}
                    >
                      Donor {donationsSort === "donor_email" ? (donationsOrder === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "right", cursor: "pointer" }}
                      onClick={() => handleDonationsSort("amount_cents")}
                    >
                      Amount {donationsSort === "amount_cents" ? (donationsOrder === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left", cursor: "pointer" }}
                      onClick={() => handleDonationsSort("status")}
                    >
                      Status {donationsSort === "status" ? (donationsOrder === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "left" }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                        {d.created_at ? new Date(d.created_at).toLocaleString() : "—"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>{d.donor_email ?? "—"}</td>
                      <td style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "right" }}>
                        ${((d.amount_cents || 0) / 100).toFixed(2)} {d.currency?.toUpperCase() || "USD"}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>{d.status}</td>
                      <td style={{ border: "1px solid #ddd", padding: "0.5rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.message ? (d.message.length > 60 ? d.message.slice(0, 60) + "…" : d.message) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {donations.length === 0 && !donationsLoading && (
                <p style={{ marginTop: "0.5rem" }}>No donations match your filters.</p>
              )}
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>
                  Page {donationsPage} of {Math.max(1, Math.ceil(donationsTotal / donationsPerPage))} ({donationsTotal} total)
                </span>
                <button
                  type="button"
                  onClick={() => setDonationsPage((p) => Math.max(1, p - 1))}
                  disabled={donationsPage <= 1}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setDonationsPage((p) => p + 1)}
                  disabled={donationsPage * donationsPerPage >= donationsTotal}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {campaign.id && orgId && (
        <CampaignTasksSection campaignId={campaign.id} orgId={orgId} />
      )}
    </div>
  );
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  assignee_user_id: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  status_id: string | null;
  status_name: string | null;
};

type TaskStatusRow = { id: string; name: string };
type MemberRow = { id: string; email: string; name: string | null };

function CampaignTasksSection({
  campaignId,
  orgId,
}: {
  campaignId: string;
  orgId: string;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newStatusId, setNewStatusId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ user_id: string; role?: string }>(API_ENDPOINTS.me.info).then((res) => {
      setCurrentUserId(res.data.user_id ?? null);
      setCurrentUserRole(res.data.role ?? null);
    }).catch(() => {});
  }, []);

  const load = async () => {
    setError("");
    try {
      const [tasksRes, statusesRes, membersRes] = await Promise.all([
        api.get<TaskRow[]>(API_ENDPOINTS.campaigns.tasks(campaignId)),
        api.get<TaskStatusRow[]>(API_ENDPOINTS.orgs.taskStatuses(orgId)),
        api.get<MemberRow[]>(API_ENDPOINTS.orgs.members(orgId)),
      ]);
      setTasks(tasksRes.data || []);
      setStatuses(statusesRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [campaignId, orgId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateLoading(true);
    try {
      await api.post(API_ENDPOINTS.campaigns.tasks(campaignId), {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        assignee_user_id: newAssignee || undefined,
        status_id: newStatusId || undefined,
      });
      setNewTitle("");
      setNewDesc("");
      setNewAssignee("");
      setNewStatusId("");
      setShowCreate(false);
      load();
    } catch {
      // ignore
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, statusId: string) => {
    setStatusUpdating(taskId);
    try {
      await api.patch(`${API_ENDPOINTS.campaigns.tasks(campaignId)}/${taskId}`, {
        status_id: statusId || null,
      });
      load();
    } catch {
      // ignore
    } finally {
      setStatusUpdating(null);
    }
  };

  const canChangeStatus = (task: TaskRow) => {
    if (!currentUserId) return false;
    if (task.assignee_user_id === currentUserId) return true;
    return currentUserRole === "owner" || currentUserRole === "admin";
  };

  return (
    <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
      <h3>Tasks</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          <button type="button" onClick={() => setShowCreate(!showCreate)} style={{ marginBottom: "0.5rem" }}>
            {showCreate ? "Cancel" : "Add task"}
          </button>
          {showCreate && (
            <form onSubmit={handleCreate} style={{ marginBottom: "1rem", padding: "0.5rem", border: "1px solid #ddd" }}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                required
                style={{ display: "block", marginBottom: "0.25rem", width: "100%", maxWidth: "300px" }}
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                style={{ display: "block", marginBottom: "0.25rem", width: "100%", maxWidth: "300px", minHeight: "60px" }}
              />
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                <option value="">No assignee</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name || m.email}</option>
                ))}
              </select>
              <select
                value={newStatusId}
                onChange={(e) => setNewStatusId(e.target.value)}
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                <option value="">No status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button type="submit" disabled={createLoading}>Create task</button>
            </form>
          )}
          <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Task</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Assignee</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <strong>{t.title}</strong>
                    {t.description && <div style={{ fontSize: "0.9rem", color: "#666" }}>{t.description}</div>}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{t.assignee_name || t.assignee_email || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {canChangeStatus(t) ? (
                      <select
                        value={t.status_id || ""}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        disabled={statusUpdating === t.id}
                      >
                        <option value="">—</option>
                        {statuses.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      t.status_name || "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && !showCreate && <p>No tasks yet.</p>}
        </>
      )}
    </div>
  );
}

export default CampaignDetails;
