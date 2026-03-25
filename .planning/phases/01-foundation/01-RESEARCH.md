# Phase 1: Foundation - Research

**Researched:** 2026-03-24
**Domain:** Next.js App Router scaffold, Better Auth + Google OAuth, Drizzle ORM + Neon Postgres, PDF content pipeline, lesson page UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Content Pipeline**
- D-01: Use AI-assisted PDF parsing — extract text from the 11 PDFs using `pdf-parse` (or similar), then pass extracted text to an LLM to structure it into concept/pseudocode/C++ sections per topic.
- D-02: Pre-run the pipeline locally. Commit the resulting structured JSON/TS seed files to the repo. No API key required at Vercel build time — seed files are static artifacts.
- D-03: Section-by-section review workflow — generate and review each of the four topics separately before committing. Manually edit anything incorrect before committing that topic's seed file.

**DB Schema**
- D-04: Create the full schema in Phase 1: `users`, `sessions`, `topics`, `lessons`, `questions`, `flashcards`, `user_answers` (or equivalent progress table). Phases 2-4 add data, not schema migrations.
- D-05: Questions use a single `questions` table with a `question_type` enum column (`multiple_choice | fill_blank | trace_step | debug_step | short_answer`) and a `content` JSONB column holding type-specific fields. Zod validates the union shape per type at runtime.
- D-06: Phase 1 seed populates `topics` and `lessons` only. Questions and flashcard rows are seeded in Phase 3 when the quiz engine is built. Schema exists, tables are empty.

**Lesson Page Structure**
- D-07: Lessons are a scrollable document with anchored sections in order: Concept → Pseudocode → C++ Code. Standard docs pattern — fastest to build, natural to read.
- D-08: All lesson content is behind auth. Sign-in required to access any lesson page. No public read mode. Aligns with AUTH-04 (progress tied to Google account).

**Navigation Architecture**
- D-09: Route structure: `/` (dashboard with 4 topic cards) → `/topics/[topic]` (topic detail page). Topic slugs: `huffman`, `n-ary-trees`, `red-black-trees`, `b-trees`.
- D-10: Topic detail page uses tabs: **Lesson** | Visualizations | Quiz | Flashcards. In Phase 1, only Lesson tab is active; remaining tabs are visible but disabled (greyed out). Sets navigation structure for all downstream phases without requiring refactoring.

### Claude's Discretion
- Exact Drizzle schema column names and TypeScript types (e.g., `createdAt` vs `created_at`) — follow Drizzle conventions and camelCase TypeScript.
- shadcn/ui component choices for the topic card grid and topic page tabs — use standard shadcn Card and Tabs primitives.
- Error boundary and loading state patterns — use Next.js App Router conventions (loading.tsx, error.tsx).
- Better Auth session middleware setup details — follow Better Auth docs for App Router.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | App deployed on Vercel as Next.js 16 App Router application | Next.js 16.2.1 scaffold with `pnpm create next-app@latest`; Vercel-native deployment |
| INFRA-02 | User data and content stored in Neon Postgres accessed via Drizzle ORM | Drizzle 0.45.1 + @neondatabase/serverless 1.0.2 + neon-http driver pattern |
| INFRA-03 | Content seeding script reads source PDFs and populates DB with lessons for all four topics | `pdf-parse` 2.4.5 + LLM structuring + `tsx` script; 11 PDFs confirmed present in `CS201-Exam2/` |
| INFRA-04 | All user-data mutations authenticated via Better Auth server-side guards (not middleware-only) | `auth.api.getSession({ headers: await headers() })` in every Server Action |
| AUTH-01 | User can sign in with Google OAuth in one click, no additional fields | Better Auth 1.5.6 `socialProviders.google` + `authClient.signIn.social({ provider: "google" })` |
| AUTH-02 | User session persists across browser refresh and new tabs | Better Auth cookie-based sessions, 7-day default expiry with 1-day refresh |
| AUTH-03 | User can sign out from any page | `authClient.signOut()` from any client component |
| AUTH-04 | Progress tied to Google account, persists across devices | User row created on first OAuth sign-in; all data keyed to userId in Neon Postgres |
| CONT-01 | User can read structured lesson for each topic with concept, pseudocode, C++ | Lesson RSC page: three `<section>` elements per lesson, seeded from DB |
| CONT-02 | Huffman lesson covers: greedy algorithm, encoding, decoding | Content authored from `CS201-Exam2/Huffman Codes.pdf` via AI-assisted pipeline |
| CONT-03 | N-ary trees lesson covers: preorder, postorder, level-order traversal, Big-O | Content authored from `CS201-Exam2/Non-Binary Trees and Traversals.pdf` |
| CONT-04 | Red-Black trees lesson covers: search, insert (rotations + recoloring), delete (double-black fixup) | Content from `CS201-Exam2/Red-Black Trees.pdf` + `Red-Black Trees Continued.pdf` |
| CONT-05 | B-Trees lesson covers: search, insert (splits), delete (merges + redistribution) | Content from `CS201-Exam2/B-Trees Search and Insert.pdf` + `B-Trees Deletion.pdf` |
| CONT-06 | All content seeded from CS201-Exam2 PDF source material | Build-time pipeline: `pdf-parse` text extraction → LLM structuring → committed seed files |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield project scaffold delivering five things: (1) Next.js 16 App Router project initialized, (2) Drizzle ORM + Neon Postgres connected with full schema migrated, (3) Better Auth Google OAuth working end-to-end with session persistence, (4) all four topic lessons seeded from the PDF source material, and (5) a working lesson reading UI with the tab shell that downstream phases will populate. This phase has no upstream dependencies and everything downstream — visualizations, quiz engine, spaced repetition — depends on it being complete and correct.

