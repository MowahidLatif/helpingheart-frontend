/**
 * Detect org public hostname: {subdomain}.{VITE_PUBLIC_SITE_HOST_SUFFIX}
 * e.g. client-name.helpinghands.ca → client-name
 * When unset or on localhost, returns null (use /donate/:org/:slug paths).
 */
export function getTenantOrgSubdomainFromHost(): string | null {
  if (typeof window === "undefined") return null;
  const suffix = (import.meta.env.VITE_PUBLIC_SITE_HOST_SUFFIX as string | undefined)
    ?.toLowerCase()
    .trim();
  if (!suffix) return null;
  const host = window.location.hostname.toLowerCase();
  if (host === suffix || host === `www.${suffix}`) return null;
  const needle = `.${suffix}`;
  if (!host.endsWith(needle)) return null;
  const sub = host.slice(0, -needle.length);
  if (!sub || sub === "www") return null;
  return sub;
}
