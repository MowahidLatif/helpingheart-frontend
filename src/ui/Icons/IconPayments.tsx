export function IconPayments({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Credit card */}
      <rect x="4" y="9" width="26" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="4" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.8" />
      <rect x="7" y="18" width="8" height="2.5" rx="1" fill="currentColor" opacity="0.3" />
      {/* Shield with checkmark */}
      <path d="M30 23 C30 23 27 21.5 27 19 L27 16.5 L33 16.5 L33 19 C33 21.5 30 23 30 23Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M28.3 19.3 L29.5 20.5 L31.7 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
