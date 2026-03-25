---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [next.js, drizzle-orm, neon, postgres, shadcn, vitest, better-auth, zod, typescript]

requires: []

provides:
  - Next.js 16 App Router project scaffold with all Phase 1 dependencies
  - Drizzle ORM schema with 7 app tables (topics, lessons, questions, flashcards, userTopicCards, userQuestionCards, reviewHistory)
  - Neon HTTP driver connection via drizzle-orm/neon-http
  - Zod discriminated union question content schema (5 types)
  - shadcn/ui initialized with 7 components (card, tabs, badge, button, avatar, separator, skeleton)
  - Vitest configured for node environment with @ alias
  - Inter font layout, env templates, drizzle.config.ts

affects: [01-02, 01-03, 01-04, all-downstream-phases]

tech-stack:
  added:
    - next@16.2.1
    - drizzle-orm@0.45.1
    - "@neondatabase/serverless@1.0.2"
    - better-auth@1.5.6
    - zod@4.3.6
    - drizzle-kit@0.31.10
    - vitest@4.1.1
    - tsx@4.21.0
    - pdf-parse@2.4.5
    - shadcn/ui (card, tabs, badge, button, avatar, separator, skeleton)
  patterns:
    - Drizzle + Neon HTTP driver (stateless, serverless-safe)
    - Drizzle relations for query builder with
    - Zod discriminated union for JSONB column typing
    - text("user_id") for Better Auth FK references (not uuid)
    - vitest.config.ts with node environment and @ path alias

key-files:
  created:
    - src/lib/db/index.ts
    - src/lib/db/schema.ts
    - src/lib/db/question-schemas.ts
    - drizzle.config.ts
    - vitest.config.ts
    - .env.example
    - .nvmrc
    - src/components/ui/card.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/avatar.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/skeleton.tsx
  modified:
    - package.json (scripts: test, db:push, db:seed, db:generate, db:migrate)
    - src/app/layout.tsx (Inter font weights 400+600)
    - src/app/globals.css (shadcn Zinc dark theme CSS variables)

key-decisions:
  - "Use drizzle-orm/neon-http driver (not neon-serverless) for stateless HTTP per request on Vercel"
  - "userTopicCards/userQuestionCards userId uses text('user_id') not uuid - Better Auth generates text IDs"
  - "Added .nvmrc pinned to Node 24 - Next.js 16 requires >=20.9.0, system has Node 18"

patterns-established:
  - "Pattern: Drizzle neon-http - neon() from @neondatabase/serverless + drizzle() from drizzle-orm/neon-http"
  - "Pattern: userId columns are text('user_id') in all tables - Better Auth generates nanoid text IDs not UUIDs"
  - "Pattern: Zod discriminated union on 'type' field for JSONB content columns"

requirements-completed: [INFRA-01, INFRA-02]

duration: 11min
completed: 2026-03-25
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**Next.js 16 + Drizzle ORM scaffold with 7-table Neon schema, Zod question union, and shadcn/ui — pending DATABASE_URL for drizzle-kit push**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-25T03:27:56Z
- **Completed:** 2026-03-25T03:39:41Z
- **Tasks:** 2 (Task 1 complete, Task 2 code complete pending DB push)
- **Files modified:** 14

## Accomplishments

- Next.js 16 project scaffold with all Phase 1 dependencies (drizzle-orm, better-auth, zod, drizzle-kit, vitest, tsx, pdf-parse, shadcn)
- Full Drizzle schema: 7 app tables with correct column types, FK constraints, Drizzle relations, and FSRS fields
- Zod discriminated union question schema for 5 content types (multiple_choice, fill_blank, trace_step, debug_step, short_answer)
- shadcn/ui initialized with Zinc dark theme; 7 components installed (card, tabs, badge, button, avatar, separator, skeleton)
- Vitest configured with node environment and @ path alias

## Task Commits

1. **Task 1+2: Scaffold, shadcn, DB schema** - `1fb91c8` (chore)

