/** Mirrors backend app/utils/ai_site_recipe.py (DSL v1). */

import {
  AI_MAX_ALT_LEN,
  AI_MAX_DONATE_LABEL_LEN,
  AI_MAX_FOOTER_TEXT_LEN,
  AI_MAX_GALLERY_ITEMS,
  AI_MAX_HERO_SUBTITLE_LEN,
  AI_MAX_HERO_TITLE_LEN,
  AI_MAX_NODES,
  AI_MAX_PROP_URL_LEN,
  AI_MAX_RECIPE_JSON_BYTES,
  AI_MAX_TEXT_BODY_LEN,
} from "./aiRecipeConstants";
import { normalizeAiRecipe } from "./aiRecipeNormalize";

export type AiNodeType =
  | "hero"
  | "text"
  | "image"
  | "video"
  | "gallery"
  | "donate_section"
  | "progress_section"
  | "footer"
  | "spacer";

export type AiGalleryItem = { url: string; alt?: string };

export type AiNode = {
  id: string;
  type: AiNodeType;
  props: Record<string, unknown>;
};

export type AiSiteRecipeV1 = {
  version: "1";
  nodes: AiNode[];
};

const ALLOWED: Set<string> = new Set([
  "hero",
  "text",
  "image",
  "video",
  "gallery",
  "donate_section",
  "progress_section",
  "footer",
  "spacer",
]);

function nonEmptyStr(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function validateNodeProps(type: string, pr: Record<string, unknown>): boolean {
  if (type === "hero") {
    if (!nonEmptyStr(pr.title) || String(pr.title).length > AI_MAX_HERO_TITLE_LEN) return false;
    if (pr.subtitle != null && typeof pr.subtitle !== "string") return false;
    if (typeof pr.subtitle === "string" && pr.subtitle.length > AI_MAX_HERO_SUBTITLE_LEN) return false;
    if (pr.background_image_url != null && typeof pr.background_image_url !== "string") return false;
    if (
      typeof pr.background_image_url === "string" &&
      pr.background_image_url.length > AI_MAX_PROP_URL_LEN
    ) {
      return false;
    }
    return true;
  }
  if (type === "text") {
    if (!nonEmptyStr(pr.body) || String(pr.body).length > AI_MAX_TEXT_BODY_LEN) return false;
    const align = pr.align;
    if (align != null && align !== "left" && align !== "center" && align !== "right") return false;
    return true;
  }
  if (type === "image") {
    if (!nonEmptyStr(pr.url) || String(pr.url).length > AI_MAX_PROP_URL_LEN) return false;
    if (pr.alt != null && (typeof pr.alt !== "string" || pr.alt.length > AI_MAX_ALT_LEN)) return false;
    return true;
  }
  if (type === "video") {
    if (!nonEmptyStr(pr.url) || String(pr.url).length > AI_MAX_PROP_URL_LEN) return false;
    return true;
  }
  if (type === "gallery") {
    const items = pr.items;
    if (!Array.isArray(items) || items.length === 0 || items.length > AI_MAX_GALLERY_ITEMS) {
      return false;
    }
    for (const it of items) {
      if (!it || typeof it !== "object" || Array.isArray(it)) return false;
      const g = it as Record<string, unknown>;
      if (!nonEmptyStr(g.url) || String(g.url).length > AI_MAX_PROP_URL_LEN) return false;
      if (g.alt != null && (typeof g.alt !== "string" || g.alt.length > AI_MAX_ALT_LEN)) return false;
    }
    return true;
  }
  if (type === "donate_section") {
    if (pr.label != null && (typeof pr.label !== "string" || pr.label.length > AI_MAX_DONATE_LABEL_LEN)) {
      return false;
    }
    const presets = pr.preset_amounts;
    if (presets != null) {
      if (!Array.isArray(presets) || presets.length > 12) return false;
      for (const p of presets) {
        if (typeof p !== "number" || p <= 0) return false;
      }
    }
    return true;
  }
  if (type === "progress_section") {
    for (const key of ["show_goal", "show_count", "show_progress_bar"] as const) {
      const val = pr[key];
      if (val != null && typeof val !== "boolean") return false;
    }
    return true;
  }
  if (type === "footer") {
    if (pr.text != null && (typeof pr.text !== "string" || pr.text.length > AI_MAX_FOOTER_TEXT_LEN)) {
      return false;
    }
    return true;
  }
  if (type === "spacer") {
    const h = pr.height_px;
    if (h != null && (typeof h !== "number" || h < 0 || h > 400)) return false;
    return true;
  }
  return false;
}

/**
 * Parse normalized recipe JSON. Prefer `parseAiSiteRecipeFromDb` for payloads from the API/DB.
 */
export function parseAiSiteRecipe(raw: unknown): AiSiteRecipeV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const v = o.version;
  if (v !== "1" && v !== 1) return null;
  const nodes = o.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return null;
  if (nodes.length > AI_MAX_NODES) return null;
  const out: AiNode[] = [];
  let hasDonate = false;
  let hasProgress = false;
  for (const n of nodes) {
    if (!n || typeof n !== "object") return null;
    const node = n as Record<string, unknown>;
    const id = typeof node.id === "string" ? node.id.trim() : "";
    const type = typeof node.type === "string" ? node.type : "";
    if (!id || !ALLOWED.has(type)) return null;
    const props = node.props;
    const p =
      props && typeof props === "object" && !Array.isArray(props) ? { ...(props as object) } : {};
    const pr = p as Record<string, unknown>;
    if (!validateNodeProps(type, pr)) return null;
    out.push({ id, type: type as AiNodeType, props: pr });
    if (type === "donate_section") hasDonate = true;
    if (type === "progress_section") hasProgress = true;
  }
  if (!hasDonate || !hasProgress) return null;
  const candidate: AiSiteRecipeV1 = { version: "1", nodes: out };
  try {
    const encoded = JSON.stringify(candidate);
    if (new TextEncoder().encode(encoded).length > AI_MAX_RECIPE_JSON_BYTES) return null;
  } catch {
    return null;
  }
  return candidate;
}

/** Normalize then parse — use for `campaign.ai_site_recipe` from the API. */
export function parseAiSiteRecipeFromDb(raw: unknown): AiSiteRecipeV1 | null {
  return parseAiSiteRecipe(normalizeAiRecipe(raw));
}

export function getDonatePresetsFromRecipe(recipe: AiSiteRecipeV1 | null): number[] {
  const fallback = [5, 10, 25, 50, 100];
  if (!recipe) return fallback;
  for (const n of recipe.nodes) {
    if (n.type !== "donate_section") continue;
    const presets = n.props.preset_amounts;
    if (Array.isArray(presets) && presets.length > 0) {
      const nums = presets.filter((x) => typeof x === "number" && x > 0) as number[];
      if (nums.length) return nums;
    }
  }
  return fallback;
}
