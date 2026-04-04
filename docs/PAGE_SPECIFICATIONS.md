# Page Specifications — Current Builder Flow

This document reflects the currently implemented campaign page authoring flow.

## Flow Overview

1. Create/enter campaign wizard (`/campaign/new` or `/campaign/ai-site/:campaignId`)
2. Upload and manage media in `/campaign/layout-builder/:campaignId`
3. Continue to AI generation + preview in `/campaign/ai-site/:campaignId`
4. Public render uses AI recipe when present
5. Optional legacy block editor can be enabled with `VITE_ENABLE_CLASSIC_PAGE_BUILDER=true`

---

## 18. Layout Builder (Media Manager)

**Route:** `/campaign/layout-builder/:campaignId`  
**Auth:** Protected (`campaign:edit`)

**Purpose:** Manage campaign media assets (images/videos/documents/embed references) used by AI generation and public render.

**Current behavior:**
- Upload files
- View existing media
- Delete / retry uploads
- Continue into AI site generation flow
- If legacy mode is enabled, users can navigate to classic page layout editor

**States:**
- Loading campaign/media
- Per-file upload in-progress
- Upload failure with retry
- Empty media library

---

## 19. AI Site Wizard (Primary Page Builder)

**Route:** `/campaign/ai-site/:campaignId`  
**Auth:** Protected (`campaign:edit`)

**Purpose:** Generate, validate, and preview AI site recipe for public donation pages.

**Core steps:**
- Details + campaign context
- Asset review
- Prompt authoring
- Generation progress/job polling
- Preview with live donation totals and Stripe donation modal

**Data integrations:**
- `POST /api/campaigns/{id}/ai-site/generate`
- `GET /api/campaigns/{id}/ai-site/jobs/{job_id}`
- `GET /api/campaigns/{id}/public`

---

## 20. Classic Page Layout Builder (Feature Flag)

**Route:** `/campaign/page-layout/:campaignId`  
**Auth:** Protected (`campaign:edit`)  
**Flag:** `VITE_ENABLE_CLASSIC_PAGE_BUILDER=true`

**Purpose:** Legacy block-based editor for manual page composition.

**Supported blocks:**
- `hero`
- `campaign_info`
- `donate_button`
- `media_gallery`
- `text`
- `embed`
- `footer`

**Persistence endpoints:**
- `GET /api/campaigns/{id}/page-layout`
- `PUT /api/campaigns/{id}/page-layout`

---

## Summary

- AI wizard is the default and recommended experience.
- Media manager feeds the AI workflow.
- Classic builder remains available behind a feature flag for manual editing use cases.
