# Milestone v1.0 — Project Summary

**Generated:** 2026-03-25
**Purpose:** Team onboarding and project review

---

## 1. Project Overview

**CS201 Exam 2 Study App** is an interactive web application for studying CS 201 data structures and algorithms — specifically Exam 2 material covering **Huffman codes**, **N-ary trees**, **Red-Black trees**, and **B-Trees**.

**Core Value:** A student who uses this app for any amount of time should leave with a measurably stronger grasp of the exam topics — whether that's understanding one algorithm better via animation, or drilling weak spots via spaced repetition quizzes.

**Target Users:** CS 201 students ranging from zero familiarity to exam reviewers. The app must serve both.

**Current State:** Phase 1 (Foundation) is complete. The full-stack foundation is live: Next.js 16 + Better Auth + Neon Postgres, Google OAuth working, 4 topics with 11 lessons seeded, dashboard and lesson reader UI verified end-to-end. Phases 2-4 (Visualizations, Quiz Engine, Spaced Repetition) are planned but not yet started.

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Runtime | Node.js | 24 (pinned via `.nvmrc`) |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| ORM | Drizzle ORM | 0.45.1 |
| Database | Neon Postgres | Serverless |
| DB Driver | @neondatabase/serverless (HTTP) | 1.0.2 |
| Auth | Better Auth (Google OAuth) | 1.5.6 |
| Validation | Zod | 4.3.6 |
| Package Manager | pnpm | 9.x |
| Testing | Vitest | 4.1.1 |
| Containerization | Docker (multi-stage) + Docker Compose | — |

---

## 2. Architecture & Technical Decisions

### Core Patterns

- **Drizzle + Neon HTTP driver:** `neon()` from `@neondatabase/serverless` + `drizzle()` from `drizzle-orm/neon-http`. Stateless HTTP transport — no persistent TCP connections, safe for Vercel serverless.
  - **Why:** `new Pool()` at module scope creates stale connections that exhaust Vercel serverless limits.
  - **Phase:** Pre-Phase 1

- **Better Auth (not NextAuth v5):** TypeScript-first auth with Drizzle adapter and Google OAuth as first-class provider.
  - **Why:** NextAuth v5 has been in beta for 2+ years and is being sunset; Better Auth is the recommended successor.
  - **Phase:** Pre-Phase 1

- **Dual-layer auth:** Middleware performs cookie-only check (no DB call, UX redirect only). Server-side `requireAuth()` performs full DB-validated session check via `auth.api.getSession()`.
  - **Why:** Edge Runtime cannot use the Drizzle/Neon driver. Middleware is not a security gate (CVE-2025-29927 class).
  - **Phase:** Phase 1

- **Better Auth user.id is text, not UUID:** All FK columns use `text('user_id')`, not `uuid`.
  - **Why:** Better Auth generates nanoid-style text IDs. UUID FK constraints would fail on insert.
  - **Phase:** Phase 1

- **Full schema in Phase 1:** All 11 DB tables (7 app + 4 auth) created upfront. Phases 2-4 add data, not schema migrations.
  - **Why:** Avoids migration complexity across phases; downstream phases can focus on features.
  - **Phase:** Phase 1

- **Content seeded at build time from PDFs:** `pdf-parse` extracts text, structured into JSON seed files committed to repo. No runtime PDF parsing, no API keys at deploy time.
  - **Why:** Reliability over flexibility — no fragile runtime parsing on Vercel.
  - **Phase:** Phase 1

- **Server Components for data fetching:** Drizzle queries run directly in async Server Components. No API routes needed for read-only content.
  - **Why:** Simpler architecture, fewer files, leverages RSC streaming.
  - **Phase:** Phase 1

- **Docker multi-stage build:** Separate `dev` and `runner` targets. `output: "standalone"` in next.config.ts produces minimal production images (~198MB vs ~849MB dev).
  - **Why:** Developer works across multiple machines via terminal/vim; Docker eliminates Node version drift and dependency mismatches.
  - **Phase:** Quick Task (post-Phase 1)

---

## 3. Phases Delivered

| Phase | Name | Status | Summary |
|-------|------|--------|---------|
| 1 | Foundation | Complete | DB schema (11 tables), Better Auth Google OAuth, PDF content pipeline (4 topics, 11 lessons), dashboard + lesson reader UI |
| 2 | Visualizations | Planned | Step-through algorithm animations for all four topics with pre-computed snapshots |
| 3 | Quiz Engine & Flashcards | Planned | All question types (MC, fill-blank, tracing, debugging, short answer) with answer recording |
| 4 | Progress & Spaced Repetition | Planned | FSRS scheduling, per-topic dashboard, recommended next action |

### Phase 1 Plan Breakdown

