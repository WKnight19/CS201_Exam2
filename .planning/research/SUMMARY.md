# Project Research Summary

**Project:** CS201 Exam 2 Study App
**Domain:** Interactive educational web app — CS data structures & algorithms
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

This is an exam-scoped interactive study tool for four specific tree data structure topics: Huffman codes, N-ary trees, Red-Black trees, and B-Trees. The defining constraint is time: the exam is days away, not weeks. That constraint shapes every decision — content breadth over animation polish, FSRS-based spaced repetition over passive re-reading, and a strict anti-feature list that excludes everything not directly mapped to exam format (tracing, fill-in-blank, multiple choice, debugging). The reference landscape (VisuAlgo, OpenDSA, zyBooks, Anki) is fragmented — no single tool covers exam-format-matched practice across all four topics with progress persistence. This app's competitive advantage is collapsing that workflow into one place.

The recommended approach is a Next.js 16 App Router application with Drizzle ORM + Neon Postgres (Prisma is excluded — too large for Vercel serverless cold starts), Better Auth for Google OAuth (NextAuth v5 is in perpetual beta and being sunset), ts-fsrs for spaced repetition scheduling (FSRS outperforms SM-2 and requires no implementation), and react-d3-tree + Framer Motion for tree visualizations. The Server Shell / Client Island pattern keeps the bundle small: lesson content is React Server Components; visualization and quiz engines are client islands. All business logic (grading, FSRS scheduling) runs server-side via Server Actions.

The two highest risks are content completeness and algorithm correctness. RB tree and B-tree algorithms have subtle edge cases (double rotation, split cascade) that produce silently incorrect trees — these must be validated with invariant checkers before any visualization is built on top. Content risk is behavioral: developers gravitate toward polishing animations rather than authoring question banks. A content coverage checklist (4 topics × N question types) must exist from day one and be reviewed at every phase gate.

---

## Key Findings

### Recommended Stack

The stack is modern, well-integrated, and optimized for Vercel + Neon deployment. Drizzle ORM is the critical differentiator over Prisma — Vercel's serverless edge compatibility and the absence of cold-start bundle penalties make it the only sensible choice for this deployment target. Better Auth replaces the long-stalled NextAuth v5. ts-fsrs provides FSRS scheduling with zero implementation cost. For visualizations, react-d3-tree handles layout math while Framer Motion manages step-through animation state — D3 should never touch the DOM directly in a React app.

**Core technologies:**
- Next.js 16 + React 19: Full-stack framework with App Router — Server Components for content, Client Components for interactive layers
- Drizzle ORM 0.45 + @neondatabase/serverless 1.0: Edge-compatible DB layer — Prisma excluded due to bundle size and serverless incompatibility
- Better Auth 1.5: Google OAuth — NextAuth v5 deprecated; Better Auth is the recommended successor
- ts-fsrs 5.3: FSRS spaced repetition scheduling — zero-dependency TypeScript implementation; run server-side only
- react-d3-tree 3.6 + Framer Motion 12: Tree visualization — D3 for layout math only, React owns the DOM
- Zustand 5: Client-side visualization step state — keeps step index and snapshot history out of component trees
- Tailwind CSS 4 + shadcn/ui: Styling and UI primitives — no tailwind.config.ts needed with v4

### Expected Features

**Must have (table stakes):**
- Coverage of all four topics (Huffman, N-ary, RB, B-Tree) — any gap means the product fails its purpose
- Step-through algorithm animations for all operations (insert, delete, search, traversal, encode/decode)
- Multiple choice and fill-in-the-blank question banks seeded from PDF content
- Basic tracing exercises — predict next tree state (highest exam-prep value)
- Google OAuth with session persistence + Neon Postgres user records
- Per-topic coverage dashboard showing completion and weak areas
- Pseudocode + C++ code blocks per topic
- Flashcard decks per topic (pre-seeded, not user-created)

**Should have (differentiators):**
- FSRS-based spaced repetition surfacing missed/hard questions
- "Recommended next action" dashboard card based on miss rate and recency
- Debugging exercises — spot the error in a pre-built wrong trace
- Short answer with rubric reveal — mirrors medium/long exam format
- Animation-to-tracing progression state machine (UNSEEN → WATCHED → TRACED → PREDICTED)

**Defer (v2+):**
- Huffman encode/decode round-trip interactive practice
- B-Tree degree parameterization in exercises
- Timed challenge mode
- AI-generated quiz variations
- Export progress summary

**Explicit anti-features (do not build):**
Code REPL, social/community features, generalized DSA coverage beyond four topics, gamification/streaks, LMS integration, native mobile app, user-created flashcard decks, video lectures.

### Architecture Approach

