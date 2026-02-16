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

export default function OrgUsersPage() {
  const { orgId } = useOutletContext<OutletContext>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPermissions, setCreatePermissions] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingPermissionsFor, setEditingPermissionsFor] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

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
      setSuccess("Account created successfully.");
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      setCreatePermissions([]);
      setShowCreate(false);
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
  if (loading) return <p>Loading members...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Organization Users</h1>
      {success && (
        <div style={{ color: "green", marginBottom: "1rem" }}>{success}</div>
      )}
      <button
        type="button"
        onClick={() => setShowCreate(!showCreate)}
        style={{ marginBottom: "1rem" }}
      >
        {showCreate ? "Cancel" : "Create account"}
      </button>

      {showCreate && (
        <form
          onSubmit={handleCreateSubmit}
          style={{
            border: "1px solid #ddd",
            padding: "1rem",
            marginBottom: "1rem",
            maxWidth: "400px",
          }}
        >
          <h3>Create new account</h3>
          {createError && (
            <div style={{ color: "red", marginBottom: "0.5rem" }}>{createError}</div>
          )}
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email *
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              required
              style={{ display: "block", width: "100%", padding: "0.25rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Temporary password * (min 8 characters)
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              minLength={8}
              required
              style={{ display: "block", width: "100%", padding: "0.25rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Name
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              style={{ display: "block", width: "100%", padding: "0.25rem" }}
            />
          </label>
          <div style={{ marginBottom: "0.5rem" }}>Permissions</div>
          {ORG_PERMISSIONS.map((perm) => (
            <label key={perm} style={{ display: "block", marginLeft: "1rem" }}>
              <input
                type="checkbox"
                checked={createPermissions.includes(perm)}
                onChange={() => toggleCreatePermission(perm)}
              />{" "}
              {perm}
            </label>
          ))}
          <button type="submit" disabled={createLoading} style={{ marginTop: "0.5rem" }}>
            {createLoading ? "Creating..." : "Create account"}
          </button>
        </form>
      )}

      <h2>Members</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
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
              <td style={{ padding: "0.5rem" }}>
                {(m.permissions || []).length
                  ? (m.permissions || []).join(", ")
                  : "—"}
              </td>
              <td style={{ padding: "0.5rem" }}>
                {m.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => openEditPermissions(m)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Edit permissions
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            <h3>Edit permissions</h3>
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
                  />{" "}
                  {perm}
                </label>
              ))}
              <div style={{ marginTop: "1rem" }}>
                <button type="submit" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPermissionsFor(null)}
                  style={{ marginLeft: "0.5rem" }}
                >
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
              <li key={s.id} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{s.name}</span>
                <button type="button" onClick={() => handleDelete(s.id)} style={{ fontSize: "0.85rem" }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleCreate} style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
