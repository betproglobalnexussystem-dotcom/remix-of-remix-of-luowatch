# Luo Watch

A media streaming web application built with React, Vite, and Firebase.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI components)
- **Auth & Backend**: Firebase (authentication, Firestore database)
- **Routing**: React Router DOM v6
- **State**: TanStack Query (React Query)
- **Media**: ArtPlayer, HLS.js, Plyr for video/audio playback
- **PWA**: vite-plugin-pwa for progressive web app support

## Project Structure
- `src/App.tsx` — Root component with routing setup
- `src/pages/` — All page-level components (Index, MusicPage, LiveTVPage, GamesPage, etc.)
- `src/components/` — Shared UI components (Header, MobileNav, AuthModal, etc.)
- `src/contexts/` — React context providers (AuthContext, SubscriptionContext)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions and Firebase config
- `src/data/` — Static data files

## Running the App
- **Dev server**: `npm run dev` — runs on port 5000
- **Build**: `npm run build`

## Key Notes
- Migrated from Lovable to Replit — removed `lovable-tagger` dependency
- Vite configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
- Firebase credentials are managed via environment variables / Firebase config in `src/lib/`