The three technical areas requiring careful first-time setup are: (a) Better Auth with Drizzle adapter, which differs substantially from the NextAuth patterns documented in the pre-phase architecture research; (b) the Drizzle + Neon HTTP driver connection, which must use `drizzle-orm/neon-http` with the `@neondatabase/serverless` `neon()` function (not a pool); and (c) the content pipeline, which is a one-time local script that runs `pdf-parse` + LLM structuring and produces committed seed files — no API key needed at Vercel deploy time.

The DB schema must be created in full in this phase per D-04. Even though only `topics` and `lessons` are seeded now, the `questions`, `flashcards`, and all SR/progress tables must be migrated so Phases 2-4 add data only, never schema migrations. The discriminated union question schema (D-05) must be established before any content seeding occurs.

**Primary recommendation:** Initialize the project using `pnpm create next-app@latest`, set up Drizzle + Neon first (validates the DB connection before layering auth on top), then add Better Auth with its Drizzle adapter using `npx @better-auth/cli generate` to produce the auth table schema, then run the PDF content pipeline.

---

## Standard Stack

### Core (Phase 1 Only — subset of full project stack)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | Full-stack framework | Required constraint; App Router RSC for lesson pages |
| react | 19.x | UI runtime | Bundled with Next.js 16 |
| typescript | 5.x | Type safety | Strict throughout; no `any` |
| tailwindcss | 4.x | Styling | Zero-config with Next.js 16; no tailwind.config.ts needed |
| drizzle-orm | 0.45.1 | ORM | Edge-safe; lightweight; Neon-native |
| @neondatabase/serverless | 1.0.2 | Neon HTTP driver | Avoids TCP connection limits on Vercel |
| drizzle-kit | 0.31.10 | Migrations CLI | `push` for local dev, `generate`+`migrate` for prod |
| better-auth | 1.5.6 | Google OAuth + sessions | NextAuth v5 successor; TypeScript-first |
| zod | 4.3.6 | Runtime validation | Question JSONB union validation; env var parsing |
| pdf-parse | 2.4.5 | PDF text extraction | Build-time only; extracts raw text for LLM structuring |
| tsx | 4.21.0 | Run seed scripts | `pnpm tsx scripts/seed.ts` without compile step |

### UI Components (shadcn/ui — Phase 1 subset)

Per `01-UI-SPEC.md`, install these shadcn components:

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add card tabs badge button avatar separator skeleton
```

shadcn init options: TypeScript=yes, style=default, base color=Zinc (dark), CSS variables=yes, components alias=`@/components`, utils alias=`@/lib/utils`.

### Installation

```bash
# 1. Scaffold
pnpm create next-app@latest cs201-study --typescript --tailwind --app --src-dir --no-eslint

# 2. Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# 3. Auth
pnpm add better-auth

# 4. Validation
pnpm add zod

# 5. Seed script tooling (dev only)
pnpm add -D pdf-parse @types/pdf-parse tsx

