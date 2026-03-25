---
phase: 01-foundation
plan: "03"
subsystem: content-pipeline
status: COMPLETE
tags: [content, pdf-extraction, seed-pipeline, huffman, n-ary-trees, red-black-trees, b-trees]
dependency_graph:
  requires: ["01-01"]
  provides: ["structured-lesson-content", "db-seed", "4-topics", "11-lessons"]
  affects: ["lesson-pages", "topic-queries", "flashcard-seed", "question-seed"]
tech_stack:
  added: ["node --experimental-strip-types (TypeScript without tsx)", "type:module in package.json"]
  patterns:
    - "pdf-parse@2.x PDFParse named class API"
    - "scripts/output/raw → structured JSON pipeline"
    - "Clear-then-reinsert seed pattern for idempotent static content"
    - ".returning() to get inserted topic IDs for FK lesson inserts"
key_files:
  created:
    - scripts/parse-pdfs.ts
    - scripts/output/raw/huffman-codes.txt
    - scripts/output/raw/non-binary-trees.txt
    - scripts/output/raw/red-black-trees.txt
    - scripts/output/raw/red-black-trees-continued.txt
    - scripts/output/raw/b-trees-search-insert.txt
    - scripts/output/raw/b-trees-deletion.txt
    - scripts/output/raw/exam2-outline.txt
    - scripts/output/raw/exam2-review.txt
    - scripts/output/raw/binary-search-trees.txt
    - scripts/output/raw/building-trees.txt
    - scripts/output/raw/trees-and-stacks.txt
    - scripts/output/structured/huffman.json
    - scripts/output/structured/n-ary-trees.json
    - scripts/output/structured/red-black-trees.json
    - scripts/output/structured/b-trees.json
    - scripts/seed.ts
  modified:
    - package.json
decisions:
  - "pdf-parse@2.x uses PDFParse named class; import via namespace alias, constructor takes { data: Uint8Array }"
  - "Clear-then-reinsert chosen over onConflictDoNothing for seed script — static content, simpler code, no unique constraint needed on lessons table"
  - "type:module added to package.json to eliminate ES module parse warning (node --experimental-strip-types runs scripts)"
  - "User approved filling missing pseudocode/C++ from standard CS knowledge — PDF slides were image-heavy for algorithm details"
metrics:
  started: "2026-03-25T03:58:14Z"
  duration: "~25 minutes total (6 partial + ~19 continuation)"
  completed_date: "2026-03-25"
  tasks_completed: 3
  tasks_total: 3
  files_created: 17
  files_modified: 1
---

# Phase 01 Plan 03: PDF Content Pipeline Summary

