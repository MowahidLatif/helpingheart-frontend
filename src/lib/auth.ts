export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

type AuthClaims = {
  role?: string;
  permissions?: string[];
  [key: string]: unknown;
};

function decodeTokenClaims(token: string): AuthClaims | null {
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
  const token = localStorage.getItem("token");
  if (!token) return null;
  return decodeTokenClaims(token);
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

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/signin";
}
