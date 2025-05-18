import React from "react";

const SettingsPage = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Account Settings</h1>

      {/* Profile Picture Upload */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>🖼️ Profile Picture</h2>
        <input type="file" accept="image/*" />
        <p>Upload a profile picture to personalize your account.</p>
      </section>

      {/* Update Email/Username */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>✏️ Update Email / Username</h2>
        <form>
          <label>
            New Email:
            <input type="email" placeholder="you@example.com" />
          </label>
          <br />
          <label>
            New Username:
            <input type="text" placeholder="your_username" />
          </label>
          <br />
          <button type="submit">Update Info</button>
        </form>
      </section>

      {/* Change Password */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>🔐 Change Password</h2>
        <form>
          <label>
            Current Password:
            <input type="password" />
          </label>
          <br />
          <label>
            New Password:
            <input type="password" />
          </label>
          <br />
          <label>
            Confirm New Password:
            <input type="password" />
          </label>
          <br />
          <button type="submit">Change Password</button>
        </form>
      </section>

      {/* Enable 2FA */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>🔒 Two-Factor Authentication</h2>
        <p>Protect your account with an extra layer of security.</p>
        <button>Enable 2FA</button>
        {/* Later: Show QR code and secret key if 2FA enabled */}
      </section>

      {/* Delete Account */}
      <section
        style={{
          marginTop: "3rem",
          borderTop: "1px solid #ccc",
          paddingTop: "2rem",
        }}
      >
        <h2 style={{ color: "red" }}>🗑️ Delete Account</h2>
        <p>
          This action is irreversible. All your campaigns and data will be
          permanently deleted.
        </p>
        <button style={{ backgroundColor: "red", color: "white" }}>
          Delete My Account
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
