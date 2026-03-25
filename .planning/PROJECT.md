# CS201 Exam 2 Study App

## What This Is

An interactive web application for studying CS 201 data structures and algorithms — specifically for Exam 2 material covering Huffman codes, N-ary trees, Red-Black trees, and B-Trees. Designed to serve both students learning the material from scratch and those reviewing before an exam, with spaced repetition, interactive visualizations, and practice problems that mirror the actual exam format (multiple choice, tracing, debugging, pseudocode).

## Core Value

A student who uses this app for any amount of time should leave with a measurably stronger grasp of the exam topics — whether that's understanding one algorithm better via animation, or drilling weak spots via spaced repetition quizzes.

## Requirements

### Validated

- [x] User can authenticate with Google OAuth and have their progress persisted across sessions *(Validated in Phase 01: foundation)*
- [x] App covers all four topic areas: Huffman codes, N-ary trees, Red-Black trees, B-Trees *(Validated in Phase 01: foundation)*
- [x] Each topic has a structured lesson: short reading → pseudocode → C++ code → examples *(Validated in Phase 01: foundation)*
- [x] Content is seeded from CS201-Exam2 PDF source material *(Validated in Phase 01: foundation)*
- [x] App is deployed-ready with Neon Postgres backend and Vercel-compatible stack *(Validated in Phase 01: foundation)*

### Active

- [ ] Interactive step-through animations show algorithms executing (insert, delete, search, traversal, encode/decode)
- [ ] User-driven tracing exercises let students predict next steps and get immediate feedback
- [ ] Flashcard decks exist for each topic area
- [ ] Practice quizzes exist in each exam-relevant format: MC, fill-in-blank, tracing, debugging, short answer
- [ ] Spaced repetition surfaces weak topics and missed questions more frequently
- [ ] User dashboard shows progress, quiz scores, topic coverage, and recommended next steps
- [ ] AI-assisted generation of quiz variations and flashcard alternatives from PDF content
- [ ] Interactive step-through animations show algorithms executing (insert, delete, search, traversal, encode/decode)
- [ ] User-driven tracing exercises let students predict next steps and get immediate feedback
- [ ] Flashcard decks exist for each topic area
- [ ] Practice quizzes exist in each exam-relevant format: MC, fill-in-blank, tracing, debugging, short answer
- [ ] Spaced repetition surfaces weak topics and missed questions more frequently
- [ ] User dashboard shows progress, quiz scores, topic coverage, and recommended next steps
- [ ] Content is seeded from CS201-Exam2 PDF source material (parsed at build time)
- [ ] AI-assisted generation of quiz variations and flashcard alternatives from PDF content
- [ ] App is deployed to Vercel with Neon Postgres backend

### Out of Scope

- Mobile native app — web-only, mobile-responsive is sufficient
- User-created content / community features — single-user study tool
- Other CS201 exam material (Exam 1 topics, etc.) — scoped to Exam 2 only for now
- Payment or monetization — free tool
- LMS integration (Canvas, Blackboard) — not needed for this use case
- Real-time multiplayer/study groups — adds complexity without exam-prep value

## Context

- **Source material**: 11 PDFs in `CS201-Exam2/` directory covering all exam topics. Includes exam outline (`Exam2-Outline.pdf`), review slides (`Exam 2.pdf`), and chapter PDFs for each topic.
- **Exam format**: ~50% multiple choice, ~50% long-form (tracing, pseudocode, debugging, algorithm questions). Tracing problems are particularly important — students must trace through tree operations step by step.
- **Code language**: Class uses C++, but most problems are pseudocode. App should show both.
- **Urgency**: Exam is days away. Content coverage takes priority over polish.
- **Topic areas and sub-topics**:
  - **Huffman Codes**: Greedy Huffman algorithm, encoding, decoding
  - **N-ary Trees**: Preorder, postorder, level-order traversal; traversal algorithm complexity
  - **Red-Black Trees**: Search, insert, delete algorithms
  - **B-Trees**: Search, insert, delete algorithms
- **Students**: Range from zero familiarity to exam reviewers. App must serve both.

## Constraints

- **Tech Stack**: Next.js App Router + Neon (Postgres) + Vercel — required by user
- **Auth**: Google OAuth only — no email/password, no magic link
- **Timeline**: Days to exam — content completeness > feature completeness
- **Content source**: PDFs parsed at build time, content hardcoded into DB seeds
- **Hosting**: Vercel — serverless constraints apply (no persistent processes, cold starts)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google OAuth only | Fastest login path, zero friction for students | ✓ Working end-to-end |
| Neon Postgres (not SQLite/local) | User progress must persist cross-session, Vercel-compatible | ✓ Connected, 11 tables live |
| Content seeded from PDFs at build time | Reliability over flexibility — no runtime PDF parsing complexity | ✓ 4 topics, 11 lessons seeded |
| Spaced repetition over simple tracking | Exam is high-stakes; surfacing weak areas is more valuable than just tracking | — Pending |
| Both animations + user-driven tracing | Animations for learning, tracing for practice — mirrors exam format directly | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
## Current State

Phase 01 (foundation) complete — full stack is live. Next.js 16 + Better Auth + Neon Postgres running. Google OAuth works. 4 topics with 11 lessons seeded. Dashboard and lesson reader UI verified end-to-end.

Phase 02 (visualizations) is next — algorithm step-through animations.

*Last updated: 2026-03-25 after Phase 01 completion*
