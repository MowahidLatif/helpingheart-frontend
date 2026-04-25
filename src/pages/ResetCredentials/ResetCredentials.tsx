import React, { useState } from "react";
import { Button, Input } from "antd";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notifications";

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
      notifySuccess("If that email is registered, a reset link has been sent.");
    } catch (err) {
      notifyError(err, "Failed to send reset link.");
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
      notifySuccess("Password reset successfully.");
      setTimeout(() => navigate("/signin"), 2500);
    } catch (err) {
      notifyError(err, "Failed to reset password.");
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
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <Button type="primary" htmlType="submit" loading={resetLoading}>
                {resetLoading ? "Resetting..." : "Reset Password"}
              </Button>
              <Button type="default" onClick={() => navigate("/signin")}>
                Back to Sign In
              </Button>
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
            <Button type="default" block onClick={() => navigate("/signin")}>
              Back to Sign In
            </Button>
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
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-actions">
            <Button type="primary" htmlType="submit" loading={requestLoading}>
              {requestLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Button type="default" onClick={() => navigate("/signin")}>
              Back to Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
