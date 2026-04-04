# Frontend-Backend Integration Guide

## Overview

This app is integrated with the backend API via `src/lib/api.ts` (Axios client) and
`src/lib/constants.ts` (endpoint map). The frontend now follows an AI-first campaign
creation flow.

## Required Environment

```env
VITE_API_BASE_URL=http://127.0.0.1:5050
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Optional:
- `VITE_ENABLE_CLASSIC_PAGE_BUILDER=true` to expose the legacy block editor route.

## Auth Integration

- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`
- JWT is attached in `api.ts`; refresh flow retries once on 401.
- Protected pages use `ProtectedRoute`, with optional role/permission checks.

## Campaign + AI Site Integration

### Dashboard and campaign operations
- `GET /api/campaigns`
- `PATCH /api/campaigns/{id}`
- `DELETE /api/campaigns/{id}`
- `GET /api/campaigns/{id}/progress`

### AI-first builder
- `POST /api/campaigns/{id}/ai-site/generate`
- `GET /api/campaigns/{id}/ai-site/jobs/{job_id}`
- `GET /api/campaigns/{id}/public` (preview/public render data)

### Media upload manager
- `POST /api/media/upload`
- `DELETE /api/media/{id}`
- `GET /api/campaigns/{id}/media`

### Optional classic block layout
- `GET /api/campaigns/{id}/page-layout`
- `PUT /api/campaigns/{id}/page-layout`

## Donation + Checkout Integration

- `POST /api/donations/checkout` for PaymentIntent client secret
- `GET /api/donations/{id}` for thank-you polling / status checks
- Public donation pages:
  - `/donate/:campaignId`
  - `/donate/:org/:slug`

## Error Handling Conventions

- UI uses `getErrorMessage()` for API exceptions.
- 401 generally triggers token clear + redirect to `/signin`.
- Donation/checkout and thank-you pages now include retry-focused status handling.

## Local Dev Checklist

1. Start backend:
   ```bash
   cd /Users/mowahidlatif/Code/donation-backend
   poetry run python run.py
   ```
2. Start frontend:
   ```bash
   cd /Users/mowahidlatif/Code/frontend
   npm run dev
   ```
3. Validate key flow:
   - Sign in
   - Open `/campaign/new`
   - Upload media in layout manager
   - Generate AI site
   - Donate on public page
