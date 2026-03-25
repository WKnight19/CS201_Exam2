# Feature Research

**Domain:** Interactive CS exam-prep web app (data structures & algorithms)
**Researched:** 2026-03-24
**Confidence:** HIGH — based on direct analysis of VisuAlgo, OpenDSA, zyBooks, Khan Academy, Anki, LeetCode; supplemented by cognitive load / spaced repetition research

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features an exam-prep study app must have. Missing these makes the app feel like a worse textbook.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Topic coverage: all four areas | Students come here specifically for Huffman, N-ary, RB, B-Trees — any gap = product fails its purpose | LOW | Content problem not engineering problem; seeds from parsed PDFs |
| Step-through algorithm animations | Every credible reference tool (VisuAlgo, OpenDSA, RB Tree Visualizer) includes this; it's the baseline expectation for any "interactive" DSA tool | MEDIUM | Need insert, delete, search, traversal, encode/decode per topic; use D3 or React Flow canvas |
| Multiple choice practice questions | Mirrors ~50% of actual exam format; universally present in VisuAlgo quiz, LeetCode, OpenDSA | LOW | JSON-seeded from PDF content; randomized answer order |
| Fill-in-the-blank questions | Explicitly in exam format; OpenDSA and Runestone Academy both include this as a distinct question type | LOW | Regex or exact-match answer verification; partial credit optional |
| Tracing exercises (predict next step) | The most exam-critical skill; VisuAlgo, zyBooks, OpenDSA all structure dedicated tracing question types | HIGH | This is the hardest to build well — see differentiators for what makes it good |
| Immediate feedback on answers | Students drill for exam; feedback delay kills the loop — all reference tools verify instantly | LOW | Client-side for MC/FIB; server round-trip acceptable for tracing |
| Progress persistence across sessions | Google OAuth is required per PROJECT.md; students study over multiple sessions before exam | MEDIUM | Neon Postgres + session-linked answer records; no anonymous progress |
| Per-topic coverage view | Students need to know which of the four topics they've covered and at what depth | LOW | Dashboard aggregate; topic × question-type completion grid |
| Pseudocode + C++ code for each algorithm | Exam uses pseudocode; class uses C++; both needed per PROJECT.md context | LOW | Static content per topic, rendered with syntax highlighting |
| Short readable explanations per topic | "Learn from scratch" path requires prose; pure animation without text frustrates beginners | LOW | Structured reading section: concept → pseudocode → code → examples |

---

### Differentiators (Competitive Advantage)

Features that make this tool better than opening VisuAlgo + Anki + a PDF side by side.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Spaced repetition surfacing weak topics | FSRS algorithm (better than SM-2) schedules re-exposure to missed/hard questions; research shows exponentially better retention vs re-reading — critical for high-stakes exam prep | MEDIUM | Track per-user per-question difficulty ratings; implement simplified FSRS or SM-2 with `next_review_at` timestamp; full FSRS requires stability/retrievability state per card |
| Tracing exercises: drag/click to build next state | Student predicts the output of one algorithm step on an interactive tree; not just "which answer is right" but "draw what happens next" — mirrors actual exam mechanics | HIGH | Render tree as SVG/canvas with node-drag or click-to-color interactions; validate state against expected output; the most differentiated feature relative to VisuAlgo quiz (which is MC only) |
| Debugging exercises: spot the error in a trace | Given a partially-executed trace with one wrong step, identify and explain the error — maps directly to exam "debugging" format | HIGH | Requires pre-authored wrong traces per operation; not generatable at runtime without LLM; seed from PDF content + manual authoring |
| AI-generated quiz variations from PDF content | LLM generates novel MC/FIB questions from source PDFs at build time, expanding the question pool beyond hand-authored content; prevents memorization of a fixed question set | MEDIUM | Build-time generation (not runtime); store in DB as seeds; human-review pass before deploy |
| "Explain why" short answer with rubric hints | Students type a short answer; app shows rubric bullets post-submission for self-grading — mirrors the medium/long-answer exam portion | MEDIUM | No auto-grading needed; just prompt → submit → reveal rubric; high value, low infra complexity |
| Recommended next action on dashboard | "You've missed 3/4 RB Tree rotation questions — start here" — surfaces the specific weak spot rather than just showing a completion percentage | MEDIUM | Requires answer-level tracking per topic/question-type; simple heuristic: sort by miss rate and recency |
| Animation-to-tracing progression | First encounter = watch the animation; second encounter = answer tracing question; third encounter = predict before seeing animation — mirrors scaffolded learning from zyBooks research showing 5x engagement when structured | MEDIUM | State machine per user × topic: UNSEEN → WATCHED → TRACED → PREDICTED; drives which view to render |
| Huffman encoding/decoding round-trip practice | Given a string, encode it; given a bitstring + tree, decode it — a complete encode-decode loop is uniquely testable for Huffman and difficult to do in a static textbook | MEDIUM | Requires Huffman tree builder + bit string renderer; decode is the harder direction |
| B-Tree degree parameterization | Let students practice with different B-Tree degrees (t=2, t=3) to build intuition about how degree affects split/merge thresholds — VisuAlgo shows this but does not quiz it | LOW | Parameterize the B-Tree question generator by degree; low cost after core B-Tree animation exists |

