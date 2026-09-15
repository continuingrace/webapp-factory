# Design Logic MCP

A source-aware AI design reviewer that tests whether each major design decision has a clear job.

Design Logic is not a style grader and not an auto-editor. It inspects a specific webpage, Figma frame, screenshot, or manual design description, then reviews structure, hierarchy, emphasis, interaction patterns, redundancy, and unnecessary complexity. It also produces a safe next-step prompt for planning revisions without changing the original until the user explicitly approves.

## What it is for

Use Design Logic when you want to answer questions such as:

- Does this card, container, label, icon, or CTA actually need to exist?
- Is the hierarchy clear, or are too many things competing for attention?
- Are familiar UI patterns being repeated out of habit rather than because they serve the goal?
- Can the same meaning be preserved with a simpler structure?
- Which parts should be kept, removed, merged, replaced, emphasized, or tested?
- How can a suggested revision be evaluated safely before touching the original?

The review avoids taste-only judgments. Recommendations should be tied to communication, usability, hierarchy, cognition, accessibility, maintainability, or context.

## Supported sources

`review_design_source` accepts four source types:

- `web` — a webpage URL
- `figma` — an exact Figma file/frame/node URL
- `screenshot` — a screenshot or image reference available to the host
- `manual` — a manually described design

For web, Figma, and screenshot inputs, the MCP host should inspect the actual source first. If the source cannot be read, the host should stop rather than invent a review.

## Core workflow

1. Identify the exact source to review.
2. Inspect the real page/frame/screenshot.
3. Summarize only what is actually observed.
4. Call `review_design_source`.
5. Review major decisions from their purpose rather than convention.
6. Return KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST recommendations.
7. Generate a `Safe next-step prompt` for revision planning.
8. Do not modify the original until the user gives separate explicit approval.

## Safety model

Design Logic intentionally separates **review** from **implementation**.

The safe revision workflow tells an implementation agent to:

- inspect the relevant code or design first,
- check technical feasibility and side effects,
- identify exactly what would be touched,
- prefer the smallest reversible change,
- describe responsive, accessibility, regression, state/data, and deployment risks,
- show a preview or diff strategy,
- provide a test and rollback plan,
- avoid editing, deleting, renaming, overwriting, committing, pushing, deploying, or mutating the original during planning,
- wait for explicit user approval before applying anything.

## Example: webpage review

Ask your MCP-capable AI host:

```text
Open this webpage and inspect it first:
https://example.com

Then use the Design Logic MCP to review it.
Summarize only what you actually observe, then call review_design_source
with source_type='web'.

Focus on hierarchy, containers, CTA emphasis, repeated labels/icons,
unnecessary decoration, and structural complexity.
If the page cannot be read, stop instead of guessing.
```

## Example: Figma review

```text
Inspect this exact Figma frame first using the available Figma integration:
https://www.figma.com/design/...

Then run the Design Logic review.
Do not infer anything from the URL alone.
```

You can also use the reusable MCP prompt `review_figma_frame` when the host exposes MCP prompts.

## Example: safe revision planning

After a review recommends a change, use `plan_safe_revision` or ask:

```text
Plan this revision, but do not change anything yet.
Inspect the relevant implementation first.
Tell me whether the change can be isolated safely, exactly what files/components/styles would be affected, and what risks exist.
Propose the smallest reversible change, a preview/diff strategy, and a test/rollback plan.
Do not edit, delete, commit, push, deploy, or otherwise modify the original until I explicitly approve.
```

## Available MCP capabilities

### Tool

`review_design_source`

Reviews one explicitly identified source and returns the review framework plus safety policy and response instructions.

### Prompts

`review_explicit_design_source` — review an already inspected source.

`review_figma_frame` — inspect an exact Figma frame/node first, then review it.

`plan_safe_revision` — convert a recommendation into a non-destructive implementation plan.

## Local installation

Requirements:

- Node.js 24 recommended
- npm
- an MCP-capable host such as Codex

From this folder:

```bash
npm install
npm run build
npm run test:mcp
```

Expected test output:

```text
Design Logic MCP protocol smoke test passed
```

Then register the built stdio server. Example for Codex on Windows:

```powershell
codex mcp add design-logic -- node "C:\path\to\webapp-factory\mcp\design-logic\dist\index.js"
```

Confirm registration:

```powershell
codex mcp list
```

## Updating an existing local install

```powershell
git pull
cd .\mcp\design-logic
npm install
npm run build
npm run test:mcp
```

## Design principles

1. A design decision should be justified by the job it performs, not by convention alone.
2. Every major element should have a clear purpose.
3. Removing or merging an element is a valid design move.
4. Prefer the lowest-complexity structure that preserves meaning and usability.
5. Accessibility and comprehension are constraints, not optional polish.
6. Critique should explain why, not only what looks better.
7. Review and implementation should remain separate until the user explicitly approves a change.

## Status

Current version: `0.3.0`

The previous working name, **First-Principles Design MCP**, is being replaced by **Design Logic MCP**. The old folder is temporarily retained for compatibility with existing local registrations.
