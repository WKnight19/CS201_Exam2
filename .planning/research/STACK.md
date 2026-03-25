# Stack Research

**Domain:** Interactive educational web app — CS data structures & algorithms study tool
**Researched:** 2026-03-24
**Confidence:** HIGH (core stack verified via npm + official docs; visualization section MEDIUM)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (latest stable) | Full-stack framework, App Router | Required constraint; App Router Server Components reduce client bundle, natural API routes, Vercel-native deployment |
| React | 19.x | UI runtime | Included with Next.js 16; concurrent features reduce animation jank |
| TypeScript | 5.x | Type safety across entire app | Required for strict typing of FSRS card state, tree node data structures, and API contracts |
| Tailwind CSS | 4.x | Styling | Zero-config with Next.js 16; OKLCH color system; no tailwind.config.ts needed with v4 inline theming |
| shadcn/ui | latest CLI | UI component system | Not a dependency — copies component source; works with Tailwind v4 + React 19 as of 2025; flashcard/quiz UI built from Accordion, Card, Progress, Badge primitives |

### Database & ORM

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Neon Postgres | — | Persistent storage | Required constraint; serverless-native, Vercel-compatible, branching for dev/prod |
| Drizzle ORM | 0.45.x | Database access layer | Edge-runtime compatible (Prisma is NOT safe for Vercel Edge/serverless without workarounds); lightweight bundle; SQL-like API is easy to understand; official Neon integration via neon-http driver; Vercel has a first-party Next.js + Drizzle + Neon starter template |
| @neondatabase/serverless | 1.0.x | Neon HTTP/WebSocket driver | Required by Drizzle for Neon connections in serverless; HTTP transport avoids TCP connection limits on Vercel |
| drizzle-kit | 0.31.x | Migrations & schema management | Companion CLI to Drizzle ORM; `drizzle-kit push` for fast local dev, `drizzle-kit generate` + `migrate` for production |

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Better Auth | 1.5.x | Google OAuth + session management | Auth.js (NextAuth) v5 has been in beta for 2+ years and is now being handed off to the Better Auth team (September 2025 announcement); Better Auth is the recommended replacement for new projects. TypeScript-first, built-in rate limiting, clean App Router integration, simpler middleware setup than Auth.js v5's edge/adapter split problem. Google OAuth is a first-class provider. |

### Spaced Repetition

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| ts-fsrs | 5.3.x | FSRS scheduling algorithm | FSRS (Free Spaced Repetition Scheduler) outperforms SM-2 on memory retention benchmarks — it's what modern Anki uses. `ts-fsrs` is the official TypeScript implementation maintained by the open-spaced-repetition org. `createEmptyCard()` + `fsrs.repeat()` API is minimal and fits cleanly into a Server Action or API route. Do NOT implement SM-2 by hand — FSRS is strictly better and ts-fsrs has zero dependencies. |

### Visualization & Animation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-d3-tree | 3.6.x | Tree graph rendering (N-ary, RB, B-Tree, Huffman) | Handles arbitrary hierarchical data with animated transitions; `renderCustomNodeElement` prop allows custom SVG/HTML nodes (needed for colored RB nodes, B-Tree multi-key nodes); `transitionDuration` prop drives step-by-step animation via controlled re-renders; backed by D3 layout math so tree positioning is automatic |
| Framer Motion | 12.x | Step-through animation choreography, UI micro-animations | Manages the animation state machine for "next step / prev step" interactions; `AnimatePresence` handles node enter/exit; `layout` prop animates tree rebalancing without manual coordinate math; better fit for declarative React than raw D3 transitions for this use case |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.x | Schema validation | API route input validation, quiz answer checking, FSRS card state parsing from DB |
| Zustand | 5.x | Client-side state | Algorithm step-through state (current step index, highlighted nodes, history); keeps visualization state out of React component trees |
| nuqs | latest | URL query state | Preserving which topic/lesson/step is active across navigation without localStorage; works natively with App Router |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| drizzle-kit | Schema migrations and introspection | `drizzle-kit push` for rapid local iteration; use `generate` + `migrate` for Vercel production deploys |
| Vitest | Unit testing | FSRS scheduling logic, quiz scoring, tree traversal helpers — pure functions that must be correct |
| ESLint + Prettier | Code quality | Use Next.js built-in ESLint config; add `eslint-plugin-drizzle` for query safety |

---

## Installation

