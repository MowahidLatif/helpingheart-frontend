export function IconShare({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* URL bar */}
      <rect x="4" y="16" width="26" height="9" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="20.5" r="1.5" fill="currentColor" opacity="0.35" />
      <rect x="14" y="19" width="12" height="2.5" rx="1.25" fill="currentColor" opacity="0.25" />
      {/* Outward arrow */}
      <path d="M32 12 L36 8 M36 8 L31 8 M36 8 L36 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