---

### Anti-Features (Deliberately NOT Building)

| Feature | Why Requested | Why It's Wrong for This Use Case | Better Approach |
|---------|---------------|----------------------------------|-----------------|
| Code execution / REPL | Feels interactive and "hands-on"; LeetCode model | Exam is pseudocode + tracing — not code writing; a REPL adds implementation overhead with zero exam-prep payoff | Tracing exercises ARE the hands-on practice; they match the actual exam format |
| Community / social features | "Study together" appeals; Quizlet has it | Zero benefit for solo exam prep; ads complexity that delays content completion; explicitly out of scope per PROJECT.md | Single-user dashboard with strong personal weak-area surfacing |
| Generalized DSA coverage beyond four topics | More content = more value feels true | Time-to-exam is days; covering other topics dilutes focus and delays launching with complete content for the four exam topics | Strict scope to Huffman, N-ary, RB, B-Trees for now |
| Timed test-mode with pressure timer | VisuAlgo supports it; feels exam-authentic | Creates anxiety without benefit at this study stage; no evidence timed practice improves performance on conceptual tracing questions | Optional "challenge mode" UI can be deferred to v2 |
| Gamification / points / badges / streaks | High engagement surface; Duolingo model | Study sessions are days away from exam, not months; gamification mechanics (streaks) require investment across weeks to pay off; adds visual complexity | Spaced repetition progress and the "next recommended topic" card is a better motivator |
| LMS integration (Canvas, Blackboard) | Might be assigned by instructor | Explicitly out of scope per PROJECT.md; adds auth + data-sharing complexity | Direct URL sharing is sufficient; no LTI needed |
| Mobile native app | Students study on phones | Web-responsive is sufficient per PROJECT.md; native app delays launch significantly; exam is in days | Mobile-responsive web with tap-friendly tree interaction targets |
| User-created flashcard decks | Anki model; feels flexible | This app's value is curated, exam-targeted content; blank flashcard decks shift the work back to the student | Pre-seeded decks from PDF content, spaced repetition surfacing weak cards |
| Video lectures | Khan Academy model | Content density vs. time-to-consume is bad for exam-days-away scenario; students need practice, not more passive content | Short text explanations + animations; skip full-length video |

---

## Feature Dependencies

```
[Progress persistence (DB)]
    └──required by──> [Spaced repetition surfacing]
    └──required by──> [Recommended next action dashboard]
    └──required by──> [Per-topic coverage view]

[Algorithm animations (step-through)]
    └──required by──> [Animation-to-tracing progression]
    └──enables──>     [Tracing exercises (interactive state prediction)]

[Topic content seeded from PDFs]
    └──required by──> [Multiple choice questions]
    └──required by──> [Fill-in-the-blank questions]
    └──required by──> [Debugging exercises]
    └──required by──> [Short answer with rubric]
    └──required by──> [Flashcard decks]

[Tracing exercises (interactive)]
    └──required by──> [Debugging exercises (spot the error)]

[Google OAuth + session]
    └──required by──> [Progress persistence]
    └──required by──> [Spaced repetition surfacing]

[Huffman tree builder]
    └──required by──> [Huffman encode/decode round-trip practice]

[B-Tree animation]
    └──enables──>     [B-Tree degree parameterization]
```

### Dependency Notes

