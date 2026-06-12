import { useEffect, useState } from "react";
import type { AiNode } from "@/lib/aiSiteRecipe";

type RaffleStatus =
  | "active"
  | "drawing"
  | "winner_pending"
  | "claimed"
  | "unclaimed"
  | "cancelled";

type RaffleBlockProps = {
  node: AiNode;
  campaignSlug?: string;
  liveEntryCount?: number;
};

function Countdown({ endDate, timezone }: { endDate: string | null; timezone?: string | null }) {
  const [relLabel, setRelLabel] = useState("");

  useEffect(() => {
    if (!endDate) { setRelLabel(""); return; }
    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setRelLabel("Raffle ended"); return; }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      if (days > 0) setRelLabel(`Raffle ends in ${days} day${days !== 1 ? "s" : ""}`);
      else if (hours > 0) setRelLabel(`Raffle ends in ${hours} hour${hours !== 1 ? "s" : ""}`);
      else setRelLabel("Raffle ends soon");
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [endDate]);

  if (!endDate || !relLabel) return null;

  let absoluteLabel = "";
  try {
    absoluteLabel = new Date(endDate).toLocaleString("en-US", {
      timeZone: timezone || "UTC",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    // invalid timezone fallback
    absoluteLabel = new Date(endDate).toLocaleString();
  }

  return (
    <>
      <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>{relLabel}</p>
      <p style={{ fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>Ends {absoluteLabel}</p>
    </>
  );
}

export function RaffleBlock({ node, campaignSlug, liveEntryCount: liveEntryCountProp }: RaffleBlockProps) {
  const p = node.props as {
    prize_name?: string | null;
    prize_description?: string | null;
    prize_image_url?: string | null;
    prize_value_cents?: number | null;
    status?: RaffleStatus | null;
    campaign_end_date?: string | null;
    timezone?: string | null;
    winner_display_name?: string | null;
    free_entry_url?: string | null;
    rules_url?: string | null;
    liveEntryCount?: number | null;
  };

  const slug = campaignSlug || (p.free_entry_url?.split("/campaigns/")?.[1]?.split("/")?.[0]);
  const resolvedEntryCount = liveEntryCountProp ?? p.liveEntryCount ?? null;

  const status = p.status || "active";
  const prizeName = p.prize_name || "Prize";

  const containerStyle: React.CSSProperties = {
    border: "2px solid #1677ff",
    borderRadius: 12,
    padding: "20px 24px",
    margin: "16px 0",
    background: "linear-gradient(135deg, #f0f7ff 0%, #fff 100%)",
    maxWidth: 560,
  };

  const renderContent = () => {
    if (status === "claimed" && p.winner_display_name) {
      return (
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>🎉 Raffle Winner!</p>
          <p style={{ margin: "0 0 8px" }}>
            Congratulations <strong>{p.winner_display_name}</strong>!
          </p>
        </div>
      );
    }
    if (status === "claimed") {
      return (
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>🎉 Raffle Complete</p>
          <p style={{ margin: 0, color: "#555" }}>The winner has been contacted — check your email!</p>
        </div>
      );
    }
    if (status === "winner_pending") {
      return (
        <p style={{ margin: 0, color: "#555" }}>
          The raffle has ended — the winner is being contacted.
        </p>
      );
    }
    if (status === "unclaimed" || status === "cancelled") {
      return <p style={{ margin: 0, color: "#888" }}>This raffle has ended.</p>;
    }
    // active or drawing
    return (
      <div>
        {p.prize_image_url && (
          <img
            src={p.prize_image_url}
            alt={prizeName}
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
          />
        )}
        <p style={{ margin: "0 0 4px", color: "#555", fontSize: 14 }}>
          Donate to this campaign to be automatically entered
        </p>
        {p.prize_description && (
          <p style={{ margin: "8px 0 4px", color: "#444", fontSize: 14 }}>{p.prize_description}</p>
        )}
        {p.prize_value_cents != null && p.prize_value_cents > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>
            Prize value: ~${(p.prize_value_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        )}
        {(resolvedEntryCount != null && resolvedEntryCount > 0) && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#1677ff", fontWeight: 500 }}>
            🎟 {resolvedEntryCount} {resolvedEntryCount === 1 ? "person" : "people"} entered
          </p>
        )}
        <Countdown endDate={p.campaign_end_date ?? null} timezone={p.timezone} />
        {p.free_entry_url && (
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "#999" }}>
            No donation necessary —{" "}
            <a href={p.free_entry_url} style={{ color: "#1677ff" }}>
              free entry here
            </a>
          </p>
        )}
        {(p.rules_url || slug) && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#999" }}>
            <a href={p.rules_url || `/campaigns/${slug}/raffle/rules`} style={{ color: "#888" }}>
              Official rules
            </a>
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle} className="raffle-block">
      <p style={{ fontWeight: 700, fontSize: 18, margin: "0 0 8px", color: "#1677ff" }}>
        🎟 Raffle Prize: {prizeName}
      </p>
      {renderContent()}
    </div>
  );
}
