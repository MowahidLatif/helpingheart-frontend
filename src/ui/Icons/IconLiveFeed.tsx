export function IconLiveFeed({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Activity bars */}
      <rect x="5" y="12" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="5" y="12" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.5" />

      <rect x="5" y="19" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="5" y="19" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.5" />

      <rect x="5" y="26" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="5" y="26" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.5" />

      {/* Live pulse dot */}
      <circle cx="33" cy="10" r="3.5" fill="currentColor" opacity="0.2" />
      <circle cx="33" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}
