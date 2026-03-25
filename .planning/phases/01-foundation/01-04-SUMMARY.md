---
phase: 01-foundation
plan: "04"
subsystem: ui
tags: [next.js, react, drizzle, tailwind, shadcn, server-components, app-router]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Drizzle schema with topics and lessons tables, db instance
  - phase: 01-foundation/01-02
    provides: Better Auth Google OAuth, requireAuth() server action, authClient hook
  - phase: 01-foundation/01-03
    provides: 4 topics and 11 lessons seeded to Neon — Huffman, N-ary Trees, RB Trees, B-Trees
provides:
  - Dashboard page at / rendering 4 topic cards from DB
  - Topic detail pages at /topics/[slug] with Lesson tab active showing concept/pseudocode/C++
  - TopicTabs shell with 3 disabled tabs ready for Phase 2 activation (Visualizations, Quiz, Flashcards)
  - NavBar with user avatar and sign-out for authenticated sessions
  - Auth-gated routes: unauthenticated users redirect to /sign-in
  - Loading skeleton UI for dashboard and topic pages
  - Content query helpers: getTopics() and getTopicWithLessons(slug)
affects: [02-visualizations, 03-quiz, 04-flashcards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Components fetch data directly via Drizzle queries (no API layer needed for reads)
    - requireAuth() called at top of each protected page Server Component
    - Client Components (NavBar, TopicTabs) use "use client" and receive session via authClient.useSession()
    - Disabled tab pattern: disabled prop + opacity-50 + cursor-not-allowed + title tooltip
    - TopicTabs shell designed for Phase 2 activation — changing disabled=false + replacing placeholder content is the only change needed

key-files:
  created:
    - src/lib/content/queries.ts
    - src/components/nav/NavBar.tsx
    - src/components/topics/TopicCard.tsx
    - src/components/topics/TopicTabs.tsx
    - src/components/lessons/LessonContent.tsx
    - src/app/page.tsx
    - src/app/loading.tsx
    - src/app/topics/layout.tsx
    - src/app/topics/[topic]/page.tsx
    - src/app/topics/[topic]/loading.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Server Components used for data fetching pages — no API routes needed for read-only content queries"
  - "TopicTabs shell built with explicit disabled state so Phase 2 activates tabs with minimal changes"
  - "LessonContent renders conceptMd as dangerouslySetInnerHTML prose-invert, pseudocode/C++ as pre/code blocks"
  - "NavBar sign-out uses window.location.href redirect to fully clear client-side session state"

patterns-established:
  - "Protected page pattern: await requireAuth() at top of async Server Component, before any data fetch"
  - "Data query pattern: import from @/lib/content/queries, call in Server Component, pass to client components via props"
  - "Disabled future feature tab: disabled prop + opacity-50 cursor-not-allowed + title='Available in a future update'"
  - "Loading skeleton pattern: loading.tsx co-located with page.tsx, skeleton matches page structural layout"

requirements-completed: [CONT-01]

# Metrics
duration: ~45min
completed: 2026-03-25
---

# Phase 1 Plan 4: UI Layer Summary

**Dashboard with 4 topic cards, topic detail pages with lesson content (concept/pseudocode/C++), and NavBar sign-out — complete Phase 1 student-facing UI wired to seeded Neon DB**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-25T04:33:51Z
- **Completed:** 2026-03-25T05:30:00Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 11

## Accomplishments

- Dashboard at / renders 4 clickable topic cards (Huffman Codes, N-ary Trees, Red-Black Trees, B-Trees) from Neon DB via Server Component
- Topic detail pages at /topics/[slug] show lesson content in three ordered sections: Concept (prose), Pseudocode (monospace block), C++ Implementation (monospace block)
- TopicTabs shell delivers active Lesson tab and three disabled tabs (Visualizations, Quiz, Flashcards) ready for Phase 2 activation with minimal structural changes
- NavBar provides user avatar and sign-out across all authenticated pages
- All pages auth-gated — unauthenticated users redirected to /sign-in
- Loading skeletons co-located with pages for smooth SSR transitions
- Human verification confirmed all 9 acceptance steps pass end-to-end

## Task Commits

Each task was committed atomically:

1. **Task 1: Dashboard, NavBar, TopicCard, content queries** - `9b2d288` (feat)
2. **Task 2: TopicTabs, LessonContent, topic detail page** - `6e6f01f` (feat)
3. **Task 3: Human verify checkpoint** - N/A (verification only, no code changes)

## Files Created/Modified

- `src/lib/content/queries.ts` - getTopics() and getTopicWithLessons(slug) Drizzle query helpers
- `src/components/nav/NavBar.tsx` - Client component: user avatar, sign-out button via authClient
- `src/components/topics/TopicCard.tsx` - Server component: shadcn Card wrapped in Link to /topics/[slug]
- `src/components/topics/TopicTabs.tsx` - Client component: Lesson tab active, 3 disabled tabs with placeholder content
- `src/components/lessons/LessonContent.tsx` - Server component: renders concept/pseudocode/C++ sections per lesson
- `src/app/layout.tsx` - Added NavBar, dark class, metadata
- `src/app/page.tsx` - Dashboard: requireAuth + getTopics + TopicCard grid
- `src/app/loading.tsx` - Dashboard skeleton: 4 skeleton cards in responsive grid
- `src/app/topics/layout.tsx` - Passthrough layout wrapper for /topics routes
- `src/app/topics/[topic]/page.tsx` - Topic detail: requireAuth + getTopicWithLessons + TopicTabs
- `src/app/topics/[topic]/loading.tsx` - Topic page skeleton: heading + tabs + content lines

## Decisions Made

- Server Components used for data-fetching pages — no API layer needed for read-only content queries. Drizzle queries run directly inside async Server Components.
- TopicTabs shell built with explicit disabled state so Phase 2 activates tabs with minimal changes — only `disabled` prop removal and placeholder content replacement needed.
- LessonContent renders `conceptMd` as `dangerouslySetInnerHTML` with prose-invert class, and `pseudocodeMd`/`cppCode` as `<pre><code>` monospace blocks.
- NavBar sign-out uses `window.location.href = "/sign-in"` after `authClient.signOut()` to fully clear client-side React session state.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all tasks completed without blockers. Human verification passed all 9 steps on first attempt.

## User Setup Required

None - no external service configuration required for this plan. Prerequisites (Google OAuth credentials, seeded DB) were established in Plans 01-02 and 01-03.

## Known Stubs

None — all four topic lesson pages render real content from Neon DB. Disabled tabs (Visualizations, Quiz, Flashcards) display intentional "Available in a future update" placeholders — these are design-specified pending Phase 2 implementation, not data stubs.

## Next Phase Readiness

- Phase 1 complete: schema, auth, seed data, and UI all operational
- Phase 2 (visualizations) can activate TopicTabs by: removing `disabled` prop from Visualizations tab trigger and replacing the placeholder TabsContent with the visualization component
- DB schema already includes `questions` and `flashcards` tables (from Plan 01-01) ready for Phase 3/4 content seeding
- All lesson content (11 lessons across 4 topics) readable and verified in production-like environment

---
*Phase: 01-foundation*
*Completed: 2026-03-25*