| Plan | Focus | Duration | Key Deliverables |
|------|-------|----------|-----------------|
| 01-01 | Scaffold + Schema | 11 min | Next.js 16 project, 7-table Drizzle schema, shadcn/ui, Vitest |
| 01-02 | Auth | ~35 min | Better Auth + Google OAuth, middleware, requireAuth(), sign-in page |
| 01-03 | Content Pipeline | ~25 min | PDF extraction, 4 structured JSON files, idempotent seed script (4 topics, 11 lessons) |
| 01-04 | UI Layer | ~45 min | Dashboard, topic pages, lesson content renderer, NavBar, loading skeletons |

### Quick Tasks

| Task | Description | Date |
|------|-------------|------|
| 260325-4yy | Dockerize application (multi-stage Dockerfile, docker-compose with dev/prod profiles) | 2026-03-25 |

---

## 4. Requirements Coverage

### Complete (Phase 1)

- **AUTH-01:** User can sign in with Google OAuth in one click
- **AUTH-02:** Session persists across browser refresh and new tabs
- **AUTH-03:** User can sign out from any page
- **AUTH-04:** Progress tied to Google account, persists across devices
- **CONT-01:** Structured lessons for each topic (concept, pseudocode, C++)
- **CONT-02:** Huffman lesson covers greedy algorithm, encoding, decoding
- **CONT-03:** N-ary trees lesson covers preorder, postorder, level-order traversal, Big-O
- **CONT-04:** Red-Black trees covers search, insert (rotations), delete (double-black fixup)
- **CONT-05:** B-Trees covers search, insert (splits), delete (merges/redistribution)
- **CONT-06:** All content seeded from CS201-Exam2 PDF source material
- **INFRA-01:** Deployed on Vercel as Next.js 16 App Router
- **INFRA-02:** Neon Postgres via Drizzle ORM
- **INFRA-03:** Content seeding script populates DB from PDFs
- **INFRA-04:** Server-side auth guards (not middleware-only)

**Score: 14/14 requirements verified**

### Pending (Phases 2-4)

- **VIZ-01 through VIZ-06:** Algorithm visualization animations (Phase 2)
- **QUIZ-01 through QUIZ-07:** Quiz engine with 5 question types (Phase 3)
- **CARD-01 through CARD-03:** Flashcard decks (Phase 3)
- **PROG-01 through PROG-04:** Progress dashboard + FSRS spaced repetition (Phase 4)

**Total: 14/34 requirements complete (41%)**

---

## 5. Key Decisions Log

| ID | Decision | Phase | Rationale |
|----|----------|-------|-----------|
| D-01 | AI-assisted PDF parsing with human review | Phase 1 | Image-heavy slides required manual fill from standard CS knowledge |
| D-02 | Committed seed JSON files (no runtime parsing) | Phase 1 | No API keys needed at Vercel deploy; static artifacts |
| D-04 | Full schema in Phase 1 | Phase 1 | Downstream phases add data only, no migrations |
| D-05 | Single `questions` table with discriminated union JSONB | Phase 1 | Zod validates 5 question types at runtime |
| D-07 | Scrollable lesson document (Concept → Pseudo → C++) | Phase 1 | Fastest to build, natural reading order |
| D-09 | Route: `/` dashboard → `/topics/[slug]` detail | Phase 1 | Tab-based topic pages ready for Phase 2 activation |
| D-10 | Disabled tabs visible from Phase 1 | Phase 1 | Sets navigation structure; Phase 2 flips `disabled=false` |
| — | `text('user_id')` not `uuid` for auth FK | Phase 1 | Better Auth generates nanoid text IDs |
| — | Cookie-only middleware + DB-validated requireAuth() | Phase 1 | Edge Runtime can't use Drizzle; security at server level |
| — | Clear-then-reinsert seed pattern | Phase 1 | Simpler than upsert for static content |
| — | `type: "module"` in package.json | Phase 1 | Required for `node --experimental-strip-types` ESM scripts |
| — | Docker multi-stage with compose profiles | Post-Phase 1 | Consistent environments across dev machines |

---

## 6. Tech Debt & Deferred Items

### Known Risks

- **Content pipeline unspecified beyond Phase 1:** Manual JSON authoring vs automated PDF parsing for questions/flashcards needs to be decided before Phase 3.
- **RB tree correctness pitfalls:** Double rotation (zigzag cases) and B-Tree split/merge cascade — write invariant validators before animation code in Phase 2.
- **react-d3-tree vs custom SVG:** Tradeoff must be settled at Phase 2 start. Custom SVG gives more control for RB (color-critical) and B-Trees (multi-key nodes).

### Anti-Patterns: None Found

