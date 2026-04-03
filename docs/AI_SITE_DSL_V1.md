# AI site recipe DSL v1

JSON stored in `campaigns.ai_site_recipe` and produced by the backend AI flow. **`version` must be `"1"`** for this contract.

**Compatibility rule:** If you change how a node type is interpreted in the UI, bump `version` (e.g. to `"2"`), add normalization from old shapes in `aiRecipeNormalize.ts` / backend `normalize_recipe`, and branch the renderer (or add `AiSiteRendererV2`). Do not change v1 semantics in place.

**Pipeline:** `normalizeAiRecipe` → `parseAiSiteRecipe` / `parseAiSiteRecipeFromDb` → `AiSiteRenderer`. Media URLs are filtered by `mediaRecipeUrlAllowlist.ts` at render time.

## Top-level shape

```json
{ "version": "1", "nodes": [ /* AiNode */ ] }
```

**Requirements (validation):** At least one `donate_section` and one `progress_section`. Max 40 nodes, 20 gallery items per gallery, field length caps in `aiRecipeConstants.ts` / backend `ai_site_recipe.py`.

## Node types → renderer

| `type` | Required / notable `props` | Rendered by |
|--------|----------------------------|-------------|
| `hero` | `title` (string); optional `subtitle`, `background_image_url` | `HeroAi` → `HeroBlock` |
| `text` | `body`; optional `align` `left` \| `center` \| `right` | `TextAi` → `TextBlock` |
| `image` | `url`; optional `alt` | `ImageAi` → `<img>` |
| `video` | `url` (storage or embed URL) | `VideoAi` → `<video>` or iframe |
| `gallery` | `items[]` with `url`, optional `alt` | `GalleryAi` → grid |
| `donate_section` | optional `label`, `preset_amounts` | `DonateSectionAi` → `DonateButtonBlock` |
| `progress_section` | optional `show_goal`, `show_count`, `show_progress_bar` | `ProgressSectionAi` → `CampaignInfoBlock` |
| `footer` | optional `text` | `FooterAi` → `FooterBlock` |
| `spacer` | optional `height_px` (0–400) | `SpacerAi` → div |

Unknown `type` values are skipped in `AiSiteRenderer` (`default` → `null`).

## Related code

- Parser / types: `src/lib/aiSiteRecipe.ts`
- Normalization: `src/lib/aiRecipeNormalize.ts`
- Renderer: `src/ui/AiSite/AiSiteRenderer.tsx`
- Backend validation: `donation-backend/app/utils/ai_site_recipe.py`
