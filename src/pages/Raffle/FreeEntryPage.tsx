import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Input, Spin, Alert } from "antd";
import api, { getErrorMessage } from "@/lib/api";

type RaffleInfo = {
  prize_name: string;
  prize_description?: string | null;
  campaign_title?: string | null;
};

export default function FreeEntryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [raffleInfo, setRaffleInfo] = useState<RaffleInfo | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await api.get(`/api/campaigns/${slug}/raffle/free-entry`);
        setRaffleInfo(res.data);
      } catch (e) {
        setLoadError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSubmitError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/campaigns/${slug}/raffle/free-entry`, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (loadError || !raffleInfo) {
    return (
      <div style={{ padding: "3rem", maxWidth: 480, margin: "0 auto" }}>
        <Alert type="error" message={loadError || "No active raffle found for this campaign."} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: "3rem", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h1>🎟 You're entered!</h1>
        <p>Good luck — the winner will be drawn when the campaign ends.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>Free Raffle Entry</h1>
      {raffleInfo.campaign_title && (
        <p style={{ color: "#555", marginBottom: 4 }}>Campaign: {raffleInfo.campaign_title}</p>
      )}
      <p style={{ marginBottom: 20 }}>
        Enter for a chance to win <strong>{raffleInfo.prize_name}</strong>. No purchase necessary.
      </p>
      {raffleInfo.prize_description && (
        <p style={{ color: "#555", marginBottom: 20 }}>{raffleInfo.prize_description}</p>
      )}
      {submitError && (
        <Alert type="error" message={submitError} style={{ marginBottom: 16 }} />
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>First name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Last name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Email address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </div>
        <Button type="primary" htmlType="submit" loading={submitting} style={{ marginTop: 8 }}>
          Enter Raffle
        </Button>
      </form>
      <p style={{ marginTop: 16, fontSize: 12, color: "#aaa" }}>
        One entry per email address. Duplicate submissions will be rejected.
      </p>
    </div>
  );
}