The system follows a Server Shell / Client Island pattern throughout. React Server Components handle all data fetching and static content rendering (lesson prose, pseudocode, initial state loading). Client components are isolated to interactive surfaces: the visualization canvas, quiz session, and flashcard deck. Server Actions handle all mutations — quiz grading, FSRS scheduling, progress recording — and always include `requireAuth()` and `revalidatePath()` calls. The question schema uses a discriminated union from day one (multiple_choice | fill_blank | trace_step | short_answer) to avoid the trap of building an MC-only engine and bolting on tracing later.

**Major components:**
1. Content Layer (RSC) — lesson prose, pseudocode, C++ code blocks; no client JS needed
2. Visualization Layer (Client) — SVG tree rendering via react-d3-tree layout + Framer Motion transitions; step state in Zustand; snapshots pre-computed as immutable arrays
3. Quiz Engine (Client + Server Action) — question rendering, answer collection, server-side grading, FSRS update, `revalidatePath` on completion
4. SR Engine (Server-only) — ts-fsrs scheduling via Server Action; never client-side
5. Auth Layer — Better Auth with Google provider; `requireAuth()` helper called at top of every mutation Server Action
6. Dashboard (RSC) — aggregates UserTopicCard and UserQuestionCard for due-today queue and progress view

**Build order (hard dependency graph):**
DB schema + seed → Auth → Content display → Quiz engine (no SR) → FSRS engine → Visualizations (N-ary first, then Huffman, RB, B-Tree) → Dashboard → Flashcard drill

### Critical Pitfalls

1. **Visualization state as mutable object, not snapshots** — pre-compute the full step sequence as an immutable `VisualizationStep[]` array before any rendering; backward stepping must return to the exact prior state, not a re-derived approximation. Recovery from this is a full rewrite.

2. **RB tree double rotation cases missing** — inner grandchild (left-right / right-left zigzag) requires two rotations; most tutorials only cover outer cases. Write `validateRBInvariants()` and test with insertion sequences 10, 5, 15, 3, 7 and 10, 20, 15 before touching animation code.

3. **B-Tree split/merge cascade incorrect** — off-by-one errors in child array slicing during splits propagate silently. Write `validateBTreeInvariants(root, order)` and stress-test with 20+ insertions in order-3 and order-4 trees against the USFCA reference visualizer.

4. **Neon module-level Pool / Auth.js Pool scope** — `new Pool()` at module level causes stale/exhausted connections on Vercel serverless. Use `neon()` HTTP driver for queries; pass `new Pool()` inside the `NextAuth(() => { ... })` callback factory for auth. Must be established in Phase 1.

5. **Server Actions missing auth check** — middleware guards URL access, not Server Action invocations. Every mutation action must call `requireAuth()` at the top; middleware is UX-only redirect layer. This is also a documented CVE class (CVE-2025-29927 family).

6. **Content completeness traded for animation polish** — build a content coverage checklist (4 topics × all question types) before Phase 1 and review it at every phase gate. Ship basic question content for all four topics before perfecting any single animation.

7. **SM-2/FSRS cold start and ease hell** — new users must see all topics once before scheduling begins; cards answered wrong repeatedly need ease recovery on consecutive correct answers; cap max interval at 3-4 days given exam proximity.

---

## Implications for Roadmap

Based on the dependency graph from ARCHITECTURE.md and the pitfall-to-phase mapping from PITFALLS.md, four phases are recommended:

### Phase 1: Foundation (DB, Auth, Schema, Content Seed)

**Rationale:** Everything else depends on this. Auth must exist before any user-state feature can be validated end-to-end. The question schema discriminated union must be established before seeding any content — retrofitting it later is expensive. Content seed must be in place before any quiz feature can be tested.

**Delivers:** Working Google OAuth, Neon Postgres schema (all tables), content seeded for all four topics, basic topic/lesson display pages, content coverage checklist populated.

**Addresses features:** Google OAuth, progress persistence, pseudocode/code display, per-topic lesson content.

