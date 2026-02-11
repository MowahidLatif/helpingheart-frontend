# Donation Platform Frontend

React + TypeScript + Vite frontend for the donation platform.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:5050
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── lib/              # Shared utilities
│   ├── api.ts        # Axios instance with auth
│   ├── auth.ts       # Auth helpers
│   └── constants.ts  # API endpoints
├── pages/            # Page components
│   ├── SignIn/       # Login page
│   ├── SignUp/       # Registration page
│   ├── Dashboard/    # Main dashboard
│   ├── Campaign/     # Campaign pages
│   │   ├── CreateCampaignPage.tsx
│   │   ├── LayoutBuilderPage.tsx (media)
│   │   └── PageLayoutBuilder.tsx (blocks)
│   └── ...
├── ui/               # Reusable UI components
│   └── Dashboard/
│       ├── Sidebar.tsx
│       └── CampaignDetails.tsx
└── routes/           # Route configuration
    └── AppRoutes.tsx
```

## Key Features

- **Authentication**: JWT-based auth with auto-refresh
- **Campaign Management**: Create, edit, and manage campaigns
- **Page Builder**: Drag-and-drop style block builder for donation pages
- **Media Upload**: Upload images, videos, and documents
- **Real-time Progress**: View campaign progress and donations

## Integration

See [INTEGRATION.md](./INTEGRATION.md) for detailed API integration documentation.

## Technologies

- React 18
- TypeScript
- Vite
- React Router
- Axios
- TailwindCSS (via @/ path alias)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Connection

Ensure the backend API is running at `http://127.0.0.1:5050` before starting the frontend.

Backend repository: `/Users/mowahidlatif/Code/donation-backend`
