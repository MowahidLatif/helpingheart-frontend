import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  goal: number;
  status: string;
  total_raised: number;
  created_at?: string;
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

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawError, setDrawError] = useState("");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [giveawayLogs, setGiveawayLogs] = useState<GiveawayLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

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
      </div>

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
    </div>
  );
};

export default CampaignDetails;
