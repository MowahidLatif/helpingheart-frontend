import { useEffect, useState } from "react";
import { Alert, Badge, Spin, Table, Typography } from "antd";
import api, { getErrorMessage } from "@/lib/api";

const { Text } = Typography;

type DrawLogRow = {
  id: string;
  drawn_at: string | null;
  outcome: string;
  notified_at: string | null;
  claimed_at: string | null;
  winner_email: string | null;
};

type RaffleData = {
  raffle: {
    id: string;
    prize_name: string;
    prize_description?: string | null;
    status: string;
    redraw_count: number;
    max_redraws: number;
    claim_deadline: string | null;
    winner_contact_email?: string | null;
  };
  entry_count: number;
  draw_log: DrawLogRow[];
};

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  drawing: "blue",
  winner_pending: "orange",
  claimed: "green",
  unclaimed: "default",
  cancelled: "red",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  drawing: "Drawing…",
  winner_pending: "Winner Pending",
  claimed: "Claimed",
  unclaimed: "Unclaimed",
  cancelled: "Cancelled",
};

export function RafflePanel({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<RaffleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // First get the raffle id via the campaign raffle endpoint
        const pubRes = await api.get(`/api/campaigns/${campaignId}/raffle/public`);
        const raffle = pubRes.data?.raffle;
        if (!raffle) {
          if (!cancelled) setData(null);
          return;
        }
        // Fetch org-level details
        const orgRes = await api.get(`/api/orgs/raffles/${raffle.id}/entries`);
        if (!cancelled) setData(orgRes.data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [campaignId]);

  if (loading) return <Spin size="small" style={{ marginBottom: 24 }} />;
  if (error) return null; // Silently hide if org doesn't have access or no raffle
  if (!data) return null;

  const { raffle, entry_count, draw_log } = data;
  const status = raffle.status;

  const logColumns = [
    {
      title: "Drawn at",
      dataIndex: "drawn_at",
      render: (v: string | null) => v ? new Date(v).toLocaleString() : "—",
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      render: (v: string) => (
        <Badge
          color={v === "claimed" ? "green" : v === "expired" ? "red" : "blue"}
          text={v.charAt(0).toUpperCase() + v.slice(1)}
        />
      ),
    },
    {
      title: "Claimed at",
      dataIndex: "claimed_at",
      render: (v: string | null) => v ? new Date(v).toLocaleString() : "—",
    },
    {
      title: "Winner",
      dataIndex: "winner_email",
      render: (v: string | null) => v || <Text type="secondary">—</Text>,
    },
  ];

  return (
    <div
      style={{
        border: "1px solid #1677ff",
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 24,
        background: "#f0f7ff",
        maxWidth: 680,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <strong style={{ fontSize: 16 }}>🎟 Raffle</strong>
        <Badge
          color={STATUS_COLORS[status] || "default"}
          text={STATUS_LABELS[status] || status}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text strong>{raffle.prize_name}</Text>
        {raffle.prize_description && (
          <p style={{ color: "#555", margin: "4px 0 0", fontSize: 13 }}>{raffle.prize_description}</p>
        )}
      </div>

      <p style={{ margin: "4px 0 8px" }}>
        <Text type="secondary">Entries: </Text>
        <strong>{entry_count}</strong>
      </p>

      {raffle.claim_deadline && status === "winner_pending" && (
        <Alert
          type="warning"
          message={`Winner has until ${new Date(raffle.claim_deadline).toLocaleString()} to claim.`}
          style={{ marginBottom: 8 }}
        />
      )}

      {raffle.winner_contact_email && status === "claimed" && (
        <Alert
          type="success"
          message={
            <>
              Prize claimed! Contact winner at: <strong>{raffle.winner_contact_email}</strong>
            </>
          }
          style={{ marginBottom: 8 }}
        />
      )}

      {draw_log.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ fontSize: 13 }}>Draw history</Text>
          <Table
            dataSource={draw_log.map((r) => ({ ...r, key: r.id }))}
            columns={logColumns}
            size="small"
            pagination={false}
            style={{ marginTop: 8 }}
          />
        </div>
      )}
    </div>
  );
}
