# CS201 Exam 2 Study App

An interactive web application for studying CS 201 data structures and algorithms — specifically Exam 2 material covering **Huffman codes**, **N-ary trees**, **Red-Black trees**, and **B-Trees**. Built with Next.js 16, Neon Postgres, and Better Auth.

**Core Value:** A student who uses this app for any amount of time should leave with a measurably stronger grasp of the exam topics — whether that's understanding one algorithm better via animation, or drilling weak spots via spaced repetition quizzes.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Runtime | Node.js | 24 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| ORM | Drizzle ORM | 0.45.x |
| Database | Neon Postgres (serverless) | — |
| Auth | Better Auth (Google OAuth) | 1.5.x |
| Validation | Zod | 4.x |
| Package Manager | pnpm | 9.x |
| Testing | Vitest | 4.x |
| Containerization | Docker (multi-stage) + Compose | — |

## Features (v1.0)

- **Google OAuth** — one-click sign-in, session persists across refresh/tabs/devices
- **4 Topic Areas** — Huffman Codes, N-ary Trees, Red-Black Trees, B-Trees
- **11 Structured Lessons** — concept explanation, pseudocode, and C++ implementation per algorithm
- **Seeded from Course PDFs** — content extracted and structured from actual CS201 Exam 2 slides
- **Auth-Gated** — all content behind sign-in; progress tied to Google account
- **Dockerized** — consistent dev/prod environments across machines

### Roadmap

| Phase | Status |
|-------|--------|
| 1. Foundation (schema, auth, content, UI) | Complete |
| 2. Step-through algorithm visualizations | Planned |
| 3. Quiz engine + flashcards (5 question types) | Planned |
| 4. Progress dashboard + FSRS spaced repetition | Planned |

## Getting Started

### Prerequisites

