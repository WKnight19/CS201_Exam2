# Architecture Research

**Domain:** Interactive educational web app (CS study tool with visualizations, spaced repetition, quizzes)
**Researched:** 2026-03-24
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                              │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐   │
│  │  Content Layer   │  │ Visualization     │  │  Quiz Engine      │   │
│  │  (RSC — server)  │  │ Layer             │  │  (Client)         │   │
│  │  Lessons, prose  │  │ ('use client')    │  │  State, answers,  │   │
│  │  pseudocode, code│  │ SVG tree/step-    │  │  scoring, timer   │   │
│  └────────┬─────────┘  │ through canvas    │  └────────┬──────────┘   │
│           │            └────────┬──────────┘           │              │
│           │                     │                       │              │
├───────────┴─────────────────────┴───────────────────────┴─────────────┤
│                        Next.js App Router                              │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  Route handlers / Server Actions  (API surface)              │     │
│  │  /api/auth  /api/quiz/submit  /api/progress  /api/sr         │     │
│  └──────────────────────────────────────────────────────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│                         Service Layer                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐  │
│  │ Content Svc   │  │  SR Engine    │  │  Quiz Scoring Svc         │  │
│  │ (read-only,   │  │  SM-2 impl,   │  │  grade answer, build      │  │
│  │  seed-driven) │  │  next due date│  │  feedback, record review  │  │
│  └───────┬───────┘  └───────┬───────┘  └────────────┬──────────────┘  │
│          │                  │                        │                 │
├──────────┴──────────────────┴────────────────────────┴─────────────────┤
│                         Data Layer (Neon Postgres + Prisma)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Topic   │  │ Question │  │UserCard  │  │ Review   │  │  User  │  │
│  │ /Lesson  │  │ /Option  │  │(SR state)│  │ History  │  │(OAuth) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| Content Layer | Render lesson prose, pseudocode, C++ code blocks, examples | React Server Components — no `use client` needed |
| Visualization Layer | Step-through tree animations, user-driven tracing exercises | Client components (`use client`) with SVG + d3-hierarchy layout math |
| Quiz Engine | Question rendering, answer collection, immediate feedback, session state | Client component with local React state; submits to Server Action on completion |
| SR Engine | SM-2 scheduling: compute next review date, update ease factor, interval | Server-side only — runs inside Server Actions after quiz submission |
| Auth/User Layer | Google OAuth session, user record creation on first login | NextAuth.js v5, JWT sessions, Prisma adapter |
| Route Handlers | `/api/auth`, progress endpoints for external clients if needed | Only add if Server Actions can't serve the use case |

---

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — session provider, font, nav
│   ├── page.tsx                    # Landing / dashboard (RSC)
│   ├── (auth)/
│   │   └── login/page.tsx          # Google OAuth entry point
│   ├── topics/
│   │   ├── layout.tsx              # Topic shell layout
│   │   ├── page.tsx                # Topic index (all 4 topics)
│   │   └── [topicSlug]/
│   │       ├── page.tsx            # Lesson page (RSC — prose + code)
│   │       ├── visualize/
│   │       │   └── page.tsx        # Visualization page (client boundary here)
│   │       └── quiz/
│   │           └── page.tsx        # Quiz session page (client)
│   ├── dashboard/
│   │   └── page.tsx                # User progress, SR queue, scores (RSC + client charts)
│   ├── flashcards/
│   │   └── page.tsx                # Flashcard drill mode (client)
│   └── api/
│       └── auth/
│           └── [...nextauth]/route.ts
├── components/
│   ├── content/                    # Lesson prose, code blocks, pseudocode display
│   ├── visualizations/             # Tree visualizers — one per algorithm
│   │   ├── HuffmanTree.tsx
│   │   ├── RedBlackTree.tsx
│   │   ├── BTree.tsx
│   │   └── NaryTree.tsx
│   ├── quiz/                       # Question type renderers
│   │   ├── MultipleChoice.tsx
│   │   ├── FillInBlank.tsx
│   │   ├── TracingStep.tsx
│   │   └── DebuggingQuestion.tsx
│   ├── flashcards/
│   │   └── FlashcardDeck.tsx
│   └── ui/                         # Shared primitives (buttons, progress bars)
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── auth.ts                     # NextAuth config
│   ├── sr/
│   │   └── sm2.ts                  # SM-2 algorithm — pure function
│   ├── quiz/
│   │   └── grader.ts               # Answer grading per question type
│   └── content/
│       └── loader.ts               # Content query helpers
├── actions/
│   ├── quiz.ts                     # submitQuizAnswer, completeQuizSession
│   └── progress.ts                 # getUserProgress, getDueCards
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # Seeds all content from parsed PDFs
└── types/
    └── index.ts                    # Shared TypeScript interfaces
