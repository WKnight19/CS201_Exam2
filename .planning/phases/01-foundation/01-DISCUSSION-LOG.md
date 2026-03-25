# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 01-foundation
**Areas discussed:** Content pipeline, DB schema scope, Lesson page structure, Navigation architecture

---

## Content Pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| AI-assisted parsing | PDF-to-text + LLM structuring at build time | ✓ |
| Manual JSON seed authoring | Hand-write all lesson content from PDFs | |
| PDF parsing only (no AI) | Raw text extraction, minimal structure | |

**User's choice:** AI-assisted parsing
**Notes:** Pre-run locally, commit the resulting JSON/TS seed files to the repo. No API key needed at Vercel build time. Section-by-section review — generate and review each topic separately before committing. Manually edit incorrect output before committing.

---

## DB Schema Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full schema now | All tables in Phase 1 | ✓ |
| Phase 1 tables only | Expand in later phases | |
| Minimal with stubs | All tables, partial seed | |

**User's choice:** Full schema now (users, sessions, topics, lessons, questions, flashcards, user_answers/progress)

| Option | Description | Selected |
|--------|-------------|----------|
| Single table + question_type enum + JSONB | One questions table, type-specific data in JSONB content column | ✓ |
| Separate table per question type | 5 tables, strongly typed | |
| Single table + flat nullable columns | All columns present, most nullable | |

**User's choice:** Single table + question_type enum (multiple_choice \| fill_blank \| trace_step \| debug_step \| short_answer) + JSONB content column. Zod validates union shape per type.

| Option | Description | Selected |
|--------|-------------|----------|
| Lessons only in Phase 1 seed | Questions/flashcards seeded in Phase 3 | ✓ |
| Seed everything in Phase 1 | All 4 tables populated | |
| Seed lessons + flashcards only | Questions wait for Phase 3 | |

**User's choice:** Lessons only — questions and flashcard rows seeded in Phase 3.

---

## Lesson Page Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Scrollable doc with sections | Concept → Pseudocode → C++ in one page | ✓ |
| Tabbed view per section | 3 tabs: Concept / Pseudocode / C++ | |
| Side-by-side: concept + code | Two-column layout | |

**User's choice:** Scrollable document with anchored sections.

| Option | Description | Selected |
|--------|-------------|----------|
| Sign-in required for lessons | Fully auth-gated | ✓ |
| Lessons public, progress requires sign-in | Auth boundary on progress only | |

**User's choice:** Sign-in required for all lesson content.

---

## Navigation Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Topic cards → topic detail page | / → 4 cards → /topics/[topic] | ✓ |
| Sidebar with all topics always visible | Persistent left sidebar | |
| Linear progression | Fixed topic order with Next/Prev | |

**User's choice:** Topic cards → `/topics/[topic]`. Slugs: huffman, n-ary-trees, red-black-trees, b-trees.

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs with disabled future tabs | Lesson active, Viz/Quiz/Flashcards disabled in Phase 1 | ✓ |
| Lesson-only page for now | Add tabs in later phases | |
| Sections on one page | Coming-soon placeholders for future content | |

**User's choice:** Tabs with disabled future tabs — Lesson \| Visualizations \| Quiz \| Flashcards. Only Lesson active in Phase 1.

---

## Claude's Discretion

- Drizzle schema column naming conventions (camelCase TypeScript)
- shadcn/ui component selection for topic card grid and topic page tabs
- Error boundary and loading state patterns (Next.js App Router conventions)
- Better Auth middleware setup details

## Deferred Ideas

None.
