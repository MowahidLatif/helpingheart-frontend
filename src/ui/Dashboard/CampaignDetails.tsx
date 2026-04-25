import { useNavigate, useOutletContext } from "react-router-dom";
import { Fragment, useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS, TASK_COMMENT_TYPES, TASK_TITLE_SUGGESTIONS } from "@/lib/constants";
import Modal from "@/components/Modal";
import EmbedGenerator from "@/ui/Dashboard/EmbedGenerator";
import { notifyError, notifySuccess, notifyWarn } from "@/lib/notifications";
import GenericTextInput from "@/components/Form/GenericTextInput";

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
  fee_option?: "donor_pays" | "platform_absorbs";
  fee_policy_version?: string;
  fee_option_locked?: boolean;
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
  onCampaignUpdated?: (campaign: Campaign) => void;
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
  fee_option?: "donor_pays" | "platform_absorbs";
  stripe_processing_fee_cents?: number;
  platform_fee_cents?: number;
  donor_fee_cents?: number;
  platform_absorbed_fee_cents?: number;
  net_to_org_cents?: number;
  created_at: string;
  updated_at?: string;
};

type CommentRow = { id: string; body: string; user_id: string; created_at: string };
type UpdateRow = { id: string; title: string; body: string; created_at: string };
type ReceiptRow = { id: string; donation_id: string; to_email: string; subject: string; sent_at: string | null; created_at: string };