```

### Structure Rationale

- **`app/(auth)/`**: Route group keeps auth routes isolated without affecting URL paths.
- **`app/topics/[topicSlug]/`**: Dynamic segment covers all 4 topic areas with a single route tree. `visualize/` and `quiz/` as sub-routes keeps URL hierarchy clear and allows independent loading.
- **`actions/`**: Server Actions co-located at the app level, not inside components, so they're importable everywhere and testable in isolation.
- **`lib/sr/sm2.ts`**: Pure function — input quality rating + card state, output new state. Zero DB dependency makes it unit-testable and portable.
- **`components/visualizations/`**: One file per algorithm. Each is a client component that receives an initial tree state from a server parent and controls animation state locally.

---

## Architectural Patterns

### Pattern 1: Server Shell / Client Island

**What:** Server Components fetch data and render static structure. A single `'use client'` boundary wraps only the interactive portion. Server renders the surrounding page, passes serializable data as props.

**When to use:** Every visualization and quiz page. The lesson text above a tree visualizer is server-rendered; the tree canvas below it is a client island.

**Trade-offs:** Keeps JS bundle small. Prevents hydration mismatches. Constraint: data passed across the boundary must be JSON-serializable (no Prisma models with methods).

**Example:**
```typescript
// app/topics/[topicSlug]/visualize/page.tsx — Server Component
import { getTopicTree } from '@/lib/content/loader'
import { RedBlackTree } from '@/components/visualizations/RedBlackTree'

export default async function VisualizePage({ params }) {
  const initialState = await getTopicTree(params.topicSlug)
  // Pass plain data — no Prisma objects
  return <RedBlackTree initialState={initialState} />
}

// components/visualizations/RedBlackTree.tsx — Client Component
'use client'
export function RedBlackTree({ initialState }: { initialState: TreeState }) {
  const [step, setStep] = useState(0)
  // All animation state lives here
}
```

### Pattern 2: Server Action for Quiz Submission

**What:** Quiz answers collected client-side in local state. On submit, a single Server Action call handles grading, persisting the review event, and running SM-2 scheduling. No separate API route needed.

**When to use:** Every quiz answer submission and SR review event.

**Trade-offs:** Reduces round-trips. Keeps business logic on the server. Side effect: Server Actions in transaction mode on Neon use the pooler URL — must configure correctly.

**Example:**
```typescript
// actions/quiz.ts
'use server'
import { gradeAnswer } from '@/lib/quiz/grader'
import { updateSRCard } from '@/lib/sr/sm2'
import { db } from '@/lib/db'

export async function submitAnswer(
  userId: string,
  questionId: string,
  userAnswer: string
) {
  const question = await db.question.findUniqueOrThrow({ where: { id: questionId } })
  const { correct, feedback } = gradeAnswer(question, userAnswer)
  const quality = correct ? 4 : 1  // SM-2 quality rating
  await updateSRCard(userId, question.topicId, quality)
  return { correct, feedback }
}
```

### Pattern 3: SVG-Based Tree Visualization with d3-hierarchy Layout Only

**What:** Use `d3-hierarchy` for layout math (computing x/y positions, links). Render the actual SVG elements as React JSX. No D3 DOM manipulation. Animation via CSS transitions or Framer Motion on SVG elements.

**When to use:** All tree visualizations (Red-Black, B-Tree, N-ary, Huffman).

**Trade-offs:** Clean React mental model — state drives SVG, not D3's imperative selection API. Avoids the React/D3 DOM conflict. Slightly more boilerplate than react-d3-tree, but full control over node appearance (critical for showing tree rotations, color changes in RB-trees, and split/merge in B-trees).

**Rationale for SVG over Canvas:** Tree structures have ~20-200 nodes max for these topics. SVG handles that with no performance concern. SVG nodes are DOM elements — easier to attach hover, click, and CSS transition for step-through highlighting. Canvas is only worth the complexity at 10,000+ nodes.

---

## DB Schema Sketches

### Content Schema (Seeded, Read-Only After Seed)

```sql
-- Topic: huffman | nary | redblack | btree
Topic
  id          UUID PK
  slug        TEXT UNIQUE  -- "huffman-codes"
  title       TEXT
  order       INT