- **Progress persistence requires auth first**: no per-user tracking without established session identity; this must be Phase 1.
- **Animations required before tracing**: students cannot be asked to predict the next state of an operation they have never seen animated. Animations must be built before tracing exercises for the same topic.
- **PDF seed content gates all question types**: MC, FIB, flashcards, debugging, and short-answer all depend on parsed + structured PDF content being in the DB. Content seeding is a hard prerequisite for all practice features.
- **Tracing is required before debugging**: "spot the error" exercises require a student to already understand what a correct trace looks like; build tracing first.
- **Spaced repetition enhances, not gates**: basic quiz practice is useful without spaced repetition; SR is an overlay on answer history. Build question types first, add SR scheduling after.

---

## MVP Definition

Given the exam is days away, the MVP must prioritize content completeness and practice coverage over polish.

### Launch With (v1)

- [ ] Google OAuth with session + Neon Postgres user record — enables all progress tracking
- [ ] PDF content seeded into DB: all four topics, all sub-operations
- [ ] Short readings + pseudocode + C++ code per topic (static, rendered)
- [ ] Step-through algorithm animations for all operations: insert, delete, search, traversal, encode/decode
- [ ] Multiple choice question bank per topic (seeded, randomized order)
- [ ] Fill-in-the-blank question bank per topic
- [ ] Basic tracing exercises: step-prediction on animated state (click next node / state)
- [ ] Answer recording with right/wrong per user × question
- [ ] Per-topic coverage view on dashboard (% questions answered, % correct)
- [ ] Flashcard decks per topic (term → definition, with flip)

### Add After Validation (v1.x)

- [ ] Spaced repetition scheduling (FSRS or simplified SM-2) — add once question bank is exercised enough to have meaningful answer history
- [ ] "Recommended next action" surfacing on dashboard — add once per-question answer history exists
- [ ] Debugging exercises (spot-the-error in trace) — add once tracing exercises are fully built
- [ ] Short answer with rubric reveal — high value, low complexity; add in v1.x
- [ ] AI-generated quiz variations — add if question bank feels thin after initial use
- [ ] Animation-to-tracing progression state machine — enhances engagement, defer until core loop is validated

### Future Consideration (v2+)

- [ ] Huffman encode/decode round-trip interactive practice
- [ ] B-Tree degree parameterization in exercises
- [ ] Timed challenge mode
- [ ] Export progress summary (PDF / share link)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| PDF content seeding (all 4 topics) | HIGH | LOW | P1 |
| Algorithm animations (step-through) | HIGH | HIGH | P1 |
| Multiple choice questions | HIGH | LOW | P1 |
| Fill-in-the-blank questions | HIGH | LOW | P1 |
| Basic tracing exercises | HIGH | HIGH | P1 |
| Google OAuth + session persistence | HIGH | LOW | P1 |
| Per-topic coverage dashboard | HIGH | LOW | P1 |
| Flashcard decks | MEDIUM | LOW | P1 |
| Spaced repetition surfacing | HIGH | MEDIUM | P2 |
| Recommended next action | HIGH | MEDIUM | P2 |
| Debugging exercises | HIGH | MEDIUM | P2 |
| Short answer + rubric reveal | MEDIUM | LOW | P2 |
| AI-generated question variations | MEDIUM | MEDIUM | P2 |
| Animation-to-tracing progression | MEDIUM | MEDIUM | P2 |
| Huffman encode/decode round-trip | MEDIUM | MEDIUM | P3 |
| B-Tree degree parameterization | LOW | LOW | P3 |
| Timed challenge mode | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch — student cannot use app effectively without it
- P2: Should have — directly improves exam prep quality; add before exam date if possible
- P3: Nice to have — useful but not exam-critical

---

## Competitor Feature Analysis

| Feature | VisuAlgo | OpenDSA | zyBooks | Anki | Our Approach |
|---------|----------|---------|---------|------|--------------|
| Step-through animations | Yes — 24 modules, custom input | Yes — full operation animations | Yes — 50+ animations with code trace | No | Yes — scoped to 4 topics, all operations |
| Multiple choice questions | Yes — randomly generated, graded | Yes — immediate feedback | Yes — embedded question sets | No | Yes — seeded from PDF content |
| Tracing exercises | Yes — but MC only (pick correct state) | Yes — Parsons problems (order the states) | Yes — embedded in reading flow | No | Yes — interactive: predict/draw next state |
| Debugging exercises | No | Limited | No | No | Yes — spot the error in a pre-built wrong trace |
| Fill-in-the-blank | No | Yes | Yes | No | Yes |
| Spaced repetition | No | No | No | Yes — FSRS + SM-2 | Yes — simplified FSRS on missed questions |
| Progress dashboard | Minimal (NUS-only tracking) | LMS-integrated gradebook | Instructor analytics | Stats per deck | Yes — per-user, per-topic, per-question-type |
| Curated exam-specific content | No — general DSA | No — general DSA | No — general DSA | No — user must build decks | Yes — scoped to CS201 Exam 2 topics only |
| Short answer practice | No | No | No | No | Yes — prompt + rubric reveal |
| Flashcards | No | No | No | Yes | Yes — pre-seeded, not user-created |