# 6. shadcn/ui
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add card tabs badge button avatar separator skeleton
```

### Version Verification (checked 2026-03-24 via npm registry)

| Package | Version | Published |
|---------|---------|-----------|
| next | 16.2.1 | current |
| better-auth | 1.5.6 | current |
| drizzle-orm | 0.45.1 | current |
| drizzle-kit | 0.31.10 | current |
| @neondatabase/serverless | 1.0.2 | current |
| pdf-parse | 2.4.5 | current |
| zod | 4.3.6 | current |
| tsx | 4.21.0 | current |
| vitest | 4.1.1 | current |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — Inter font, global nav shell
│   ├── page.tsx                      # / dashboard — RSC, 4 topic cards
│   ├── loading.tsx                   # Root Suspense boundary (Skeleton)
│   ├── (auth)/
│   │   └── sign-in/
│   │       └── page.tsx              # Sign-in page — centered card + Google button
│   ├── topics/
│   │   ├── layout.tsx                # Topic shell layout (auth guard)
│   │   └── [topic]/
│   │       ├── page.tsx              # Topic page — Tabs shell (RSC)
│   │       └── loading.tsx           # Skeleton for lesson content
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts          # Better Auth catch-all handler
├── components/
│   ├── nav/
│   │   └── NavBar.tsx                # Logo + user avatar + sign-out
│   ├── topics/
│   │   ├── TopicCard.tsx             # Dashboard card (shadcn Card)
│   │   └── TopicTabs.tsx             # Tabs shell: Lesson | disabled...
│   ├── lessons/
│   │   └── LessonContent.tsx         # RSC: 3 sections (Concept/Pseudo/C++)
│   └── ui/                           # shadcn copied components
├── lib/
│   ├── auth.ts                       # Better Auth instance (server)
│   ├── auth-client.ts                # Better Auth client (browser)
│   ├── db/
│   │   ├── index.ts                  # Drizzle instance (neon-http)
│   │   └── schema.ts                 # Full Drizzle schema (all tables)
│   └── content/
│       └── queries.ts                # Topic/lesson query helpers
├── actions/
│   └── auth.ts                       # requireAuth() helper for Server Actions
scripts/
├── parse-pdfs.ts                     # Step 1: extract raw text from PDFs
└── seed.ts                           # Step 2: insert structured content into DB
drizzle/                              # Generated migration files
drizzle.config.ts                     # Drizzle Kit config
middleware.ts                         # Better Auth cookie-based route guard
```

### Pattern 1: Drizzle + Neon HTTP Driver

**What:** Use `neon()` from `@neondatabase/serverless` as the connection, passed to `drizzle()` from `drizzle-orm/neon-http`. Never use `new Pool()` at module level — it creates stale connections on Vercel serverless cold starts.

**When to use:** Every database access in the application.

```typescript
// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Pattern 2: Better Auth Instance (Server)

**What:** Single `auth` instance in `lib/auth.ts` using the Drizzle adapter. The `drizzleAdapter` is imported from `better-auth/adapters/drizzle` (not a separate package). Schema tables are generated by `npx @better-auth/cli generate` which outputs Drizzle-compatible TypeScript.

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
```

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Pattern 3: Better Auth Client (Browser)

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

**Sign-in trigger from client component:**
```typescript
"use client";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <button
      onClick={() => authClient.signIn.social({ provider: "google" })}
    >
      Sign in with Google
    </button>
  );
}
```

**Sign-out from client component:**
```typescript
"use client";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button onClick={() => authClient.signOut()}>
      Sign out
    </button>
  );
}
```

### Pattern 4: Session Check in Server Components and Server Actions

**What:** `auth.api.getSession()` with forwarded headers performs a full DB-validated session check. This is required per INFRA-04 — middleware is UX-only; mutations need server-side auth guards.

```typescript
// In any Server Component or Server Action
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Server Component
const session = await auth.api.getSession({
  headers: await headers(),
});
if (!session) redirect("/sign-in");

// Server Action — requireAuth helper
// src/actions/auth.ts
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");
  return session;
}
```

### Pattern 5: Middleware (Optimistic Cookie Check Only)

**What:** Middleware checks for session cookie existence — no DB call. This is UX-only: redirects unauthenticated users before page render. All protected data access still requires `requireAuth()` at the action/component level.

```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/topics/:path*"],
};
```

### Pattern 6: Full Drizzle Schema (All Tables — Phase 1)

Per D-04, all tables are created in Phase 1. Better Auth generates the `user`, `session`, `account`, `verification` tables via its CLI. The app adds `topics`, `lessons`, `questions`, `flashcards`, and SR/progress tables.

