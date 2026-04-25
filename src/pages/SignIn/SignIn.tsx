import React, { useState } from "react";
import { Button, Input } from "antd";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { decodeTokenClaims } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError } from "@/lib/notifications";

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
    // Keep local token fallback for environments where auth cookies are not sent
    // (e.g. localhost <-> 127.0.0.1 host mismatch during local development).
    localStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refreshToken", data.refresh_token);
    } else {
      localStorage.removeItem("refreshToken");
    }
    // Decode the access token to extract role/permissions for local auth checks.
    const claims = decodeTokenClaims(data.access_token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name ?? "",
        role: claims?.role ?? null,
        org_id: claims?.org_id ?? null,
        permissions: claims?.permissions ?? [],
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
      notifyError(err, "Sign in failed.");
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
      notifyError(err, "2FA verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (requires2Fa) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Two-Factor Authentication</h1>
            <p>Enter the 6-digit code from your authenticator app.</p>
          </div>
          {error && <div className="form-error mb-md">{error}</div>}
          <form onSubmit={handle2FaSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Code</label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <div className="form-actions">
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                type="default"
                block
                onClick={() => {
                  setRequires2Fa(false);
                  setTempToken("");
                  setCode("");
                  setError("");
                }}
              >
                Back
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Sign In</h1>
          <p>Welcome back! Sign in to your account.</p>
        </div>
        {error && <div className="form-error mb-md">{error}</div>}
        <form onSubmit={handleLoginSubmit} className="auth-form">
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
          <div className="form-group">
            <label className="form-label">Password</label>
            <Input.Password
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <Button type="primary" htmlType="submit" loading={loading} block>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
        <div className="auth-footer">
          <Link to="/reset-credentials">Forgot password?</Link>
          <p className="mt-md">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
