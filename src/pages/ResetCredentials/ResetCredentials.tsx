import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export default function ResetCredentials() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSent, setRequestSent] = useState(false);

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

  if (token) {
    if (resetDone) {
      return (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Password Reset</h1>
              <p>Your password has been reset. Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Set New Password</h1>
          </div>
          {resetError && (
            <div className="form-error mb-md">
              {resetError}{" "}
              <Link to="/reset-credentials">Request a new link</Link>
            </div>
          )}
          <form onSubmit={handleResetSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={resetLoading} className="btn btn-primary">
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate("/signin")}>
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>If that email is registered, you will receive a reset link shortly.</p>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline btn-block" onClick={() => navigate("/signin")}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email address and we'll send you a reset link.</p>
        </div>
        {requestError && <div className="form-error mb-md">{requestError}</div>}
        <form onSubmit={handleRequestSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={requestLoading} className="btn btn-primary">
              {requestLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/signin")}>
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