-- A lesson is a structured body of content under a topic
Lesson
  id          UUID PK
  topicId     UUID FK → Topic
  title       TEXT
  body        TEXT         -- MDX or plain Markdown
  order       INT

-- A flashcard belongs to one topic
Flashcard
  id          UUID PK
  topicId     UUID FK → Topic
  front       TEXT
  back        TEXT

-- Questions use a discriminated-union approach:
-- base table holds shared fields + type discriminator
-- question_data JSONB holds type-specific payload
Question
  id          UUID PK
  topicId     UUID FK → Topic
  type        TEXT  -- 'multiple_choice' | 'fill_blank' | 'tracing' | 'debugging'
  prompt      TEXT
  questionData JSONB  -- typed per question_type (see below)
  explanation TEXT    -- shown after answer
  difficulty  INT DEFAULT 2  -- 1-5

-- questionData shapes per type:
-- multiple_choice: { options: string[], correctIndex: number }
-- fill_blank:      { blanks: { id: string, answer: string }[] }
-- tracing:         { steps: TreeStep[], correctStepIndex: number }
-- debugging:       { code: string, bugs: { line: number, fix: string }[] }
```

**Rationale for JSONB on questionData:** The alternative is 4 joined tables (one per question type). For a seeded, read-only content table with a fixed schema, JSONB is pragmatic. The type discriminator column keeps the Prisma model usable and lets application code narrow the type safely. Avoid JSONB for mutable user data — it's fine here because content never changes post-seed.

### User and SR State Schema

```sql
User
  id          UUID PK
  email       TEXT UNIQUE
  name        TEXT
  image       TEXT
  createdAt   TIMESTAMPTZ DEFAULT NOW()
  updatedAt   TIMESTAMPTZ DEFAULT NOW()

-- One row per (user, topic) — SR state for the topic as a whole
-- Used to surface "which topic to review next"
UserTopicCard
  id          UUID PK
  userId      UUID FK → User
  topicId     UUID FK → Topic
  interval    INT DEFAULT 1      -- days until next review
  easeFactor  FLOAT DEFAULT 2.5  -- SM-2 E-Factor
  repetitions INT DEFAULT 0
  nextReview  DATE DEFAULT NOW()
  lapses      INT DEFAULT 0
  createdAt   TIMESTAMPTZ DEFAULT NOW()
  updatedAt   TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(userId, topicId)

-- One row per (user, question) — per-question SR state
-- Used to surface "which questions to drill"
UserQuestionCard
  id          UUID PK
  userId      UUID FK → User
  questionId  UUID FK → Question
  interval    INT DEFAULT 1
  easeFactor  FLOAT DEFAULT 2.5
  repetitions INT DEFAULT 0
  nextReview  DATE DEFAULT NOW()
  lapses      INT DEFAULT 0
  createdAt   TIMESTAMPTZ DEFAULT NOW()
  updatedAt   TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(userId, questionId)

-- Immutable log of every review event — used for dashboard analytics
ReviewHistory
  id          UUID PK
  userId      UUID FK → User
  questionId  UUID FK → Question
  quality     INT          -- SM-2 quality 0-5
  correct     BOOLEAN
  answeredAt  TIMESTAMPTZ DEFAULT NOW()
```

**Why two SR tables (topic + question):** Topic-level cards drive the "study next" recommendation. Question-level cards drive the individual drill queue. They evolve independently — a user can master a topic's flashcard review but still have weak individual questions.

### Auth Schema (NextAuth Prisma Adapter Standard)

NextAuth v5 with Prisma adapter generates its own tables (`Account`, `Session`, `VerificationToken`). Use the standard adapter schema — do not customize it. The `User` table above should extend the adapter's User model via the Prisma schema `@@map` pattern or by including the adapter's User fields directly.

---

## Data Flow

### Quiz Answer Submission Flow

```
User selects answer in QuizQuestion component
    ↓
Local state update (immediate UI feedback disabled until graded)
    ↓
submitAnswer(userId, questionId, userAnswer)  ← Server Action
    ↓
gradeAnswer(question, userAnswer)  ← lib/quiz/grader.ts
    ↓
SM-2 quality rating derived (correct → 4, incorrect → 1)
    ↓
updateSRCard(userId, questionId, quality)  ← lib/sr/sm2.ts + Prisma
    [updates UserQuestionCard.interval, easeFactor, repetitions, nextReview]
    [inserts ReviewHistory row]
    ↓
