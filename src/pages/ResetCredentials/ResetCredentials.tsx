import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export default function ResetCredentials() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  // View A — request reset
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // View B — set new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setRequestError("Please enter your email address.");
      return;
    }
    setRequestLoading(true);
    setRequestError("");
    try {
      await api.post(API_ENDPOINTS.auth.forgotPassword, { email: email.trim() });
      setRequestSent(true);
    } catch (err) {
      setRequestError(getErrorMessage(err));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    setResetError("");
    try {
      await api.post(API_ENDPOINTS.auth.resetPassword, {
        token,
        new_password: newPassword,
      });
      setResetDone(true);
      setTimeout(() => navigate("/signin"), 2500);
    } catch (err) {
      setResetError(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  // View B — token present in URL
  if (token) {
    if (resetDone) {
      return (
        <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
          <h2>Password Reset</h2>
          <p>Your password has been reset. Redirecting to sign in…</p>
        </div>
      );
    }
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h2>Set New Password</h2>
        {resetError && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            {resetError}{" "}
            <Link to="/reset-credentials">Request a new link</Link>
          </div>
        )}
        <form onSubmit={handleResetSubmit}>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          <button type="submit" disabled={resetLoading} style={{ marginRight: "0.5rem" }}>
            {resetLoading ? "Resetting…" : "Reset Password"}
          </button>
          <button type="button" onClick={() => navigate("/signin")}>
            Back to Sign In
          </button>
        </form>
      </div>
    );
  }

  // View A — no token in URL
  if (requestSent) {
    return (
      <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
        <h2>Check Your Email</h2>
        <p>
          If that email is registered, you will receive a reset link shortly.
        </p>
        <button type="button" onClick={() => navigate("/signin")}>
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Forgot Password</h2>
      <p>Enter your email address and we'll send you a reset link.</p>
      {requestError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{requestError}</div>
      )}
      <form onSubmit={handleRequestSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit" disabled={requestLoading} style={{ marginRight: "0.5rem" }}>
          {requestLoading ? "Sending…" : "Send Reset Link"}
        </button>
        <button type="button" onClick={() => navigate("/signin")}>
          Back to Sign In
        </button>
      </form>
    </div>
  );
}
