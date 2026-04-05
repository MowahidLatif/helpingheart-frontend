import { API_BASE_URL } from './constants';

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("user");
}

type AuthClaims = {
  role?: string;
  permissions?: string[];
  org_id?: string;
  [key: string]: unknown;
};

export function decodeTokenClaims(token: string): AuthClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as AuthClaims;
  } catch {
    return null;
  }
}

export function getAuthClaims(): AuthClaims | null {
  const user = getUser();
  if (!user) return null;
  return {
    role: user.role,
    permissions: user.permissions,
    org_id: user.org_id,
  };
}

export function hasAnyRole(allowedRoles: string[]): boolean {
  if (!allowedRoles.length) return true;
  const claims = getAuthClaims();
  const role = (claims?.role || "").toLowerCase();
  return allowedRoles.map((r) => r.toLowerCase()).includes(role);
}

export function hasPermissions(requiredPermissions: string[]): boolean {
  if (!requiredPermissions.length) return true;
  const claims = getAuthClaims();
  const role = (claims?.role || "").toLowerCase();
  if (role === "owner" || role === "admin") return true;
  const user = getUser();
  const granted = Array.isArray(claims?.permissions)
    ? claims.permissions
    : Array.isArray(user?.permissions)
      ? user.permissions
      : [];
  if (!granted.length) {
    // Backward compatibility until permissions are consistently included in auth payloads.
    return true;
  }
  return requiredPermissions.every((perm) => granted.includes(perm));
}

export function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

export function logout(): void {
  // Clear all local auth state (including any legacy token keys)
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  // Ask server to unset HttpOnly cookies; fire-and-forget
  fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    keepalive: true,
  }).catch(() => {});
  window.location.href = "/signin";
}
