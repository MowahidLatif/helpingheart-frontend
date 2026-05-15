export function IconTeam({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Person 1 */}
      <circle cx="15" cy="13" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 30 C5 24.5 9.5 20 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Person 2 (offset, slightly behind) */}
      <circle cx="25" cy="13" r="5" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
      <path d="M25 20 C30.5 20 35 24.5 35 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      {/* Check badge */}
      <circle cx="31" cy="9" r="5" fill="currentColor" />
      <path d="M28.5 9 L30.2 10.8 L33.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
