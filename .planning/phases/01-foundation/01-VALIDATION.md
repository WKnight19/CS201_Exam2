---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `pnpm test --run` |
| **Full suite command** | `pnpm test --run --coverage` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run`
- **After every plan wave:** Run `pnpm test --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | INFRA-01 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | INFRA-02 | integration | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | INFRA-03 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-01-04 | 01 | 1 | INFRA-04 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-02-01 | 02 | 1 | AUTH-01 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-02-02 | 02 | 1 | AUTH-02 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-02-03 | 02 | 1 | AUTH-03 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-02-04 | 02 | 1 | AUTH-04 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | CONT-01 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 1 | CONT-02 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 1 | CONT-03 | unit | `pnpm test --run` | ❌ W0 | ⬜ pending |
| 1-03-04 | 03 | 2 | CONT-04 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-03-05 | 03 | 2 | CONT-05 | manual | see Manual Verifications | N/A | ⬜ pending |
| 1-03-06 | 03 | 2 | CONT-06 | manual | see Manual Verifications | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/db/schema.test.ts` — stubs verifying all Drizzle schema tables exist (INFRA-02, CONT-01–03)
- [ ] `tests/auth/session.test.ts` — stubs for auth middleware route protection logic (AUTH-04)
- [ ] `tests/content/seed.test.ts` — stubs verifying seed data shape and required fields (CONT-01–CONT-03)
- [ ] `vitest.config.ts` — install vitest if not present
- [ ] `tests/setup.ts` — shared test setup (env vars, db mock stubs)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Next.js app builds and deploys to Vercel | INFRA-01 | Requires Vercel CLI / push — no automated test | `pnpm build` exits 0 locally; Vercel deployment succeeds |
| Vercel env vars set (DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET) | INFRA-03 | External system configuration | Check Vercel dashboard or `vercel env ls` output |
| Route-level middleware redirects unauthenticated users to /sign-in | INFRA-04 | Browser behavior | Navigate to /dashboard without session — verify redirect to /sign-in |
| Google OAuth sign-in completes end-to-end | AUTH-01 | Requires live Google OAuth credentials | Click "Sign in with Google" → complete OAuth → land on /dashboard |
| Session persists across browser refresh | AUTH-02 | Browser state | Sign in → refresh → verify still authenticated (no re-auth prompt) |
| Sign-out redirects to sign-in screen | AUTH-03 | Browser behavior | Click sign-out → verify redirect to /sign-in, session cookie cleared |
| All 4 topic lesson pages render content | CONT-04 | Browser rendering | Navigate to /topics/huffman, /topics/n-ary-trees, /topics/red-black-trees, /topics/b-trees |
| Lesson pages show concept, pseudocode, C++ sections | CONT-05 | Content verification | Each topic page shows 3 sections with real content (no placeholders) |
| Remaining tabs (Visualizations, Quiz, Flashcards) are visible but disabled | CONT-06 | UI state | Each topic page shows 4 tabs; 3 are greyed out and unclickable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
