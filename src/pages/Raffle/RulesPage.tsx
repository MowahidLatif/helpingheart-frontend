import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Spin, Alert } from "antd";
import api, { getErrorMessage } from "@/lib/api";

type RulesData = {
  org_name: string;
  campaign_title: string;
  entry_period_start: string | null;
  entry_period_end: string | null;
  prize_name: string;
  prize_value_cents: number | null;
  free_entry_url: string;
  claim_window_hours: number;
};

function fmt(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function fmtDollars(cents: number | null): string {
  if (cents == null || cents <= 0) return "N/A";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RulesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<RulesData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setError("Campaign not found."); setLoading(false); return; }
    (async () => {
      try {
        const res = await api.get(`/api/campaigns/${slug}/raffle/rules`);
        setData(res.data);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const containerStyle: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "3rem 2rem",
    fontFamily: "Georgia, serif",
    lineHeight: 1.7,
    color: "#222",
  };

  const h2Style: React.CSSProperties = { fontSize: 16, fontWeight: 700, marginTop: "1.5rem", marginBottom: 4 };

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center" }}><Spin size="large" /></div>;
  }

  if (error || !data) {
    return (
      <div style={{ padding: "3rem 2rem", maxWidth: 600, margin: "0 auto" }}>
        <Alert type="error" message={error || "Rules not available."} />
      </div>
    );
  }

  const freeEntryAbsUrl = `${window.location.origin}${data.free_entry_url}`;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Official Raffle Rules</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        {data.org_name} — {data.campaign_title}
      </p>

      <h2 style={h2Style}>1. Sponsor</h2>
      <p>
        This raffle is sponsored by <strong>{data.org_name}</strong> ("Sponsor") in connection with the campaign
        titled <strong>{data.campaign_title}</strong>, hosted on HelpingHandsFund.
      </p>

      <h2 style={h2Style}>2. Eligibility</h2>
      <p>
        Open to any individual who makes a qualifying donation to the campaign during the Entry Period, or who
        submits a free entry via mail/online as described below. Employees, officers, directors, and agents of the
        Sponsor and their immediate family members are not eligible.
      </p>

      <h2 style={h2Style}>3. Entry Period</h2>
      <p>
        The raffle entry period begins on <strong>{fmt(data.entry_period_start)}</strong> and ends on{" "}
        <strong>{fmt(data.entry_period_end)}</strong> ("Entry Period"), or when the campaign concludes,
        whichever comes first.
      </p>

      <h2 style={h2Style}>4. How to Enter</h2>
      <p>
        <strong>Purchase entry:</strong> Make any donation to the campaign during the Entry Period to receive one (1)
        raffle entry per donor. Multiple donations by the same donor do not increase the number of entries.
      </p>
      <p>
        <strong>Free entry (no purchase necessary):</strong> To enter without donating, visit{" "}
        <a href={freeEntryAbsUrl}>{freeEntryAbsUrl}</a> and submit your name and email address during the Entry
        Period. Limit one free entry per person.
      </p>

      <h2 style={h2Style}>5. Prize</h2>
      <p>
        One (1) winner will receive: <strong>{data.prize_name}</strong>.
        {data.prize_value_cents != null && data.prize_value_cents > 0 && (
          <> Approximate retail value: <strong>{fmtDollars(data.prize_value_cents)}</strong>.</>
        )}{" "}
        No substitution or cash equivalent. Sponsor reserves the right to substitute a prize of equal or greater
        value if the advertised prize becomes unavailable.
      </p>

      <h2 style={h2Style}>6. Drawing and Odds</h2>
      <p>
        The winner will be selected by random drawing from all eligible entries after the Entry Period closes. Odds
        of winning depend on the total number of eligible entries received.
      </p>

      <h2 style={h2Style}>7. Winner Notification and Claim</h2>
      <p>
        The winner will be notified by email at the address provided at entry. The winner must claim their prize
        within <strong>{data.claim_window_hours} hours</strong> of notification by following the link in the
        notification email and confirming their email address. Failure to claim within this period may result in
        forfeiture and selection of an alternate winner.
      </p>

      <h2 style={h2Style}>8. General Conditions</h2>
      <p>
        By participating, entrants agree to be bound by these Official Rules and the decisions of the Sponsor,
        which are final. The Sponsor reserves the right to cancel, suspend, or modify this raffle if fraud,
        technical failures, or any other factor impairs the integrity of the raffle. This raffle is void where
        prohibited by law. Participants are responsible for complying with applicable local, state, and federal
        laws.
      </p>

      <h2 style={h2Style}>9. Privacy</h2>
      <p>
        Personal information collected in connection with this raffle will be used solely for administering the
        raffle and will not be sold or shared with third parties except as necessary to award the prize.
      </p>

      <p style={{ marginTop: "2rem", fontSize: 12, color: "#999" }}>
        Raffle administered via HelpingHandsFund. For questions, contact the Sponsor directly.
      </p>
    </div>
  );
}
