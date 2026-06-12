/** Mirrors backend app/utils/ai_site_recipe.py (DSL v1). */

import {
  AI_MAX_ALT_LEN,
  AI_MAX_DONATE_LABEL_LEN,
  AI_MAX_FOOTER_TEXT_LEN,
  AI_MAX_GALLERY_ITEMS,
  AI_MAX_HERO_SUBTITLE_LEN,
  AI_MAX_HERO_TITLE_LEN,
  AI_MAX_IFRAME_CONTENT_FIELDS,
  AI_MAX_IFRAME_CONTENT_KEY_LEN,
  AI_MAX_IFRAME_CONTENT_VALUE_LEN,
  AI_MAX_IFRAME_CSS_BYTES,
  AI_MAX_IFRAME_HTML_BYTES,
  AI_MAX_IFRAME_JS_BYTES,
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
  | "spacer"
  | "raffle_block";

export type AiGalleryItem = { url: string; alt?: string };

export type AiNode = {
  id: string;
  type: AiNodeType;
  props: Record<string, unknown>;
};

export type RecipeTheme = {
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  border_radius?: string;
};

export type AiSiteRecipeV1 = {
  version: "1";
  nodes: AiNode[];
  theme?: RecipeTheme;
};

export type AiIframeContentMap = Record<string, string>;

export type AiSiteIframeBundleV1 = {
  type: "iframeBundle";
  version: "1";
  template: {
    html: string;
    css?: string;
    js?: string;
  };
  content: AiIframeContentMap;
  publishedContent?: AiIframeContentMap;
};

export type AiSiteRenderModel =
  | { type: "dsl"; recipe: AiSiteRecipeV1 }
  | { type: "iframeBundle"; bundle: AiSiteIframeBundleV1 };

export function getRecipeTheme(recipe: AiSiteRecipeV1): RecipeTheme | null {
  return recipe.theme ?? null;
}

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
  "raffle_block",
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
  if (type === "raffle_block") {
    // All props are optional strings/nulls — pass through
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

function parseIframeContentMap(raw: unknown): AiIframeContentMap | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: AiIframeContentMap = {};
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > AI_MAX_IFRAME_CONTENT_FIELDS) return null;
  for (const [keyRaw, valueRaw] of entries) {
    const key = keyRaw.trim();
    if (!key || key.length > AI_MAX_IFRAME_CONTENT_KEY_LEN) return null;
    if (typeof valueRaw !== "string") return null;
    if (valueRaw.length > AI_MAX_IFRAME_CONTENT_VALUE_LEN) return null;
    out[key] = valueRaw;
  }
  return out;
}

function parseAiSiteIframeBundle(raw: unknown): AiSiteIframeBundleV1 | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const type = o.type;
  if (type !== "iframeBundle" && type !== "iframe_bundle") return null;
  const version = o.version;
  if (version !== "1" && version !== 1) return null;
  const templateRaw =
    o.template && typeof o.template === "object" && !Array.isArray(o.template)
      ? (o.template as Record<string, unknown>)
      : null;
  if (!templateRaw) return null;
  const html = typeof templateRaw.html === "string" ? templateRaw.html : "";
  if (!html.trim()) return null;
  if (new TextEncoder().encode(html).length > AI_MAX_IFRAME_HTML_BYTES) return null;
  const css = typeof templateRaw.css === "string" ? templateRaw.css : undefined;
  const js = typeof templateRaw.js === "string" ? templateRaw.js : undefined;
  if (css && new TextEncoder().encode(css).length > AI_MAX_IFRAME_CSS_BYTES) return null;
  if (js && new TextEncoder().encode(js).length > AI_MAX_IFRAME_JS_BYTES) return null;

  const content = parseIframeContentMap(o.content);
  if (!content) return null;
  const publishedContent =
    o.publishedContent == null ? undefined : parseIframeContentMap(o.publishedContent);
  if (o.publishedContent != null && !publishedContent) return null;

  const candidate: AiSiteIframeBundleV1 = {
    type: "iframeBundle",
    version: "1",
    template: { html, ...(css ? { css } : {}), ...(js ? { js } : {}) },
    content,
    ...(publishedContent ? { publishedContent } : {}),
  };
  try {
    const encoded = JSON.stringify(candidate);
    if (new TextEncoder().encode(encoded).length > AI_MAX_RECIPE_JSON_BYTES) return null;
  } catch {
    return null;
  }
  return candidate;
}

export function parseAiSiteRenderModelFromDb(raw: unknown): AiSiteRenderModel | null {
  const iframe = parseAiSiteIframeBundle(raw);
  if (iframe) return { type: "iframeBundle", bundle: iframe };

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if (o.type === "dsl" && o.recipe != null) {
      const recipe = parseAiSiteRecipeFromDb(o.recipe);
      if (recipe) return { type: "dsl", recipe };
      return null;
    }
  }
  const recipe = parseAiSiteRecipeFromDb(raw);
  if (!recipe) return null;
  return { type: "dsl", recipe };
}

export function getIframeBundleContent(
  bundle: AiSiteIframeBundleV1,
  opts: { publicView: boolean; allowDraftFallback?: boolean },
): AiIframeContentMap | null {
  if (!opts.publicView) return bundle.content;
  if (bundle.publishedContent) return bundle.publishedContent;
  if (opts.allowDraftFallback) return bundle.content;
  return null;
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

/** Label from the first donate_section, for sticky CTA chrome. */
export function getDonateStickyLabelFromRecipe(recipe: AiSiteRecipeV1 | null): string {
  if (!recipe) return "Donate";
  for (const n of recipe.nodes) {
    if (n.type !== "donate_section") continue;
    const label = n.props.label;
    if (typeof label === "string" && label.trim()) return label.trim();
    return "Donate";
  }
  return "Donate";
}

const SEO_DESC_MAX = 300;

/** Plain-text snippet for meta description from recipe nodes (hero subtitle, then first text). */
export function getSeoDescriptionFromRecipe(recipe: AiSiteRecipeV1 | null): string {
  if (!recipe) return "";
  for (const n of recipe.nodes) {
    if (n.type === "hero") {
      const sub = n.props.subtitle;
      if (typeof sub === "string" && sub.trim()) return sub.trim().slice(0, SEO_DESC_MAX);
    }
  }
  for (const n of recipe.nodes) {
    if (n.type === "text") {
      const body = n.props.body;
      if (typeof body === "string" && body.trim()) {
        const oneLine = body.replace(/\s+/g, " ").trim();
        return oneLine.slice(0, SEO_DESC_MAX);
      }
    }
  }
  return "";
}

export function getSeoDescriptionFromRenderModel(
  model: AiSiteRenderModel | null,
): string {
  if (!model) return "";
  if (model.type === "dsl") return getSeoDescriptionFromRecipe(model.recipe);
  const published = model.bundle.publishedContent;
  const content = published ?? model.bundle.content;
  const preferredKeys = ["description", "subtitle", "summary", "body", "about"];
  for (const key of preferredKeys) {
    const val = content[key];
    if (typeof val === "string" && val.trim()) {
      return val.replace(/\s+/g, " ").trim().slice(0, SEO_DESC_MAX);
    }
  }
  for (const val of Object.values(content)) {
    if (typeof val === "string" && val.trim()) {
      return val.replace(/\s+/g, " ").trim().slice(0, SEO_DESC_MAX);
    }
  }
  return "";
}