Return { correct: boolean, feedback: string } to client
    ↓
Client renders feedback, enables "next question" button
```

### Content Loading Flow

```
User navigates to /topics/[topicSlug]
    ↓
Page Server Component executes (RSC)
    ↓
db.topic.findUnique({ where: { slug }, include: { lessons: true } })
    ↓
Lesson MDX rendered server-side, HTML streamed to client
    ↓
Visualization sub-route loaded:
  db.question.findMany({ where: { topicId, type: 'tracing' } })
    ↓
Plain TreeState objects passed as props to Client Component
    ↓
d3-hierarchy computes node positions, SVG renders on client
```

### SR Queue / Dashboard Flow

```
User loads /dashboard
    ↓
RSC queries UserTopicCard WHERE nextReview <= NOW() ORDER BY nextReview
    ↓
Renders "due today" topic list + per-topic progress
    ↓
User clicks "Start Review" for a topic
    ↓
Quiz session page loads — questions filtered by:
  UserQuestionCard.nextReview <= NOW() AND userId = current
    ↓
Questions ordered by nextReview ASC (oldest overdue first)
    ↓
Each answer flows through the submission flow above
```

### Visualization Step-Through Flow

```
Server Component loads initial algorithm state from seed data
    ↓
Passes steps[] array to Visualization Client Component as prop
    ↓
Client Component holds currentStepIndex in useState
    ↓
User clicks "Next Step" → currentStepIndex++
    ↓
Current step's TreeState re-computed from steps[currentStepIndex]
    ↓
SVG nodes re-render, CSS transitions animate node moves/color changes
    ↓
Tracing mode: user predicts next step → compare against steps[i+1]
    ↓
Feedback rendered inline, SR card updated via Server Action if tracing mode
```

---

## Component Boundaries

| Boundary | Server (RSC) | Client ('use client') | Communication |
|----------|-------------|----------------------|---------------|
| Lesson page | Lesson text, code blocks, MDX | — | No boundary needed |
| Visualization page | Data fetch, page shell | Entire visualization component tree | Props with serializable TreeState |
| Quiz page | Initial question load | QuizSession, QuizQuestion, answer state | Server Action on submit |
| Dashboard | Progress data, SR queue | Score charts (if animated) | Props + Server Actions |
| Flashcard deck | — | Entire flashcard UI | Server Action to record review |

---

## Build Order (Dependency Graph)

Build in this order — each layer depends on the one before it:

```
1. DB schema + Prisma setup + seed script
   (Everything depends on this — no skipping)

2. Auth layer (NextAuth v5 + Google OAuth + User creation hook)
   (Quiz and SR require userId)

3. Content seed + topic/lesson display
   (Static content — no user state needed; validates seed is correct)

4. Quiz engine — question rendering + grading (no SR yet)
   (Validates question schema and grader logic before adding SR)

5. SR engine — SM-2 + UserQuestionCard updates
   (Plugs into quiz submission as an after-grade step)

6. Visualizations — one algorithm at a time
   (Independent of SR; can be built in parallel with steps 4-5)
   Order: N-ary (simplest tree) → Huffman → RB-tree → B-tree

7. Dashboard + progress views
   (Aggregates data from all prior layers)

8. Flashcard drill mode
   (Reuses SR engine from step 5; simpler than quiz)
```

**Critical dependency:** Steps 1-2 must be complete before anything user-state-related can be validated end-to-end. The content seed (step 3) should be runnable without auth to allow offline content validation.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon Postgres | Prisma ORM via `DATABASE_URL` (direct) + `DATABASE_URL_POOLER` (pooled) | Use pooled URL in all app code; direct URL only for migrations (`prisma migrate`) |
| Google OAuth | NextAuth.js v5 Google Provider | Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` env vars |
| Vercel | Deploy via GitHub integration | Set all env vars in Vercel dashboard; use Neon Vercel integration for automatic pooled URL injection |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Quiz Engine → SR Engine | Server Action calls `sm2.ts` pure function, then Prisma write | Never call SR from client — quality rating must be computed server-side |
| Visualization → Content | Server Component passes `TreeState[]` prop to client visualizer | Steps are pre-computed in seed, not computed at runtime |
| Dashboard → SR State | Server Component reads `UserTopicCard` + `UserQuestionCard` | Direct Prisma query; no intermediate service needed at this scale |
| Auth → User creation | NextAuth `events.createUser` callback inserts seed SR cards | Bootstrap `UserTopicCard` rows for all 4 topics on first sign-in |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 users (exam cohort) | Current design is correct. Neon free tier handles it. No caching layer needed. |
| 500-10k users | Add `unstable_cache` or React's `cache()` for content queries (lessons don't change). Add DB indexes on `UserQuestionCard(userId, nextReview)`. |
| 10k+ users | Move content to a CDN-served static JSON bundle (it never changes). Add Redis for session state if DB sessions adopted. Split SR engine into a background job queue. |