## Files Created/Modified

- `src/lib/db/index.ts` - Drizzle instance using neon-http driver; exports `db`
- `src/lib/db/schema.ts` - Full Drizzle schema: 7 app tables + pgEnum + relations
- `src/lib/db/question-schemas.ts` - Zod discriminated union for question JSONB content
- `drizzle.config.ts` - Drizzle Kit config pointing to schema and Neon DATABASE_URL
- `vitest.config.ts` - Vitest config: node environment, @ alias
- `.env.example` - Template with all required env var keys
- `.nvmrc` - Node 24 pin (Next.js 16 requires >=20.9.0)
- `src/components/ui/` - 7 shadcn components (card, tabs, badge, button, avatar, separator, skeleton)
- `package.json` - Added test, db:push, db:seed, db:generate, db:migrate scripts
- `src/app/layout.tsx` - Inter font (weights 400+600), app metadata

## Decisions Made

- **Node 24 required:** Next.js 16 requires Node >=20.9.0; system has Node 18. Added `.nvmrc` pinned to 24. All Next.js operations must use `PATH="/home/wheeler/.nvm/versions/node/v24.14.0/bin:..."`.
- **text("user_id") not uuid:** Better Auth generates nanoid-style text IDs, not UUIDs. All FK columns referencing auth user.id use `text("user_id")`.
- **drizzle-orm/neon-http driver:** Use stateless HTTP transport, not WebSocket Pool, for Vercel serverless safety.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Config] Added .nvmrc pinned to Node 24**
- **Found during:** Task 1 (pnpm build)
- **Issue:** Next.js 16 requires Node >=20.9.0; system Node is 18.19.1; build fails without correct version
- **Fix:** Added `.nvmrc` with `24`; rebuilt node_modules under Node 24 for correct native Tailwind oxide bindings
- **Files modified:** `.nvmrc`
- **Verification:** `pnpm build` succeeds with Node 24
- **Committed in:** `1fb91c8` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical config)
**Impact on plan:** Required for build to succeed. No scope creep.

## User Setup Required

`drizzle-kit push` requires a real Neon Postgres `DATABASE_URL`. All schema code is complete. To push the schema:

1. Go to [console.neon.tech](https://console.neon.tech) and create a new project
2. Copy the **Pooled connection string** from: Project -> Connection Details -> Pooled
3. Set `DATABASE_URL` in `.env.local` to the copied value
4. Run: `pnpm db:push`

All 7 tables will be created: `topics`, `lessons`, `questions`, `flashcards`, `user_topic_cards`, `user_question_cards`, `review_history`, plus the `question_type` enum.

**Note on Node version:** Run all commands with Node 24:
```bash
export PATH="/home/wheeler/.nvm/versions/node/v24.14.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
```

## Known Stubs

None — no UI components rendering data yet. Schema is code-complete; DB push is the only pending action.

## Next Phase Readiness

- Next.js build: passing
- Schema: code-complete, ready to push once DATABASE_URL is set
- shadcn/ui: initialized with Zinc dark theme, 7 components available
- Plan 01-02 (Better Auth) can proceed once DATABASE_URL is set (auth tables merge into schema.ts)
- Plan 01-03 (lesson UI) can proceed once auth is working
- Plan 01-04 (content seed) can proceed once schema is in DB

## Self-Check: PASSED

- FOUND: src/lib/db/index.ts
- FOUND: src/lib/db/schema.ts
- FOUND: src/lib/db/question-schemas.ts
- FOUND: drizzle.config.ts
- FOUND: vitest.config.ts
- FOUND: .env.example
- FOUND: .nvmrc
- FOUND: src/components/ui/card.tsx
- FOUND: src/components/ui/tabs.tsx
- FOUND: src/components/ui/skeleton.tsx
- FOUND commit: 1fb91c8

---
*Phase: 01-foundation*
*Completed: 2026-03-25*
