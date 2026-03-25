# Roadmap: CS201 Exam 2 Study App

## Overview

Four phases deliver the complete exam-prep tool. Phase 1 is the hard dependency gate: schema, auth, and content seed must all exist before any interactive feature can be built or tested. Phase 2 builds the visualization engine independently of the quiz system — algorithm correctness is validated with invariant checkers before any animation code runs. Phase 3 delivers the quiz engine and flashcard drill, using the seeded content from Phase 1 and optionally pulling visualization snapshots for tracing questions. Phase 4 adds spaced repetition scheduling and the progress dashboard on top of the answer history produced by Phase 3.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - DB schema, Better Auth + Google OAuth, Neon connection, content seed, lesson pages
- [ ] **Phase 2: Visualizations** - Step-through algorithm animations for all four topics with pre-computed snapshots
- [ ] **Phase 3: Quiz Engine & Flashcards** - All question types (MC, fill-blank, tracing, debugging, short answer) with answer recording
- [ ] **Phase 4: Progress & Spaced Repetition** - FSRS scheduling, per-topic dashboard, recommended next action

## Phase Details

### Phase 1: Foundation
**Goal**: Users can sign in with Google, view structured lesson content for all four topics, and the database schema and content seed are complete and correct — unlocking all downstream features
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
  1. User can click "Sign in with Google", complete OAuth, and land on the app — no additional fields required
  2. User's session persists across browser refresh and new tabs without re-authenticating
  3. User can sign out from any page and be redirected to the sign-in screen
  4. User can navigate to any of the four topic lesson pages and read concept explanation, pseudocode, and C++ implementation
  5. All four topic lessons (Huffman, N-ary, RB, B-Trees) have content seeded from the PDF source material and are readable without placeholder text
**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold, DB schema, Drizzle + Neon connection, shadcn/ui, Vitest
- [ ] 01-02-PLAN.md — Better Auth + Google OAuth, sign-in page, middleware, requireAuth
- [ ] 01-03-PLAN.md — PDF content pipeline, structured lesson JSON, DB seed script
- [ ] 01-04-PLAN.md — Dashboard UI, topic pages, lesson content renderer, nav bar

**UI hint**: yes

### Phase 2: Visualizations
**Goal**: Users can watch and step through algorithm animations for all operations across all four topics, with correct algorithm behavior validated before any animation runs
**Depends on**: Phase 1
**Requirements**: VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05, VIZ-06
**Success Criteria** (what must be TRUE):
  1. User can watch a step-through Huffman tree construction animation showing the greedy bottom-up merge process
  2. User can watch step-through N-ary tree traversal animations for preorder, postorder, and level-order — visited nodes stay highlighted as the traversal progresses
  3. User can watch step-through RB tree insert and delete animations including rotation and recoloring steps; delete animation includes double-black fixup cases
  4. User can watch step-through B-Tree insert and delete animations including node splits, merges, and redistribution
  5. User can step forward and backward through any animation one step at a time, and each backward step returns to the exact prior tree state
**Plans**: TBD
**UI hint**: yes

### Phase 3: Quiz Engine & Flashcards
**Goal**: Users can practice every exam-relevant question format across all four topics and have their answers recorded per question for downstream progress tracking
**Depends on**: Phase 1
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, QUIZ-07, CARD-01, CARD-02, CARD-03
**Success Criteria** (what must be TRUE):
  1. User can answer multiple choice, fill-in-the-blank, tracing, debugging, and short-answer questions for each of the four topics and receive immediate feedback (or rubric reveal for short answer)
  2. User can flip through flashcard decks for each topic and mark cards as "known" or "needs review"
  3. Every answer submission is recorded in the database with correct/incorrect result and timestamp tied to the user's account
  4. All five question types are available for all four topic areas (no topic has a missing question type)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Progress & Spaced Repetition
**Goal**: Users can see exactly where they stand on each topic and have the app surface the questions and flashcards they need most based on their answer history
**Depends on**: Phase 3
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04
**Success Criteria** (what must be TRUE):
  1. User can view a dashboard showing per-topic coverage: percentage of questions answered and percentage correct, broken down by question type
  2. Dashboard shows a "recommended next" card that names the weakest topic/question-type combination based on the user's answer history
  3. Questions and flashcards the user has answered incorrectly or marked "needs review" appear more frequently in subsequent sessions than well-known ones
  4. A new user sees all four topics at least once before the spaced repetition scheduler begins prioritizing based on performance
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/4 | Planning complete | - |
| 2. Visualizations | 0/TBD | Not started | - |
| 3. Quiz Engine & Flashcards | 0/TBD | Not started | - |
| 4. Progress & Spaced Repetition | 0/TBD | Not started | - |
