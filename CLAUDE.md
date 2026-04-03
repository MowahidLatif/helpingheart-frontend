# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server at http://localhost:5173
npm run build      # Type-check (tsc -b) + Vite production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

No test runner is configured. There are no test files in this repo.

## Environment Setup

Create a `.env` file in the project root:
```
VITE_API_BASE_URL=http://127.0.0.1:5050
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Backend must be running at `http://127.0.0.1:5050` before starting the frontend:
```bash
cd /Users/mowahidlatif/Code/donation-backend
poetry run python run.py
```

## Architecture

**React 19 + TypeScript + Vite SPA** for a donation/fundraising platform. No global state management library — all state is local `useState`/`useEffect` with React Router's Outlet context for cross-layout data sharing.

### Key Directories

- `src/lib/` — Shared utilities: `api.ts` (Axios instance), `auth.ts` (auth helpers), `constants.ts` (all API endpoint strings), `mediaUpload.ts`, `pageLayoutValidation.ts`, `aiSiteRecipe.ts`, `aiRecipeNormalize.ts`, `mediaRecipeUrlAllowlist.ts`, `campaignMediaLimits.ts`
- `src/pages/` — Route-level page components
- `src/ui/` — Feature-specific UI components (Dashboard, DonateBlocks, LandingPage, etc.)
- `src/components/` — Generic reusable components (ProtectedRoute, DonationModal, etc.)
- `src/routes/AppRoutes.tsx` — All route definitions
- `src/styles/` — SCSS with structured abstracts/components/layouts architecture; entry point is `main.scss`

### Authentication

JWT tokens are stored in `localStorage` (`token`, `refreshToken`). The Axios instance in `src/lib/api.ts` automatically:
- Injects the Bearer token on every request
- On 401, queues pending requests, attempts token refresh, retries — or logs out if refresh fails

`src/components/ProtectedRoute.tsx` wraps authenticated routes, checking `localStorage.getItem('token')`.

### Routing Pattern

Protected routes are wrapped in `<ProtectedRoute>`. The dashboard layout uses React Router's `<Outlet>` with context to pass `orgId`, `role`, and refresh callbacks down to child pages without prop drilling.

Notable routes:
- `/dashboard` — Campaign list + details (protected)
- `/campaign/new` — Multi-step campaign + AI wizard: details → assets → prompt → generation → in-app preview with live public polling and Stripe donate modal (`CampaignAiWizardPage.tsx`, protected)
- `/campaign/ai-site/:campaignId` — Same wizard in resume mode (dashboard); jumps to preview if `ai_site_recipe` exists (protected)
- `/campaign/layout-builder/:campaignId` — Media upload manager (protected)
- `/campaign/page-layout/:campaignId` — Block-based page builder (protected)
- `/donate/:campaignId` and `/donate/:org/:slug` — Public donation pages
- `/embed/progress/:campaignId` — Embeddable progress widget

### Page Builder System

The block-based page builder (`src/pages/Campaign/PageLayoutBuilder.tsx`) lets users compose donation pages from typed blocks: `hero`, `campaign_info`, `donate_button`, `media_gallery`, `text`, `embed`, `footer`. Layouts are saved/loaded via `PUT/GET /api/campaigns/{id}/page-layout`. Block rendering on the public-facing side is handled by `src/ui/DonateBlocks/BlockRenderer.tsx`.

**AI site builder:** `src/pages/Campaign/CampaignAiWizardPage.tsx` implements the full flow (Ant Design `Steps`: details, assets, describe, generating, preview). `CreateCampaignPage` and `AiSiteWizardPage` are thin wrappers (`mode="new"` vs `resume`). Resume opens on preview when `ai_site_recipe` exists. Generation uses `POST /api/campaigns/{id}/ai-site/generate` and job polling; preview polls `GET /api/campaigns/{id}/public` for live totals. Public pages use `src/ui/AiSite/AiSiteRenderer.tsx` when a recipe exists. Set `VITE_ENABLE_CLASSIC_PAGE_BUILDER=true` for the legacy page layout editor on the dashboard. Multi-tenant host routing: `docs/MULTITENANT_HOSTING.md`, `src/lib/hostTenant.ts`.

**AI site recipe pipeline (public + preview):** normalize with `src/lib/aiRecipeNormalize.ts`, then parse/validate with `parseAiSiteRecipe` / `parseAiSiteRecipeFromDb` in `src/lib/aiSiteRecipe.ts`, then render. `AiSiteRenderer` skips media URLs that fail `src/lib/mediaRecipeUrlAllowlist.ts` (`VITE_MEDIA_URL_HOSTS`). Limits are shared in `src/lib/aiRecipeConstants.ts`. **DSL v1 contract:** [`docs/AI_SITE_DSL_V1.md`](docs/AI_SITE_DSL_V1.md).

### API Layer

All API endpoint strings are in `src/lib/constants.ts`. All HTTP calls go through the Axios instance exported from `src/lib/api.ts`. Use `getErrorMessage()` from `src/lib/api.ts` to extract user-friendly messages from error responses.

### Styling

SCSS via Sass. Ant Design (`antd`) is the primary component library — its reset CSS is imported globally in `main.tsx`. Custom SCSS lives under `src/styles/` with variables/mixins in `src/styles/abstracts/`. Path alias `@` maps to `src/`.

### Key Dependencies

- `react-router-dom@7` — Routing
- `axios` — HTTP client
- `antd@6` — UI component library
- `@stripe/stripe-js` + `@stripe/react-stripe-js` — Payment UI
- `three` + `@react-three/fiber` + `@react-three/drei` — 3D graphics (used in select visualizations)
- `socket.io-client` — Installed but minimally integrated