```typescript
// src/lib/db/schema.ts (app tables — Better Auth tables generated separately)
import {
  pgTable, uuid, text, integer, boolean,
  timestamp, jsonb, pgEnum, unique, index
} from "drizzle-orm/pg-core";

// Better Auth tables are generated into this file via:
// npx @better-auth/cli generate --output src/lib/db/schema.ts

// --- Content tables (seeded, read-only after seed) ---

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),  // huffman | n-ary-trees | red-black-trees | b-trees
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  title: text("title").notNull(),
  conceptMd: text("concept_md").notNull(),      // Markdown prose
  pseudocodeMd: text("pseudocode_md").notNull(), // Pseudocode block
  cppCode: text("cpp_code").notNull(),           // C++ implementation
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "fill_blank",
  "trace_step",
  "debug_step",
  "short_answer",
]);

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  questionType: questionTypeEnum("question_type").notNull(),
  prompt: text("prompt").notNull(),
  content: jsonb("content").notNull(),    // Zod-validated union per type
  explanation: text("explanation"),
  difficulty: integer("difficulty").default(2).notNull(), // 1-5
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- SR / Progress tables (empty in Phase 1; queried in Phase 3+) ---

export const userTopicCards = pgTable("user_topic_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),  // FK to Better Auth user.id (text type)
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  // FSRS fields (ts-fsrs Card type)
  stability: text("stability").default("0").notNull(),
  difficulty: text("difficulty").default("0").notNull(),
  elapsedDays: integer("elapsed_days").default(0).notNull(),
  scheduledDays: integer("scheduled_days").default(0).notNull(),
  reps: integer("reps").default(0).notNull(),
  lapses: integer("lapses").default(0).notNull(),
  state: integer("state").default(0).notNull(),  // FSRS State enum
  due: timestamp("due", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.topicId)]);

export const userQuestionCards = pgTable("user_question_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  stability: text("stability").default("0").notNull(),
  difficulty: text("difficulty").default("0").notNull(),
  elapsedDays: integer("elapsed_days").default(0).notNull(),
  scheduledDays: integer("scheduled_days").default(0).notNull(),
  reps: integer("reps").default(0).notNull(),
  lapses: integer("lapses").default(0).notNull(),
  state: integer("state").default(0).notNull(),
  due: timestamp("due", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.questionId)]);

export const reviewHistory = pgTable("review_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  rating: integer("rating").notNull(),      // FSRS Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
  correct: boolean("correct").notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("review_history_user_idx").on(t.userId, t.answeredAt)]);
```

**Note on Better Auth user.id type:** Better Auth generates `user.id` as `text` (not `uuid`) by default. All foreign keys to `user_id` must use `text("user_id")`, not `uuid("user_id")`. Verify this when running `npx @better-auth/cli generate`.

### Pattern 7: Content Seed Script

**What:** A standalone script runnable with `pnpm tsx scripts/seed.ts`. Uses `pdf-parse` to extract raw text, an LLM call to structure it, and Drizzle to insert into the DB.

**Execution model (D-02):** Run locally, review output, commit the resulting seed JSON files. The seed script reads committed JSON — it does not call the LLM at Vercel build time.

```
scripts/
├── parse-pdfs.ts     # Runs pdf-parse on each PDF, saves raw text to scripts/output/raw/
├── structure-content.ts  # Calls LLM with raw text, saves structured JSON to scripts/output/structured/
└── seed.ts           # Reads structured JSON, inserts into DB via Drizzle
```

Running order:
```bash
# Step 1: Extract text (run once, commit output)
pnpm tsx scripts/parse-pdfs.ts

# Step 2: Structure with LLM (run once per topic, review, commit output)
pnpm tsx scripts/structure-content.ts --topic huffman

# Step 3: Seed DB (run on each environment — reads committed JSON)
pnpm tsx scripts/seed.ts
```

The `seed.ts` script must be idempotent — use `onConflictDoNothing()` or `onConflictDoUpdate()` so re-running does not duplicate rows.

### Anti-Patterns to Avoid

