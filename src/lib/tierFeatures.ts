export type TierKey = 1 | 2 | 3;

export interface TierLimits {
  name: string;
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
    platform_fee_percent: 3,
    max_active_campaigns: 2,
    max_members: 1,
    ai_gen_lifetime: 3,
    ai_gen_per_month: null,
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
    platform_fee_percent: 4,
    max_active_campaigns: 5,
    max_members: 5,
    ai_gen_lifetime: null,
    ai_gen_per_month: 10,
    task_management: true,
    task_management_full: false,
    email_marketing: false,
    giveaway: false,
    iframe_embed: false,
    media_uploads: true,
    campaign_updates: true,
    basic_analytics: true,
    advanced_analytics: false,
  },
  3: {
    name: "Scale",
    platform_fee_percent: 5,
    max_active_campaigns: null,
    max_members: null,
    ai_gen_lifetime: null,
    ai_gen_per_month: 30,
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
export const TIER_FEE: Record<TierKey, number> = { 1: 3, 2: 4, 3: 5 };

export function tierHasFeature(tier: TierKey, feature: keyof TierLimits): boolean {
  return !!TIER_LIMITS[tier][feature];
}

export function getAiGenLabel(tier: TierKey): string {
  const limits = TIER_LIMITS[tier];
  if (limits.ai_gen_lifetime !== null) return `${limits.ai_gen_lifetime} lifetime`;
  if (limits.ai_gen_per_month !== null) return `${limits.ai_gen_per_month}/month`;
  return "Unlimited";
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
