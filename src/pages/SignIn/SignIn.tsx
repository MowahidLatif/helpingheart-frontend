import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requires2Fa, setRequires2Fa] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");

  const saveSession = (data: {
    access_token: string;
    refresh_token?: string;
    id: string;
    email: string;
    name?: string;
  }) => {
    localStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refreshToken", data.refresh_token);
    }
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name ?? "",
      })
    );
    navigate("/dashboard");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post(API_ENDPOINTS.auth.login, {
        email,
        password,
      });
      const data = response.data;
      if (data.requires_2fa && data.temp_token) {
        setRequires2Fa(true);
        setTempToken(data.temp_token);
        setCode("");
      } else if (data.access_token) {
        saveSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          id: data.id,
          email: data.email ?? email,
          name: data.name,
        });
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post(API_ENDPOINTS.auth.twoFaConfirmLogin, {
        temp_token: tempToken,
        code: code.trim(),
      });
      const data = response.data;
      if (data.access_token) {
        saveSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          id: data.id,
          email: data.email ?? email,
          name: data.name,
        });
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (requires2Fa) {
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h2>Two-Factor Authentication</h2>
        <p>Enter the 6-digit code from your authenticator app.</p>
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        <form onSubmit={handle2FaSubmit}>
          <label>Code:</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
          />
          <button type="submit" disabled={loading} style={{ marginRight: "0.5rem" }}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRequires2Fa(false);
              setTempToken("");
              setCode("");
              setError("");
            }}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Sign In</h2>
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      <form onSubmit={handleLoginSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit" disabled={loading} style={{ marginRight: "0.5rem" }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <button type="button" onClick={() => navigate("/reset-credentials")}>
          Reset Password
        </button>
      </form>
      <button
        type="button"
        onClick={() => navigate("/signup")}
        style={{
          marginTop: "1rem",
          background: "none",
          border: "none",
          color: "blue",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Don't have an account? Sign up
      </button>
    </div>
  );
}