- **`new Pool()` at module scope:** Creates persistent TCP connections that exhaust Vercel serverless limits. Use `neon()` from `@neondatabase/serverless` instead. The `neon-http` driver creates stateless HTTP requests per query.
- **Auth-only in middleware:** `middleware.ts` is UX redirect only. It does not validate session integrity. Every Server Action that mutates data must call `requireAuth()` independently (INFRA-04, CVE-2025-29927 class).
- **Prisma instead of Drizzle:** Prisma's client bundle exceeds safe limits for Vercel serverless cold starts. Drizzle is the mandated ORM.
- **`auth.ts` importing from `auth-client.ts` or vice versa:** `auth.ts` (server) and `auth-client.ts` (browser) are separate files and must never cross-import. Server-only imports will fail in the browser bundle.
- **Calling `auth.api.getSession()` in middleware:** The Edge Runtime cannot make database calls with the standard Drizzle/Neon driver. Middleware uses cookie check only; DB-validated session checks belong in RSC and Server Actions.
- **Seed script calling LLM at Vercel build time:** PDF content is pre-structured locally, committed as JSON, and the seed script only reads JSON. No API key needed in Vercel environment.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Google OAuth flow | Custom OAuth state machine | Better Auth `socialProviders.google` | PKCE, CSRF tokens, token refresh — 100+ edge cases |
| Session cookie management | Custom session middleware | Better Auth `toNextJsHandler` + `getSessionCookie` | Secure signing, rotation, expiry, revocation |
| DB connection pooling | Manual pool management | `neon()` HTTP driver (stateless) | Vercel serverless has no persistent process — pooling is irrelevant |
| DB migrations | Manual ALTER TABLE | `drizzle-kit generate` + `drizzle-kit migrate` | Tracks migration history, rollback-safe |
| Env var validation | Runtime try/catch | Zod `z.object({ DATABASE_URL: z.string() }).parse(process.env)` | Fails fast at startup with readable error, not cryptic runtime crash |
| PDF text extraction | Custom parser | `pdf-parse` 2.4.5 | PDF format is complex (streams, encoding, cross-references) |
| Markdown rendering | Custom renderer | `next-mdx-remote` or raw `<ReactMarkdown>` | Handles edge cases in heading/code block nesting |

**Key insight:** Auth and DB connection are where custom code most commonly introduces security vulnerabilities and operational failures. Use libraries that have been audited and tested at scale.

---

## Common Pitfalls

### Pitfall 1: Better Auth Schema Not Generated Before Migration

**What goes wrong:** Developer runs `drizzle-kit push` before running `npx @better-auth/cli generate`. Drizzle schema file only has app tables; auth tables missing. `auth.api.getSession()` throws "relation does not exist" at runtime.

**Why it happens:** Better Auth requires its own tables (`user`, `session`, `account`, `verification`) and generates them via CLI. They are NOT auto-created by the auth instance startup.

**How to avoid:** Generate auth schema first, then write app tables, then push:
```bash
npx @better-auth/cli generate --output src/lib/db/schema.ts
# Then manually add app tables below the generated auth tables
pnpm drizzle-kit push
```

**Warning signs:** `relation "user" does not exist` error on first sign-in attempt.

### Pitfall 2: Better Auth User ID Type Mismatch

**What goes wrong:** Developer assumes Better Auth user IDs are UUIDs and declares `userId: uuid("user_id")` in `userTopicCards` and `userQuestionCards`. FK constraint fails at insert time because Better Auth generates `user.id` as `text` (nanoid-style).

**Why it happens:** Better Auth does not use `gen_random_uuid()` — it generates its own IDs as text strings. The generated schema uses `text("id")` for the user table PK.

**How to avoid:** Inspect the generated schema from `npx @better-auth/cli generate` before writing FK columns. Use `text("user_id")` for all Better Auth user FK references.

**Warning signs:** `invalid input syntax for type uuid` on first sign-in / user creation.

### Pitfall 3: `baseURL` Missing from Better Auth Config

**What goes wrong:** Google OAuth callback URL defaults to `localhost:3000` in production. OAuth callback fails with "redirect_uri_mismatch" after Vercel deploy.

**Why it happens:** Without `baseURL` set, Better Auth cannot construct the correct callback URL for the OAuth redirect. Development works because localhost is added to Google OAuth authorized URIs; production domain is not.

**How to avoid:** Set `BETTER_AUTH_URL` env var to the production Vercel URL and include it in `auth.ts`. Add both `http://localhost:3000/api/auth/callback/google` and `https://your-vercel-domain.vercel.app/api/auth/callback/google` to Google Cloud Console authorized redirect URIs.

**Warning signs:** OAuth flow completes but redirects to wrong URL, or `Error 400: redirect_uri_mismatch` from Google.

### Pitfall 4: Lesson Content Missing Sections After Seed

