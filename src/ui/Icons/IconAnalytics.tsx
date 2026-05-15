export function IconAnalytics({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Axes */}
      <line x1="7" y1="30" x2="7" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
      <line x1="7" y1="30" x2="35" y2="30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
      {/* Bars */}
      <rect x="10" y="22" width="5" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="18" y="17" width="5" height="13" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="26" y="12" width="5" height="18" rx="1" fill="currentColor" />
      {/* Trend line */}
      <path d="M12.5 21 L20.5 16 L28.5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
