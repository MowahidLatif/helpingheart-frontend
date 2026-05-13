import React, { useState, useEffect, useCallback } from "react";
import { Button, Checkbox, Input, Select, Tabs } from "antd";
import { useOutletContext } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS, ORG_PERMISSIONS } from "@/lib/constants";
import { confirmAction } from "@/lib/dialogs";
import { notifyError, notifySuccess } from "@/lib/notifications";

type Member = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
};

type OutletContext = {
  orgId: string | null;
  role: string | null;
  orgTierInfo?: import("@/lib/tierFeatures").OrgTierInfo | null;
};

type Tab = "members" | "create";

export default function OrgUsersPage() {
  const { orgId, role: viewerRole, orgTierInfo } = useOutletContext<OutletContext>();
  const orgTier = orgTierInfo?.tier ?? 1;
  const maxMembers = orgTierInfo?.limits?.max_members ?? 1;
  const memberCount = orgTierInfo?.usage?.member_count ?? 0;
  const [activeTab, setActiveTab] = useState<Tab>("members");

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Add existing user
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("member");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Create new account
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPermissions, setCreatePermissions] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit permissions modal
  const [editingPermissionsFor, setEditingPermissionsFor] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Per-row loading states
  const [removeLoadingId, setRemoveLoadingId] = useState<string | null>(null);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);
  const [resetLoadingId, setResetLoadingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await api.get<Member[]>(API_ENDPOINTS.orgs.members(orgId));
      setMembers(res.data);
    } catch (err) {
      notifyError(err, "Failed to load organization members.");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      setLoading(true);
      loadMembers();
    }
  }, [orgId, loadMembers]);

  // Clear inline form errors when switching tabs
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setAddError("");
    setCreateError("");
  };

  const handleAddExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setAddError("");
    if (!addEmail.trim()) {
      setAddError("Email is required.");
      return;
    }
    setAddLoading(true);
    try {
      await api.post(API_ENDPOINTS.orgs.addMember(orgId), {
        email: addEmail.trim().toLowerCase(),
        role: addRole,
      });
      notifySuccess(`${addEmail.trim()} has been added to the organization.`);
      setAddEmail("");
      setAddRole("member");
      loadMembers();
    } catch (err) {
      notifyError(err, "Failed to add user to organization.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setCreateError("");
    if (!createEmail.trim() || !createPassword.trim()) {
      setCreateError("Email and password are required.");
      return;
    }
    if (createPassword.length < 8) {
      setCreateError("Password must be at least 8 characters.");
      return;
    }
    setCreateLoading(true);
    try {
      await api.post(API_ENDPOINTS.orgs.createMember(orgId), {
        email: createEmail.trim().toLowerCase(),
        password: createPassword,
        name: createName.trim() || undefined,
        permissions: createPermissions,
      });
      notifySuccess("Account created and added to the organization.");
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      setCreatePermissions([]);
      loadMembers();
    } catch (err) {
      notifyError(err, "Failed to create account.");
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditPermissions = (member: Member) => {
    setEditingPermissionsFor(member.id);
    setEditPermissions(member.permissions || []);
    setEditError("");
  };

  const handleEditPermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !editingPermissionsFor) return;
    setEditError("");
    setEditLoading(true);
    try {
      await api.put(API_ENDPOINTS.orgs.memberPermissions(orgId, editingPermissionsFor), {
        permissions: editPermissions,
      });
      notifySuccess("Permissions updated.");
      setEditingPermissionsFor(null);
      loadMembers();
    } catch (err) {
      notifyError(err, "Failed to update permissions.");
    } finally {
      setEditLoading(false);
    }
  };

  const removeMember = async (member: Member) => {
    if (!orgId) return;
    const shouldRemove = await confirmAction({
      title: "Remove member?",
      content: `Remove ${member.email} from the organization? Their task assignments will be cleared.`,
      okText: "Remove",
      cancelText: "Cancel",
      danger: true,
    });
    if (!shouldRemove) return;
    setRemoveLoadingId(member.id);
    try {
      await api.delete(API_ENDPOINTS.orgs.deleteMember(orgId, member.id));
      notifySuccess(`${member.email} has been removed.`);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err) {
      notifyError(err, "Failed to remove member.");
    } finally {
      setRemoveLoadingId(null);
    }
  };

  const changeRole = async (member: Member, newRole: string) => {
    if (!orgId || newRole === member.role) return;
    setRoleLoadingId(member.id);
    try {
      if (newRole === "admin") {
        const currentAdmin = members.find((m) => m.role === "admin" && m.id !== member.id);
        if (currentAdmin) {
          await api.patch(API_ENDPOINTS.orgs.memberRole(orgId, currentAdmin.id), {
            role: "member",
          });
        }
      }
      await api.patch(API_ENDPOINTS.orgs.memberRole(orgId, member.id), { role: newRole });
      notifySuccess(`${member.email}'s role updated to ${newRole}.`);
      loadMembers();
    } catch (err) {
      notifyError(err, "Failed to update role.");
    } finally {
      setRoleLoadingId(null);
    }
  };

  const resetPassword = async (member: Member) => {
    const shouldReset = await confirmAction({
      title: "Send password reset email?",
      content: `Send a password reset email to ${member.email}? They will receive a link to set a new password.`,
      okText: "Send email",
      cancelText: "Cancel",
    });
    if (!shouldReset) return;
    setResetLoadingId(member.id);
    try {
      await api.post(API_ENDPOINTS.auth.forgotPassword, { email: member.email });
      notifySuccess(`Password reset email sent to ${member.email}.`);
    } catch (err) {
      notifyError(err, "Failed to send password reset email.");
    } finally {
      setResetLoadingId(null);
    }
  };

  const toggleCreatePermission = (perm: string) => {
    setCreatePermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleEditPermission = (perm: string) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  if (!orgId) return <p>Loading organization...</p>;

  if (orgTier < 2) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>Organization Users</h1>
        <div className="tier-gate-banner">
          <strong>Team Management</strong> is available on the Grow plan and above.{" "}
          Upgrade to add team members, assign roles, and collaborate on campaigns.{" "}
          <a href="/pricing">See pricing →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Organization Users</h1>
      {orgTier === 2 && maxMembers !== null && (
        <p style={{ color: memberCount >= maxMembers ? "red" : "#666", marginBottom: "0.75rem" }}>
          Team members: {memberCount} / {maxMembers}
          {memberCount >= maxMembers && " — limit reached. Upgrade to Scale for unlimited members."}
        </p>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(key) => switchTab(key as Tab)}
        items={[
          { key: "members", label: "All Members" },
          { key: "create", label: "Create Account" },
        ]}
      />

      {/* ── All Members tab ── */}
      {activeTab === "members" && (
        <>
          {/* Add existing user form */}
          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "1.5rem",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Add existing user by email</h3>
            {addError && (
              <div style={{ color: "red", marginBottom: "0.5rem" }}>{addError}</div>
            )}
            <form
              onSubmit={handleAddExistingSubmit}
              style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}
            >
              <label style={{ display: "block", flex: "1 1 200px" }}>
                <span style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.25rem" }}>
                  Email
                </span>
                <Input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </label>
              <label style={{ display: "block", flex: "0 0 auto" }}>
                <span style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.25rem" }}>
                  Role
                </span>
                <Select
                  value={addRole}
                  onChange={setAddRole}
                  style={{ minWidth: 120 }}
                  options={[
                    { value: "member", label: "member" },
                    { value: "admin", label: "admin" },
                  ]}
                />
              </label>
              <Button
                type="primary"
                htmlType="submit"
                loading={addLoading}
                disabled={maxMembers !== null && memberCount >= maxMembers}
                title={maxMembers !== null && memberCount >= maxMembers ? "Member limit reached. Upgrade to Scale." : undefined}
                style={{ alignSelf: "flex-end" }}
              >
                {addLoading ? "Adding..." : "Add user"}
              </Button>
            </form>
          </section>

          {/* Members table */}
          <h2 style={{ marginBottom: "0.75rem" }}>
            Members{" "}
            <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "#666" }}>
              ({members.length})
            </span>
          </h2>

          {loading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p style={{ color: "#666" }}>No members yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "600px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Role</th>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Permissions</th>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "0.5rem" }}>{m.email}</td>
                      <td style={{ padding: "0.5rem" }}>{m.name || "—"}</td>
                      <td style={{ padding: "0.5rem" }}>{m.role}</td>
                      <td style={{ padding: "0.5rem", maxWidth: "220px" }}>
                        {(m.permissions || []).length
                          ? (m.permissions || []).join(", ")
                          : "—"}
                      </td>
                      <td style={{ padding: "0.5rem" }}>
                        {m.role !== "owner" ? (
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {viewerRole === "owner" && (
                              <Select
                                value={m.role}
                                loading={roleLoadingId === m.id}
                                onChange={(value) => changeRole(m, value)}
                                style={{ minWidth: 120 }}
                                options={[
                                  { value: "admin", label: "admin" },
                                  { value: "member", label: "member" },
                                ]}
                              />
                            )}
                            <Button type="default" onClick={() => openEditPermissions(m)}>
                              Edit permissions
                            </Button>
                            <Button
                              type="default"
                              onClick={() => resetPassword(m)}
                              loading={resetLoadingId === m.id}
                            >
                              {resetLoadingId === m.id ? "Sending..." : "Reset password"}
                            </Button>
                            <Button
                              danger
                              onClick={() => removeMember(m)}
                              loading={removeLoadingId === m.id}
                            >
                              {removeLoadingId === m.id ? "Removing..." : "Remove"}
                            </Button>
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: "0.85rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Create Account tab ── */}
      {activeTab === "create" && (
        <div style={{ maxWidth: "420px" }}>
          <h2 style={{ marginTop: 0 }}>Create new account</h2>
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Creates a brand-new user account and adds them to this organization.
          </p>
          {createError && (
            <div style={{ color: "red", marginBottom: "0.75rem" }}>{createError}</div>
          )}
          <form onSubmit={handleCreateSubmit}>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              Email *
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                style={{ marginTop: "0.25rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              Temporary password * (min 8 characters)
              <Input.Password
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                minLength={8}
                required
                style={{ marginTop: "0.25rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              Name
              <Input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                style={{ marginTop: "0.25rem" }}
              />
            </label>
            <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>Permissions</div>
            {ORG_PERMISSIONS.map((perm) => (
              <label key={perm} style={{ display: "block", marginLeft: "0.25rem", marginBottom: "0.25rem" }}>
                <Checkbox
                  checked={createPermissions.includes(perm)}
                  onChange={() => toggleCreatePermission(perm)}
                  style={{ marginRight: "0.4rem" }}
                />
                {perm}
              </label>
            ))}
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading}
              style={{ marginTop: "1rem" }}
            >
              {createLoading ? "Creating..." : "Create account"}
            </Button>
          </form>
        </div>
      )}

      {/* Edit permissions modal */}
      {editingPermissionsFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          onClick={() => setEditingPermissionsFor(null)}
        >
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Edit permissions</h3>
            {editError && (
              <div style={{ color: "red", marginBottom: "0.5rem" }}>{editError}</div>
            )}
            <form onSubmit={handleEditPermissionsSubmit}>
              {ORG_PERMISSIONS.map((perm) => (
                <label key={perm} style={{ display: "block", marginBottom: "0.25rem" }}>
                  <Checkbox
                    checked={editPermissions.includes(perm)}
                    onChange={() => toggleEditPermission(perm)}
                    style={{ marginRight: "0.4rem" }}
                  />
                  {perm}
                </label>
              ))}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <Button htmlType="submit" type="primary" loading={editLoading}>
                  {editLoading ? "Saving..." : "Save"}
                </Button>
                <Button type="default" onClick={() => setEditingPermissionsFor(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TaskStatusesSection orgId={orgId} />
    </div>
  );
}

type TaskStatus = { id: string; name: string; sort_order: number };

function TaskStatusesSection({ orgId }: { orgId: string }) {
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingStatusName, setEditingStatusName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState("");

  const loadStatuses = useCallback(async () => {
    try {
      const res = await api.get<TaskStatus[]>(API_ENDPOINTS.orgs.taskStatuses(orgId));
      setStatuses(res.data || []);
    } catch {
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateError("");
    setCreateLoading(true);
    try {
      await api.post(API_ENDPOINTS.orgs.taskStatuses(orgId), { name: newName.trim() });
      setNewName("");
      loadStatuses();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = await confirmAction({
      title: "Delete status?",
      content: "Delete this status? It will fail if any task uses it.",
      okText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });
    if (!shouldDelete) return;
    try {
      await api.delete(API_ENDPOINTS.orgs.taskStatus(orgId, id));
      loadStatuses();
    } catch {
      // ignore
    }
  };

  const startEdit = (s: TaskStatus) => {
    setEditingStatusId(s.id);
    setEditingStatusName(s.name);
    setRenameError("");
  };

  const cancelEdit = () => {
    setEditingStatusId(null);
    setEditingStatusName("");
    setRenameError("");
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatusId || !editingStatusName.trim()) return;
    setRenameLoading(true);
    setRenameError("");
    try {
      await api.patch(API_ENDPOINTS.orgs.taskStatus(orgId, editingStatusId), {
        name: editingStatusName.trim(),
      });
      setEditingStatusId(null);
      setEditingStatusName("");
      loadStatuses();
    } catch (err) {
      setRenameError(getErrorMessage(err));
    } finally {
      setRenameLoading(false);
    }
  };

  return (
    <section style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
      <h2>Task statuses</h2>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Statuses you can assign to campaign tasks (e.g. Not started, In progress, Completed).
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {statuses.map((s) => (
              <li
                key={s.id}
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {editingStatusId === s.id ? (
                  <form
                    onSubmit={handleRename}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Input
                      value={editingStatusName}
                      onChange={(e) => setEditingStatusName(e.target.value)}
                      style={{ width: "180px" }}
                      autoFocus
                    />
                    <Button
                      htmlType="submit"
                      type="primary"
                      loading={renameLoading}
                      disabled={!editingStatusName.trim()}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {renameLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button type="default" onClick={cancelEdit} style={{ fontSize: "0.85rem" }}>
                      Cancel
                    </Button>
                    {renameError && (
                      <span style={{ color: "red", fontSize: "0.85rem" }}>{renameError}</span>
                    )}
                  </form>
                ) : (
                  <>
                    <span>{s.name}</span>
                    <Button type="default" onClick={() => startEdit(s)} style={{ fontSize: "0.85rem" }}>
                      Edit
                    </Button>
                    <Button
                      type="default"
                      danger
                      onClick={() => handleDelete(s.id)}
                      style={{ fontSize: "0.85rem" }}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <form
            onSubmit={handleCreate}
            style={{
              marginTop: "0.5rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New status name"
              style={{ width: "200px" }}
            />
            <Button htmlType="submit" type="primary" loading={createLoading} disabled={!newName.trim()}>
              {createLoading ? "Adding..." : "Add status"}
            </Button>
            {createError && <span style={{ color: "red" }}>{createError}</span>}
          </form>
        </>
      )}
    </section>
  );
}
