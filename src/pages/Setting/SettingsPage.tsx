import React, { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import {
  validateEmail,
  validateName,
  validatePasswordChange,
} from "@/lib/settingsValidation";

type Profile = { id: string; email: string; name: string } | null;
type Org = { id: string; name: string; subdomain?: string; role?: string } | null;

const SettingsPage = () => {
  const [profile, setProfile] = useState<Profile>(null);
  const [org, setOrg] = useState<Org>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Account Settings form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);

  // Change Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profileRes, orgsRes] = await Promise.all([
          api.get<{ id: string; email: string; name: string }>(
            API_ENDPOINTS.me.profile
          ),
          api.get<Array<{ id: string; name: string; role: string }>>(
            API_ENDPOINTS.orgs.list
          ),
        ]);
        if (cancelled) return;
        setProfile(profileRes.data);
        setName(profileRes.data.name ?? "");
        setEmail(profileRes.data.email ?? "");
        const firstOrg = orgsRes.data?.[0];
        if (firstOrg) {
          const orgDetail = await api.get<{
            id: string;
            name: string;
            subdomain?: string;
          }>(API_ENDPOINTS.orgs.get(firstOrg.id));
          if (!cancelled) {
            setOrg({
              id: orgDetail.data.id,
              name: orgDetail.data.name,
              subdomain: orgDetail.data.subdomain,
              role: firstOrg.role,
            });
          }
        } else {
          setOrg(null);
        }
      } catch (err) {
        if (!cancelled) {
          setProfile(null);
          setOrg(null);
          const stored = getUser();
          if (stored) {
            setName(stored.name ?? "");
            setEmail(stored.email ?? "");
          }
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    setAccountSuccess("");
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    if (nameErr || emailErr) {
      setAccountError(nameErr || emailErr || "");
      return;
    }
    setAccountLoading(true);
    try {
      const res = await api.patch<{ id: string; email: string; name: string }>(
        API_ENDPOINTS.me.profile,
        { name: name.trim(), email: email.trim().toLowerCase() }
      );
      const user = getUser();
      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            name: res.data.name,
            email: res.data.email,
          })
        );
      }
      setProfile(res.data);
      setAccountSuccess("Profile updated successfully.");
    } catch (err) {
      setAccountError(getErrorMessage(err));
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    const err = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword
    );
    if (err) {
      setPasswordError(err);
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post(API_ENDPOINTS.auth.changePassword, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const messageBlock = (
    success: string,
    error: string,
    successStyle: React.CSSProperties,
    errorStyle: React.CSSProperties
  ) => (
    <>
      {success && (
        <div style={{ ...successStyle, marginBottom: "1rem" }}>{success}</div>
      )}
      {error && (
        <div style={{ ...errorStyle, marginBottom: "1rem" }}>{error}</div>
      )}
    </>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Account Settings</h1>

      {/* Account Settings: name, email, org details */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Account details</h2>
        {profileLoading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleAccountSubmit}>
            {messageBlock(
              accountSuccess,
              accountError,
              { color: "green" },
              { color: "red" }
            )}
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            {org && (
              <div style={{ marginBottom: "1rem", color: "#666" }}>
                <strong>Organization:</strong> {org.name}
                {org.subdomain != null && (
                  <> &middot; Subdomain: <code>{org.subdomain}</code></>
                )}
                {org.role != null && <> ({org.role})</>}
              </div>
            )}
            <button type="submit" disabled={accountLoading}>
              {accountLoading ? "Saving..." : "Update profile"}
            </button>
          </form>
        )}
      </section>

      {/* Change Password */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Change password</h2>
        <form onSubmit={handlePasswordSubmit}>
          {messageBlock(
            passwordSuccess,
            passwordError,
            { color: "green" },
            { color: "red" }
          )}
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Current password:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            New password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Confirm new password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Updating..." : "Change password"}
          </button>
        </form>
      </section>

      {/* Profile Picture Upload - placeholder */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Profile picture</h2>
        <input type="file" accept="image/*" />
        <p>Upload a profile picture to personalize your account.</p>
      </section>

      {/* Enable 2FA - placeholder */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Two-Factor Authentication</h2>
        <p>Protect your account with an extra layer of security.</p>
        <button type="button">Enable 2FA</button>
      </section>

      {/* Delete Account - placeholder */}
      <section
        style={{
          marginTop: "3rem",
          borderTop: "1px solid #ccc",
          paddingTop: "2rem",
        }}
      >
        <h2 style={{ color: "red" }}>Delete account</h2>
        <p>
          This action is irreversible. All your campaigns and data will be
          permanently deleted.
        </p>
        <button type="button" style={{ backgroundColor: "red", color: "white" }}>
          Delete my account
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