**Avoids pitfalls:**
- Neon module-level Pool (#4) — establish correct connection pattern in `db.ts` from day one
- Auth Server Action bypass (#5) — implement `requireAuth()` helper before any Server Actions exist
- Auth.js + Neon pool scope (#6) — use factory callback pattern in Better Auth config
- Tracing question schema (#9) — discriminated union schema designed and seeded before question content exists
- Content completeness (#8) — coverage checklist created and tracked from this phase

### Phase 2: Visualizations + Algorithm Engines

**Rationale:** Animations must come before tracing exercises — students cannot predict a state they have never seen. Algorithm correctness must be validated before animation is built on top (a smooth animation of a wrong tree is worse than no animation). Build N-ary first (simplest), then Huffman (bottom-up tree build is unique), then RB (highest complexity), then B-Tree.

**Delivers:** Step-through animations for all operations on all four topics. Algorithm engines validated with invariant checkers. Pre-computed step snapshot arrays stored or generated. Backward stepping functional.

**Addresses features:** Step-through algorithm animations, pseudocode line highlighting, all operation coverage.

**Uses:** react-d3-tree, Framer Motion, Zustand for step state, SVG-based rendering pattern.

**Avoids pitfalls:**
- Visualization state as mutable object (#1) — snapshot array architecture established before any animation code
- RB tree double rotation (#2) — `validateRBInvariants()` written and passing before visualization built
- B-Tree split/merge cascade (#3) — `validateBTreeInvariants()` written and passing; tested against USFCA reference

**Research flag:** RB tree deletion (double-black fixup, 6 sub-cases) and B-Tree merge logic are algorithmically complex — consider phase-specific research or reference implementation review before building.

### Phase 3: Quiz Engine + FSRS

**Rationale:** Quiz engine depends on content seed (Phase 1) and visualization snapshots (Phase 2, for tracing questions). FSRS scheduling is an overlay on the quiz submission flow — build grading first, add scheduling after. `revalidatePath` pattern must be established with the first mutation action.

**Delivers:** Functional MC, fill-in-blank, and basic tracing exercises with grading. Answer recording per user × question. FSRS scheduling via ts-fsrs running server-side. UserQuestionCard and UserTopicCard updated on each submission. Dashboard showing due-today queue.

**Addresses features:** Multiple choice questions, fill-in-the-blank, basic tracing, flashcard decks, spaced repetition surfacing, per-topic coverage dashboard.

**Implements:** Quiz Engine component, SR Engine (Server Action), ReviewHistory log, ts-fsrs `fsrs.repeat()` server-side.

**Avoids pitfalls:**
- SM-2/FSRS ease hell (#7) — ease recovery on consecutive correct answers; max interval capped at 4 days; cold-start handling (show all topics once before scheduling)
- Missing `revalidatePath` (#10) — every mutation Server Action template includes `revalidatePath('/dashboard')`
- Content completeness (#8) — gate this phase on all four topics having at least 5 MC and 5 fill-blank questions in seed

### Phase 4: Engagement Layer (Tracing, Debugging, Short Answer, Dashboard Polish)

**Rationale:** Advanced question types (tracing exercises with interactive tree manipulation, debugging spot-the-error) depend on the quiz engine (Phase 3) and visualization snapshots (Phase 2). These are the highest-value differentiators but also highest complexity — defer until the core loop is validated.

**Delivers:** Interactive tracing exercises (click/drag to predict next state). Debugging exercises (spot the error in a pre-built wrong trace). Short answer with rubric reveal. "Recommended next action" dashboard card. Animation-to-tracing progression state machine.

**Addresses features:** Advanced tracing, debugging exercises, short answer + rubric, recommended next action, animation-to-tracing progression.

**Avoids pitfalls:**
- Content completeness (#8) — check coverage checklist before adding polish; tracing and debugging content must exist for all four topics

---

### Phase Ordering Rationale

- Phase 1 before everything: auth and schema are hard dependencies for all user-state features; discriminated union schema must exist before content is seeded
- Phase 2 before Phase 3: animations must precede tracing questions; algorithm correctness must be validated before quiz questions reference visualization snapshots
- Phase 3 before Phase 4: quiz engine and FSRS must exist before advanced question types are added as overlays
- Content checklist enforced across all phases: content completeness is the highest-risk failure mode given exam proximity

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (RB Tree):** Double rotation and double-black deletion sub-cases are well-documented in CLRS but implementation-tricky — recommend reviewing a known-correct reference implementation (CLRS pseudocode or USFCA reference) before coding
- **Phase 2 (B-Tree):** Delete borrow/merge case matrix is complex — recommend cross-checking implementation against USFCA B-Tree visualizer at cs.usfca.edu/~galles/visualization/BTree.html during implementation
- **Phase 4 (Interactive tracing):** SVG drag-to-predict interaction pattern for tree nodes has limited prior art — may need UI prototyping research

Phases with standard patterns (skip research-phase):
- **Phase 1:** Auth (Better Auth docs are complete), Drizzle + Neon (Vercel first-party starter exists), schema design (fully sketched in ARCHITECTURE.md)
- **Phase 3:** FSRS scheduling (ts-fsrs API is minimal and documented), Server Action pattern (well-established)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified via npm registry (2026-03-24); Drizzle + Neon integration from Vercel first-party starter; Better Auth announcement from official source; ts-fsrs from open-spaced-repetition org |
| Features | HIGH | Based on direct analysis of VisuAlgo, OpenDSA, zyBooks, Khan Academy, Anki, LeetCode; supplemented by cognitive load and spaced repetition research; feature list is well-grounded |
| Architecture | HIGH | Next.js App Router patterns from official docs; Neon connection pooling from official Neon docs; DB schema sketches are complete and internally consistent |
| Pitfalls | HIGH | Most pitfalls sourced from official docs (Vercel blog, Neon docs, Auth.js migration guide, CLRS); algorithm edge cases verified against USFCA reference implementations; MEDIUM on SM-2 ease hell recovery (community analysis) |

**Overall confidence:** HIGH

### Gaps to Address

- **Better Auth vs NextAuth.js adapter for Neon:** The architecture research was written referencing NextAuth v5/Prisma adapter patterns. Better Auth has its own Neon adapter — confirm `@better-auth/neon` adapter setup during Phase 1 rather than relying on the NextAuth-specific Pool-inside-callback pattern documented in PITFALLS.md. The principle is the same (pool scoping) but the config shape differs.
- **react-d3-tree vs custom SVG:** ARCHITECTURE.md recommends using d3-hierarchy layout math with custom JSX SVG rendering (for full node control), while STACK.md recommends react-d3-tree (which wraps this). These are compatible but the tradeoff — react-d3-tree for speed vs custom SVG for control — should be settled at Phase 2 start. For RB trees (color-critical) and B-trees (multi-key nodes), custom SVG rendering gives more control.
- **FSRS cold-start handling:** ts-fsrs is specified in STACK.md but the cold-start "show all topics once before scheduling" logic from PITFALLS.md needs explicit implementation — ts-fsrs doesn't handle this; it's application-layer logic.
- **Content authoring pipeline:** Research assumes PDF content is parsed and seeded at build time, but the exact parsing approach (manual JSON authoring vs automated PDF parsing) is unspecified. This is a Phase 1 risk — manual JSON authoring is safer for exam-scoped content but must begin immediately.

---

## Sources

### Primary (HIGH confidence)
- npm registry (live, 2026-03-24) — package versions for all core dependencies
- [Drizzle ORM + Neon official tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) — Drizzle integration patterns
- [Neon serverless driver docs](https://neon.com/docs/serverless/serverless-driver) — HTTP driver, connection pooling
- [Neon + Vercel connection methods](https://neon.com/docs/guides/vercel-connection-methods) — pooler endpoint requirement
- [Neon: Authenticate with Auth.js](https://neon.com/docs/guides/auth-authjs) — Pool-inside-callback pattern
- [ts-fsrs GitHub (open-spaced-repetition org)](https://github.com/open-spaced-repetition/ts-fsrs) — FSRS algorithm, API
- [Vercel Next.js + Drizzle + Postgres starter](https://vercel.com/templates/next.js/postgres-drizzle) — first-party integration template
- [Next.js App Router Documentation](https://nextjs.org/docs/app) — Server/Client component boundaries, Server Actions
- [Vercel: Common Mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — pitfall patterns
- [USFCA RB Tree Visualizer](https://www.cs.usfca.edu/~galles/visualization/RedBlack.html) — RB correctness reference
- [USFCA B-Tree Visualizer](https://www.cs.usfca.edu/~galles/visualization/BTree.html) — B-Tree correctness reference
- [Auth.js: Migrating to v5](https://authjs.dev/getting-started/migrating-to-v5) — NextAuth deprecation
- [Anki SM-2 Algorithm — RemNote](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) — SRS behavior reference

### Secondary (MEDIUM confidence)
- [Better Auth — Auth.js joins Better Auth announcement](https://better-auth.com/blog/authjs-joins-better-auth) — Better Auth as NextAuth successor
- [VisuAlgo Training Mode](https://visualgo.net/training) — competitor feature analysis
- [OpenDSA: Design and architecture](https://www.researchgate.net/publication/259332833_Design_and_architecture_of_an_interactive_eTextbook_-_The_OpenDSA_system) — feature benchmarking
- [PNAS: Enhancing human learning via spaced repetition](https://www.pnas.org/doi/10.1073/pnas.1815156116) — SR research basis
- [D3 Hierarchy Tree Layout](https://d3js.org/d3-hierarchy/tree) — layout API
- [SM-2 Better Algorithm Analysis (blueraja)](https://www.blueraja.com/blog/477/a-better-spaced-repetition-learning-algorithm-sm2) — ease hell mitigation
- WebSearch: Better Auth vs NextAuth comparisons (2025)

### Tertiary (LOW confidence)
- B-Tree JavaScript split off-by-one bug — community implementation reports, cross-checked with algorithm spec; validate during Phase 2 implementation

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
