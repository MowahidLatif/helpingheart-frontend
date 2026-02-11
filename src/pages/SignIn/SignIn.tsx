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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      const { access_token, id, email: userEmail, name } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify({ id, email: userEmail, name }));
      
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Sign In</h2>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
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