**What goes wrong:** PDF text is extracted and LLM-structured, but one or more topics is missing pseudocode or C++ content because the PDF used images for code blocks (not text). The LLM produces empty strings or hallucinated content for those sections.

**Why it happens:** CS lecture slides frequently embed code as images. `pdf-parse` only extracts text-layer content. Image-embedded code is invisible to text extraction.

**How to avoid:** After running `parse-pdfs.ts`, manually inspect the raw text output for each PDF. If code sections appear empty, manually transcribe from the PDF or copy from the source slides. The D-03 review step exists for exactly this reason — review each topic's structured JSON before committing.

**Warning signs:** `conceptMd`, `pseudocodeMd`, or `cppCode` fields are empty strings or contain generic placeholder text in the extracted JSON.

### Pitfall 5: Seed Script Not Idempotent

**What goes wrong:** Running `seed.ts` twice inserts duplicate topic/lesson rows. Lesson pages show duplicate content sections. Subsequent migrations fail on unique constraint violations.

**Why it happens:** A naive `db.insert(topics).values(...)` without conflict handling inserts a new row on every run.

**How to avoid:** Use Drizzle's `onConflictDoNothing()` on the `slug` unique constraint for topics:
```typescript
await db.insert(topics).values(topicData).onConflictDoNothing();
await db.insert(lessons).values(lessonData).onConflictDoNothing();
```

### Pitfall 6: Disabled Tabs Cause Layout Shift When Activated Later

**What goes wrong:** Phase 2 activates the Visualizations tab by removing `disabled` prop. The tab panel content has different height than the placeholder, causing layout jump. Tab component refactoring required.

**Why it happens:** Placeholder `<TabsContent>` for disabled tabs is typically empty — when real content is added, the layout shifts. If the tabs component structure is wrong, downstream phases must refactor.

**How to avoid:** In Phase 1, render disabled tabs with a stub `<TabsContent>` that has the same height as a typical content panel:
```tsx
<TabsContent value="visualizations">
  <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
    Available in a future update
  </div>
</TabsContent>
```

This ensures the Tabs component contract is stable for Phase 2 to plug into.

---

## Code Examples

### Drizzle Query in RSC (topic lesson page)

```typescript
// src/app/topics/[topic]/page.tsx
import { db } from "@/lib/db";
import { topics, lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;

  // Server-side session validation (INFRA-04)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const topic = await db.query.topics.findFirst({
    where: eq(topics.slug, slug),
    with: { lessons: { orderBy: (l, { asc }) => [asc(l.order)] } },
  });

  if (!topic) notFound();

  return <TopicTabs topic={topic} />;
}
```

### Environment Variables (.env.local)

```bash
# Neon — use pooled connection string from Neon dashboard
DATABASE_URL=postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=<32+ char random string — generate with: openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth — from Google Cloud Console
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### Zod Validation for Question JSONB Content

```typescript
// src/lib/db/question-schemas.ts
import { z } from "zod";

const multipleChoiceContent = z.object({
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

const fillBlankContent = z.object({
  blanks: z.array(z.object({ id: z.string(), answer: z.string() })),
});

const traceStepContent = z.object({
  steps: z.array(z.unknown()),   // tree snapshots — typed in Phase 3
  correctStepIndex: z.number().int(),
});

const debugStepContent = z.object({
  steps: z.array(z.unknown()),
  errorStepIndex: z.number().int(),
});

const shortAnswerContent = z.object({
  rubric: z.array(z.string()),
  sampleAnswer: z.string(),
});

export const questionContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("multiple_choice"), ...multipleChoiceContent.shape }),
  z.object({ type: z.literal("fill_blank"), ...fillBlankContent.shape }),
  z.object({ type: z.literal("trace_step"), ...traceStepContent.shape }),
  z.object({ type: z.literal("debug_step"), ...debugStepContent.shape }),
  z.object({ type: z.literal("short_answer"), ...shortAnswerContent.shape }),
]);

