export function IconLaunch({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Campaign page lines */}
      <rect x="6" y="14" width="16" height="2" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="6" y="19" width="12" height="2" rx="1" fill="currentColor" opacity="0.25" />
      <rect x="6" y="24" width="14" height="2" rx="1" fill="currentColor" opacity="0.25" />
      {/* Upward arrow */}
      <path d="M28 28 L28 12 M28 12 L22 18 M28 12 L34 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Go-live dot */}
      <circle cx="28" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}