### Scaling Priorities

1. **First bottleneck:** `ReviewHistory` table grows unboundedly. Add a retention policy or archive old rows after 90 days.
2. **Second bottleneck:** Cold-start + Neon compute auto-suspend. Use the Neon pooler URL everywhere; consider Neon's "always-on" compute for production if latency is unacceptable.

---

## Anti-Patterns

### Anti-Pattern 1: Putting SM-2 Logic in the Client

**What people do:** Run the SM-2 quality calculation and interval update in a client-side effect, then sync to the server.

**Why it's wrong:** Client can be manipulated. SM-2 state is authoritative — if it lives client-side even temporarily, cheating and sync conflicts become real problems. The `nextReview` date must come from a server-side source of truth.

**Do this instead:** Server Action grading → server-side SM-2 calc → Prisma write → return only UI feedback to client.

### Anti-Pattern 2: D3 DOM Mutations Inside React Components

**What people do:** Call `d3.select(ref.current).append(...)` inside `useEffect` to let D3 own the DOM.

**Why it's wrong:** React and D3 fight over the DOM. Reconciliation breaks. Tree nodes don't reliably update. React DevTools becomes useless for debugging the visualization.

**Do this instead:** Use `d3-hierarchy` only for layout math (`d3.tree()(root)` to get x/y). Map the resulting nodes to JSX `<circle>` and `<line>` elements. React owns the DOM entirely.

### Anti-Pattern 3: JSONB for User State

**What people do:** Store SR card state (`interval`, `easeFactor`, `nextReview`) as a JSON blob on the User row.

**Why it's wrong:** You can't query "which cards are due today" with a `WHERE` clause. You'd have to load all users' blobs and filter in application code.

**Do this instead:** Normalized `UserQuestionCard` table with indexed `nextReview` column. `SELECT * FROM user_question_cards WHERE user_id = $1 AND next_review <= NOW()` is instant with a B-tree index.

### Anti-Pattern 4: One Route Per Algorithm

**What people do:** Create `/huffman`, `/redblack`, `/btree`, `/nary` as flat top-level routes.

**Why it's wrong:** No shared topic layout, repeated data fetching, hard to add cross-topic features (e.g., "study all overdue topics").

**Do this instead:** `app/topics/[topicSlug]/` with a shared topic layout that handles breadcrumbs, topic nav, and progress display once.

---

## Sources

- [Next.js App Router Documentation](https://nextjs.org/docs/app) — Server/Client component boundaries, Server Actions (HIGH confidence)
- [Next.js App Router Patterns 2026](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146) — Current patterns (MEDIUM confidence)
- [Neon Connection Pooling Docs](https://neon.com/docs/connect/connection-pooling) — PgBouncer transaction mode, pooler URL usage (HIGH confidence)
- [Neon + Vercel Connection Methods](https://neon.com/docs/guides/vercel-connection-methods) — Integration setup (HIGH confidence)
- [SM-2 Algorithm Explanation](https://tegaru.app/en/blog/sm2-algorithm-explained) — Algorithm mechanics, quality inputs/outputs (MEDIUM confidence)
- [Anki SM-2 Algorithm Reference](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) — Canonical SM-2 variant (MEDIUM confidence)
- [D3 Hierarchy Tree Layout](https://d3js.org/d3-hierarchy/tree) — `d3.tree()` layout API (HIGH confidence)
- [Efficient Data Visualisation with React and SVG](https://gitnation.com/contents/efficient-data-visualisation-with-react-and-svg) — React-owns-DOM pattern for SVG (MEDIUM confidence)
- [Prisma Table Inheritance Docs](https://www.prisma.io/docs/orm/prisma-schema/data-model/table-inheritance) — Discriminated union / MTI patterns (HIGH confidence)
- [NextAuth.js v5 Google OAuth](https://strapi.io/blog/nextauth-js-secure-authentication-next-js-guide) — App Router integration (MEDIUM confidence)

---
*Architecture research for: CS201 Exam 2 Study App — interactive educational web app*
*Researched: 2026-03-24*
