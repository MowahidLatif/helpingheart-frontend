export function IconEmbed({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Code brackets */}
      <path d="M11 14 L6 20 L11 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 14 L34 20 L29 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Progress bar inside */}
      <rect x="13" y="19" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="13" y="19" width="9" height="3" rx="1.5" fill="currentColor" opacity="0.65" />
    </svg>
  );
}
