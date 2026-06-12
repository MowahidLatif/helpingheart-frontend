import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Alert, Button, Input } from "antd";
import api, { getErrorMessage } from "@/lib/api";

type Step = "loading" | "email_form" | "submitting" | "success" | "expired" | "used" | "locked" | "invalid" | "error";

export default function ClaimPrizePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [step, setStep] = useState<Step>("loading");
  const [prizeName, setPrizeName] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStep("invalid");
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/api/raffles/claim?token=${encodeURIComponent(token)}`);
        setPrizeName(res.data.prize_name || "the prize");
        setEmailHint(res.data.donor_email_hint || "");
        setStep("email_form");
      } catch (e) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 410) {
          setStep("used");
        } else if (status === 400) {
          setStep("invalid");
        } else if (status === 429) {
          setStep("locked");
        } else {
          setErrorMsg(getErrorMessage(e));
          setStep("error");
        }
      }
    })();
  }, [token]);

  const handleClaim = async () => {
    if (!email.trim()) { setErrorMsg("Please enter your email address."); return; }
    setErrorMsg("");
    setStep("submitting");
    try {
      await api.post("/api/raffles/claim", { token, email: email.trim() });
      setStep("success");
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      const data = (e as { response?: { data?: { error?: string; attempts_remaining?: number } } })?.response?.data;
      if (status === 429) {
        setStep("locked");
      } else if (status === 410) {
        setStep("used");
      } else if (status === 400 && data?.error === "email_mismatch") {
        const remaining = data.attempts_remaining ?? 0;
        setErrorMsg(
          remaining > 0
            ? `That email doesn't match our records. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
            : "No attempts remaining. Please try again later."
        );
        setStep("email_form");
      } else {
        setErrorMsg(getErrorMessage(e));
        setStep("email_form");
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "4rem 2rem",
    maxWidth: 480,
    margin: "0 auto",
    textAlign: "center",
  };

  if (step === "loading") {
    return (
      <div style={containerStyle}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Verifying your claim link…</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div style={containerStyle}>
        <h1>Congratulations!</h1>
        <p style={{ fontSize: 16 }}>
          You've claimed your prize: <strong>{prizeName}</strong>. We'll be in touch shortly!
        </p>
        <Button type="primary" href="/" style={{ marginTop: 16 }}>Go home</Button>
      </div>
    );
  }

  if (step === "used") {
    return (
      <div style={containerStyle}>
        <Alert type="warning" message="This claim link has already been used." style={{ marginBottom: 16 }} />
        <Button href="/">Go home</Button>
      </div>
    );
  }

  if (step === "locked") {
    return (
      <div style={containerStyle}>
        <Alert type="error" message="Too many failed attempts. Please try again in 1 hour." style={{ marginBottom: 16 }} />
        <Button href="/">Go home</Button>
      </div>
    );
  }

  if (step === "invalid" || step === "error") {
    return (
      <div style={containerStyle}>
        <Alert
          type="error"
          message={step === "invalid" ? "This claim link is invalid or has expired." : errorMsg}
          style={{ marginBottom: 16 }}
        />
        <Button href="/">Go home</Button>
      </div>
    );
  }

  // email_form or submitting
  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 8 }}>Claim your prize</h2>
      <p style={{ color: "#555", marginBottom: 4 }}>
        You've been drawn as the winner of: <strong>{prizeName}</strong>
      </p>
      {emailHint && (
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
          Enter the email you used to enter the raffle (hint: {emailHint})
        </p>
      )}
      {errorMsg && (
        <Alert type="error" message={errorMsg} style={{ marginBottom: 12, textAlign: "left" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, margin: "0 auto" }}>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={handleClaim}
          disabled={step === "submitting"}
          size="large"
        />
        <Button
          type="primary"
          size="large"
          loading={step === "submitting"}
          onClick={handleClaim}
        >
          Confirm and claim prize
        </Button>
      </div>
    </div>
  );
}
