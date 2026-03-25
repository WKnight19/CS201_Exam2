# Phase 1: Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers: project scaffold, full DB schema, Better Auth + Google OAuth, Neon connection via Drizzle, PDF-to-DB content pipeline (lessons only), and a working lesson reading UI for all four topics. This is the hard dependency gate — no interactive features (visualizations, quizzes, flashcards, spaced repetition) are in scope.

</domain>

<decisions>
## Implementation Decisions

### Content Pipeline
- **D-01:** Use AI-assisted PDF parsing — extract text from the 11 PDFs using `pdf-parse` (or similar), then pass extracted text to an LLM to structure it into concept/pseudocode/C++ sections per topic.
- **D-02:** Pre-run the pipeline locally. Commit the resulting structured JSON/TS seed files to the repo. No API key required at Vercel build time — seed files are static artifacts.
- **D-03:** Section-by-section review workflow — generate and review each of the four topics separately before committing. Manually edit anything incorrect before committing that topic's seed file.

### DB Schema
- **D-04:** Create the full schema in Phase 1: `users`, `sessions`, `topics`, `lessons`, `questions`, `flashcards`, `user_answers` (or equivalent progress table). Phases 2-4 add data, not schema migrations.
- **D-05:** Questions use a single `questions` table with a `question_type` enum column (`multiple_choice | fill_blank | trace_step | debug_step | short_answer`) and a `content` JSONB column holding type-specific fields. Zod validates the union shape per type at runtime.
- **D-06:** Phase 1 seed populates `topics` and `lessons` only. Questions and flashcard rows are seeded in Phase 3 when the quiz engine is built. Schema exists, tables are empty.

### Lesson Page Structure
- **D-07:** Lessons are a scrollable document with anchored sections in order: Concept → Pseudocode → C++ Code. Standard docs pattern — fastest to build, natural to read.
- **D-08:** All lesson content is behind auth. Sign-in required to access any lesson page. No public read mode. Aligns with AUTH-04 (progress tied to Google account).

### Navigation Architecture
- **D-09:** Route structure: `/` (dashboard with 4 topic cards) → `/topics/[topic]` (topic detail page). Topic slugs: `huffman`, `n-ary-trees`, `red-black-trees`, `b-trees`.
- **D-10:** Topic detail page uses tabs: **Lesson** | Visualizations | Quiz | Flashcards. In Phase 1, only Lesson tab is active; remaining tabs are visible but disabled (greyed out). Sets navigation structure for all downstream phases without requiring refactoring.

### Claude's Discretion
- Exact Drizzle schema column names and TypeScript types (e.g., `createdAt` vs `created_at`) — follow Drizzle conventions and camelCase TypeScript.
- shadcn/ui component choices for the topic card grid and topic page tabs — use standard shadcn Card and Tabs primitives.
- Error boundary and loading state patterns — use Next.js App Router conventions (loading.tsx, error.tsx).
- Better Auth session middleware setup details — follow Better Auth docs for App Router.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and requirements list
- `.planning/REQUIREMENTS.md` — Full requirement specs: INFRA-01-04, AUTH-01-04, CONT-01-06
- `.planning/PROJECT.md` — Core constraints (stack, auth, timeline, content source)

### Tech Stack Specs
- `CLAUDE.md` (project) — Recommended stack table (Next.js 16, Drizzle 0.45.x, Better Auth 1.5.x, Neon serverless driver, Tailwind v4, shadcn/ui), version compatibility matrix, and explicit "What NOT to Use" table
- `CLAUDE.md` (project) — Drizzle + Neon integration pattern: `neon()` from `@neondatabase/serverless` + `drizzle()` from `drizzle-orm/neon-http`

### Source Material
- `CS201-Exam2/` — 11 PDF source files. Relevant for Phase 1 content pipeline:
  - `CS201-Exam2/Huffman Codes.pdf`
  - `CS201-Exam2/Non-Binary Trees and Traversals.pdf`
  - `CS201-Exam2/Red-Black Trees.pdf`
  - `CS201-Exam2/Red-Black Trees Continued.pdf`
  - `CS201-Exam2/B-Trees Search and Insert.pdf`
  - `CS201-Exam2/B-Trees Deletion.pdf`
  - `CS201-Exam2/Exam2-Outline.pdf` — topic scope and coverage guide
  - `CS201-Exam2/Exam 2.pdf` — exam format reference

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — repo is greenfield. No existing components, hooks, or utilities.

### Established Patterns
- None yet. Phase 1 establishes all patterns.

### Integration Points
- PDF source files at `CS201-Exam2/` are the only existing content asset. Build-time seed script reads from here.
- 11 PDFs available: Huffman Codes, Non-Binary Trees and Traversals, Red-Black Trees (2 files), B-Trees Search and Insert, B-Trees Deletion, Binary Search Trees, Building Trees from Traversals, Trees and Stacks, Exam2-Outline, Exam 2 (review slides).

</code_context>

<specifics>
## Specific Ideas

- The topic page tab structure (Lesson | Visualizations | Quiz | Flashcards) must be designed so Phase 2 and 3 can activate existing disabled tabs rather than adding new navigation — this is important for keeping URL structure stable across phases.
- The content seed script should be a standalone Node.js/TypeScript script (`scripts/seed.ts` or similar) runnable with `pnpm tsx scripts/seed.ts` or `pnpm db:seed`.
- Better Auth Neon adapter setup is a noted risk (different from NextAuth patterns) — researcher should confirm `@better-auth/neon` adapter configuration for App Router.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-24*