type CampaignProgress = {
  percent: number;
  donations_count: number;
  total_raised: number;
  goal: number;
  fee_option?: "donor_pays" | "platform_absorbs";
  fee_option_locked?: boolean;
  platform_fee_cents?: number;
  stripe_fee_cents?: number;
  net_to_org_cents?: number;
};

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign, onCampaignUpdated }) => {
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContext>();
  const { onRefreshCampaigns, onCampaignDeleted, role } = outletContext || {};
  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawError, setDrawError] = useState("");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [giveawayLogs, setGiveawayLogs] = useState<GiveawayLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editFeeOption, setEditFeeOption] = useState<"donor_pays" | "platform_absorbs">(
    "donor_pays"
  );
  const [editSlug, setEditSlug] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false);
  const [updates, setUpdates] = useState<UpdateRow[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateBody, setNewUpdateBody] = useState("");
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState<string | null>(null);

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

  const orgId = campaign?.org_id;
  const showDonations = role === "admin" || role === "owner";

  const loadDonations = useCallback(async () => {
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
  }, [campaign?.id, showDonations, donationsPage, donationsPerPage, donationsSort, donationsOrder, searchQuery]);

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
  }, [campaign?.id, showDonations, loadDonations]);

  useEffect(() => {
    if (!campaign?.id) return;
    setCommentsLoading(true);
    api.get<CommentRow[]>(API_ENDPOINTS.campaigns.comments(campaign.id), { params: { limit: 50 } })
      .then((r) => setComments(Array.isArray(r.data) ? r.data : []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [campaign?.id]);

  useEffect(() => {
    if (!campaign?.id) return;
    setUpdatesLoading(true);
    api.get<UpdateRow[]>(API_ENDPOINTS.campaigns.updates(campaign.id), { params: { limit: 50 } })
      .then((r) => setUpdates(Array.isArray(r.data) ? r.data : []))
      .catch(() => setUpdates([]))
      .finally(() => setUpdatesLoading(false));
  }, [campaign?.id]);

  useEffect(() => {
    if (!campaign?.id || !showDonations) return;
    setReceiptsLoading(true);
    api.get<ReceiptRow[]>(API_ENDPOINTS.campaigns.receipts(campaign.id), { params: { limit: 50 } })
      .then((r) => setReceipts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setReceipts([]))
      .finally(() => setReceiptsLoading(false));
  }, [campaign?.id, showDonations]);

  const handleOpenEdit = () => {
    setEditTitle(campaign?.title ?? "");
    setEditGoal(String(campaign?.goal ?? ""));
    setEditStatus(campaign?.status ?? "draft");
    setEditFeeOption(campaign?.fee_option ?? "donor_pays");
    setEditSlug(campaign?.slug ?? "");
    setEditError("");
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign?.id) return;
    setEditError("");
    setEditLoading(true);
    try {
      const body: {
        title?: string;
        goal?: number;
        status?: string;
        slug?: string;
        fee_option?: "donor_pays" | "platform_absorbs";
      } = {};
      if (editTitle.trim()) body.title = editTitle.trim();
      if (editGoal.trim()) body.goal = parseFloat(editGoal);
      if (editStatus.trim()) body.status = editStatus.trim();
      if (editSlug.trim()) body.slug = editSlug.trim();
      if (!campaign.fee_option_locked) {
        body.fee_option = editFeeOption;
      }
      const res = await api.patch<Campaign>(API_ENDPOINTS.campaigns.patch(campaign.id), body);
      onCampaignUpdated?.(res.data);
      onRefreshCampaigns?.();
      setShowEditModal(false);
      notifySuccess("Campaign updated.");
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign?.id || !newCommentBody.trim()) return;
    setCommentSubmitLoading(true);
    try {
      await api.post(API_ENDPOINTS.campaigns.comments(campaign.id), { body: newCommentBody.trim() });
      setNewCommentBody("");
      const r = await api.get<CommentRow[]>(API_ENDPOINTS.campaigns.comments(campaign.id), { params: { limit: 50 } });
      setComments(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to add comment");
    } finally {
      setCommentSubmitLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!campaign?.id) return;
    try {
      await api.delete(API_ENDPOINTS.campaigns.comment(campaign.id, commentId));
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to delete comment");
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign?.id || !newUpdateTitle.trim() || !newUpdateBody.trim()) return;
    setUpdateSubmitLoading(true);
    try {
      await api.post(API_ENDPOINTS.campaigns.updates(campaign.id), { title: newUpdateTitle.trim(), body: newUpdateBody.trim() });
      setNewUpdateTitle("");
      setNewUpdateBody("");
      const r = await api.get<UpdateRow[]>(API_ENDPOINTS.campaigns.updates(campaign.id), { params: { limit: 50 } });
      setUpdates(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to add update");
    } finally {
      setUpdateSubmitLoading(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!campaign?.id) return;
    try {
      await api.delete(API_ENDPOINTS.campaigns.update(campaign.id, updateId));
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to delete update");
    }
  };

  const handleResendReceipt = async (receiptId: string) => {
    if (!campaign?.id) return;
    setResendLoading(receiptId);
    try {
      await api.post(API_ENDPOINTS.campaigns.receiptResend(campaign.id, receiptId));
      notifySuccess("Receipt resent.");
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to resend receipt");
    } finally {
      setResendLoading(null);
    }
  };

  const handlePreviewReceipt = async (receiptId: string) => {
    if (!campaign?.id) return;
    try {
      const res = await api.get<string>(API_ENDPOINTS.campaigns.receiptPreview(campaign.id, receiptId), { responseType: "text" });
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(res.data);
        w.document.close();
      }
    } catch (err) {
      notifyError(getErrorMessage(err) || "Could not open receipt preview");
    }
  };

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

  const loadProgress = useCallback(async () => {
    if (!campaign?.id) return;
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.progress(campaign.id));
      setProgress(response.data);
    } catch (err) {
      notifyWarn(getErrorMessage(err) || "Could not load progress");
    }
  }, [campaign?.id]);

  const loadGiveawayLogs = useCallback(async () => {
    if (!campaign?.id) return;
    setLogsLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.campaigns.giveawayLogs(campaign.id));
      setGiveawayLogs(response.data || []);
    } catch (err) {
      notifyWarn(getErrorMessage(err) || "Could not load giveaway logs");
      setGiveawayLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [campaign?.id]);

  useEffect(() => {
    if (campaign?.id) {
      loadProgress();
      if (campaign.giveaway_prize_cents) {
        loadGiveawayLogs();
      } else {
        setGiveawayLogs([]);
      }
    }
  }, [campaign?.id, campaign?.giveaway_prize_cents, loadGiveawayLogs, loadProgress]);

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
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      const errData = (err as { response?: { data?: { error?: string } } })?.response?.data;
      const serverMsg = errData?.error;
      setDrawError(serverMsg || msg);
    } finally {
      setDrawLoading(false);
    }
  };

  const handleCloseDrawResult = () => setDrawResult(null);

  const handleConfirmDelete = async () => {
    if (!campaign?.id) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await api.delete(API_ENDPOINTS.campaigns.delete(campaign.id));
      setShowDeleteConfirmModal(false);
      notifySuccess("Campaign deleted.");
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

  const handleAiSite = () => {
    navigate(`/campaign/ai-site/${campaign.id}`);
  };

  const handleEditLayout = () => {
    navigate(`/campaign/page-layout/${campaign.id}`);
  };

  const progressPercent = progress?.percent || 0;
  const donationsCount = progress?.donations_count || 0;
  const isGiveaway = !!campaign.giveaway_prize_cents;
  const feeOption = progress?.fee_option || campaign.fee_option || "donor_pays";
  const feeOptionLocked =
    typeof progress?.fee_option_locked === "boolean"
      ? progress.fee_option_locked
      : !!campaign.fee_option_locked;
  const grossRaised = progress?.total_raised ?? campaign.total_raised ?? 0;
  const netToOrgCents = progress?.net_to_org_cents;
  const stripeFeeCents = progress?.stripe_fee_cents;
  const progressPlatformFeeCents = progress?.platform_fee_cents;

  const feeOptionLabel =
    feeOption === "platform_absorbs" ? "Platform absorbs fees" : "Donor pays fees";

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{campaign.title}</h2>
      <p>Slug: {campaign.slug}</p>

      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <strong>🎯 Goal:</strong> ${campaign.goal}
        <br />
        <strong>💰 Gross Raised:</strong> ${grossRaised}
        <br />
        <strong>🏷️ Payment Model:</strong> {feeOptionLabel}
        <br />
        <strong>🔒 Model Lock:</strong> {feeOptionLocked ? "Locked (published/completed)" : "Editable (draft)"}
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
        {progressPlatformFeeCents ? (
          <>
            <strong>💳 Platform Fee:</strong> ${(progressPlatformFeeCents / 100).toFixed(2)}
            <br />
          </>
        ) : campaign.platform_fee_cents ? (
          <>
            <strong>💳 Platform Fee:</strong> ${(campaign.platform_fee_cents / 100).toFixed(2)} ({campaign.platform_fee_percent}%)
            <br />
          </>
        ) : null}
        {typeof stripeFeeCents === "number" ? (
          <>
            <strong>🏦 Stripe Fees:</strong> ${(stripeFeeCents / 100).toFixed(2)}
            <br />
          </>
        ) : null}
        {typeof netToOrgCents === "number" ? (
          <>
            <strong>✅ Estimated Net To Org:</strong> ${(netToOrgCents / 100).toFixed(2)}
            <br />
          </>
        ) : null}
      </div>

      <div className="campaign-progress" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <p>
          ${grossRaised.toLocaleString()} of $
          {(progress?.goal ?? campaign.goal ?? 0).toLocaleString()} raised
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handlePublish} style={{ marginRight: "0.5rem" }}>Preview & Publish</button>
        <a
          href={`${typeof window !== "undefined" ? window.location.origin : ""}/donate/${campaign.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: "0.5rem", display: "inline-block", padding: "0.4rem 0.75rem", border: "1px solid #333", borderRadius: "4px", color: "inherit", textDecoration: "none", fontSize: "inherit" }}
        >
          View Live Page
        </a>
        <button onClick={handleOpenEdit} style={{ marginRight: "0.5rem" }}>Edit campaign</button>
        <button onClick={handleEditMedia} style={{ marginRight: "0.5rem" }}>Edit Media</button>
        <button onClick={handleAiSite} style={{ marginRight: "0.5rem" }}>AI site builder</button>
        {import.meta.env.VITE_ENABLE_CLASSIC_PAGE_BUILDER === "true" ? (
          <button onClick={handleEditLayout} style={{ marginRight: "0.5rem" }}>
            Classic page layout
          </button>
        ) : null}
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

      <Modal isOpen={showEditModal} onClose={() => !editLoading && setShowEditModal(false)}>
        <h3 style={{ marginTop: 0 }}>Edit campaign</h3>
        {editError && <p style={{ color: "red", marginBottom: "0.5rem" }}>{editError}</p>}
        <form onSubmit={handleSaveEdit}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Title:
            <GenericTextInput
              value={editTitle}
              setValue={(value) => setEditTitle(String(value ?? ""))}
              required
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Goal ($):
            <GenericTextInput
              valueType="number"
              value={editGoal}
              setValue={(value) => setEditGoal(String(value ?? ""))}
              min="0"
              step="1"
              required
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Status:
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Slug:
            <GenericTextInput
              value={editSlug}
              setValue={(value) => setEditSlug(String(value ?? ""))}
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Payment model:
            <select
              value={editFeeOption}
              onChange={(e) =>
                setEditFeeOption(e.target.value as "donor_pays" | "platform_absorbs")
              }
              disabled={feeOptionLocked}
              style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            >
              <option value="donor_pays">Donor pays fees (default)</option>
              <option value="platform_absorbs">Platform absorbs fees</option>
            </select>
            <small style={{ color: "#666" }}>
              {feeOptionLocked
                ? "Payment model is locked after publish/completion."
                : "Payment model can be changed while campaign is in draft."}
            </small>
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={editLoading}>{editLoading ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</button>
          </div>
        </form>
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
              <GenericTextInput
                value={searchInput}
                setValue={(value) => setSearchInput(String(value ?? ""))}
                placeholder="Filter..."
                hideLabel
                wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                inputStyle={{ padding: "0.25rem 0.5rem", width: "200px" }}
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
                    <th style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "right" }}>
                      Net To Org
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
                      <td style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "right" }}>
                        {typeof d.net_to_org_cents === "number"
                          ? `$${(d.net_to_org_cents / 100).toFixed(2)}`
                          : "—"}
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

      {campaign?.id && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <h3>Comments</h3>
          {commentsLoading ? (
            <p>Loading…</p>
          ) : (
            <>
              <form onSubmit={handleAddComment} style={{ marginBottom: "1rem" }}>
                <textarea value={newCommentBody} onChange={(e) => setNewCommentBody(e.target.value)} placeholder="Add a comment…" rows={2} style={{ width: "100%", maxWidth: "400px", display: "block", marginBottom: "0.5rem", padding: "0.5rem" }} />
                <button type="submit" disabled={commentSubmitLoading || !newCommentBody.trim()}>{commentSubmitLoading ? "Sending…" : "Post comment"}</button>
              </form>
              {comments.length === 0 ? <p style={{ color: "#666" }}>No comments yet.</p> : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {comments.map((c) => (
                    <li key={c.id} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0" }}>
                      <span style={{ fontSize: "0.9rem", color: "#666" }}>{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
                      <p style={{ margin: "0.25rem 0" }}>{c.body}</p>
                      <button type="button" onClick={() => handleDeleteComment(c.id)} style={{ fontSize: "0.85rem", color: "#666" }}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {campaign?.id && (role === "admin" || role === "owner") && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <h3>Updates</h3>
          {updatesLoading ? (
            <p>Loading…</p>
          ) : (
            <>
              <form onSubmit={handleAddUpdate} style={{ marginBottom: "1rem", padding: "0.5rem", border: "1px solid #ddd" }}>
                <GenericTextInput
                  value={newUpdateTitle}
                  setValue={(value) => setNewUpdateTitle(String(value ?? ""))}
                  placeholder="Update title"
                  required
                  hideLabel
                  wrapperStyle={{ marginBottom: "0.5rem" }}
                  inputStyle={{ display: "block", width: "100%", maxWidth: "400px", padding: "0.5rem" }}
                />
                <textarea value={newUpdateBody} onChange={(e) => setNewUpdateBody(e.target.value)} placeholder="Update body" required rows={3} style={{ display: "block", width: "100%", maxWidth: "400px", marginBottom: "0.5rem", padding: "0.5rem" }} />
                <button type="submit" disabled={updateSubmitLoading}>Post update</button>
              </form>
              {updates.length === 0 ? <p style={{ color: "#666" }}>No updates yet.</p> : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {updates.map((u) => (
                    <li key={u.id} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0" }}>
                      <strong>{u.title}</strong>
                      <span style={{ fontSize: "0.9rem", color: "#666", marginLeft: "0.5rem" }}>{u.created_at ? new Date(u.created_at).toLocaleString() : ""}</span>
                      <p style={{ margin: "0.25rem 0", whiteSpace: "pre-wrap" }}>{u.body}</p>
                      <button type="button" onClick={() => handleDeleteUpdate(u.id)} style={{ fontSize: "0.85rem", color: "#666" }}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {showDonations && campaign?.id && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <h3>Receipts</h3>
          {receiptsLoading ? (
            <p>Loading…</p>
          ) : receipts.length === 0 ? (
            <p style={{ color: "#666" }}>No receipts yet.</p>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>To</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Sent</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}></th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>{r.to_email}</td>
                    <td style={{ padding: "0.5rem" }}>{r.subject}</td>
                    <td style={{ padding: "0.5rem" }}>{r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <button type="button" onClick={() => handlePreviewReceipt(r.id)} style={{ marginRight: "0.5rem" }}>Preview</button>
                      <button type="button" onClick={() => handleResendReceipt(r.id)} disabled={resendLoading === r.id}>{resendLoading === r.id ? "Sending…" : "Resend"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showDonations && campaign.id && (
        <EmbedGenerator
          campaign={{ id: campaign.id, slug: campaign.slug, title: campaign.title }}
        />
      )}

      {campaign.id && orgId && (
        <CampaignTasksSection campaignId={campaign.id} orgId={orgId} />
      )}
    </div>
  );
};

type TaskAssignee = {
  user_id: string;
  name: string | null;
  email: string | null;
};
type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status_id: string | null;
  status_name: string | null;
  assignees?: TaskAssignee[];
  assignee_user_id?: string | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
};

type TaskStatusRow = { id: string; name: string };
type MemberRow = { id: string; email: string; name: string | null };
type TaskCommentRow = {
  id: string;
  comment_type: string;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  author_name: string | null;
  author_email: string | null;
  mentions: { user_id: string; name: string | null; email: string | null }[];
  reactions: { user_id: string; reaction: string }[];
};
type TaskChecklistItem = {
  id: string;
  title: string;
  is_checked: boolean;
  checked_by_user_id: string | null;
};

function normalizeTaskAssignees(task: TaskRow): TaskAssignee[] {
  if (Array.isArray(task.assignees) && task.assignees.length) return task.assignees;
  if (task.assignee_user_id) {
    return [{ user_id: task.assignee_user_id, name: task.assignee_name ?? null, email: task.assignee_email ?? null }];
  }
  return [];
}

function CampaignTasksSection({
  campaignId,
  orgId,
}: {
  campaignId: string;
  orgId: string;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<(TaskRow & { assignees: TaskAssignee[] })[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<"details" | "assign">("details");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedSuggestionTitle, setSelectedSuggestionTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatusId, setNewStatusId] = useState("");
  const [newAssigneeIds, setNewAssigneeIds] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<(TaskRow & { assignees: TaskAssignee[] }) | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatusId, setEditStatusId] = useState("");
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [takingTaskId, setTakingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentsByTask, setCommentsByTask] = useState<Record<string, TaskCommentRow[]>>({});
  const [checklistByTask, setChecklistByTask] = useState<Record<string, TaskChecklistItem[]>>({});
  const [commentType, setCommentType] = useState<string>("text");
  const [commentText, setCommentText] = useState("");
  const [commentHours, setCommentHours] = useState("");
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [commentAssignees, setCommentAssignees] = useState<string[]>([]);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");

  const canCreateTask = currentUserRole === "owner" || currentUserRole === "admin";

  useEffect(() => {
    api
      .get<{ user_id: string; role?: string }>(API_ENDPOINTS.me.info)
      .then((res) => {
        setCurrentUserId(res.data.user_id ?? null);
        setCurrentUserRole(res.data.role ?? null);
      })
      .catch(() => { });
  }, []);

  const load = useCallback(async () => {
    setError("");
    try {
      const [tasksRes, statusesRes, membersRes] = await Promise.all([
        api.get<TaskRow[]>(API_ENDPOINTS.campaigns.tasks(campaignId)),
        api.get<TaskStatusRow[]>(API_ENDPOINTS.orgs.taskStatuses(orgId)),
        api.get<MemberRow[]>(API_ENDPOINTS.orgs.members(orgId)),
      ]);
      const taskRows = (tasksRes.data || []).map((task) => ({
        ...task,
        assignees: normalizeTaskAssignees(task),
      }));
      setTasks(taskRows);
      setStatuses(statusesRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [campaignId, orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedTitle = customTitle.trim() || selectedSuggestionTitle;

  const toggleId = (
    value: string,
    setter: (updater: (prev: string[]) => string[]) => void
  ) => {
    setter((prev) => (prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]));
  };

  const handleCreateComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTitle.trim()) return;
    setCreateLoading(true);
    try {
      await api.post(API_ENDPOINTS.campaigns.tasks(campaignId), {
        title: selectedTitle.trim(),
        description: newDesc.trim() || undefined,
        status_id: newStatusId || undefined,
        assignee_user_ids: newAssigneeIds,
      });
      setShowCreateModal(false);
      setCreateStep("details");
      setCustomTitle("");
      setSelectedSuggestionTitle("");
      setNewDesc("");
      setNewStatusId("");
      setNewAssigneeIds([]);
      load();
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, statusId: string) => {
    setStatusUpdating(taskId);
    try {
      await api.patch(API_ENDPOINTS.campaigns.task(campaignId, taskId), {
        status_id: statusId || null,
      });
      load();
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to update task status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const canChangeStatus = (task: { assignees: TaskAssignee[] }) => {
    if (!currentUserId) return false;
    if (task.assignees.some((a) => a.user_id === currentUserId)) return true;
    return currentUserRole === "owner" || currentUserRole === "admin";
  };

  const canEditTask = () => currentUserRole === "owner" || currentUserRole === "admin";
  const canTakeTask = (task: { assignees: TaskAssignee[] }) =>
    Boolean(currentUserId && task.assignees.length === 0);

  const handleTakeTask = async (task: TaskRow & { assignees: TaskAssignee[] }) => {
    if (!currentUserId) return;
    setTakingTaskId(task.id);
    try {
      await api.patch(API_ENDPOINTS.campaigns.task(campaignId, task.id), {
        assignee_user_ids: [currentUserId],
      });
      load();
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to take task");
    } finally {
      setTakingTaskId(null);
    }
  };

  const openEditTask = (task: TaskRow & { assignees: TaskAssignee[] }) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditStatusId(task.status_id || "");
    setEditAssigneeIds(task.assignees.map((a) => a.user_id));
    setEditError("");
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    setEditLoading(true);
    setEditError("");
    try {
      await api.patch(API_ENDPOINTS.campaigns.task(campaignId, editingTask.id), {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        status_id: editStatusId || null,
        assignee_user_ids: editAssigneeIds,
      });
      setEditingTask(null);
      load();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const loadTaskActivity = async (taskId: string) => {
    try {
      const [commentsRes, checklistRes] = await Promise.all([
        api.get<TaskCommentRow[]>(API_ENDPOINTS.campaigns.taskComments(campaignId, taskId)),
        api.get<TaskChecklistItem[]>(API_ENDPOINTS.campaigns.taskChecklist(campaignId, taskId)),
      ]);
      setCommentsByTask((prev) => ({ ...prev, [taskId]: commentsRes.data || [] }));
      setChecklistByTask((prev) => ({ ...prev, [taskId]: checklistRes.data || [] }));
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to load task activity");
    }
  };

  const toggleTaskExpanded = async (taskId: string) => {
    const next = expandedTaskId === taskId ? null : taskId;
    setExpandedTaskId(next);
    if (next) {
      setCommentType("text");
      setCommentText("");
      setCommentHours("");
      setCommentMentions([]);
      setCommentAssignees([]);
      await loadTaskActivity(next);
    }
  };

  const submitTaskComment = async (taskId: string) => {
    setCommentSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        comment_type: commentType,
        body: commentText.trim() || undefined,
      };
      if (commentMentions.length) payload.mention_user_ids = commentMentions;
      if (commentType === "time_log") {
        payload.metadata = { hours: Number(commentHours || "0") };
      }
      if (commentType === "reassignment") {
        payload.assignee_user_ids = commentAssignees;
      }
      await api.post(API_ENDPOINTS.campaigns.taskComments(campaignId, taskId), payload);
      setCommentText("");
      setCommentHours("");
      setCommentMentions([]);
      setCommentAssignees([]);
      await load();
      await loadTaskActivity(taskId);
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to submit comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const addReaction = async (taskId: string, commentId: string, reaction: string) => {
    try {
      await api.post(API_ENDPOINTS.campaigns.taskCommentReactions(campaignId, taskId, commentId), {
        reaction,
      });
      await loadTaskActivity(taskId);
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to add reaction");
    }
  };

  const addChecklistItem = async (taskId: string) => {
    const title = newChecklistTitle.trim();
    if (!title) return;
    try {
      await api.post(API_ENDPOINTS.campaigns.taskChecklist(campaignId, taskId), { title });
      setNewChecklistTitle("");
      await loadTaskActivity(taskId);
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to add checklist item");
    }
  };

  const toggleChecklistItem = async (taskId: string, item: TaskChecklistItem) => {
    try {
      await api.patch(API_ENDPOINTS.campaigns.taskChecklistItem(campaignId, taskId, item.id), {
        is_checked: !item.is_checked,
      });
      await loadTaskActivity(taskId);
    } catch (err) {
      notifyError(getErrorMessage(err) || "Failed to update checklist item");
    }
  };

  return (
    <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
      <h3>Tasks</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          {canCreateTask && (
            <button type="button" onClick={() => setShowCreateModal(true)} style={{ marginBottom: "0.75rem" }}>
              Create Task
            </button>
          )}
          <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "850px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Task</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Assignees</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <Fragment key={task.id}>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>
                      <strong>{task.title}</strong>
                      {task.description && <div style={{ fontSize: "0.9rem", color: "#666" }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {task.assignees.length ? task.assignees.map((a) => a.name || a.email).join(", ") : "Unassigned"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {canChangeStatus(task) ? (
                        <select
                          value={task.status_id || ""}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          disabled={statusUpdating === task.id}
                        >
                          <option value="">—</option>
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                          ))}
                        </select>
                      ) : (
                        task.status_name || "—"
                      )}
                    </td>
                    <td style={{ padding: "0.5rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => toggleTaskExpanded(task.id)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        {expandedTaskId === task.id ? "Hide activity" : "Comments"}
                      </button>
                      {canEditTask() ? (
                        <button type="button" onClick={() => openEditTask(task)} style={{ fontSize: "0.85rem" }}>
                          Edit
                        </button>
                      ) : canTakeTask(task) ? (
                        <button
                          type="button"
                          onClick={() => handleTakeTask(task)}
                          disabled={takingTaskId === task.id}
                          style={{ fontSize: "0.85rem" }}
                        >
                          {takingTaskId === task.id ? "Taking..." : "Take task"}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                  {expandedTaskId === task.id && (
                    <tr style={{ borderBottom: "1px solid #eee", background: "#fafafa" }}>
                      <td colSpan={4} style={{ padding: "0.75rem" }}>
                        <div style={{ marginBottom: "0.75rem" }}>
                          <strong>Task activity</strong>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <div>
                            <div style={{ marginBottom: "0.4rem" }}>
                              <strong>Comments</strong>
                            </div>
                            <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #eee", background: "white", padding: "0.5rem", borderRadius: "6px" }}>
                              {(commentsByTask[task.id] || []).length === 0 ? (
                                <div style={{ color: "#666", fontSize: "0.9rem" }}>No comments yet.</div>
                              ) : (
                                (commentsByTask[task.id] || []).map((comment) => (
                                  <div key={comment.id} style={{ borderBottom: "1px solid #f1f1f1", marginBottom: "0.45rem", paddingBottom: "0.45rem" }}>
                                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                                      {comment.comment_type} · {new Date(comment.created_at).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: "0.9rem" }}>{comment.body || "—"}</div>
                                    <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.25rem" }}>
                                      <button type="button" style={{ fontSize: "0.75rem" }} onClick={() => addReaction(task.id, comment.id, "thumbs_up")}>👍</button>
                                      <button type="button" style={{ fontSize: "0.75rem" }} onClick={() => addReaction(task.id, comment.id, "seen")}>Seen</button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ marginBottom: "0.4rem" }}>
                              <strong>Checklist</strong>
                            </div>
                            <div style={{ border: "1px solid #eee", background: "white", padding: "0.5rem", borderRadius: "6px" }}>
                              {(checklistByTask[task.id] || []).map((item) => (
                                <label key={item.id} style={{ display: "block", marginBottom: "0.25rem" }}>
                                  <GenericTextInput
                                    valueType="checkbox"
                                    value={item.is_checked}
                                    setValue={() => toggleChecklistItem(task.id, item)}
                                    hideLabel
                                    wrapperStyle={{ marginBottom: 0, marginRight: "0.35rem", display: "inline-block" }}
                                  />
                                  {item.title}
                                </label>
                              ))}
                              <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.45rem" }}>
                                <GenericTextInput
                                  value={newChecklistTitle}
                                  setValue={(value) => setNewChecklistTitle(String(value ?? ""))}
                                  placeholder="Add checklist item"
                                  hideLabel
                                  wrapperStyle={{ marginBottom: 0, flex: 1 }}
                                  inputStyle={{ width: "100%", padding: "0.25rem" }}
                                />
                                <button type="button" onClick={() => addChecklistItem(task.id)}>Add</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: "0.75rem", borderTop: "1px solid #eee", paddingTop: "0.65rem" }}>
                          <div style={{ marginBottom: "0.4rem" }}>
                            <strong>Add activity</strong>
                          </div>
                          <div style={{ display: "grid", gap: "0.35rem" }}>
                            <select value={commentType} onChange={(e) => setCommentType(e.target.value)}>
                              {TASK_COMMENT_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment or note..."
                              style={{ minHeight: "65px", padding: "0.35rem" }}
                            />
                            {commentType === "time_log" && (
                              <GenericTextInput
                                valueType="number"
                                min="0.25"
                                step="0.25"
                                value={commentHours}
                                setValue={(value) => setCommentHours(String(value ?? ""))}
                                placeholder="Hours spent"
                                hideLabel
                                wrapperStyle={{ marginBottom: 0 }}
                              />
                            )}
                            {commentType === "reassignment" && (
                              <div style={{ border: "1px solid #eee", borderRadius: "6px", padding: "0.4rem", maxHeight: "120px", overflowY: "auto" }}>
                                {members.map((member) => (
                                  <label key={member.id} style={{ display: "block", marginBottom: "0.2rem" }}>
                                    <GenericTextInput
                                      valueType="checkbox"
                                      value={commentAssignees.includes(member.id)}
                                      setValue={() => toggleId(member.id, setCommentAssignees)}
                                      hideLabel
                                      wrapperStyle={{ marginBottom: 0, marginRight: "0.35rem", display: "inline-block" }}
                                    />
                                    {member.name || member.email}
                                  </label>
                                ))}
                              </div>
                            )}
                            <div style={{ border: "1px dashed #ccc", borderRadius: "6px", padding: "0.5rem", color: "#777" }}>
                              File & media attachments: Coming soon! (disabled)
                            </div>
                            <label style={{ fontSize: "0.85rem" }}>
                              Mentions:
                              <select
                                multiple
                                value={commentMentions}
                                onChange={(e) =>
                                  setCommentMentions(
                                    Array.from(e.target.selectedOptions).map((o) => o.value)
                                  )
                                }
                                style={{ width: "100%", marginTop: "0.25rem", minHeight: "70px" }}
                              >
                                {members.map((member) => (
                                  <option key={member.id} value={member.id}>
                                    {member.name || member.email}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button type="button" disabled={commentSubmitting} onClick={() => submitTaskComment(task.id)}>
                                {commentSubmitting ? "Submitting..." : "Submit"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <p>No tasks yet.</p>}

          <Modal isOpen={showCreateModal} onClose={() => !createLoading && setShowCreateModal(false)}>
            <h3 style={{ marginTop: 0 }}>Create Task</h3>
            {createStep === "details" ? (
              <div>
                <p style={{ marginTop: 0, color: "#666" }}>
                  Choose a suggestion below or enter your own task title.
                </p>
                <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #eee", padding: "0.5rem", borderRadius: "6px" }}>
                  {TASK_TITLE_SUGGESTIONS.map((group) => (
                    <details key={group.category} style={{ marginBottom: "0.35rem" }}>
                      <summary>{group.category}</summary>
                      <ul style={{ margin: "0.35rem 0 0.2rem 1.2rem" }}>
                        {group.items.map((item) => (
                          <li key={item} style={{ marginBottom: "0.2rem" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedSuggestionTitle(item)}
                              style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: selectedSuggestionTitle === item ? "#111" : "#444" }}
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
                <label style={{ display: "block", marginTop: "0.75rem" }}>
                  Title
                  <GenericTextInput
                    value={customTitle}
                    setValue={(value) => setCustomTitle(String(value ?? ""))}
                    placeholder={selectedSuggestionTitle || "Add your own task title"}
                    hideLabel
                    wrapperStyle={{ marginBottom: 0 }}
                    inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.35rem" }}
                  />
                </label>
                <label style={{ display: "block", marginTop: "0.5rem" }}>
                  Details
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Further details or paste URL link"
                    style={{ display: "block", width: "100%", minHeight: "80px", marginTop: "0.25rem", padding: "0.35rem" }}
                  />
                </label>
                <label style={{ display: "block", marginTop: "0.5rem" }}>
                  Status
                  <select
                    value={newStatusId}
                    onChange={(e) => setNewStatusId(e.target.value)}
                    style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.35rem" }}
                  >
                    <option value="">No status</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </label>
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setCreateStep("assign")}
                    disabled={!selectedTitle.trim()}
                  >
                    Assign Task Next
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateComplete}>
                <p style={{ color: "#666", marginTop: 0 }}>
                  Assign one or more people now, or leave it unassigned.
                </p>
                <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #eee", padding: "0.5rem", borderRadius: "6px" }}>
                  {members.map((member) => (
                    <label key={member.id} style={{ display: "block", marginBottom: "0.25rem" }}>
                      <GenericTextInput
                        valueType="checkbox"
                        value={newAssigneeIds.includes(member.id)}
                        setValue={() => toggleId(member.id, setNewAssigneeIds)}
                        hideLabel
                        wrapperStyle={{ marginBottom: 0, marginRight: "0.35rem", display: "inline-block" }}
                      />
                      {member.name || member.email}
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                  <button type="button" onClick={() => setCreateStep("details")} disabled={createLoading}>
                    Back
                  </button>
                  <button type="submit" disabled={createLoading}>
                    {createLoading ? "Saving..." : "Complete"}
                  </button>
                </div>
              </form>
            )}
          </Modal>

          <Modal isOpen={Boolean(editingTask)} onClose={() => !editLoading && setEditingTask(null)}>
            <h3 style={{ marginTop: 0 }}>Edit task</h3>
            {editError && <div style={{ color: "red", marginBottom: "0.5rem" }}>{editError}</div>}
            <form onSubmit={handleEditTaskSubmit}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Title *
                <GenericTextInput
                  value={editTitle}
                  setValue={(value) => setEditTitle(String(value ?? ""))}
                  required
                  hideLabel
                  wrapperStyle={{ marginBottom: 0 }}
                  inputStyle={{ display: "block", width: "100%", padding: "0.35rem", marginTop: "0.2rem" }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Description
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "0.35rem", minHeight: "70px", marginTop: "0.2rem" }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Status
                <select
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "0.35rem", marginTop: "0.2rem" }}
                >
                  <option value="">No status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </label>
              <div style={{ marginBottom: "0.75rem", border: "1px solid #eee", borderRadius: "6px", padding: "0.5rem" }}>
                {members.map((member) => (
                  <label key={member.id} style={{ display: "block", marginBottom: "0.2rem" }}>
                    <GenericTextInput
                      valueType="checkbox"
                      value={editAssigneeIds.includes(member.id)}
                      setValue={() => toggleId(member.id, setEditAssigneeIds)}
                      hideLabel
                      wrapperStyle={{ marginBottom: 0, marginRight: "0.35rem", display: "inline-block" }}
                    />
                    {member.name || member.email}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setEditingTask(null)} disabled={editLoading}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading || !editTitle.trim()}>
                  {editLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}

export default CampaignDetails;
