const MAX_URL_LEN = 2048;

function parseAllowlistHosts(): string[] {
  const raw = import.meta.env.VITE_MEDIA_URL_HOSTS as string | undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
}

function isDevHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "127.0.0.1" || h === "localhost" || h === "::1" || h.endsWith(".local");
}

/**
 * Defense-in-depth: only load recipe media from configured hosts (HTTPS; HTTP only on dev hosts).
 * Set VITE_MEDIA_URL_HOSTS to match backend AI_SITE_MEDIA_URL_HOSTS / PUBLIC_MEDIA_BASE_URL host(s).
 * In production with an empty allowlist, all recipe media URLs are blocked.
 */
export function isAllowedRecipeMediaUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (!u || u.length > MAX_URL_LEN) return false;
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return false;
  }
  if (parsed.username || parsed.password) return false;
  const scheme = parsed.protocol.replace(/:$/, "").toLowerCase();
  const host = parsed.hostname.toLowerCase();
  if (scheme === "https") {
    /* ok */
  } else if (scheme === "http" && isDevHost(host)) {
    /* ok */
  } else {
    return false;
  }
  const hosts = parseAllowlistHosts();
  if (hosts.length > 0) {
    return hosts.includes(host);
  }
  if (import.meta.env.PROD) {
    return false;
  }
  return isDevHost(host);
}
