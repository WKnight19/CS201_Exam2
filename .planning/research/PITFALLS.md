# Pitfalls Research

**Domain:** Interactive CS study / educational web app (tree data structures + algorithms)
**Researched:** 2026-03-24
**Confidence:** HIGH (specific pitfalls verified against official docs and community post-mortems)

---

## Critical Pitfalls

### Pitfall 1: Algorithm Visualization State as Derived Data, Not Snapshots

**What goes wrong:**
You store algorithm state as a single mutable object and mutate it as the user steps forward/backward. Stepping backward becomes impossible without re-running the whole algorithm from the beginning. Steps feel inconsistent — the same tree step shown twice may render differently because intermediate state leaked.

**Why it happens:**
It seems natural to "run the algorithm" and animate from current state. Developers don't build a snapshot array upfront because it feels like premature planning. The bug surfaces at step 3-4 when rotation state doesn't match what was shown in step 2.

**How to avoid:**
Pre-compute the full step sequence as an immutable array of tree snapshots before rendering any animation. Each element in the array is a complete, self-contained description of the tree at that step (node positions, colors, edge set, annotation text). The visualizer is then a pure function of `steps[currentIndex]`. Forward = `index++`, backward = `index--`. No re-derivation, no mutation.

```typescript
type VisualizationStep = {
  nodes: TreeNode[];       // complete snapshot, not delta
  edges: Edge[];
  highlightedNodes: string[];
  annotation: string;      // "Uncle is red → recolor and move up"
  pseudocodeLine: number;  // which line is active
};

type VisualizationState = {
  steps: VisualizationStep[];
  currentIndex: number;
};
```

**Warning signs:**
- "Step backward" button is missing or disabled in early design
- Tree component receives a mutable tree object rather than a plain data snapshot
- Animations driven by `useEffect` watching tree mutations

**Phase to address:**
Visualization phase (Phase 2 or 3). Architecture decision must be made before writing a single animation — retrofitting snapshot-based stepping onto a mutation-based system requires a full rewrite.

---

### Pitfall 2: Red-Black Tree "Double Rotation" Cases Break Naive Implementations

**What goes wrong:**
RB tree insertion has four rotation cases. The "inner grandchild" case (zigzag: left-right or right-left) requires TWO rotations — a rotation at the parent first, then at the grandparent. Naive implementations only handle the straight-line (outer grandchild) case and produce incorrect trees silently, or throw index errors on the second rotation.

Deletion is worse: the "double black" fixup has six sub-cases with three rotation types. Missing even one sub-case produces a tree that looks valid visually but violates RB invariants.

**Why it happens:**
Most tutorials illustrate the "easy" left-left/right-right case clearly and gloss over left-right/right-left. Developers implement based on the tutorial, test with sequential insertions (which only hit outer cases), and ship.

**How to avoid:**
- Implement a `validateRBInvariants(root)` function that verifies all five RB properties after every operation in dev mode. Run it after every insert/delete in tests.
- Test with these specific sequences:
  - Insert: 10, 5, 15, 3, 7 (triggers left-right zigzag at node 5→7)
  - Insert: 10, 20, 15 (right-left zigzag — classic missed case)
  - Delete: any black leaf's sibling after it has been colored black (triggers double-black)
- Use a reference implementation (CLRS textbook pseudocode or a known-correct open source implementation) to cross-check output for all test cases before writing visualization code.

**Warning signs:**
- Test suite only inserts sequential or sorted values
- No `validateRBInvariants` function exists
- Visualization looks "mostly right" for common cases but no edge case testing has occurred

**Phase to address:**
Visualization phase. The core RB tree data logic must be validated against a reference before any animation is built on top of it.

---

### Pitfall 3: B-Tree Split/Merge Cascade Not Modeled Correctly

**What goes wrong:**
B-tree insert splits a full node correctly, but the split propagation up the tree is wrong — the median key is either placed in the wrong parent slot, or the child pointer split leaves orphaned children. Result: the tree looks correct for order-3 B-trees with few insertions, then breaks on deeper trees or higher order.

Merge/borrow on delete has even more cases: borrow from left sibling, borrow from right sibling, merge with left, merge with right — each with different separator key movement. Missing one case corrupts the tree silently.

