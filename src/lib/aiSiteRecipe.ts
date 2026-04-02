/** Mirrors backend app/utils/ai_site_recipe.py (DSL v1). */

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

export function parseAiSiteRecipe(raw: unknown): AiSiteRecipeV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const v = o.version;
  if (v !== "1" && v !== 1) return null;
  const nodes = o.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return null;
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
    const p = props && typeof props === "object" && !Array.isArray(props) ? { ...(props as object) } : {};
    out.push({ id, type: type as AiNodeType, props: p });
    if (type === "donate_section") hasDonate = true;
    if (type === "progress_section") hasProgress = true;
  }
  if (!hasDonate || !hasProgress) return null;
  return { version: "1", nodes: out };
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
