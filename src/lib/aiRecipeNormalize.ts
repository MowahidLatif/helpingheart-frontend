import {
  AI_MAX_ALT_LEN,
  AI_MAX_DONATE_LABEL_LEN,
  AI_MAX_FOOTER_TEXT_LEN,
  AI_MAX_GALLERY_ITEMS,
  AI_MAX_HERO_SUBTITLE_LEN,
  AI_MAX_HERO_TITLE_LEN,
  AI_MAX_PROP_URL_LEN,
  AI_MAX_TEXT_BODY_LEN,
} from "./aiRecipeConstants";

/**
 * Best-effort normalization before parse (mirrors backend normalize_recipe).
 */
export function normalizeAiRecipe(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return { version: "1", nodes: [] };
  }
  const o = raw as Record<string, unknown>;
  const version = o.version;
  let ver: string;
  if (version === undefined || version === "") {
    ver = "1";
  } else if (version === 1 || version === "1") {
    ver = "1";
  } else {
    ver = String(version);
  }
  const nodesIn = o.nodes;
  if (!Array.isArray(nodesIn)) {
    return { version: ver, nodes: [] };
  }
  const outNodes: Record<string, unknown>[] = [];
  for (const node of nodesIn) {
    if (!node || typeof node !== "object") continue;
    const n = node as Record<string, unknown>;
    const ntype = n.type;
    const propsRaw = n.props;
    const p: Record<string, unknown> =
      propsRaw && typeof propsRaw === "object" && !Array.isArray(propsRaw)
        ? { ...(propsRaw as object) }
        : {};
    if (ntype === "hero") {
      if (typeof p.title === "string") {
        p.title = p.title.slice(0, AI_MAX_HERO_TITLE_LEN);
      }
      if (typeof p.subtitle === "string") {
        p.subtitle = p.subtitle.slice(0, AI_MAX_HERO_SUBTITLE_LEN);
      }
      if (typeof p.background_image_url === "string") {
        p.background_image_url = p.background_image_url.slice(0, AI_MAX_PROP_URL_LEN);
      }
    } else if (ntype === "text" && typeof p.body === "string") {
      p.body = p.body.slice(0, AI_MAX_TEXT_BODY_LEN);
    } else if (ntype === "image") {
      if (typeof p.url === "string") {
        p.url = p.url.slice(0, AI_MAX_PROP_URL_LEN);
      }
      if (typeof p.alt === "string") {
        p.alt = p.alt.slice(0, AI_MAX_ALT_LEN);
      }
    } else if (ntype === "video" && typeof p.url === "string") {
      p.url = p.url.slice(0, AI_MAX_PROP_URL_LEN);
    } else if (ntype === "gallery" && Array.isArray(p.items)) {
      const items: Record<string, unknown>[] = [];
      for (const it of p.items.slice(0, AI_MAX_GALLERY_ITEMS)) {
        if (it && typeof it === "object" && !Array.isArray(it)) {
          const d = { ...(it as object) } as Record<string, unknown>;
          if (typeof d.url === "string") {
            d.url = d.url.slice(0, AI_MAX_PROP_URL_LEN);
          }
          if (typeof d.alt === "string") {
            d.alt = d.alt.slice(0, AI_MAX_ALT_LEN);
          }
          items.push(d);
        }
      }
      p.items = items;
    } else if (ntype === "donate_section" && typeof p.label === "string") {
      p.label = p.label.slice(0, AI_MAX_DONATE_LABEL_LEN);
    } else if (ntype === "footer" && typeof p.text === "string") {
      p.text = p.text.slice(0, AI_MAX_FOOTER_TEXT_LEN);
    }
    const nid = n.id;
    const sid = typeof nid === "string" ? nid.trim() : nid != null ? String(nid).trim() : "";
    outNodes.push({ id: sid, type: ntype, props: p });
  }
  return { version: ver, nodes: outNodes };
}
