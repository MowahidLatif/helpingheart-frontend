/**
 * Client-side validation for campaign page layout.
 * Mirrors backend rules in app/utils/page_layout.py so preview/save behave consistently.
 */

const BLOCK_TYPES = new Set([
  "hero",
  "campaign_info",
  "donate_button",
  "media_gallery",
  "text",
  "embed",
  "footer",
  "progress_tube",
]);

const MAX_BLOCKS = 50;
const MAX_ID_LEN = 100;

/** Type guard: true if id is a valid block id (backend rules: alphanumeric with - or _). */
function validId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  if (id.length === 0 || id.length > MAX_ID_LEN) return false;
  const stripped = id.replace(/-/g, "").replace(/_/g, "");
  return stripped.length > 0 && /^[a-zA-Z0-9]+$/.test(stripped);
}

export type BlockLike = { id?: string; type?: string; props?: unknown };

/**
 * Validate a list of blocks (as used in PageLayoutBuilder state).
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateLayout(blocks: unknown): { valid: true } | { valid: false; error: string } {
  if (!Array.isArray(blocks)) {
    return { valid: false, error: "Layout must be an array of blocks" };
  }
  if (blocks.length > MAX_BLOCKS) {
    return { valid: false, error: `At most ${MAX_BLOCKS} blocks allowed` };
  }
  const seenIds = new Set<string>();
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as BlockLike;
    if (!block || typeof block !== "object") {
      return { valid: false, error: `Block ${i} must be an object` };
    }
    const id = block.id;
    if (!validId(id)) {
      return { valid: false, error: `Block ${i}: id required and must be alphanumeric with - or _` };
    }
    if (seenIds.has(id)) {
      return { valid: false, error: `Block ${i}: duplicate id '${id}'` };
    }
    seenIds.add(id);
    const type = block.type;
    if (!type || !BLOCK_TYPES.has(type)) {
      return {
        valid: false,
        error: `Block ${i}: type must be one of ${[...BLOCK_TYPES].sort().join(", ")}`,
      };
    }
    if (block.props !== undefined && block.props !== null && typeof block.props !== "object") {
      return { valid: false, error: `Block ${i}: props must be an object` };
    }
  }
  return { valid: true };
}
