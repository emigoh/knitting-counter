# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Unravel** - A knitting and crochet project tracker built with Next.js 16, React 19, TypeScript 5, and Supabase. Users track projects, manage yarn stash, browse patterns, and maintain a project queue.

## Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Realtime)
- **Deployment**: Vercel

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Auth page (email/password)
│   ├── notebook/           # User's personal tracking
│   │   ├── projects/       # Project CRUD with [id] dynamic route
│   │   ├── stash/          # Yarn inventory
│   │   ├── queue/          # Project wishlist
│   │   └── favorites/      # Bookmarked patterns
│   ├── patterns/           # Shared pattern library with [id] route
│   └── profile/            # User profile
├── components/             # Shared components (AuthProvider, Navbar, etc.)
└── lib/
    ├── supabase.ts         # Supabase client factory
    ├── types.ts            # TypeScript interfaces
    └── constants.ts        # Colors, statuses, enums
```

### Key Patterns

**Authentication**: AuthProvider wraps the app, provides `useAuth()` hook. Routes check `user` context and redirect to `/login` if null.

**Data Flow**: Client components fetch from Supabase directly. All tables have real-time subscriptions enabled for instant sync across clients.

**Styling**: CSS custom properties in `globals.css` define the color scheme (primary green `#4A7C59`, accent tan `#C4956A`, cream background `#FDF8F0`). Project cards use 10 predefined colors from `constants.ts`.

### Database Tables
- `profiles` - User data (auto-created on signup via trigger)
- `projects` - Knitting/crochet projects with row counts, status, happiness rating
- `patterns` - Shared pattern library (viewable by all authenticated users)
- `stash` - Per-user yarn inventory
- `queue` - Priority-ordered project wishlist
- `favorites` - Bookmarked patterns (unique per user)

All tables have Row Level Security policies. Schema is in `supabase-migration.sql`.

### Path Alias
`@/*` maps to `./src/*` (configured in tsconfig.json)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