**Our primary advantage:** The only tool that combines exam-format-matched practice (tracing, debugging, fill-in-blank) with spaced repetition + progress tracking, scoped exactly to the four CS201 Exam 2 topics. Every reference tool requires the student to navigate across multiple products or build their own Anki decks. This app collapses the workflow.

---

## Notes on Effective Tracing Practice

Research from zyBooks, OpenDSA, and cognitive load studies establishes these principles for tracing exercises:

1. **Watch before predicting.** First exposure must be passive animation (reduces cognitive load). Prediction only works once the student has a mental model. This maps to the animation-to-tracing progression in the differentiators section.

2. **State, not code.** Tracing exercises should ask about tree state (what does the tree look like after this operation?) not about code execution (what line runs next?). The CS201 exam traces tree states.

3. **One step at a time.** Full-operation tracing (insert a key into a RB tree from start to finish) is too long. Single-step prediction (what happens after this rotation?) is more pedagogically sound and more testable.

4. **Immediate visual feedback.** After the student submits a predicted state, show the correct state animated to the answer. Don't just mark right/wrong — show the delta.

5. **Parsons problems as a simpler tracing variant.** For lower-complexity questions, show 3–5 intermediate states in scrambled order; ask student to sort them. This is lower implementation cost than full interactive tree manipulation and still tests tracing skill.

## Notes on Effective Visualizations for Tree Data Structures

- **Color is load-bearing for RB Trees.** Red/black coloring must be prominent; color-blind accessibility (use shapes or labels alongside color) is important.
- **B-Tree node layout must show degree.** Render each node as a horizontal array of keys with child pointers below; degree-t must be visually obvious.
- **Huffman tree builds bottom-up.** The visualization must start from leaf weights and animate the greedy merge; the final tree alone is insufficient.
- **N-ary traversal needs visit-order highlighting.** Traversal animations need a "visited" highlight that persists across nodes so students can follow the traversal order.

---

## Sources

- [VisuAlgo — Training Mode](https://visualgo.net/training)
- [Algorithm Visualizer vs. VisuAlgo comparison — daily.dev](https://daily.dev/blog/algorithm-visualizer-vs-visualgo-comparison)
- [OpenDSA: Design and architecture of an interactive eTextbook](https://www.researchgate.net/publication/259332833_Design_and_architecture_of_an_interactive_eTextbook_-_The_OpenDSA_system)
- [OpenDSA Huffman Coding Tree Build Visualization](https://opendsa-server.cs.vt.edu/OpenDSA/AV/Binary/huffmanBuildAV.html)
- [zyBooks: Tracing Algorithms](https://www.zybooks.com/tracing-algorithms/)
- [FSRS Algorithm — open-spaced-repetition/fsrs4anki Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert)
- [What spaced repetition algorithm does Anki use — Anki FAQs](https://faqs.ankiweb.net/what-spaced-repetition-algorithm)
- [Enhancing human learning via spaced repetition optimization — PNAS](https://www.pnas.org/doi/10.1073/pnas.1815156116)
- [Cognitive Effects of Visualization on Learning Data Structure and Algorithms — Academia.edu](https://www.academia.edu/11939455/Cognitive_Effects_of_Visualization_on_Learning_Data_Structure_and_Algorithms)
- [Designing Educationally Effective Algorithm Visualizations — Auburn University](https://www.eng.auburn.edu/~naraynh/jvlc.pdf)
- [Red-Black Tree Visualizer — rbt-visualizer.netlify.app](https://rbt-visualizer.netlify.app/)
- [See Algorithms Red-Black Tree](https://see-algorithms.com/data-structures/RedBlackTree)
- [Huffman Tree — CS Field Guide](https://www.csfieldguide.org.nz/en/interactives/huffman-tree/)
- [TraceCode — step-through tracing tool](https://tracecode.app)

---
*Feature research for: CS201 Exam 2 study app — Huffman codes, N-ary trees, Red-Black trees, B-Trees*
*Researched: 2026-03-24*