**Why it happens:**
B-tree split/merge logic is inherently index-math heavy. Off-by-one errors in child array slicing are common and don't surface until specific insert sequences. Developers test with order 2 (2-3 trees) only.

**How to avoid:**
- Implement a `validateBTreeInvariants(root, order)` function — checks min/max key counts per node, all leaves at same depth, keys sorted within nodes, key ranges match parent separators.
- Test with order-3 and order-4 trees (the exam uses order-2 and order-3).
- Specific stress test: insert 1 through 20 in order into an order-3 B-tree, verify against a known reference tool (USFCA visualization at cs.usfca.edu/~galles/visualization/BTree.html).
- Known JavaScript B-tree bug to watch for: array slicing during node split can push the key count one over the limit on the final loop iteration, producing `null` children.

**Warning signs:**
- B-tree only tested with 5-6 insertions
- `children` array length not validated after every split
- No delete/merge test cases

**Phase to address:**
Visualization phase. Validate data logic before building visualization.

---

### Pitfall 4: Neon Postgres Pool Created Outside Request Handler

**What goes wrong:**
You create a `Pool` or `Client` at module level (outside a request handler) to reuse connections. On Vercel serverless, function instances are short-lived — the pool is created, used once, and the instance is frozen between requests. On warm reuse, the pool's connections are stale or closed, causing `connection terminated` errors at unpredictable intervals. Happens more under load or after idle periods.

**Why it happens:**
This is the correct pattern in long-running Node.js servers. The Vercel serverless execution model is different and the distinction isn't obvious from standard Postgres documentation.

**How to avoid:**
Create the Neon connection inside the request handler, not at module level. Use `@neondatabase/serverless` with the HTTP-based `neon()` function for individual queries, or use PgBouncer's pooled connection string (hostname contains `-pooler`) when using `pg` for transaction-heavy operations.

```typescript
// WRONG — module-level pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// CORRECT — use Neon's serverless driver
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
// sql is a tagged template — creates an HTTP connection per call, no pool needed
```

Also: always use the `-pooler` connection string endpoint in `DATABASE_URL` for Vercel deployments to route through PgBouncer.

**Warning signs:**
- `const pool = new Pool(...)` appears at the top of a `db.ts` module that is imported by route handlers
- Occasional `connection terminated unexpectedly` errors in Vercel logs
- Works fine locally but fails intermittently in production

**Phase to address:**
Infrastructure/auth phase (Phase 1). Must be established in the database connection layer before any feature work.

---

### Pitfall 5: Auth.js (NextAuth v5) Session Not Validating in Server Actions and API Routes

**What goes wrong:**
You check authentication in middleware (via `matcher` config) and assume protected routes are safe. But Next.js layout segments don't re-render on every navigation within their subtree — a session check in a layout is only run on initial load. More critically, Server Actions called by Client Components bypass the middleware entirely. Users can call Server Actions unauthenticated.

**Why it happens:**
The mental model from Pages Router was "middleware guards routes." In App Router, middleware guards URL access but not direct Server Action invocations. This distinction isn't obvious and Auth.js documentation doesn't emphasize it at the top.

**How to avoid:**
- Check `auth()` (or `getServerSession()`) at the top of every Server Action and in every Route Handler, not just middleware.
- Treat middleware as a UX redirect layer (send unauthenticated users to login page), not as a security layer.
- Pattern: create a `requireAuth()` helper that calls `auth()`, throws if no session, and returns the session for use in the action body.

```typescript
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session;
}

// In every Server Action:
export async function saveQuizResult(data: QuizResultInput) {
  const session = await requireAuth();
  // ... use session.user.id to scope the write
}
```

**Warning signs:**
- Server Actions that write to DB don't call `auth()` at the top
- Auth check is only in `middleware.ts` and root layout
- No `requireAuth` utility function exists

**Phase to address:**
Auth phase (Phase 1). Establish the pattern before building any Server Actions.

---

### Pitfall 6: Auth.js Pool Must Be Created Inside the Handler (Neon-Specific)

**What goes wrong:**
When using the Auth.js database adapter with Neon, creating the `Pool` outside the request handler (at module level in `auth.ts`) causes connection exhaustion or stale connection errors on serverless Vercel deployments.