Phase 1 verification found no TODO/FIXME/placeholder stubs, no `return null` components, no hardcoded empty arrays. All data flows from DB through queries to components are verified.

### Lessons Learned

- Better Auth tables should be added manually to `schema.ts` rather than using `npx @better-auth/cli generate` which risks overwriting existing app tables.
- `pdf-parse@2.x` uses a different API than 1.x (PDFParse named class vs default export) — always verify major version API changes.
- Node 24 is required for Next.js 16 — `.nvmrc` pin is essential.

---

## 7. Getting Started

### Prerequisites

- **Node.js 24** (pinned in `.nvmrc` — use `nvm use` if you have nvm)
- **pnpm 9.x** (package manager)
- **Docker + Docker Compose V2** (for containerized development)
- **Neon Postgres account** (free tier works)
- **Google Cloud Console** project with OAuth 2.0 credentials

### Environment Variables

Create a `.env.local` file in the project root:

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

Google OAuth authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Local Development (without Docker)

```bash
nvm use                  # Switch to Node 24
pnpm install             # Install dependencies
pnpm db:push             # Push schema to Neon
pnpm db:seed             # Seed 4 topics + 11 lessons
pnpm dev                 # Start dev server at http://localhost:3000
```

### Local Development (with Docker)

```bash
docker compose --profile dev up          # Hot-reload dev server at http://localhost:3000
docker compose --profile dev up --build  # Rebuild after dependency changes
docker compose --profile dev down        # Tear down
```

- Source code is volume-mounted — changes reflect immediately without rebuild
- `node_modules` and `.next` use anonymous volumes to prevent host/container conflicts
- Environment variables injected from `.env.local` at runtime

### Production Build (with Docker)

```bash
docker compose --profile prod up          # Standalone prod server at http://localhost:3000
docker compose --profile prod up --build  # Rebuild after code changes
docker compose --profile prod down        # Tear down
```

- Optimized standalone image (~198MB vs ~849MB dev)
- Runs as non-root `nextjs` user (UID 1001)
- Health check via `wget` every 30s
- No secrets baked into images — env vars injected at runtime via `env_file`

### Vercel Deployment (Production)

The app is designed for Vercel deployment. Docker is for local development consistency — Vercel handles production hosting natively.

1. **Connect repo** to Vercel (import from GitHub)
2. **Set environment variables** in Vercel project settings:
   - `DATABASE_URL` — Neon Postgres pooled connection string
   - `BETTER_AUTH_SECRET` — same value as local
   - `BETTER_AUTH_URL` — your Vercel production URL (e.g., `https://cs201-study.vercel.app`)
   - `GOOGLE_CLIENT_ID` — same as local
   - `GOOGLE_CLIENT_SECRET` — same as local
3. **Add production OAuth redirect URI** in Google Cloud Console:
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
4. **Deploy** — Vercel auto-detects Next.js, runs `pnpm build`, and deploys

Vercel uses `output: "standalone"` from `next.config.ts` automatically. The Dockerfile is not used for Vercel deployments — Vercel has its own build pipeline optimized for Next.js.

**Note:** `output: "standalone"` in `next.config.ts` is always active. It does not affect `pnpm dev` (local or Docker) but changes `pnpm build` output structure. This is intentional and compatible with both Docker and Vercel.

### Database Commands

```bash
pnpm db:push             # Push schema changes to Neon (dev)
pnpm db:generate         # Generate migration files (production)
pnpm db:migrate          # Run migrations (production)
pnpm db:seed             # Seed topics and lessons
pnpm db:parse            # Extract text from PDFs (one-time)
```

### Testing

```bash
pnpm test                # Run Vitest test suite
pnpm test:watch          # Watch mode
```

### Key Directories

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── (auth)/          # Sign-in page (public route)
│   ├── topics/[topic]/  # Topic detail pages (auth-gated)
│   └── api/auth/        # Better Auth catch-all handler
├── components/          # React components
│   ├── nav/             # NavBar (sign-out, avatar)
│   ├── topics/          # TopicCard, TopicTabs
│   ├── lessons/         # LessonContent renderer
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── auth.ts          # Better Auth server instance
│   ├── auth-client.ts   # Better Auth browser client
│   ├── db/              # Drizzle schema + connection
│   └── content/         # Topic/lesson query helpers
├── actions/             # Server actions (requireAuth)
scripts/                 # PDF parsing + DB seed scripts
drizzle/                 # Generated migration files
```

---

## Stats

- **Timeline:** 2026-03-24 → 2026-03-25 (2 days)
- **Phases:** 1/4 complete (Phase 1: Foundation)
- **Commits:** 47
- **Files changed:** 107 (+22,777 insertions)
- **Contributors:** Wheeler Knight
