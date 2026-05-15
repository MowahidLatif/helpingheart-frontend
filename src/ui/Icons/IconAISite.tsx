export function IconAISite({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Browser frame */}
      <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="4" y1="13" x2="28" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="11" cy="10.5" r="1" fill="currentColor" opacity="0.4" />
      {/* Content lines inside browser */}
      <rect x="7" y="16" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      <rect x="7" y="19.5" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      {/* Sparkle rays — AI generation */}
      <line x1="32" y1="12" x2="35" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="33" y1="17" x2="37" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="32" y1="22" x2="35" y2="25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="31" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}
