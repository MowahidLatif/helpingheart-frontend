import React, { useState } from "react";
import { Button, Input } from "antd";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { decodeTokenClaims } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError } from "@/lib/notifications";

export default function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSubdomain, setOrgSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !password || !orgName) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(API_ENDPOINTS.auth.register, {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        org_name: orgName,
        org_subdomain: orgSubdomain || undefined,
      });

      const {
        access_token,
        refresh_token,
        id,
        email: userEmail,
        name,
        org_id,
      } = response.data;
      // Keep local token fallback for environments where auth cookies are not sent
      // (e.g. localhost <-> 127.0.0.1 host mismatch during local development).
      localStorage.setItem("token", access_token);
      if (refresh_token) {
        localStorage.setItem("refreshToken", refresh_token);
      } else {
        localStorage.removeItem("refreshToken");
      }
      // Decode claims to store role/permissions for local auth checks.
      const claims = decodeTokenClaims(access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id,
          email: userEmail,
          name,
          org_id: org_id ?? claims?.org_id ?? null,
          role: claims?.role ?? null,
          permissions: claims?.permissions ?? [],
        })
      );

      navigate("/dashboard");
    } catch (err) {
      notifyError(err, "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Sign Up</h1>
          <p>Create your account and start fundraising.</p>
        </div>
        {error && <div className="form-error mb-md">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
              />
            </div>
          </div>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <Input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              placeholder="My Organization"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Organization Subdomain (optional)</label>
            <Input
              type="text"
              value={orgSubdomain}
              onChange={(e) => setOrgSubdomain(e.target.value)}
              placeholder="e.g., myorg"
            />
            <span className="form-help-text">
              Your donation page will be at: {orgSubdomain || "yourorg"}.helpinghands.ca
            </span>
          </div>
          <div className="form-actions">
            <Button type="primary" htmlType="submit" loading={loading} block>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </div>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
