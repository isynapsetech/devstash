# Current Feature
<!-- Feature Name and Short Description -->
Seed data — populate the database (`prisma/seed.ts`) with a demo user, system item types, and sample collections and items for development and demos.

# Status
<!-- Not Started  or In Progress or Completed -->
Completed

# Goals
<!-- Goals and requirements -->
- **Demo user:** `demo@devstash.io`, name "Demo User", password `12345678` hashed with bcryptjs (12 rounds), `isPro: false`, `emailVerified` set to the current date
- **System item types** (`isSystem: true`, icons are Lucide component names):

  | Name    | Icon       | Color   |
  | ------- | ---------- | ------- |
  | snippet | Code       | #3b82f6 |
  | prompt  | Sparkles   | #8b5cf6 |
  | command | Terminal   | #f97316 |
  | note    | StickyNote | #fde047 |
  | file    | File       | #6b7280 |
  | image   | Image      | #ec4899 |
  | link    | Link       | #10b981 |

- **Collections and items:**
  - **React Patterns** — _Reusable React patterns and hooks_ — 3 TypeScript snippets: custom hooks (useDebounce, useLocalStorage, etc.), component patterns (context providers, compound components), utility functions
  - **AI Workflows** — _AI prompts and workflow automations_ — 3 prompts: code review, documentation generation, refactoring assistance
  - **DevOps** — _Infrastructure and deployment resources_ — 1 snippet (Docker, CI/CD config), 1 command (deployment scripts), 2 links (real documentation URLs)
  - **Terminal Commands** — _Useful shell commands for everyday development_ — 4 commands: git operations, Docker commands, process management, package manager utilities
  - **Design Resources** — _UI/UX resources and references_ — 4 links (real URLs): CSS/Tailwind references, component libraries, design systems, icon libraries

# Notes
<!-- Any extra notes -->
- Spec: @context/features/seed-spec.md
- Replaces the current seed in `prisma/seed.ts` (John Doe + mock dashboard data, capitalized type names) — run with `npm run db:seed`
- Prisma 7 doesn't seed automatically after migrations; seed command is configured in `prisma.config.ts`
- Needs `bcryptjs` installed
- Schema changes (if any) go through `prisma migrate dev`, never `db push`

# History
<!-- Keep this updated. Earliest to latest -->

## 2026-10-26 — Initial Next.js setup
- Created Next.js project with App Router, TypeScript, Tailwind CSS v4 and Turbopack
- Removed default boilerplate (SVGs, AGENTS.md, default page/styles)
- Added CLAUDE.md and context files (project-overview, coding-standards, ai-interaction, current-feature)
- Committed and pushed to https://github.com/isynapsetech/devstash.git

## 2026-10-26 — Mock data for dashboard UI
- Added `src/lib/mock-data.ts` with user, item types, collections and items, used until the database is in place

## 2026-10-26 — Dashboard UI Phase 1
- Initialized shadcn/ui (base-nova preset) and added the `button` and `input` components
- Added the `/dashboard` route with a layout: sidebar placeholder, top bar and main area
- Dark mode by default (`dark` class on `<html>`), Geist fonts wired into the theme
- Top bar with search input (⌘K hint) and New Item button (display only)

## 2026-10-26 — Dashboard UI Phase 2
- Added shadcn `sidebar`, `avatar` and `collapsible` components (plus sheet, tooltip, separator, skeleton)
- Sidebar with item type links to `/items/[slug]`, favorite and recent collections, and user avatar area
- Collapses to icons on desktop, always a drawer on mobile; toggle button in the top bar (also Ctrl/⌘+B)
- Recent collections ordered by latest item `updatedAt` (mock collections have no timestamp)
- Rewrote the generated `use-mobile` hook with `useSyncExternalStore` to fix a lint error

## 2026-10-26 — Dashboard UI Phase 3
- Added shadcn `card` and `badge` components
- Main dashboard area: 4 stats cards, recent collections grid, pinned items and 10 recent items
- Extracted shared mock-data queries into `src/lib/dashboard.ts` and a `TypeIcon` component, reused by the sidebar
- Added two mock items so the recent items list has 10 entries
- Total items stat sums per-type counts to match the sidebar; favorite counts come from the sample item list

## 2026-10-27 — Prisma 7 + Neon PostgreSQL setup
- Installed Prisma 7.10 with `@prisma/adapter-neon`; client generated to `src/generated/prisma` (gitignored) via `postinstall`
- `prisma.config.ts` loads `.env` with dotenv and uses `DIRECT_URL` for migrations; app client in `src/lib/prisma.ts` uses pooled `DATABASE_URL`
- Initial schema from the project overview, incl. Auth.js models, indexes (incl. `[userId, isFavorite]`, `[userId, updatedAt]` on Item) and cascade deletes
- Initial migration `20261027084116_init` applied to the Neon development branch (migrations only, never `db push`)
- Seed script `prisma/seed.ts` (`npm run db:seed`): 7 system item types and a demo user with the mock collections, items and tags
- Database smoke test `scripts/test-db.ts` (`npm run db:test`): connection, tables, counts, write/read and cascade delete

## 2026-10-27 — Seed data
- Rewrote `prisma/seed.ts` per the seed spec: demo user `demo@devstash.io` (bcryptjs, 12 rounds, free plan, email verified)
- 7 lowercase system item types; types from the previous seed are renamed in place (case-insensitive match), not duplicated
- 5 collections with 18 items: React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources (real URLs for links)
- Seed is re-runnable and removes the previous `john@example.com` seed user
- `npm run db:test` now also verifies the seeded types, demo user (incl. password) and per-collection item types against the spec
- Added `bcryptjs` dependency