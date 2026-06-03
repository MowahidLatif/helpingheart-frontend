import React, { useState, useEffect } from "react";
import { Button } from "antd";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import Modal from "@/components/Modal";
import { notifyError, notifySuccess } from "@/lib/notifications";
import GenericTextInput from "@/components/Form/GenericTextInput";
import {
  validateEmail,
  validateName,
  validatePasswordChange,
} from "@/lib/settingsValidation";
import { TIER_LIMITS, TIER_NAMES } from "@/lib/tierFeatures";
import type { TierKey } from "@/lib/tierFeatures";

type Profile = { id: string; email: string; name: string } | null;
type Org = { id: string; name: string; subdomain?: string; role?: string; tier?: number } | null;

type AckCampaign = {
  id: string;
  title: string;
  locked_tier: number;
  locked_tier_name: string;
  locked_fee_percent: number;
  status: string;
};
type EmailSettings = {
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  bcc_to?: string;
  receipt_subject?: string;
  receipt_text?: string;
  receipt_html?: string;
  thank_you_subject?: string;
  thank_you_text?: string;
  thank_you_html?: string;
  winner_subject?: string;
  winner_text?: string;
  winner_html?: string;
} | null;

const SettingsPage = () => {
  const [, setProfile] = useState<Profile>(null);
  const [org, setOrg] = useState<Org>(null);
  const [, setEmailSettings] = useState<EmailSettings>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Account Settings form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);

  // Org edit
  const [orgName, setOrgName] = useState("");
  const [orgSubdomain, setOrgSubdomain] = useState("");
  const [orgError, setOrgError] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);

  // Email settings
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [bccTo, setBccTo] = useState("");
  const [receiptSubject, setReceiptSubject] = useState("");
  const [receiptText, setReceiptText] = useState("");
  const [receiptHtml, setReceiptHtml] = useState("");
  const [thankYouSubject, setThankYouSubject] = useState("");
  const [thankYouText, setThankYouText] = useState("");
  const [thankYouHtml, setThankYouHtml] = useState("");
  const [winnerSubject, setWinnerSubject] = useState("");
  const [winnerText, setWinnerText] = useState("");
  const [winnerHtml, setWinnerHtml] = useState("");
  const [emailSettingsError, setEmailSettingsError] = useState("");
  const [emailSettingsLoading, setEmailSettingsLoading] = useState(false);

  // Change Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 2FA
  const [twoFaSetup, setTwoFaSetup] = useState<{ secret: string; qr_data_url: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaDisablePassword, setTwoFaDisablePassword] = useState("");
  const [twoFaDisableCode, setTwoFaDisableCode] = useState("");
  const [twoFaDisableLoading, setTwoFaDisableLoading] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tier management
  const [pendingTier, setPendingTier] = useState<TierKey | null>(null);
  const [tierLoading, setTierLoading] = useState(false);
  const [showAckModal, setShowAckModal] = useState(false);
  const [ackCampaigns, setAckCampaigns] = useState<AckCampaign[]>([]);

  const canEditOrg = org && (org.role === "owner" || org.role === "admin");
  const isOwner = org?.role === "owner";

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
          const [orgDetail, emailRes] = await Promise.all([
            api.get<{ id: string; name: string; subdomain?: string; tier?: number }>(
              API_ENDPOINTS.orgs.get(firstOrg.id)
            ),
            api.get<EmailSettings>(API_ENDPOINTS.orgs.emailSettings(firstOrg.id)).catch(() => ({ data: null })),
          ]);
          if (!cancelled) {
            setOrg({
              id: orgDetail.data.id,
              name: orgDetail.data.name,
              subdomain: orgDetail.data.subdomain,
              role: firstOrg.role,
              tier: orgDetail.data.tier ?? 1,
            });
            setOrgName(orgDetail.data.name ?? "");
            setOrgSubdomain(orgDetail.data.subdomain ?? "");
            const es = emailRes?.data;
            setEmailSettings(es ?? null);
            if (es) {
              setFromName(es.from_name ?? "");
              setFromEmail(es.from_email ?? "");
              setReplyTo(es.reply_to ?? "");
              setBccTo(es.bcc_to ?? "");
              setReceiptSubject(es.receipt_subject ?? "");
              setReceiptText(es.receipt_text ?? "");
              setReceiptHtml(es.receipt_html ?? "");
              setThankYouSubject(es.thank_you_subject ?? "");
              setThankYouText(es.thank_you_text ?? "");
              setThankYouHtml(es.thank_you_html ?? "");
              setWinnerSubject(es.winner_subject ?? "");
              setWinnerText(es.winner_text ?? "");
              setWinnerHtml(es.winner_html ?? "");
            }
          }
        } else {
          setOrg(null);
        }
      } catch {
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
      notifySuccess("Profile updated successfully.");
    } catch (err) {
      notifyError(err, "Failed to update profile.");
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
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
      notifySuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      notifyError(err, "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id || !canEditOrg) return;
    if (!orgName.trim()) {
      setOrgError("Organization name is required.");
      return;
    }
    setOrgError("");
    setOrgLoading(true);
    try {
      await api.patch(API_ENDPOINTS.orgs.update(org.id), { name: orgName.trim() });
      if (orgSubdomain.trim()) {
        await api.patch(API_ENDPOINTS.orgs.subdomain(org.id), {
          subdomain: orgSubdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
        });
      }
      setOrg((o) => (o ? { ...o, name: orgName.trim(), subdomain: orgSubdomain.trim() || o.subdomain } : o));
      notifySuccess("Organization updated.");
    } catch (err) {
      notifyError(err, "Failed to update organization.");
    } finally {
      setOrgLoading(false);
    }
  };

  const handleTierChange = async (newTier: TierKey, acknowledged = false) => {
    if (!org?.id || !isOwner) return;
    setTierLoading(true);
    try {
      await api.patch(API_ENDPOINTS.orgs.tier(org.id), {
        tier: newTier,
        acknowledged,
      });
      // Success — apply the new tier
      setOrg((o) => (o ? { ...o, tier: newTier } : o));
      setPendingTier(null);
      setShowAckModal(false);
      setAckCampaigns([]);
      notifySuccess(`Plan changed to ${TIER_NAMES[newTier]}.`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { requires_acknowledgment?: boolean; campaigns?: AckCampaign[] } } })?.response?.status;
      const data = (err as { response?: { data?: { requires_acknowledgment?: boolean; campaigns?: AckCampaign[] } } })?.response?.data;
      if (status === 409 && data?.requires_acknowledgment) {
        // Show acknowledgment modal
        setAckCampaigns(data.campaigns ?? []);
        setShowAckModal(true);
      } else {
        notifyError(err, "Failed to change plan.");
        setPendingTier(null);
      }
    } finally {
      setTierLoading(false);
    }
  };

  const handleEmailSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id || !canEditOrg) return;
    setEmailSettingsError("");
    setEmailSettingsLoading(true);
    try {
      await api.patch(API_ENDPOINTS.orgs.emailSettings(org.id), {
        from_name: fromName.trim() || undefined,
        from_email: fromEmail.trim() || undefined,
        reply_to: replyTo.trim() || undefined,
        bcc_to: bccTo.trim() || undefined,
        receipt_subject: receiptSubject.trim() || undefined,
        receipt_text: receiptText.trim() || undefined,
        receipt_html: receiptHtml.trim() || undefined,
        thank_you_subject: thankYouSubject.trim() || undefined,
        thank_you_text: thankYouText.trim() || undefined,
        thank_you_html: thankYouHtml.trim() || undefined,
        winner_subject: winnerSubject.trim() || undefined,
        winner_text: winnerText.trim() || undefined,
        winner_html: winnerHtml.trim() || undefined,
      });
      notifySuccess("Email settings saved.");
    } catch (err) {
      notifyError(err, "Failed to save email settings.");
    } finally {
      setEmailSettingsLoading(false);
    }
  };

  const handle2FaSetup = async () => {
    setTwoFaError("");
    setTwoFaLoading(true);
    try {
      const res = await api.post<{ secret: string; qr_data_url: string }>(
        API_ENDPOINTS.auth.twoFaSetup
      );
      setTwoFaSetup({ secret: res.data.secret, qr_data_url: res.data.qr_data_url });
    } catch (err) {
      notifyError(err, "Failed to set up 2FA.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaCode.trim() || twoFaCode.length !== 6) {
      setTwoFaError("Enter the 6-digit code.");
      return;
    }
    setTwoFaError("");
    setTwoFaLoading(true);
    try {
      await api.post(API_ENDPOINTS.auth.twoFaVerify, { code: twoFaCode.trim() });
      notifySuccess("2FA enabled.");
      setTwoFaSetup(null);
      setTwoFaCode("");
    } catch (err) {
      notifyError(err, "Failed to verify 2FA.");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FaDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaDisablePassword || !twoFaDisableCode.trim()) {
      setTwoFaError("Password and 6-digit code required.");
      return;
    }
    setTwoFaError("");
    setTwoFaDisableLoading(true);
    try {
      await api.post(API_ENDPOINTS.auth.twoFaDisable, {
        password: twoFaDisablePassword,
        code: twoFaDisableCode.trim(),
      });
      notifySuccess("2FA disabled.");
      setTwoFaDisablePassword("");
      setTwoFaDisableCode("");
    } catch (err) {
      notifyError(err, "Failed to disable 2FA.");
    } finally {
      setTwoFaDisableLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      setDeleteError("Password is required.");
      return;
    }
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await api.post(API_ENDPOINTS.auth.deleteAccount, {
        password: deletePassword,
        ...(deleteCode.trim() ? { code: deleteCode.trim() } : {}),
      });
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      notifyError(err, "Failed to delete account.");
    } finally {
      setDeleteLoading(false);
    }
  };

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
            {accountError && <div className="form-error mb-md">{accountError}</div>}
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Name:
              <GenericTextInput
                value={name}
                setValue={(value) => setName(String(value ?? ""))}
                placeholder="Your name"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              Email:
              <GenericTextInput
                valueType="email"
                value={email}
                setValue={(value) => setEmail(String(value ?? ""))}
                placeholder="you@example.com"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            {org && (
              <div style={{ marginBottom: "1rem", color: "#666" }}>
                {org.role != null && <>Role: {org.role}</>}
              </div>
            )}
            <Button type="primary" htmlType="submit" loading={accountLoading}>
              {accountLoading ? "Saving..." : "Update profile"}
            </Button>
          </form>
        )}
      </section>

      {org && canEditOrg && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Organization</h2>
          <form onSubmit={handleOrgSubmit}>
            {orgError && <div className="form-error mb-md">{orgError}</div>}
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Organization name:
              <GenericTextInput
                value={orgName}
                setValue={(value) => setOrgName(String(value ?? ""))}
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              Subdomain (letters, numbers, hyphens):
              <GenericTextInput
                value={orgSubdomain}
                setValue={(value) => setOrgSubdomain(String(value ?? ""))}
                placeholder="yourorg"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <Button type="primary" htmlType="submit" loading={orgLoading}>
              {orgLoading ? "Saving..." : "Update organization"}
            </Button>
          </form>
        </section>
      )}

      {org && isOwner && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Plan</h2>
          {(() => {
            const currentTier = (org.tier ?? 1) as TierKey;
            const limits = TIER_LIMITS[currentTier];
            return (
              <>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Current plan:</strong> {limits.name} — ${limits.monthly_price}/month
                </p>
                <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.9rem" }}>
                  Changing your plan immediately updates features and limits for all your active campaigns.
                  Completed campaigns are unaffected.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {([1, 2, 3] as TierKey[]).map((t) => (
                    <Button
                      key={t}
                      type={t === currentTier ? "primary" : "default"}
                      disabled={t === currentTier || tierLoading}
                      loading={tierLoading && pendingTier === t}
                      onClick={() => {
                        setPendingTier(t);
                        handleTierChange(t);
                      }}
                    >
                      {TIER_NAMES[t]} (${TIER_LIMITS[t].monthly_price}/mo)
                    </Button>
                  ))}
                </div>
              </>
            );
          })()}
        </section>
      )}

      {/* Tier-change acknowledgment modal */}
      <Modal isOpen={showAckModal} onClose={() => { setShowAckModal(false); setPendingTier(null); }}>
        <h3 style={{ marginTop: 0 }}>Before you continue</h3>
        <p>
          You have one or more active campaigns on your account.
          Changing your plan will <strong>immediately update</strong> features and limits for these campaigns:
        </p>
        <ul style={{ paddingLeft: "1.25rem", marginBottom: "1.25rem" }}>
          {ackCampaigns.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.35rem" }}>
              <strong>{c.title}</strong>{" "}
              <span style={{ color: "#666" }}>
                ({c.status}) — currently on {c.locked_tier_name}
              </span>
            </li>
          ))}
        </ul>
        <p>
          All listed campaigns will use your new plan&apos;s features and limits going forward.
          Completed campaigns are not affected.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <Button onClick={() => { setShowAckModal(false); setPendingTier(null); }}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={tierLoading}
            onClick={() => pendingTier && handleTierChange(pendingTier, true)}
          >
            Change plan — update active campaigns
          </Button>
        </div>
      </Modal>

      {org && canEditOrg && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Email settings</h2>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}>
            Sender name and email for receipts and notifications. Leave template fields blank to use system defaults.
          </p>
          <form onSubmit={handleEmailSettingsSubmit}>
            {emailSettingsError && <div className="form-error mb-md">{emailSettingsError}</div>}

            <h3 style={{ marginBottom: "0.5rem" }}>Sender</h3>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              From name:
              <GenericTextInput
                value={fromName}
                setValue={(value) => setFromName(String(value ?? ""))}
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              From email:
              <GenericTextInput
                valueType="email"
                value={fromEmail}
                setValue={(value) => setFromEmail(String(value ?? ""))}
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Reply-To:
              <GenericTextInput
                valueType="email"
                value={replyTo}
                setValue={(value) => setReplyTo(String(value ?? ""))}
                placeholder="Leave blank to use From email"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              BCC:
              <GenericTextInput
                valueType="email"
                value={bccTo}
                setValue={(value) => setBccTo(String(value ?? ""))}
                placeholder="Leave blank to disable BCC"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>

            <h3 style={{ marginBottom: "0.5rem" }}>Receipt email template</h3>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Subject:
              <GenericTextInput
                value={receiptSubject}
                setValue={(value) => setReceiptSubject(String(value ?? ""))}
                placeholder="Thanks for your donation to {{ campaign.title }}!"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Body (plain text):
              <textarea
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                rows={5}
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontFamily: "monospace" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              Body (HTML):
              <textarea
                value={receiptHtml}
                onChange={(e) => setReceiptHtml(e.target.value)}
                rows={5}
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontFamily: "monospace" }}
              />
            </label>

            <h3 style={{ marginBottom: "0.5rem" }}>Thank-you email template</h3>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Subject:
              <GenericTextInput
                value={thankYouSubject}
                setValue={(value) => setThankYouSubject(String(value ?? ""))}
                placeholder="Thank you for supporting {{ campaign.title }}!"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Body (plain text):
              <textarea
                value={thankYouText}
                onChange={(e) => setThankYouText(e.target.value)}
                rows={5}
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontFamily: "monospace" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              Body (HTML):
              <textarea
                value={thankYouHtml}
                onChange={(e) => setThankYouHtml(e.target.value)}
                rows={5}
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontFamily: "monospace" }}
              />
            </label>

            <h3 style={{ marginBottom: "0.5rem" }}>Winner notification email template</h3>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Subject:
              <GenericTextInput
                value={winnerSubject}
                setValue={(value) => setWinnerSubject(String(value ?? ""))}
                placeholder="Congratulations! You won the {{ campaign.title }} giveaway!"
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
                inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Body (plain text):
              <textarea
                value={winnerText}
                onChange={(e) => setWinnerText(e.target.value)}
                rows={5}
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontFamily: "monospace" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              Body (HTML):
              <textarea
                value={winnerHtml}
                onChange={(e) => setWinnerHtml(e.target.value)}
                rows={5}
                style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontFamily: "monospace" }}
              />
            </label>

            <Button type="primary" htmlType="submit" loading={emailSettingsLoading}>
              {emailSettingsLoading ? "Saving..." : "Save email settings"}
            </Button>
          </form>
        </section>
      )}

      {/* Change Password */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Change password</h2>
        <form onSubmit={handlePasswordSubmit}>
          {passwordError && <div className="form-error mb-md">{passwordError}</div>}
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Current password:
            <GenericTextInput
              valueType="password"
              value={currentPassword}
              setValue={(value) => setCurrentPassword(String(value ?? ""))}
              autoComplete="current-password"
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            New password:
            <GenericTextInput
              valueType="password"
              value={newPassword}
              setValue={(value) => setNewPassword(String(value ?? ""))}
              autoComplete="new-password"
              minLength={8}
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Confirm new password:
            <GenericTextInput
              valueType="password"
              value={confirmPassword}
              setValue={(value) => setConfirmPassword(String(value ?? ""))}
              autoComplete="new-password"
              minLength={8}
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <Button type="primary" htmlType="submit" loading={passwordLoading}>
            {passwordLoading ? "Updating..." : "Change password"}
          </Button>
        </form>
      </section>

      {/* 2FA */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Two-Factor Authentication</h2>
        {twoFaError && <div className="form-error mb-md">{twoFaError}</div>}
        {twoFaSetup ? (
          <div>
            <p>Scan the QR code with your authenticator app, then enter the 6-digit code below.</p>
            <img src={twoFaSetup.qr_data_url} alt="QR code" style={{ display: "block", margin: "1rem 0", maxWidth: "200px" }} />
            <form onSubmit={handle2FaVerify}>
              <GenericTextInput
                value={twoFaCode}
                setValue={(value) =>
                  setTwoFaCode(String(value ?? "").replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                hideLabel
                wrapperStyle={{ marginBottom: 0, marginRight: "0.5rem", display: "inline-block" }}
                inputStyle={{ padding: "0.5rem" }}
              />
              <Button htmlType="submit" type="primary" loading={twoFaLoading}>Verify and enable</Button>
              <Button type="default" onClick={() => { setTwoFaSetup(null); setTwoFaCode(""); setTwoFaError(""); }}>Cancel</Button>
            </form>
          </div>
        ) : (
          <>
            <p>Protect your account with an authenticator app (e.g. Google Authenticator).</p>
            <Button type="primary" onClick={handle2FaSetup} loading={twoFaLoading} style={{ marginRight: "0.5rem" }}>
              Enable 2FA
            </Button>
            <form onSubmit={handle2FaDisable} style={{ display: "inline-block", marginTop: "1rem" }}>
              <p>To disable 2FA, enter your password and current 6-digit code:</p>
              <GenericTextInput
                valueType="password"
                value={twoFaDisablePassword}
                setValue={(value) => setTwoFaDisablePassword(String(value ?? ""))}
                placeholder="Password"
                hideLabel
                wrapperStyle={{ marginBottom: "0.5rem", display: "block" }}
                inputStyle={{ padding: "0.5rem" }}
              />
              <GenericTextInput
                value={twoFaDisableCode}
                setValue={(value) =>
                  setTwoFaDisableCode(String(value ?? "").replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                placeholder="6-digit code"
                maxLength={6}
                hideLabel
                wrapperStyle={{ marginBottom: "0.5rem", display: "block" }}
                inputStyle={{ padding: "0.5rem" }}
              />
              <Button htmlType="submit" danger loading={twoFaDisableLoading}>Disable 2FA</Button>
            </form>
          </>
        )}
      </section>

      {/* Delete Account */}
      <section style={{ marginTop: "3rem", borderTop: "1px solid #ccc", paddingTop: "2rem" }}>
        <h2 className="text-danger">Delete account</h2>
        <p>Your account will be anonymized. This cannot be undone.</p>
        <Button danger onClick={() => { setShowDeleteModal(true); setDeleteError(""); setDeletePassword(""); setDeleteCode(""); }}>
          Delete my account
        </Button>
      </section>

      <Modal isOpen={showDeleteModal} onClose={() => !deleteLoading && setShowDeleteModal(false)}>
        <h3 style={{ marginTop: 0 }}>Delete account?</h3>
        <p>Enter your password to confirm. If you have 2FA enabled, also enter your 6-digit code.</p>
        {deleteError && <p className="form-error mb-sm">{deleteError}</p>}
        <form onSubmit={handleDeleteAccount}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Password:
            <GenericTextInput
              valueType="password"
              value={deletePassword}
              setValue={(value) => setDeletePassword(String(value ?? ""))}
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            2FA code (if enabled):
            <GenericTextInput
              value={deleteCode}
              setValue={(value) =>
                setDeleteCode(String(value ?? "").replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
              inputStyle={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button danger htmlType="submit" loading={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete account"}
            </Button>
            <Button type="default" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
