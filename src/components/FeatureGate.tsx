import { Link } from "react-router-dom";
import { TIER_LIMITS, TIER_NAMES } from "@/lib/tierFeatures";
import type { TierLimits, TierKey } from "@/lib/tierFeatures";

interface FeatureGateProps {
  feature: keyof TierLimits;
  orgTier: number;
  children?: React.ReactNode;
  lockedMessage?: string;
  inline?: boolean;
}

function getMinTierForFeature(feature: keyof TierLimits): TierKey | null {
  for (const t of [1, 2, 3] as TierKey[]) {
    if (TIER_LIMITS[t][feature]) return t;
  }
  return null;
}

export function FeatureGate({ feature, orgTier, children, lockedMessage, inline }: FeatureGateProps) {
  const tierKey = Math.max(1, Math.min(3, orgTier)) as TierKey;
  const allowed = !!TIER_LIMITS[tierKey][feature];

  if (allowed) return <>{children}</>;

  const minTier = getMinTierForFeature(feature);
  const defaultMsg = minTier
    ? `This feature is available on the ${TIER_NAMES[minTier]} plan and above.`
    : "This feature is not available on your current plan.";

  if (inline) {
    return (
      <span className="tier-gate-inline">
        {lockedMessage ?? defaultMsg}{" "}
        <Link to="/settings">Upgrade</Link>
      </span>
    );
  }

  return (
    <div className="tier-gate-banner">
      <span>{lockedMessage ?? defaultMsg}</span>
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "1rem" }}>
        <Link to="/settings">Upgrade in Settings</Link>
        <Link to="/pricing" style={{ color: "#666" }}>View plans</Link>
      </div>
    </div>
  );
}