**One-liner:** CS201 PDFs extracted to text, structured into 4 topic JSON files (11 lessons total covering Huffman, N-ary Trees, RB Trees, B-Trees), and seeded into Neon Postgres via idempotent clear-then-reinsert script.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create PDF extraction script and extract text from all 11 PDFs | 7b0e5fd | scripts/parse-pdfs.ts, scripts/output/raw/*.txt (11 files) |
| 2 | Review extracted PDF text and create structured lesson JSON | 85a58b8 | scripts/output/structured/*.json (4 files) |
| 3 | Create idempotent seed script and seed the database | 9be769e | scripts/seed.ts, package.json |

## Content Coverage

### Huffman Codes (3 lessons, order: 1)
1. **Huffman Codes Overview** — greedy algorithm concept, variable-length encoding, prefix property
2. **Building the Huffman Tree** — min-heap construction algorithm, step-by-step example with {a,b,c,d,e,f,g,h,i,j}, O(n log n) complexity
3. **Encoding and Decoding** — encoding a string to bitstring, tree-walk decoding, worked example

### N-ary Trees (2 lessons, order: 2)
1. **N-ary Tree Basics** — node structure (leftmostChild/rightSibling), applications (filesystems, org charts, books)
2. **Tree Traversals** — preorder, postorder, level-order with pseudocode and C++; O(n) analysis for all three

### Red-Black Trees (3 lessons, order: 3)
1. **RB Tree Properties** — 5 invariants, black-height, O(log n) height proof, left/right rotations
2. **Search and Insert** — BST search, 3-case insert fixup (uncle red, zigzag, straight-line), O(log n) total
3. **Deletion** — transplant, in-order successor, 4-case double-black fixup, O(log n) total

### B-Trees (3 lessons, order: 4)
1. **B-Tree Properties** — minimum degree t, 5 structural properties, height bound O(log_t n), node structure
2. **Search and Insert** — disk-friendly search, preemptive split on descent, split-child algorithm, O(t·log_t n)
3. **Deletion** — 3 cases (leaf, internal predecessor/successor/merge, descend-with-ensure-t), borrow/merge, O(t·log_t n)

## Seed Results

```
Seeded 4 topics
Seeded 11 lessons (3 for huffman, 2 for n-ary-trees, 3 for red-black-trees, 3 for b-trees)
```

Re-run is safe: the script deletes all lessons then topics before reinserting.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] pdf-parse@2.x uses PDFParse named class export, not default function**
- **Found during:** Task 1
- **Issue:** Plan specified `import pdf from "pdf-parse"` (1.x API). Version 2.4.5 (installed) exports `PDFParse` as a named class.
- **Fix:** Changed to namespace import pattern; used `PDFParse` constructor.
- **Files modified:** scripts/parse-pdfs.ts
- **Commit:** 7b0e5fd

**2. [Rule 3 - Blocking] Node 18 incompatible with pdf-parse@2.x / pnpm db:seed**
- **Found during:** Task 1 and Task 3 execution
- **Issue:** System Node is 18.19.1. Both pdf-parse@2.x (uses pdfjs-dist@5.x) and `--experimental-strip-types` (added in Node 22+) require Node 22+. Project is pinned to Node 24 via .nvmrc.
- **Fix:** Used `export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"` before running scripts.
- **Files modified:** None (runtime environment fix)

**3. [Rule 2 - Missing] `"type": "module"` missing from package.json**
- **Found during:** Task 3 execution
- **Issue:** Node emitted `[MODULE_TYPELESS_PACKAGE_JSON]` warning on every seed run — the package was being reparsed as ESM due to ESM syntax detection, incurring a performance overhead.
- **Fix:** Added `"type": "module"` to package.json.
- **Files modified:** package.json
- **Commit:** 9be769e

**4. User-approved deviation: PDF image gaps filled from standard CS knowledge**
- **Found during:** Task 2 content structuring
- **Context:** The RB tree and B-tree PDFs are heavily visual (tree diagrams in images). Key pseudocode (RB-INSERT-FIXUP, RB-DELETE-FIXUP, B-TREE-SPLIT-CHILD, B-TREE-DELETE) was not extracted as text because it was rendered as images in the slides.
- **Resolution:** User approved: "fill in missing algorithm pseudocode and C++ from your knowledge base — the class teaches standard CS data structures so accuracy from standard CS knowledge is fine."
- **Impact:** All pseudocode and C++ implementations are from standard CLRS algorithms, not hallucinated.

## Known Stubs

None — all 11 lessons have fully populated `conceptMd`, `pseudocodeMd`, and `cppCode` fields. No placeholder text present.

## Self-Check: PASSED

Files created:
- FOUND: scripts/output/structured/huffman.json
- FOUND: scripts/output/structured/n-ary-trees.json
- FOUND: scripts/output/structured/red-black-trees.json
- FOUND: scripts/output/structured/b-trees.json
- FOUND: scripts/seed.ts

Commits:
- FOUND: 7b0e5fd (feat(01-03): PDF text extraction script and raw output files)
- FOUND: 85a58b8 (feat(01-03): structured lesson JSON for all 4 CS201 topics)
- FOUND: 9be769e (feat(01-03): idempotent seed script — populates 4 topics and 11 lessons)
