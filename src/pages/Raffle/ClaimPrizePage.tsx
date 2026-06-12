import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Alert, Button } from "antd";
import api, { getErrorMessage } from "@/lib/api";

type ClaimState = "loading" | "success" | "expired" | "invalid" | "error";

export default function ClaimPrizePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<ClaimState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      setMessage("Invalid claim link.");
      return;
    }
    (async () => {
      try {
        const res = await api.get(`/api/raffles/claim?token=${encodeURIComponent(token)}`);
        setMessage(res.data.message || "Prize claimed!");
        setState("success");
      } catch (e) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 410) {
          setState("expired");
          setMessage("This claim link has expired.");
        } else if (status === 400) {
          setState("invalid");
          setMessage("Invalid claim link.");
        } else {
          setState("error");
          setMessage(getErrorMessage(e));
        }
      }
    })();
  }, [token]);

  const containerStyle: React.CSSProperties = {
    padding: "4rem 2rem",
    maxWidth: 480,
    margin: "0 auto",
    textAlign: "center",
  };

  if (state === "loading") {
    return (
      <div style={containerStyle}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Verifying your claim…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div style={containerStyle}>
        <h1>🎉 Congratulations!</h1>
        <p style={{ fontSize: 16 }}>{message}</p>
        <Button type="primary" href="/" style={{ marginTop: 16 }}>
          Go home
        </Button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Alert
        type={state === "expired" ? "warning" : "error"}
        message={message}
        style={{ textAlign: "left", marginBottom: 16 }}
      />
      {state === "expired" && (
        <p style={{ color: "#888" }}>
          The 24-hour claim window has passed. A new winner may be drawn.
        </p>
      )}
      <Button href="/">Go home</Button>
    </div>
  );
}
