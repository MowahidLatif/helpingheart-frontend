# Page Specifications — Layout Builder & Page Layout Builder (Revised)

This document describes the revised flow for building campaign pages: skeleton-first, then content assignment.

---

## Revised Flow Overview

1. **Select block skeleton** — Choose block type (Image, Video, PDF) and layout pattern (e.g. 1 image + text, 2 images + 2 texts).
2. **Select layout variant** — Choose arrangement (image above text, image beside text, etc.).
3. **Assign content** — Assign specific media (uploaded images, videos, PDFs) to each slot in the block.

---

## 18. Layout Builder (Media Upload & Block Skeleton Selection)

**Route:** `/campaign/layout-builder/:campaignId`  
**Auth:** Protected

**Purpose:** Upload campaign media (images, videos, PDFs) and select block skeletons/layouts before assigning content. This is the first step in building the campaign page structure.

**Layout:**
- Header: AuthenticatedNavBar
- Main: two-phase layout
  - **Phase 1 (Media):** Upload sections for Images, Videos, Documents (PDF)
  - **Phase 2 (Skeleton):** Block skeleton selector — choose block type + layout pattern

**Key components:**
- Upload sections: Images, Videos, Documents (PDF) with file input, progress, preview, delete
- Block skeleton selector: cards or list of available layouts
- Layout pattern options per media type (see below)
- “Continue to Page Layout” → proceed to content assignment

**Block skeleton options:**

*Image blocks:*
- 1 image + 1 text description (image above text, image beside text, image below text)
- 2 images + 2 texts (grid 2x2, stacked, side-by-side)
- 3 images + 3 texts (grid 3x1, 1x3, mixed arrangements)
- Single full-width image, single image with caption

*Video blocks:*
- 1 video + 1 text (video above text, video beside text, video below text)
- 2 videos + 2 texts (various arrangements)
- 3 videos + 3 texts (various arrangements)
- Single full-width video with caption

*PDF blocks:*
- 1 PDF + 1 text (PDF above text, PDF beside text)
- 2 PDFs + 2 texts
- 3 PDFs + 3 texts
- Single PDF with caption

**Interactions:**
- Upload files to S3
- Delete media
- Select block skeleton (type + layout pattern) for each block to add
- Add multiple block skeletons before proceeding
- “Continue to Page Layout” → `/campaign/page-layout/:campaignId` (with selected skeletons)

**Content:**
- Section titles (Images, Videos, Documents)
- Thumbnail or filename per media item
- Layout pattern cards with visual preview (wireframe)
- Upload status (idle, uploading, success, error)

**States:**
- Loading: initial media load
- Uploading: per-file progress
- Error: per upload or global
- Empty: “No images/videos/documents yet”
- Empty skeleton selection: “Select at least one block layout to continue”

---

## 19. Page Layout Builder (Content Assignment & Block Ordering)

**Route:** `/campaign/page-layout/:campaignId`  
**Auth:** Protected

**Purpose:** Assign specific content to each block skeleton, reorder blocks, and configure non-media blocks (hero, campaign_info, donate_button, text, embed, footer, progress_tube). Users only assign content after block type and layout are chosen in the Layout Builder.

**Layout:**
- Header: AuthenticatedNavBar
- Left panel: Block list (ordered), Add Blocks (for non-media blocks: hero, campaign_info, donate_button, text, embed, footer, progress_tube)
- Main: canvas showing each block with its skeleton layout and assigned content (or placeholder slots)
- Right panel (when block selected): property editors — for media blocks: assign media to each slot; for other blocks: edit props

**Key components:**
- Left: add-block buttons (hero, campaign_info, donate_button, text, embed, footer, progress_tube); list of media blocks (from Layout Builder) in order
- Center: block cards — each shows skeleton layout; for media blocks, slots show assigned image/video/PDF or “Assign” placeholder
- Right: assignment form (e.g. “Slot 1: [Select Image]”, “Slot 2: [Text input]”) + other block props
- Toolbar: Save Layout, Preview, Upload Media (→ Layout Builder), Back to Dashboard
- Drag handle for reordering blocks

**Interactions:**
- Assign content: for each media slot, select from uploaded media (dropdown, picker, or drag)
- Edit text slots: type description for each text field in the block
- Reorder blocks: drag to reorder
- Add non-media blocks (hero, donate_button, etc.)
- Select block → show properties / assignment form
- Remove block
- Save → PUT layout
- Preview → full-page preview
- Upload Media → `/campaign/layout-builder/:campaignId`
- Back to Dashboard → `/dashboard`

**Content:**
- Block list with skeleton type (e.g. “2 images + 2 texts, images above”)
- Per-slot assignment UI: image picker, video picker, PDF picker, text input
- Block props (donate presets, hero text, etc.)
- Campaign ID, save status

**States:**
- Loading: layout + media load
- Error: save or schema error
- Empty blocks: “No blocks yet. Add blocks in Media Upload, or add a hero/donate block here.”
- Unassigned slots: “Assign” placeholder, visual distinction
- Preview mode: full Donate-style view

---

## Summary: Flow Diagram

```
Layout Builder (Media Upload)
  ├── Upload images, videos, PDFs
  └── Select block skeletons (e.g. 2 images + 2 texts, images above)
        │
        ▼
Page Layout Builder (Content Assignment)
  ├── Blocks appear in order (from skeletons + any hero/donate/etc.)
  ├── For each media block: assign image/video/PDF to each slot
  ├── Edit text descriptions per slot
  ├── Configure donate_button, hero, etc.
  └── Reorder, save, preview
```