**Why it happens:**
Auth.js documentation shows a generic `Pool` instantiation pattern. The Neon-specific requirement to create it inside the handler is only documented in the Neon guide, not the Auth.js guide. Developers follow the Auth.js example verbatim.

**How to avoid:**
Per Neon's official guidance: create the `Pool` inside the Auth.js config callback, not at module level.

```typescript
// auth.ts — CORRECT for Neon serverless
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { NeonAdapter } from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL }); // inside callback
  return {
    adapter: NeonAdapter(pool),
    providers: [Google],
  };
});
```

**Warning signs:**
- `const pool = new Pool(...)` is at the top of `auth.ts`, outside the `NextAuth()` call
- Auth works in development but produces intermittent session failures in Vercel deployment

**Phase to address:**
Auth phase (Phase 1).

---

### Pitfall 7: Spaced Repetition "Ease Hell" Trap

**What goes wrong:**
You implement SM-2 verbatim. A student who struggles with RB tree deletion gets the card wrong 3-4 times. Each failure reduces the ease factor. After enough failures, the card's interval never grows meaningfully — it surfaces every session at maximum frequency but the student has no mechanism to escape. This makes the app feel punishing rather than helpful, and students stop using it.

**Why it happens:**
SM-2's ease factor has a lower bound (typically 1.3) but no mechanism to recover ease after a student begins answering correctly. The algorithm was designed for individual learners with weeks of data — not for a few days before an exam.

**How to avoid:**
- Clamp ease factor minimum at 1.3 (SM-2 default) but add ease recovery: when a card is answered correctly 2 times in a row, increment ease by `+0.1` (Anki does this).
- For this app's specific context (exam in days), cap maximum intervals at 3-4 days — long intervals are useless when the exam is in a week.
- Implement a "new card" learning phase distinct from the review phase: new cards must be seen 2-3 times with short gaps (10 min, 1 day) before entering the spaced repetition queue.
- Handle the cold-start problem explicitly: new users have no history, so show all topics once before applying SM-2 scheduling. Don't start scheduling from zero data.

**Warning signs:**
- Cards with ease below 1.5 are not getting any bonus for consecutive correct answers
- Maximum interval has no upper cap
- New cards enter the SRS queue after a single viewing

**Phase to address:**
Quiz/SRS phase. Design the scheduling logic before implementing the quiz engine — the data model (ease, interval, repetitions, nextReview) must be set correctly from the start.

---

### Pitfall 8: Content Completeness Traded Away for Feature Polish

**What goes wrong:**
You spend Phase 1 perfecting the auth flow and DB schema, Phase 2 building a beautiful RB tree visualization, and reach the exam date with Huffman codes and B-trees having stub content. The student needed to study all four topics.

**Why it happens:**
Developers naturally gravitate toward technically interesting problems (making a rotation animation look smooth) over content work (writing 20 accurate quiz questions for B-tree deletion). Animation work also has visible, satisfying progress; content work is invisible until it's done.

**How to avoid:**
- Make a "content coverage checklist" at the start: 4 topics × N question types × M difficulty levels. Track completion rate, not just feature completion.
- If a choice must be made between "polished animation for one topic" vs. "basic content for all four topics," choose breadth first.
- Build the quiz question data model and seed at least 5 questions per topic before investing in any animation polish.
- Ship the app with static/hardcoded content first — dynamic AI generation is a nice-to-have, not a prerequisite for exam value.

**Warning signs:**
- Progress tracking shows 2 of 4 topics have content; the other 2 are placeholder
- Animation work is taking more than 2× the estimated time
- No content coverage checklist exists

**Phase to address:**
All phases. Content checklist is a planning artifact created before Phase 1 begins. Review it at each phase gate.

---

### Pitfall 9: Tracing/Debugging Questions Modeled as Multiple Choice

**What goes wrong:**
You implement the quiz engine for MC questions (single correct answer from list), then try to bolt on tracing questions. A tracing question ("What is the tree state after inserting 15?") doesn't fit — the "answer" is a tree state, not a string. You end up either: (a) converting tracing questions to MC by showing screenshots of 4 tree states (implementation nightmare), or (b) making them free-text (no grading possible).

**Why it happens:**
MC is the simplest question type. Building it first is natural. The quiz engine's data model ends up MC-shaped and everything else is forced into it.