export type QuestionContent = z.infer<typeof questionContentSchema>;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js v5 (next-auth@5 beta) | Better Auth 1.5.x | Sep 2025 (official handoff announcement) | New projects must use Better Auth; Auth.js team handed off to Better Auth org |
| Prisma ORM | Drizzle ORM | 2023-2024 (Vercel serverless adoption) | Prisma bundle too large for Vercel cold starts; Drizzle is the standard for Vercel+Neon |
| Next.js middleware for full auth | Cookie check in middleware + DB check in RSC/Actions | 2024 (CVE-2025-29927 class) | Middleware is UX only; DB validation required in every protected route |
| `new Pool()` at module level | `neon()` HTTP driver stateless per-request | Vercel serverless era | Persistent connections cause timeout/exhaustion on serverless |
| NextAuth Prisma adapter | Better Auth `drizzleAdapter` + CLI generate | 2025 | Better Auth generates its own schema; adapter config differs from NextAuth patterns |

---

## Open Questions

1. **Better Auth schema generation output format**
   - What we know: `npx @better-auth/cli generate` outputs Drizzle-compatible TypeScript schema
   - What's unclear: Whether it appends to an existing schema file or creates a new one; whether the generated user.id is truly `text` (not `uuid`) in the latest 1.5.x version
   - Recommendation: Run `npx @better-auth/cli generate --dry-run` in Wave 0 to inspect output before writing app schema tables

2. **pdf-parse vs academic slide PDFs**
   - What we know: `pdf-parse` extracts text layer; CS slides often embed code as images
   - What's unclear: How much content from these specific 11 PDFs is image vs text
   - Recommendation: Run extraction in Wave 0 as a validation step; plan for 30-60 minutes of manual content transcription if code blocks are image-only

3. **Next.js 16 params type change**
   - What we know: Next.js 15+ changed dynamic route params from synchronous to async (Promise<{...}>)
   - What's unclear: Whether Next.js 16 maintains this or reverts
   - Recommendation: Use `const { topic } = await params` pattern shown in code examples above — this is safe for both sync and async params

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | All scripts, Next.js | Yes | v18.19.1 | — |
| pnpm | Package management | Yes | 10.32.0 | — |
| tsx | `pnpm tsx scripts/seed.ts` | No (not globally installed) | — | Install as dev dep: `pnpm add -D tsx` |
| Neon Postgres DB | INFRA-02 | Not yet provisioned | — | Must create in Neon dashboard before Wave 1 |
| Google OAuth credentials | AUTH-01 | Not yet created | — | Must create in Google Cloud Console before Wave 2 |
| Vercel project | INFRA-01 | Not yet created | — | Deploy after Wave 3 completes local validation |

**Missing dependencies with no fallback:**
- Neon Postgres database instance — must be created in Neon dashboard; `DATABASE_URL` is required before any Drizzle operations
- Google OAuth credentials — `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` required before auth can be tested end-to-end

**Missing dependencies with fallback:**
- `tsx` — install as dev dependency in Wave 0; not needed globally

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 |
| Config file | `vitest.config.ts` — does not exist yet, Wave 0 gap |
| Quick run command | `pnpm vitest run` |
| Full suite command | `pnpm vitest run --reporter=verbose` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-02 | Drizzle `db.query.topics.findMany()` returns rows after seed | integration | `pnpm vitest run tests/db.test.ts` | Wave 0 |
| INFRA-03 | Seed script inserts all 4 topics + 4 lessons without error | integration | `pnpm vitest run tests/seed.test.ts` | Wave 0 |
| INFRA-04 | `requireAuth()` throws/redirects when no session header present | unit | `pnpm vitest run tests/auth.test.ts` | Wave 0 |
| CONT-01 | Lesson query returns `conceptMd`, `pseudocodeMd`, `cppCode` as non-empty strings | unit | `pnpm vitest run tests/lesson.test.ts` | Wave 0 |
| AUTH-01, AUTH-02, AUTH-03 | Google OAuth round-trip, session persistence, sign-out | manual | — | Manual-only: requires live Google OAuth credentials and browser |
| CONT-02–05 | Each topic's lesson content covers required algorithm topics | manual | — | Manual-only: content review against PDF source material |

**Manual-only justification for AUTH-01-03:** OAuth flows require browser interaction with Google's live servers. Cannot be automated without a real OAuth session. Validate by clicking through the flow in the browser after Neon and Google credentials are configured.

**Manual-only justification for CONT-02-05:** Content accuracy (does the Huffman lesson actually cover greedy algorithm + encoding + decoding?) requires human review against source PDFs. A unit test can verify non-empty fields but cannot verify algorithmic accuracy.

### Sampling Rate

