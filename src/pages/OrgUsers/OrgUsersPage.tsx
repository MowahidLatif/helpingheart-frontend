import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS, ORG_PERMISSIONS } from "@/lib/constants";

type Member = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  permissions: string[];
};

type OutletContext = { orgId: string | null; role: string | null };

type Tab = "members" | "create";

export default function OrgUsersPage() {
  const { orgId, role: viewerRole } = useOutletContext<OutletContext>();
  const [activeTab, setActiveTab] = useState<Tab>("members");

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const loadMembers = async () => {
    if (!orgId) return;
    setError("");
    try {
      const res = await api.get<Member[]>(API_ENDPOINTS.orgs.members(orgId));
      setMembers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      setLoading(true);
      loadMembers();
    }
  }, [orgId]);

  // Clear global success/error when switching tabs
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSuccess("");
    setError("");
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
      setSuccess(`${addEmail.trim()} has been added to the organization.`);
      setAddEmail("");
      setAddRole("member");
      loadMembers();
    } catch (err) {
      setAddError(getErrorMessage(err));
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
      setSuccess("Account created and added to the organization.");
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      setCreatePermissions([]);
      loadMembers();
    } catch (err) {
      setCreateError(getErrorMessage(err));
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
      setSuccess("Permissions updated.");
      setEditingPermissionsFor(null);
      loadMembers();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const removeMember = async (member: Member) => {
    if (!orgId) return;
    if (
      !window.confirm(
        `Remove ${member.email} from the organization? Their task assignments will be cleared.`
      )
    )
      return;
    setRemoveLoadingId(member.id);
    setError("");
    try {
      await api.delete(API_ENDPOINTS.orgs.deleteMember(orgId, member.id));
      setSuccess(`${member.email} has been removed.`);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemoveLoadingId(null);
    }
  };

  const changeRole = async (member: Member, newRole: string) => {
    if (!orgId || newRole === member.role) return;
    setRoleLoadingId(member.id);
    setError("");
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
      setSuccess(`${member.email}'s role updated to ${newRole}.`);
      loadMembers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRoleLoadingId(null);
    }
  };

  const resetPassword = async (member: Member) => {
    if (
      !window.confirm(
        `Send a password reset email to ${member.email}? They will receive a link to set a new password.`
      )
    )
      return;
    setResetLoadingId(member.id);
    setError("");
    try {
      await api.post(API_ENDPOINTS.auth.forgotPassword, { email: member.email });
      setSuccess(`Password reset email sent to ${member.email}.`);
    } catch (err) {
      setError(getErrorMessage(err));
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

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Organization Users</h1>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #ddd",
          marginBottom: "1.5rem",
          gap: "0",
        }}
      >
        {(
          [
            { key: "members", label: "All Members" },
            { key: "create", label: "Create Account" },
          ] as { key: Tab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            style={{
              padding: "0.5rem 1.25rem",
              border: "none",
              borderBottom: activeTab === key ? "2px solid #333" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: activeTab === key ? 600 : 400,
              color: activeTab === key ? "#111" : "#666",
              marginBottom: "-2px",
              fontSize: "0.95rem",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Global feedback */}
      {success && (
        <div style={{ color: "green", marginBottom: "1rem" }}>{success}</div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

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
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  style={{ display: "block", width: "100%", padding: "0.35rem 0.5rem" }}
                />
              </label>
              <label style={{ display: "block", flex: "0 0 auto" }}>
                <span style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.25rem" }}>
                  Role
                </span>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  style={{ padding: "0.35rem 0.5rem" }}
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={addLoading}
                style={{ padding: "0.35rem 0.9rem", alignSelf: "flex-end" }}
              >
                {addLoading ? "Adding..." : "Add user"}
              </button>
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
                              <select
                                value={m.role}
                                disabled={roleLoadingId === m.id}
                                onChange={(e) => changeRole(m, e.target.value)}
                              >
                                <option value="admin">admin</option>
                                <option value="member">member</option>
                              </select>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditPermissions(m)}
                            >
                              Edit permissions
                            </button>
                            <button
                              type="button"
                              onClick={() => resetPassword(m)}
                              disabled={resetLoadingId === m.id}
                            >
                              {resetLoadingId === m.id ? "Sending..." : "Reset password"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMember(m)}
                              disabled={removeLoadingId === m.id}
                            >
                              {removeLoadingId === m.id ? "Removing..." : "Remove"}
                            </button>
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
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                style={{ display: "block", width: "100%", padding: "0.35rem 0.5rem", marginTop: "0.25rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              Temporary password * (min 8 characters)
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                minLength={8}
                required
                style={{ display: "block", width: "100%", padding: "0.35rem 0.5rem", marginTop: "0.25rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              Name
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                style={{ display: "block", width: "100%", padding: "0.35rem 0.5rem", marginTop: "0.25rem" }}
              />
            </label>
            <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>Permissions</div>
            {ORG_PERMISSIONS.map((perm) => (
              <label key={perm} style={{ display: "block", marginLeft: "0.25rem", marginBottom: "0.25rem" }}>
                <input
                  type="checkbox"
                  checked={createPermissions.includes(perm)}
                  onChange={() => toggleCreatePermission(perm)}
                  style={{ marginRight: "0.4rem" }}
                />
                {perm}
              </label>
            ))}
            <button
              type="submit"
              disabled={createLoading}
              style={{ marginTop: "1rem", padding: "0.4rem 1rem" }}
            >
              {createLoading ? "Creating..." : "Create account"}
            </button>
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
                  <input
                    type="checkbox"
                    checked={editPermissions.includes(perm)}
                    onChange={() => toggleEditPermission(perm)}
                    style={{ marginRight: "0.4rem" }}
                  />
                  {perm}
                </label>
              ))}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <button type="submit" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditingPermissionsFor(null)}>
                  Cancel
                </button>
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

  const loadStatuses = async () => {
    try {
      const res = await api.get<TaskStatus[]>(API_ENDPOINTS.orgs.taskStatuses(orgId));
      setStatuses(res.data || []);
    } catch {
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, [orgId]);

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
    if (!confirm("Delete this status? It will fail if any task uses it.")) return;
    try {
      await api.delete(`${API_ENDPOINTS.orgs.taskStatuses(orgId)}/${id}`);
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
                    <input
                      type="text"
                      value={editingStatusName}
                      onChange={(e) => setEditingStatusName(e.target.value)}
                      style={{ padding: "0.2rem 0.4rem", width: "180px" }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={renameLoading || !editingStatusName.trim()}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {renameLoading ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={cancelEdit} style={{ fontSize: "0.85rem" }}>
                      Cancel
                    </button>
                    {renameError && (
                      <span style={{ color: "red", fontSize: "0.85rem" }}>{renameError}</span>
                    )}
                  </form>
                ) : (
                  <>
                    <span>{s.name}</span>
                    <button type="button" onClick={() => startEdit(s)} style={{ fontSize: "0.85rem" }}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      style={{ fontSize: "0.85rem" }}
                    >
                      Delete
                    </button>
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
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New status name"
              style={{ padding: "0.25rem", width: "200px" }}
            />
            <button type="submit" disabled={createLoading || !newName.trim()}>
              {createLoading ? "Adding..." : "Add status"}
            </button>
            {createError && <span style={{ color: "red" }}>{createError}</span>}
          </form>
        </>
      )}
    </section>
  );
}
