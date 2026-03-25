---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [better-auth, google-oauth, drizzle, neon, middleware, session]

requires:
  - phase: 01-01
    provides: "Next.js 16 scaffold, Drizzle ORM + Neon DB, shadcn components, schema.ts with app tables"

provides:
  - "Better Auth 1.5.x instance with Google OAuth + Drizzle adapter (src/lib/auth.ts)"
  - "Better Auth browser client for sign-in/sign-out (src/lib/auth-client.ts)"
  - "Better Auth catch-all API route handler (src/app/api/auth/[...all]/route.ts)"
  - "Optimistic cookie-based middleware route guard (middleware.ts)"
  - "Server-side requireAuth() DB-validated session guard (src/actions/auth.ts)"
  - "Sign-in page with Google OAuth button (src/app/(auth)/sign-in/page.tsx)"
  - "Better Auth schema tables in Neon: user, session, account, verification"

affects: [01-03, 01-04, phase-02, phase-03, phase-04]

tech-stack:
  added: [better-auth@1.5.x, drizzle adapter via better-auth/adapters/drizzle]
  patterns:
    - "Better Auth server instance: betterAuth() with drizzleAdapter(db) + socialProviders.google"
    - "Cookie-only middleware (no DB call) + requireAuth() DB check in Server Actions"
    - "User ID is text not uuid — all FK columns use text('user_id')"

key-files:
  created:
    - src/lib/auth.ts
    - src/lib/auth-client.ts
    - src/app/api/auth/[...all]/route.ts
    - src/app/(auth)/sign-in/page.tsx
    - src/actions/auth.ts
    - middleware.ts
  modified:
    - src/lib/db/schema.ts

key-decisions:
  - "Middleware uses getSessionCookie() (cookie check only, no DB) — UX redirect only, not security gate"
  - "requireAuth() uses auth.api.getSession() with forwarded headers — full DB validation per INFRA-04"
  - "Better Auth tables added manually to schema.ts (not via npx @better-auth/cli generate) to avoid CLI overwriting existing app tables"
  - "user.id is text type in Better Auth — all user FK references use text('user_id') not uuid"

patterns-established:
  - "Pattern: Never call auth.api.getSession() in middleware (Edge Runtime can't use DB driver)"
  - "Pattern: Every Server Action touching user data calls requireAuth() at top"
  - "Pattern: authClient (browser) and auth (server) are separate files, never cross-import"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, INFRA-04]

duration: ~30min
completed: 2026-03-25
---

# Phase 01 Plan 02: Better Auth with Google OAuth Summary

**Better Auth 1.5.x Google OAuth with Drizzle adapter, dual-layer auth guard (middleware cookie check + server-side DB validation), sign-in page, and requireAuth() helper**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-25T03:58:23Z
- **Completed:** 2026-03-25T04:10:00Z
- **Tasks:** 1 of 2 complete (Task 2 is a human-verification checkpoint)
- **Files modified:** 7

## Accomplishments

- Better Auth tables (user, session, account, verification) added to Drizzle schema and pushed to Neon via `drizzle-kit push`
- Full Google OAuth flow wired: auth server instance → API catch-all route → browser client → sign-in page
- Dual-layer route protection: middleware redirects unauthenticated users (cookie check, no DB) + requireAuth() validates sessions against DB (per INFRA-04)
- `pnpm build` passes with all 5 routes: `/`, `/_not-found`, `/api/auth/[...all]`, `/sign-in`, plus middleware proxy

## Task Commits

Each task was committed atomically:

1. **Task 1: Better Auth schema, auth instance, API route, client, middleware, sign-in page, requireAuth** - `d778010` (feat: phase 1 wave one finished)

Note: Task 1 was completed by the user prior to executor agent spawn. The executor verified all acceptance criteria against the committed code and confirmed `pnpm build` passes.

**Plan metadata:** _(docs commit to follow after checkpoint resolution)_

## Files Created/Modified

- `src/lib/db/schema.ts` - Added Better Auth tables: user, session, account, verification
- `src/lib/auth.ts` - Better Auth server instance with Google OAuth + Drizzle adapter
- `src/lib/auth-client.ts` - Better Auth browser client (createAuthClient)
- `src/app/api/auth/[...all]/route.ts` - Better Auth catch-all handler via toNextJsHandler
- `middleware.ts` - Optimistic cookie-based route guard protecting / and /topics/:path*
- `src/actions/auth.ts` - requireAuth() server-side DB-validated session guard
- `src/app/(auth)/sign-in/page.tsx` - Sign-in page with Google OAuth button and loading/error states

## Decisions Made

- Used manual Better Auth table definitions in `schema.ts` instead of `npx @better-auth/cli generate` — avoids risk of CLI overwriting existing app tables
- `user.id` confirmed as `text` type in Better Auth — all FK columns already use `text("user_id")` from Plan 01
- Middleware performs cookie-existence check only (no DB call) — follows established pattern to avoid Edge Runtime + DB driver incompatibility
- `requireAuth()` performs full DB-validated session check per INFRA-04 requirement

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed parse-pdfs.ts TypeScript error blocking pnpm build**
- **Found during:** Task 1 verification (`pnpm build`)
- **Issue:** `scripts/parse-pdfs.ts` imported `PDFParse` incorrectly, causing `load is private` TypeScript error. Next.js includes all `**/*.ts` files in type-check, so this blocked build verification.
- **Fix:** Parallel agent (01-03) applied namespace import pattern: `import * as pdfParseModule from "pdf-parse"` with manual type cast. Build passes after fix.
- **Files modified:** `scripts/parse-pdfs.ts`
- **Verification:** `pnpm build` exits 0 with all 5 routes generated
- **Committed in:** `d571a90` (by parallel agent 01-03)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in pre-existing file blocking build)
**Impact on plan:** Pre-existing TypeScript error in unrelated script blocked build verification. Fixed by parallel agent. No scope creep.

## Issues Encountered

- `parse-pdfs.ts` was committed with incorrect `pdf-parse@2.x` API usage (named class import with `load()` private method). Build failed TypeScript check until fixed.
- All other acceptance criteria met on first verification pass.

## User Setup Required

**External services require manual configuration before Task 2 (human-verify checkpoint):**

1. **Google Cloud Console**: Create OAuth 2.0 Client ID (Web application) with authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - Add production Vercel URL when deployed
2. **Environment variables** (`.env.local`): Confirm `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
3. **BETTER_AUTH_SECRET**: Must be a real 32-char hex string — generate with `openssl rand -hex 32`

All three are already set in `.env.local` per file inspection.

## Next Phase Readiness

- Auth layer complete — all server actions in Phase 2+ should call `requireAuth()` at top
- Sign-in redirect is wired: unauthenticated requests to `/` or `/topics/:path*` go to `/sign-in`
- Database has auth tables ready: user, session, account, verification in Neon
- `requireAuth()` exported from `src/actions/auth.ts` — import and call in any protected Server Action

**Checkpoint required:** Task 2 is human verification of the live Google OAuth flow (AUTH-01/02/03). Cannot be automated — requires browser interaction with Google's live OAuth servers and valid credentials.

## Known Stubs

None — all auth plumbing is fully wired. Sign-in page connects to live Google OAuth. The checkpoint is for end-to-end verification, not because stubs exist.

---
*Phase: 01-foundation*
*Completed: 2026-03-25*