**How to avoid:**
Design the question schema as a discriminated union from day one:

```typescript
type Question =
  | { type: 'multiple_choice'; stem: string; choices: string[]; correctIndex: number }
  | { type: 'fill_blank'; stem: string; blank: string; correctAnswer: string; caseSensitive: boolean }
  | { type: 'trace_step'; description: string; algorithmId: string; insertionSequence: number[]; expectedStepIndex: number }
  | { type: 'short_answer'; stem: string; rubric: string; }; // human-graded, score deferred
```

For tracing questions, "checking the answer" means checking whether the student's predicted next tree state matches the pre-computed step snapshot at `expectedStepIndex`. Re-use the same visualization step snapshots from pitfall #1 — they're already the source of truth.

**Warning signs:**
- Quiz schema has a single `answer: string` field (too narrow)
- Tracing questions are described in planning docs as "like MC but with images"
- No discriminated union / question type enum in the schema

**Phase to address:**
Quiz schema design, early in Phase 1 (DB schema). The question type schema must be established before seeding any content.

---

### Pitfall 10: Forgetting `revalidatePath` After Mutations

**What goes wrong:**
A student completes a quiz. The Server Action writes the result to the DB. The dashboard page still shows stale progress data — the quiz score doesn't update. Refreshing the page fixes it, but the student doesn't know to do that. Looks like a bug to the user.

**Why it happens:**
Next.js App Router aggressively caches Server Component data. A mutation via Server Action does not automatically invalidate cached pages — you must explicitly tell Next.js which paths to revalidate.

**How to avoid:**
Every Server Action that mutates data must call `revalidatePath()` or `revalidateTag()` after the mutation succeeds.

```typescript
export async function submitQuizResult(data: QuizSubmission) {
  const session = await requireAuth();
  await db.insert(quizResults).values({ userId: session.user.id, ...data });
  revalidatePath('/dashboard');  // required — clears cached dashboard data
}
```

**Warning signs:**
- Server Actions exist with no `revalidatePath` calls
- Dashboard progress feels "sticky" — doesn't update right after quiz completion
- The pattern was working in early dev with `cache: 'no-store'` but breaks after removing that

