export type TierKey = 1 | 2 | 3;

export interface TierLimits {
  name: string;
  monthly_price: number;
  /** Retained for API compatibility; not shown in UI */
  platform_fee_percent: number;
  max_active_campaigns: number | null;
  max_members: number | null;
  ai_gen_lifetime: number | null;
  ai_gen_per_month: number | null;
  task_management: boolean;
  task_management_full: boolean;
  email_marketing: boolean;
  giveaway: boolean;
  iframe_embed: boolean;
  media_uploads: boolean;
  campaign_updates: boolean;
  basic_analytics: boolean;
  advanced_analytics: boolean;
}

export const TIER_LIMITS: Record<TierKey, TierLimits> = {
  1: {
    name: "Starter",
    monthly_price: 10,
    platform_fee_percent: 3,
    max_active_campaigns: 1,
    max_members: 1,
    ai_gen_lifetime: null,
    ai_gen_per_month: 3,
    task_management: false,
    task_management_full: false,
    email_marketing: false,
    giveaway: false,
    iframe_embed: false,
    media_uploads: false,
    campaign_updates: false,
    basic_analytics: false,
    advanced_analytics: false,
  },
  2: {
    name: "Grow",
    monthly_price: 40,
    platform_fee_percent: 4,
    max_active_campaigns: 3,
    max_members: 5,
    ai_gen_lifetime: null,
    ai_gen_per_month: 15,
    task_management: true,
    task_management_full: false,
    email_marketing: false,
    giveaway: false,
    iframe_embed: true,
    media_uploads: true,
    campaign_updates: true,
    basic_analytics: true,
    advanced_analytics: false,
  },
  3: {
    name: "Scale",
    monthly_price: 100,
    platform_fee_percent: 5,
    max_active_campaigns: null,
    max_members: null,
    ai_gen_lifetime: null,
    ai_gen_per_month: null,
    task_management: true,
    task_management_full: true,
    email_marketing: true,
    giveaway: true,
    iframe_embed: true,
    media_uploads: true,
    campaign_updates: true,
    basic_analytics: true,
    advanced_analytics: true,
  },
};

export const TIER_NAMES: Record<TierKey, string> = { 1: "Starter", 2: "Grow", 3: "Scale" };
export const TIER_PRICE: Record<TierKey, number> = { 1: 10, 2: 40, 3: 100 };

export function formatMonthlyPrice(tier: TierKey): string {
  return `$${TIER_PRICE[tier]}/mo`;
}

export function formatMonthlyPriceLong(tier: TierKey): string {
  return `$${TIER_PRICE[tier]}/month`;
}

export function tierHasFeature(tier: TierKey, feature: keyof TierLimits): boolean {
  return !!TIER_LIMITS[tier][feature];
}

export function getAiGenLabel(tier: TierKey): string {
  const limits = TIER_LIMITS[tier];
  if (limits.ai_gen_lifetime !== null) return `${limits.ai_gen_lifetime} lifetime`;
  if (limits.ai_gen_per_month !== null) return `${limits.ai_gen_per_month}/month`;
  return "Unlimited";
}

export function getTierCardFeatures(tier: TierKey): string[] {
  if (tier === 1) {
    return [
      "1 admin user",
      "1 active campaign at a time",
      `AI site builder: ${getAiGenLabel(1)} generations`,
      "Campaign page with custom subdomain",
      "Real-time donation feed",
      "Automated donor email receipts",
      "Stripe Connect payouts",
    ];
  }
  if (tier === 2) {
    return [
      "Up to 5 team members",
      "Up to 3 active campaigns",
      `AI site builder: ${getAiGenLabel(2)} generations`,
      "Everything in Starter, plus:",
      "Basic task management (create, assign, track status)",
      "iFrame embedding (widget + full page)",
      "Campaign update notifications to donors",
      "Basic analytics dashboard",
    ];
  }
  return [
    "Unlimited team members",
    "Unlimited active campaigns",
    "Unlimited AI generations",
    "Everything in Grow, plus:",
    "Full task suite (checklists, attachments, blockers, time entries, @mentions)",
    "Email marketing to donor list with open + click tracking",
    "Donor segmentation",
    "Giveaway / lottery feature",
    "Advanced analytics + CSV export",
  ];
}

export interface TierUsage {
  active_campaigns: number;
  member_count: number;
  ai_gens_used: number;
}

export interface OrgTierInfo {
  tier: TierKey;
  tier_name: string;
  limits: TierLimits;
  usage: TierUsage;
}