- **Per task commit:** `pnpm vitest run`
- **Per wave merge:** `pnpm vitest run --reporter=verbose`
- **Phase gate:** All automated tests green + manual auth flow + manual content review before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — framework config; install: `pnpm add -D vitest`
- [ ] `tests/db.test.ts` — covers INFRA-02: Drizzle connection + query returns data
- [ ] `tests/seed.test.ts` — covers INFRA-03: seed script idempotency and row counts
- [ ] `tests/auth.test.ts` — covers INFRA-04: `requireAuth()` redirects without valid session
- [ ] `tests/lesson.test.ts` — covers CONT-01: lesson fields are non-empty after seed

---

## Project Constraints (from CLAUDE.md)

Directives from `CLAUDE.md` (project) that the planner must enforce:

| Directive | Impact on Planning |
|-----------|-------------------|
| Use pnpm (not npm, not yarn) | All install commands use `pnpm add` / `pnpm dlx` |
| Next.js 16 App Router — required | No Pages Router patterns; RSC by default |
| Neon Postgres — required | `@neondatabase/serverless` + `drizzle-orm/neon-http` |
| Drizzle ORM (not Prisma) | `drizzle-orm` + `drizzle-kit`; no `@prisma/client` |
| Better Auth 1.5.x (not NextAuth v5) | `better-auth` + `drizzleAdapter`; no `next-auth` |
| Google OAuth only | No email/password, no magic link auth |
| Content seeded at build time from PDFs | No runtime PDF parsing; seed files committed to repo |
| Vercel hosting — serverless constraints | No persistent processes; HTTP driver for Neon |
| TypeScript strict — no `any` | All schema types and API contracts fully typed |
| Conventional commits | `feat:`, `fix:`, `chore:`, `docs:` prefixes |
| Never hardcode credentials | `.env.local` for all secrets; `.gitignore` it |
| GSD workflow enforcement | Use `/gsd:execute-phase` for all file changes |

---

## Sources

### Primary (HIGH confidence)
- npm registry (live, 2026-03-24) — better-auth@1.5.6, drizzle-orm@0.45.1, drizzle-kit@0.31.10, @neondatabase/serverless@1.0.2, next@16.2.1, pdf-parse@2.4.5, zod@4.3.6, tsx@4.21.0, vitest@4.1.1
- [Better Auth Docs — Installation](https://www.better-auth.com/docs/installation) — env vars, auth.ts setup
- [Better Auth Docs — Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle) — `drizzleAdapter()`, CLI generate, migrations
- [Better Auth Docs — Google Provider](https://www.better-auth.com/docs/authentication/google) — `socialProviders.google`, callback URI setup
- [Better Auth Docs — Next.js Integration](https://better-auth.com/docs/integrations/next) — `toNextJsHandler`, `getSessionCookie`, `createAuthClient`, session in RSC/Server Actions
- [Better Auth Docs — Session Management](https://www.better-auth.com/docs/concepts/session-management) — 7-day session duration, cookie caching
- [Drizzle ORM + Neon Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) — `neon()` + `drizzle()` from `drizzle-orm/neon-http`, `drizzle.config.ts`, migration workflow
- `CS201-Exam2/` directory listing confirmed (2026-03-24) — all 11 PDFs present

### Secondary (MEDIUM confidence)
- WebSearch: Better Auth middleware `getSessionCookie` pattern (2025) — verified against Better Auth GitHub issues #5120, #5376
- WebSearch: Better Auth Google OAuth configuration (2025) — confirmed `socialProviders.google` shape and redirect URI requirements
- [Better Auth + Next.js — Complete Guide (Medium)](https://medium.com/@amitupadhyay878/better-auth-with-next-js-a-complete-guide-for-modern-authentication-06eec09d6a64) — middleware and session patterns

### Tertiary (LOW confidence)
- Better Auth user.id type being `text` not `uuid` — inferred from Drizzle adapter documentation and CLI generate description; verify by running `npx @better-auth/cli generate` in Wave 0

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — versions verified live from npm registry 2026-03-24
- Better Auth integration: HIGH — verified from official Better Auth docs (installation, adapter, Google provider, Next.js integration)
- Drizzle + Neon connection: HIGH — verified from official Drizzle + Neon tutorial
- Schema design: HIGH — follows CONTEXT.md decisions D-04/D-05 with Drizzle idioms from project research
- PDF content pipeline: MEDIUM — pdf-parse confirmed working for text-layer PDFs; image-embedded code is an unknown until extraction is run
- Pitfalls: HIGH — each pitfall sourced from official docs or Better Auth GitHub issues

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack; Better Auth minor versions may shift)