**Phase to address:**
Quiz/persistence phase. Every mutation Server Action template should include a `revalidatePath` call.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode quiz questions as JSON in seed file | Fast content delivery, no DB schema complexity for question variants | Can't add/edit content without redeployment; questions can't reference shared state | Acceptable for exam-scoped MVP with fixed content |
| Skip `validateRBInvariants` / `validateBTreeInvariants` in tests | Faster implementation | Subtle tree corruption bugs surface mid-visualization, confusing students | Never — write the validators before visualization |
| Use `strategy: 'jwt'` for Auth.js instead of DB sessions | Simpler setup, no sessions table needed | Can't invalidate sessions server-side; user progress queries always need userId from JWT which could be stale | Acceptable for this app — sessions are low-stakes |
| Store visualization steps as pre-computed JSON in static assets | Zero DB reads for animations | Large bundle size if tree animations are complex; harder to generate dynamically | Acceptable for fixed algorithm set (4 topics) |
| Skip SM-2 cold-start handling | Simpler initial implementation | New users see random questions in random order with no prioritization | Only acceptable if launching after 1 session of data; fix before recommending the app |
| Free-text short-answer questions scored manually | Covers exam format without grading complexity | Scores sit ungraded; SRS can't incorporate them | Acceptable for stretch content — flag as "instructor-graded" |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Neon + Vercel serverless | Module-level `new Pool()` causes stale connections | Create pool inside request handler; use `neon()` HTTP driver for single queries |
| Neon + Auth.js adapter | `Pool` at module level in `auth.ts` | Pass `new Pool()` inside the `NextAuth(() => { ... })` callback factory |
| Auth.js + App Router | Session checked only in middleware | Call `auth()` in every Server Action and Route Handler that accesses user data |
| Next.js Server Actions + DB mutations | No `revalidatePath` after writes | Always call `revalidatePath('/affected-path')` at end of mutation actions |
| Next.js `redirect()` | Called inside `try/catch` — throws are swallowed | Place `redirect()` outside try/catch; it throws a special `NEXT_REDIRECT` error |
| Google OAuth + Auth.js | `NEXTAUTH_SECRET` missing in production env vars | Set `AUTH_SECRET` (v5) or `NEXTAUTH_SECRET` (v4) in Vercel environment variables before deploy |
| Neon connection string | Using direct (non-pooler) connection string on Vercel | Use `-pooler` hostname variant in `DATABASE_URL` for all Vercel deployments |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-computing tree snapshots on every render | Visualization stutters or freezes on large RB trees | Compute step array once on user action, memoize with `useMemo` or store in `useReducer` | Any tree with >15 nodes + >10 steps |
| Fetching all quiz questions for a user on every dashboard load | Dashboard slow; DB query returns hundreds of rows | Paginate or aggregate on DB side; use a `quizSummary` materialized view or server-side aggregation query | >50 quiz attempts per user |
| Neon cold start on first request | First page load after inactivity is 1-3 seconds | Expected behavior for Neon's scale-to-zero; use PgBouncer pooler connection string to mitigate; inform users with a loading state | Any cold start — design for it |
| Importing heavy tree animation library in every route | Large JS bundle increases Time to Interactive | Use dynamic import with `next/dynamic` for visualization components | First load on slow connections |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Server Actions not checking `auth()` | Any unauthenticated caller can write to DB (save quiz scores, corrupt progress data) | `requireAuth()` utility called at top of every mutation Server Action |
| User ID taken from client-submitted form data | User can forge another user's ID, overwriting their progress | Always derive userId from `session.user.id` (server-authoritative), never from client input |
| Neon connection string in `.env.local` committed to git | Database credentials exposed | `.env.local` in `.gitignore`; use Vercel environment variable dashboard for production secrets |
| Google OAuth `GOOGLE_CLIENT_SECRET` in source | OAuth client hijacking | Environment variable only, never hardcoded |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Visualizer auto-plays too fast | Student can't follow the algorithm steps | Default to paused; require user to click "Next Step"; auto-play is opt-in with configurable speed |
| No annotation on visualization steps | Student sees tree change but doesn't know why | Each step must have a text annotation explaining the rule being applied ("Uncle is black, node is inner child → double rotate") |
| Pseudocode and visualization not synchronized | Student has to mentally correlate which code line maps to which tree change | Highlight current pseudocode line alongside the tree step |
| Spaced repetition with no "I already know this" escape | Students who know material well still grind easy cards | Provide a "Mark as known" / "Easy" button that fast-tracks intervals |
| Quiz score shown without explanation | Student knows they got it wrong but doesn't learn from it | Always show correct answer + brief explanation on wrong answers, before moving to next question |
| No progress indicator across topics | Student doesn't know which of the 4 topics needs more practice | Dashboard must show per-topic coverage with explicit "weak area" signals |

---

## "Looks Done But Isn't" Checklist

