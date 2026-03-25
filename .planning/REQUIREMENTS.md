# Requirements: CS201 Exam 2 Study App

**Defined:** 2026-03-24
**Core Value:** A student who uses this app for any amount of time leaves with a measurably stronger grasp of the exam topics — via targeted practice that mirrors the actual exam format.

---

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign in with Google OAuth in one click with no additional fields
- [x] **AUTH-02**: User session persists across browser refresh and new tabs
- [x] **AUTH-03**: User can sign out from any page
- [x] **AUTH-04**: User's progress and preferences are tied to their Google account and persist across devices

### Content

- [ ] **CONT-01**: User can read a structured lesson for each topic (Huffman codes, N-ary trees, Red-Black trees, B-Trees) with concept explanation, pseudocode, and C++ implementation
- [x] **CONT-02**: Huffman lesson covers: greedy algorithm, encoding a string, decoding a bitstring
- [x] **CONT-03**: N-ary trees lesson covers: preorder traversal, postorder traversal, level-order traversal, and traversal algorithm complexity (Big-O)
- [x] **CONT-04**: Red-Black trees lesson covers: search algorithm, insert algorithm (with rotations and recoloring), delete algorithm (with double-black fixup)
- [x] **CONT-05**: B-Trees lesson covers: search algorithm, insert algorithm (with node splits), delete algorithm (with node merges and redistribution)
- [x] **CONT-06**: All content is seeded from CS201-Exam2 PDF source material (parsed at build time, stored in DB)

### Visualizations

- [ ] **VIZ-01**: User can watch a step-through animation of Huffman tree construction (greedy bottom-up merge)
- [ ] **VIZ-02**: User can watch step-through animations of N-ary tree traversals: preorder, postorder, level-order (with persistent visit-order highlighting)
- [ ] **VIZ-03**: User can watch step-through animations of Red-Black tree operations: insert (with rotations), delete (with fixup), search
- [ ] **VIZ-04**: User can watch step-through animations of B-Tree operations: insert (with splits), delete (with merges/redistribution), search
- [ ] **VIZ-05**: User can navigate animations step-by-step (forward and backward) and pause at any step
- [ ] **VIZ-06**: Animation steps are pre-computed as immutable state snapshots (not derived from mutable animated state)

### Practice — Quizzes

- [ ] **QUIZ-01**: User can answer multiple choice questions for each topic with randomized answer ordering and immediate right/wrong feedback
- [ ] **QUIZ-02**: User can answer fill-in-the-blank questions for each topic with immediate feedback (exact match or regex validation)
- [ ] **QUIZ-03**: User can complete tracing exercises: given a partially-executed tree operation, predict the next step's tree state (click/select the correct node action or resulting state)
- [ ] **QUIZ-04**: User can complete debugging exercises: given a trace with one incorrect step, identify the error
- [ ] **QUIZ-05**: User can answer short-answer prompts; after submitting, a rubric is revealed for self-grading
- [ ] **QUIZ-06**: All question types are available for all four topic areas
- [ ] **QUIZ-07**: User answers are recorded per question per user (right/wrong, timestamp) for progress tracking

### Practice — Flashcards

- [ ] **CARD-01**: User can flip through flashcard decks for each topic (term/concept on front, definition/explanation on back)
- [ ] **CARD-02**: User can mark a flashcard as "known" or "needs review"
- [ ] **CARD-03**: Flashcard decks are pre-seeded from PDF content (not user-created)

### Progress & Spaced Repetition

- [ ] **PROG-01**: User can view a dashboard showing per-topic coverage (% questions answered, % correct) across all question types
- [ ] **PROG-02**: Dashboard surfaces a "recommended next" action based on weakest topic/question-type combination
- [ ] **PROG-03**: Spaced repetition (FSRS algorithm via ts-fsrs) schedules which questions and flashcards to surface based on answer history
- [ ] **PROG-04**: Topics and questions with poor performance are surfaced more frequently than well-known ones

### Infrastructure

- [x] **INFRA-01**: App is deployed on Vercel as a Next.js 16 App Router application
- [x] **INFRA-02**: User data and content are stored in Neon Postgres accessed via Drizzle ORM
- [x] **INFRA-03**: Content seeding script reads source PDFs and populates DB with lessons, questions, and flashcards for all four topics
- [x] **INFRA-04**: All user-data mutations are authenticated via Better Auth server-side guards (not middleware-only)

---

## v2 Requirements

### AI-Assisted Content

- **AI-01**: AI-generated quiz variations from PDF content expand the question pool at build time (LLM generates novel MC/FIB questions; human-reviewed before deploy)
- **AI-02**: Question variations prevent memorization of fixed question set across study sessions

### Advanced Practice

- **ADV-01**: Huffman encode/decode round-trip interactive practice (encode a string → produce bitstring; decode bitstring + tree → produce string)
- **ADV-02**: B-Tree degree parameterization — students can practice with different degrees (t=2, t=3) to build intuition about split/merge thresholds
- **ADV-03**: Animation-to-tracing progression state machine (UNSEEN → WATCHED → TRACED → PREDICTED per user × topic)

### UX Enhancements

- **UX-01**: Timed challenge mode for practice sessions
- **UX-02**: Export progress summary (PDF or shareable link)
- **UX-03**: Mobile-optimized tap targets for tree interaction in tracing exercises

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Email/password or magic link auth | Google OAuth only — no additional auth complexity |
| User-created flashcard decks | App value is curated exam-targeted content; blank decks shift work back to student |
| Community / social features | Zero benefit for solo exam prep; explicitly excluded in PROJECT.md |
| LMS integration (Canvas, Blackboard) | Not needed; direct URL is sufficient |
| Mobile native app | Mobile-responsive web is sufficient |
| Code execution / REPL | Exam is pseudocode + tracing, not code writing; no exam-prep payoff |
| Gamification (streaks, badges, points) | Exam is days away; gamification mechanics require weeks to pay off |
| Video lectures | Content density vs. time is bad for days-to-exam; short text + animations are higher-value |
| Coverage of topics outside Exam 2 | Scoped to Huffman, N-ary, RB, B-Trees only |
| Real-time multiplayer / study groups | Complexity without exam-prep value |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| CONT-01 | Phase 1 | Pending |
| CONT-02 | Phase 1 | Complete |
| CONT-03 | Phase 1 | Complete |
| CONT-04 | Phase 1 | Complete |
| CONT-05 | Phase 1 | Complete |
| CONT-06 | Phase 1 | Complete |
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| VIZ-01 | Phase 2 | Pending |
| VIZ-02 | Phase 2 | Pending |
| VIZ-03 | Phase 2 | Pending |
| VIZ-04 | Phase 2 | Pending |
| VIZ-05 | Phase 2 | Pending |
| VIZ-06 | Phase 2 | Pending |
| QUIZ-01 | Phase 3 | Pending |
| QUIZ-02 | Phase 3 | Pending |
| QUIZ-03 | Phase 3 | Pending |
| QUIZ-04 | Phase 3 | Pending |
| QUIZ-05 | Phase 3 | Pending |
| QUIZ-06 | Phase 3 | Pending |
| QUIZ-07 | Phase 3 | Pending |
| CARD-01 | Phase 3 | Pending |
| CARD-02 | Phase 3 | Pending |
| CARD-03 | Phase 3 | Pending |
| PROG-01 | Phase 4 | Pending |
| PROG-02 | Phase 4 | Pending |
| PROG-03 | Phase 4 | Pending |
| PROG-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

Note: The previous draft listed 33 total; a recount of all requirement IDs yields 34. All 34 are now mapped.

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after roadmap creation — traceability complete*