- **Node.js 24** (pinned in `.nvmrc` — use `nvm use`)
- **pnpm 9.x**
- **Docker + Docker Compose V2** (for containerized development)
- A [Neon](https://neon.tech) Postgres database (free tier works)
- Google Cloud Console project with [OAuth 2.0 credentials](https://console.cloud.google.com/apis/credentials)

### Environment Variables

Create `.env.local` in the project root:

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console.

---

## Running Locally (without Docker)

```bash
nvm use                  # Switch to Node 24
pnpm install             # Install dependencies
pnpm db:push             # Push schema to Neon
pnpm db:seed             # Seed 4 topics + 11 lessons
pnpm dev                 # http://localhost:3000
```

## Running with Docker

Docker ensures a consistent environment across all machines — same Node version, same dependencies, same behavior. No more "works on my machine" issues.

### Development Container

```bash
docker compose --profile dev up
```

- Hot-reload dev server at **http://localhost:3000**
- Source code is volume-mounted — file changes reflect immediately
- `node_modules` and `.next` use anonymous volumes (container deps stay isolated from host)
- Environment variables injected from `.env.local` at runtime

```bash
docker compose --profile dev up --build   # Rebuild after dependency changes (package.json/lockfile)
docker compose --profile dev down         # Tear down
```

### Production Container

```bash
docker compose --profile prod up
```

- Optimized standalone server at **http://localhost:3000**
- ~198MB image (vs ~849MB dev) — only includes files needed at runtime
- Runs as non-root `nextjs` user (UID 1001)
- Health check via `wget` every 30s
- `restart: unless-stopped` for automatic recovery

```bash
docker compose --profile prod up --build  # Rebuild after code changes
docker compose --profile prod down        # Tear down
```

### Docker Architecture

The `Dockerfile` uses a multi-stage build:

| Stage | Purpose |
|-------|---------|
| `base` | Node 24 Alpine + pnpm 9 via corepack |
| `deps` | Cached dependency install (`pnpm install --frozen-lockfile`) |
| `dev` | Hot-reload target — runs `pnpm dev` |
| `builder` | Runs `pnpm build` with placeholder env vars (no secrets baked in) |
| `runner` | Minimal production image — copies standalone output only |

Docker Compose selects the target via `build.target`:
- `--profile dev` builds the `dev` target
- `--profile prod` builds through `builder` → `runner`

No database container is included — the app connects to external Neon Postgres via `DATABASE_URL` in `.env.local`.

---

## Deploying to Vercel (Production)

The app is designed for Vercel deployment. Docker is for **local development consistency** — Vercel handles production hosting natively with its own Next.js-optimized build pipeline.

1. **Connect your repo** to [Vercel](https://vercel.com) (import from GitHub)
2. **Set environment variables** in Vercel project settings:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Neon pooled connection string |
   | `BETTER_AUTH_SECRET` | Same as local (32+ char hex) |
   | `BETTER_AUTH_URL` | Your Vercel URL (e.g., `https://cs201-study.vercel.app`) |
   | `GOOGLE_CLIENT_ID` | Same as local |
   | `GOOGLE_CLIENT_SECRET` | Same as local |

3. **Add production redirect URI** in Google Cloud Console:
   ```
   https://your-vercel-domain.vercel.app/api/auth/callback/google
   ```
4. **Deploy** — Vercel auto-detects Next.js, runs `pnpm build`, and deploys

`output: "standalone"` in `next.config.ts` is always active. It doesn't affect `pnpm dev` but optimizes `pnpm build` for both Docker and Vercel.

---

## Database Commands

```bash
pnpm db:push             # Push schema to Neon (dev — fast, no migration files)
pnpm db:generate         # Generate migration SQL files (production)
pnpm db:migrate          # Run pending migrations (production)
pnpm db:seed             # Seed topics and lessons from committed JSON
pnpm db:parse            # Extract text from PDFs (one-time setup)
```

## Testing

```bash
pnpm test                # Run Vitest suite
pnpm test:watch          # Watch mode
```

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/sign-in/      # Sign-in page (public)
│   ├── topics/[topic]/      # Topic detail pages (auth-gated)
│   └── api/auth/[...all]/   # Better Auth handler
├── components/
│   ├── nav/NavBar.tsx       # User avatar + sign-out
│   ├── topics/              # TopicCard, TopicTabs
│   ├── lessons/             # LessonContent renderer
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── auth.ts              # Better Auth server instance
│   ├── auth-client.ts       # Better Auth browser client
│   ├── db/schema.ts         # Drizzle schema (11 tables)
│   ├── db/index.ts          # Drizzle + Neon connection
│   └── content/queries.ts   # Topic/lesson query helpers
└── actions/auth.ts          # requireAuth() server action
scripts/
├── parse-pdfs.ts            # PDF text extraction
└── seed.ts                  # DB seed from JSON
Dockerfile                   # Multi-stage (dev + prod targets)
docker-compose.yml           # Dev and prod service profiles
```

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Drizzle ORM (not Prisma) | Smaller bundle, edge-safe, faster cold starts on Vercel serverless |
| Better Auth (not NextAuth v5) | NextAuth v5 is sunset; Better Auth is the TypeScript-first successor |
| Neon HTTP driver (not Pool) | Stateless per-request — no TCP connection exhaustion on serverless |
| Cookie middleware + DB-validated requireAuth() | Edge Runtime can't use DB driver; security check at server level |
| Full schema in Phase 1 | Downstream phases add data, not migrations |
| Content seeded from PDFs at build time | No runtime parsing, no API keys at deploy |
| Docker multi-stage + compose profiles | Consistent environments across dev machines |

## Content Coverage

| Topic | Lessons | Algorithms |
|-------|---------|------------|
| Huffman Codes | 3 | Greedy construction, encoding, decoding |
| N-ary Trees | 2 | Preorder, postorder, level-order traversal, O(n) analysis |
| Red-Black Trees | 3 | Search, insert (3-case fixup), delete (double-black fixup) |
| B-Trees | 3 | Search, insert (preemptive splits), delete (borrow/merge) |