- [ ] **RB Tree insert:** Handles all four rotation cases — left-left, right-right, left-right, right-left. Validated with `validateRBInvariants` after each insert.
- [ ] **RB Tree delete:** Handles "double black" fixup with all six sub-cases. Tested against sequential deletion of all inserted values.
- [ ] **B-Tree insert:** Propagates splits correctly to root (root split creates new root node). Validated after inserting 15+ values.
- [ ] **B-Tree delete:** Handles borrow-from-left, borrow-from-right, merge-left, merge-right cases. Tested after buildling tree then deleting root separator keys.
- [ ] **Visualization backward stepping:** Step backward returns to the exact same tree state shown before, not a re-derived approximation.
- [ ] **Spaced repetition cold start:** New users see all topics at least once before SRS scheduling begins.
- [ ] **Auth on Server Actions:** Every Server Action that writes user data calls `requireAuth()` before the DB write.
- [ ] **Mutations revalidate paths:** Every Server Action that mutates data calls `revalidatePath()` for affected pages.
- [ ] **Content coverage:** All 4 topics have question content across all question types (MC, fill-blank, trace, short-answer).
- [ ] **Google OAuth production env:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` are all set in Vercel environment variables.
- [ ] **Neon connection string:** Uses `-pooler` endpoint in production `DATABASE_URL`.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Visualization built on mutable state (pitfall #1) | HIGH | Full rewrite of visualization component and algorithm engine — no partial fix. Pre-compute snapshots from scratch. |
| RB/B-tree logic incorrect (pitfalls #2, #3) | MEDIUM | Fix the algorithm, re-generate all pre-computed step sequences, revalidate with invariant checker. UI unchanged. |
| Neon module-level pool (pitfall #4) | LOW | Refactor `db.ts` — move pool creation inside request scope. 30-minute fix. |
| Server Actions missing auth check (pitfall #5) | LOW | Add `requireAuth()` call to each action. Mechanical, not architectural. |
| Missing `revalidatePath` (pitfall #10) | LOW | Add to each mutation action. 5 minutes per action. |
| SM-2 ease hell accumulated bad data (pitfall #7) | MEDIUM | Reset ease factors for all cards to default (2.5) or write a migration that clamps ease. Data fixable without code rewrite. |
| Content coverage gap discovered near exam (pitfall #8) | HIGH | No technical recovery — must write content fast. The cost is time, not code. Prevention is the only mitigation. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Visualization state as snapshots (#1) | Phase 2: Visualization architecture | Step backward works correctly on all 4 algorithms |
| RB tree rotation edge cases (#2) | Phase 2: Algorithm engine | `validateRBInvariants` passes for 20+ node trees including zigzag insertions |
| B-tree split/merge cascade (#3) | Phase 2: Algorithm engine | `validateBTreeInvariants` passes for order-3 and order-4 trees with 20+ insertions + deletions |
| Neon module-level pool (#4) | Phase 1: Infrastructure | No `connection terminated` errors after 10+ minutes of inactivity on Vercel |
| Auth.js Server Action bypass (#5) | Phase 1: Auth | Unauthenticated POST to Server Action returns 401 / error, not success |
| Auth.js + Neon pool scope (#6) | Phase 1: Auth | No session failures on Vercel after repeated requests |
| SM-2 ease hell (#7) | Phase 3: SRS engine | Cards answered wrong 5× in a row still recover interval after 3 consecutive correct answers |
| Content coverage (#8) | All phases (tracked) | Content coverage checklist reaches 100% before final phase |
| Tracing question schema (#9) | Phase 1: DB schema | Question schema uses discriminated union; trace questions reference step indices from visualization |
| Missing revalidatePath (#10) | Phase 3: Quiz persistence | Dashboard updates immediately after quiz submission without manual refresh |

---

## Sources

- [Vercel: Common Mistakes with the Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — HIGH confidence
- [Neon Docs: Authenticate with Auth.js](https://neon.com/docs/guides/auth-authjs) — HIGH confidence (Pool-inside-callback pattern)
- [Neon Docs: Connecting from Vercel](https://neon.com/docs/guides/vercel-connection-methods) — HIGH confidence (pooler endpoint requirement)
- [Auth.js: Migrating to v5](https://authjs.dev/getting-started/migrating-to-v5) — HIGH confidence
- [Clerk: NextAuth Session Persistence Issues 2025](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues) — MEDIUM confidence (third-party analysis, cross-checked with Auth.js docs)
- [SM-2 Better Algorithm Analysis (blueraja)](https://www.blueraja.com/blog/477/a-better-spaced-repetition-learning-algorithm-sm2) — MEDIUM confidence (community analysis, consistent with Anki behavior)
- [Anki SM-2 Algorithm — RemNote](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) — HIGH confidence
- [USFCA RB Tree Visualization reference](https://www.cs.usfca.edu/~galles/visualization/RedBlack.html) — HIGH confidence (canonical reference for correctness checking)
- [USFCA B-Tree Visualization reference](https://www.cs.usfca.edu/~galles/visualization/BTree.html) — HIGH confidence (canonical reference for correctness checking)
- [OpenDSA B-Trees](https://opendsa-server.cs.vt.edu/ODSA/Books/Everything/html/BTree.html) — HIGH confidence
- [CVE-2025-29927 middleware bypass](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router) — HIGH confidence (documented vulnerability, validates why middleware-only auth is insufficient)
- B-tree JavaScript split bug (off-by-one in array slicing) — MEDIUM confidence (reported in community implementations, cross-checked with algorithm spec)

---
*Pitfalls research for: CS interactive study app — tree algorithms + spaced repetition*
*Researched: 2026-03-24*
