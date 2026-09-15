# Design Logic MCP — English Guide

Design Logic is a **source-aware MCP for reviewing the logic behind design decisions in webpages, Figma frames, screenshots, and manually described interfaces**.

It does not simply rate a design as “good” or “bad.” Instead, it asks what each major element is doing, whether it is necessary, and whether the same goal can be achieved with a simpler structure.

It is also intentionally non-destructive: after a review, it can propose a safe revision plan, but **the original should not be changed until the user gives separate explicit approval**.

## What does it review?

Design Logic helps answer questions such as:

- Does this card, container, label, icon, or CTA actually need to exist?
- Is the hierarchy clear?
- Are too many elements competing for attention?
- Is a familiar UI pattern serving the goal, or is it being repeated out of habit?
- Can the same meaning be preserved with a simpler structure?
- What should be KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST?
- Can a proposed revision be evaluated safely before touching the original?

The review should be grounded in **communication, usability, hierarchy, cognitive load, accessibility, maintainability, and context**, rather than taste alone.

## Supported inputs

`review_design_source` accepts four source types:

- `web` — a webpage URL
- `figma` — an exact Figma file/frame/node URL
- `screenshot` — a screenshot or image available to the host
- `manual` — a manually described design

For webpages, Figma, and screenshots, the host should **inspect the actual source first**. If the source cannot be read, the host should stop instead of fabricating a review.

## Core workflow

1. Identify the exact page, frame, image, or design to review.
2. Inspect the real source first.
3. Summarize only what was actually observed.
4. Call `review_design_source`.
5. Evaluate the purpose and necessity of major design decisions.
6. Return KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST recommendations.
7. Generate a `Safe next-step prompt`.
8. Do not modify the original until the user gives separate explicit approval.

## Example 1 — Webpage review

Ask an MCP-capable AI host:

```text
Open and inspect this webpage first:
https://example.com

Then review it with the Design Logic MCP.
Summarize only what you actually observe, then call
review_design_source with source_type='web'.

Focus on hierarchy, nested containers, CTA emphasis,
repeated icons/text, unnecessary decoration, and structural complexity.

If the page cannot be read, stop instead of guessing.
```

## Example 2 — Figma review

```text
Inspect this exact Figma frame first:
https://www.figma.com/design/...

Then review it with the Design Logic MCP.
Do not infer the layout from the URL alone.
```

If the host exposes MCP prompts, you can also use `review_figma_frame`.

## Example 3 — Safe revision planning

After a review recommends a change, use `plan_safe_revision` or ask:

```text
Do not apply this change yet. First evaluate whether it can be implemented safely.

Inspect the relevant code and structure first.
Tell me exactly which files, components, styles, selectors, or tokens would be affected.
Check responsive, accessibility, state/persistence, regression, and deployment risks.

Propose the smallest reversible change,
a preview or diff strategy, and a test/rollback plan.

Do not edit, delete, rename, overwrite, commit, push, deploy,
or otherwise modify the original in this step.
Wait for my separate explicit approval before applying anything.
```

## MCP capabilities

### Tool

`review_design_source`

Reviews one explicitly identified design source and returns the design-review framework plus safe follow-up rules.

### Prompts

- `review_explicit_design_source` — review an already inspected source
- `review_figma_frame` — inspect an exact Figma frame/node first, then review it
- `plan_safe_revision` — turn a review recommendation into a non-destructive implementation plan

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

Expected output:

```text
Design Logic MCP protocol smoke test passed
```

### Codex registration example — Windows

```powershell
codex mcp add design-logic -- node "C:\path\to\webapp-factory\mcp\design-logic\dist\index.js"
```

Confirm registration:

```powershell
codex mcp list
```

## Updating an existing install

```powershell
git pull
cd .\mcp\design-logic
npm install
npm run build
npm run test:mcp
```

## Design principles

1. Familiar does not automatically mean necessary.
2. Every major element should have a clear job.
3. Removing or merging an element is a valid design decision.
4. Prefer the lowest-complexity structure that preserves meaning and usability.
5. Accessibility and comprehension are constraints, not optional polish.
6. Explain why a decision is justified, not merely what looks better.
7. Keep review and implementation separate until the user explicitly approves a change.

Current version: `0.3.0`