```bash
# Core framework (use pnpm)
pnpm create next-app@latest cs201-study --typescript --tailwind --app --src-dir

# Database + ORM
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth
pnpm add better-auth

# Spaced repetition
pnpm add ts-fsrs

# Visualization
pnpm add react-d3-tree framer-motion

# State + validation
pnpm add zustand zod nuqs

# UI components (shadcn CLI, not a package)
pnpm dlx shadcn@latest init
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Drizzle ORM | Prisma | Only if team is already heavily invested in Prisma and won't hit Edge Runtime; Prisma's client bundle is too large for Vercel serverless cold starts at scale |
| Drizzle ORM | Kysely | If you want even thinner abstraction and write raw SQL everywhere; no migration story built-in |
| Better Auth | Auth.js v5 (NextAuth) | Only if migrating an existing Auth.js project; do not start new projects on it — it remains perpetual beta and is being sunset |
| Better Auth | Clerk | If you want fully hosted auth UI and are willing to pay per MAU; overkill for a single-user exam study tool |
| ts-fsrs (FSRS) | Custom SM-2 | Never — FSRS is empirically better and ts-fsrs is production-ready; SM-2 is a 1987 algorithm |
| react-d3-tree + Framer Motion | Cytoscape.js | Only if you need graph (not tree) layouts — RB trees and B-trees are strictly trees; Cytoscape adds unnecessary complexity |
| react-d3-tree + Framer Motion | vis-network / sigma.js | Same — graph-oriented, heavier, worse DX for trees |
| Tailwind CSS v4 + shadcn | Chakra UI / MUI | Only if you need accessibility-heavy enterprise components; Chakra/MUI add significant bundle weight and fight with Tailwind |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| NextAuth.js v5 (next-auth@5 beta) | Still beta after 2+ years; perpetual API churn; Auth.js team has handed it off to Better Auth; edge/adapter split is a known footgun for App Router + DB adapter combinations | Better Auth 1.5.x |
| Prisma | Large client bundle causes cold start penalty on Vercel serverless; not edge-runtime safe without extra config; slower query execution vs Drizzle for simple queries | Drizzle ORM 0.45.x |
| SM-2 algorithm (hand-rolled) | Outdated 1987 algorithm; requires reimplementing interval math that ts-fsrs already provides; FSRS has measurably better retention outcomes | ts-fsrs 5.3.x |
| D3.js (direct, no React wrapper) | Forces imperative DOM mutations that conflict with React's rendering model; causes sync issues during step-through animations | react-d3-tree (D3 for layout, React for rendering) |
| Chart.js / Recharts | Built for charts, not tree graphs; cannot represent hierarchical tree structures with edges and labeled nodes | react-d3-tree |
| localStorage for progress persistence | Data lost on device change; user cannot switch devices mid-study session | Neon Postgres via Drizzle |
| PDF.js for runtime PDF parsing | App uses Neon Postgres seeded at build time; runtime PDF parsing adds cold-start overhead and fragile parsing logic; PDFs are already available offline | Build-time seed scripts |

---

## Stack Patterns by Variant

**For algorithm step-through visualization:**
- Store step history as an array of tree snapshots in Zustand
- Each snapshot is a plain JS object (not a class instance) — serialize cleanly to JSON
- `react-d3-tree` re-renders from snapshot on each step change
- Framer Motion `layout` prop on node elements handles position animation between steps
- Do NOT use D3 transitions for this — they run outside React's reconciler

**For spaced repetition (FSRS scheduling):**
- Store card state as `Card` type from ts-fsrs in Postgres (stability, difficulty, due date, reps, lapses)
- Run `fsrs.repeat(card, now)` server-side in a Server Action — never client-side (avoids clock manipulation)
- Store full `ReviewLog` per answer for analytics and optimizer training later
- Rating map: Again=1, Hard=2, Good=3, Easy=4 (FSRS standard)

**For Vercel deployment with Neon:**
- Use `@neondatabase/serverless` HTTP driver (not WebSocket) for all Vercel function routes
- WebSocket driver only needed if you require interactive transactions — the HTTP driver is sufficient for this app's read/write patterns
- Set `DATABASE_URL` in Vercel environment to the Neon pooled connection string

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.x | react@19.x, tailwindcss@4.x | Official supported matrix |
| better-auth@1.5.x | next@15+, next@16.x | App Router integration via `toNextJsHandler()` |
| drizzle-orm@0.45.x | @neondatabase/serverless@1.x | Use `neon()` from `@neondatabase/serverless` + `drizzle()` from `drizzle-orm/neon-http` |
| ts-fsrs@5.3.x | Node.js 18+, ESM + CJS | Works in Vercel serverless (Node 18 runtime); do not run in Edge Runtime (uses native Date math) |
| react-d3-tree@3.6.x | react@18, react@19 | React 19 compatible; renders SVG via D3 layout, React for DOM |
| framer-motion@12.x | react@19, Next.js 16 App Router | Use `"use client"` directive; do not import in Server Components |
| shadcn/ui (CLI) | tailwindcss@4.x, react@19 | Components updated for Tailwind v4 + React 19 as of 2025; run `pnpm dlx shadcn@latest init` |

---

## Sources

- npm registry (live, 2026-03-24) — versions for next, better-auth, drizzle-orm, drizzle-kit, @neondatabase/serverless, ts-fsrs, react-d3-tree, framer-motion, zustand, zod
- [Auth.js is now part of Better Auth (official announcement)](https://better-auth.com/blog/authjs-joins-better-auth) — MEDIUM confidence (WebSearch verified, official source)
- [Drizzle ORM + Neon official tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) — HIGH confidence
- [Neon serverless driver docs](https://neon.com/docs/serverless/serverless-driver) — HIGH confidence
- [ts-fsrs GitHub (open-spaced-repetition org)](https://github.com/open-spaced-repetition/ts-fsrs) — HIGH confidence
- [react-d3-tree GitHub](https://github.com/bkrem/react-d3-tree) — MEDIUM confidence (library is maintained but less active than core packages)
- [Vercel Next.js + Drizzle + Postgres starter template](https://vercel.com/templates/next.js/postgres-drizzle) — HIGH confidence (Vercel first-party)
- WebSearch: Better Auth vs NextAuth comparisons (2025) — MEDIUM confidence (multiple sources agree)
- WebSearch: FSRS vs SM-2 performance claims — MEDIUM confidence (sourced from open-spaced-repetition org materials, not independently reviewed literature)

---

*Stack research for: CS201 Exam 2 Study App — interactive educational web app*
*Researched: 2026-03-24*
