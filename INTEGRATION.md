# Frontend-Backend Integration Guide

## Overview

The frontend is now fully connected to the backend donation API. This document outlines the integration points and how to use them.

## Setup

1. **Environment Variables**: Create a `.env` file in the frontend root:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:5050
   ```

2. **Install Dependencies**: Ensure all dependencies are installed:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## API Integration

### Authentication

**Files:**
- `src/lib/api.ts` - Axios instance with auth interceptors
- `src/lib/auth.ts` - Auth helper functions
- `src/lib/constants.ts` - API endpoints configuration

**Sign Up** (`/signup`):
- Creates a new user and organization
- Automatically logs in after successful registration
- Stores JWT token and user info in localStorage

**Sign In** (`/signin`):
- Authenticates existing user
- Stores JWT token in localStorage
- Redirects to dashboard

**Token Management:**
- JWT token is automatically attached to all API requests
- 401 responses trigger automatic logout and redirect to signin

### Campaign Management

**Dashboard** (`/dashboard`):
- Sidebar fetches campaigns via `GET /api/campaigns`
- Displays campaign list with title, goal, raised amount, and status
- Click campaign to view details in main panel

**Create Campaign** (`/campaign/new`):
- Form submits to `POST /api/campaigns`
- Fields: title, goal, status, giveaway_prize_cents
- Redirects to page layout builder on success

**Campaign Details**:
- Fetches campaign progress via `GET /api/campaigns/{id}/progress`
- Shows goal, raised amount, donations count, platform fees
- Buttons to edit media, edit page layout, or preview

### Page Layout Builder

**Route:** `/campaign/page-layout/{campaignId}`

**Features:**
- Drag-and-drop style block builder
- Available blocks: hero, campaign_info, donate_button, media_gallery, text, embed, footer
- Each block has customizable properties (title, colors, alignment, etc.)
- Saves layout to `PUT /api/campaigns/{id}/page-layout`
- Loads existing layout from `GET /api/campaigns/{id}/page-layout`

**Block Types:**
- **hero**: Title, subtitle, image URL, background color
- **campaign_info**: Toggle goal, progress bar, donations count
- **donate_button**: Label, min amount, preset amounts
- **media_gallery**: Columns (1-4), aspect ratio
- **text**: Content, alignment
- **embed**: URL (YouTube/Vimeo), height
- **footer**: Text, show org name toggle

### Media Upload Builder

**Route:** `/campaign/layout-builder/{campaignId}`

**Features:**
- Upload images, videos, documents
- Add descriptions to each media item
- Preview uploaded media
- Save media to campaign

## API Endpoints Used

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/refresh` - Refresh token

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/{id}` - Get campaign details
- `PATCH /api/campaigns/{id}` - Update campaign
- `DELETE /api/campaigns/{id}` - Delete campaign
- `GET /api/campaigns/{id}/progress` - Get campaign progress

### Page Layout
- `GET /api/campaigns/{id}/page-layout` - Get page layout
- `PUT /api/campaigns/{id}/page-layout` - Save page layout
- `GET /api/page-layout/schema` - Get block schema

### Media
- `GET /api/media/signed-url` - Get S3 presigned URL
- `POST /api/media` - Persist media record

### Donations
- `POST /api/donations/checkout` - Create checkout session
- `GET /api/donations/{id}` - Get donation details

## Error Handling

All API calls use the `getErrorMessage()` helper to extract user-friendly error messages from API responses.

Common error patterns:
- 401 Unauthorized → Auto-logout and redirect to signin
- 403 Forbidden → User lacks permission
- 404 Not Found → Resource doesn't exist
- 400 Bad Request → Validation error (message in response)

## Local Development

1. **Backend**: Ensure backend is running on `http://127.0.0.1:5050`
   ```bash
   cd /Users/mowahidlatif/Code/donation-backend
   poetry run python run.py
   ```

2. **Frontend**: Start Vite dev server
   ```bash
   cd /Users/mowahidlatif/Code/frontend
   npm run dev
   ```

3. **Test Flow**:
   - Sign up at `/signup`
   - Create a campaign at `/campaign/new`
   - Edit page layout at `/campaign/page-layout/{id}`
   - View campaign details in dashboard

## Next Steps

- Add media upload integration with S3 presigned URLs
- Implement donation checkout flow
- Add campaign preview page
- Add organization settings page
- Implement giveaway winner drawing UI
- Add analytics dashboard
