import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

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
      alert("Please fill in all required fields.");
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

      const { access_token, refresh_token, id, email: userEmail, name, org_id } = response.data;
      localStorage.setItem("token", access_token);
      if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("user", JSON.stringify({ id, email: userEmail, name, org_id }));

      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Sign Up</h2>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <label>Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />

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

        <label>Organization Name:</label>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <label>Organization Subdomain (optional):</label>
        <input
          type="text"
          value={orgSubdomain}
          onChange={(e) => setOrgSubdomain(e.target.value)}
          placeholder="e.g., myorg"
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <small style={{ display: "block", marginBottom: "1rem", color: "#666" }}>
          Your donation page will be at: {orgSubdomain || "yourorg"}.helpinghands.ca
        </small>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => navigate("/signin")}
        style={{
          marginTop: "1rem",
          background: "none",
          border: "none",
          color: "blue",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Already have an account? Sign in
      </button>
    </div>
  );
}
