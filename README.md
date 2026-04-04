# Donation Platform Frontend

React 19 + TypeScript + Vite SPA for the fundraising platform.

## Quick Start

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Create `.env`:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:5050
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

## Current Product Flow

- Auth + 2FA (`/signin`, `/signup`, `/reset-credentials`)
- Dashboard and org management (`/dashboard`, `/dashboard/users`, `/settings`)
- Campaign AI-first creation flow:
  - `/campaign/new` (wizard entry)
  - `/campaign/layout-builder/:campaignId` (media upload + AI handoff)
  - `/campaign/ai-site/:campaignId` (generate + preview AI site)
- Public donation pages:
  - `/donate/:campaignId`
  - `/donate/:org/:slug`
  - `/donate/:campaignId/thank-you`
- Optional classic page builder (feature-flagged):
  - `/campaign/page-layout/:campaignId` with `VITE_ENABLE_CLASSIC_PAGE_BUILDER=true`

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run Vitest once (CI mode)

## Notes

- Main API integration lives in `src/lib/api.ts` and `src/lib/constants.ts`.
- Public tenant-host routing is handled by `src/lib/hostTenant.ts` and `src/App.tsx`.
- Detailed integration notes: [INTEGRATION.md](./INTEGRATION.md).
