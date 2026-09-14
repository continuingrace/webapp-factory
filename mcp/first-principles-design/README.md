# First-Principles Design MCP

A small MCP server for challenging habitual design decisions from first principles.

## What it does

The first tool, `review_design`, asks what each major element is actually doing, what would be lost if it disappeared, whether the same job could be handled with simpler structure, and whether a familiar UI pattern is being used out of habit rather than necessity.

It is designed to avoid taste-only critique. Judgments should be tied to communication, usability, hierarchy, cognition, accessibility, maintainability, or context.

## Current scope — v0.1.0

- One MCP tool: `review_design`
- One reusable MCP prompt: `first_principles_design_review`
- First-principles review framework
- Explicit actions: KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST
- Guardrails for accessibility and required affordances
- Probes for common habitual patterns such as card-inside-card, unnecessary rounded containers, redundant helper text, equally strong CTAs, decorative icon repetition, and gratuitous gradients/glass/shadows

## Local setup

```bash
npm install
npm run build
npm start
```

For development:

```bash
npm run dev
```

The server communicates over stdio and can be registered in an MCP-compatible host by pointing the host to the built `dist/index.js` entry point.

## Suggested test prompt

> Review a mobile landing page where the hero contains a rounded card, that card contains a second rounded feature card, both CTAs have equal visual weight, and every text label is repeated with an icon. The goal is to help first-time visitors understand the service and start a trial quickly.

Expected behavior: the server should challenge the duplicated grouping and emphasis before discussing decorative details, preserve necessary affordances, and propose the lowest-complexity alternative that keeps the meaning and action clear.

## Design principles

1. Common does not mean necessary.
2. Every element should have a job.
3. Removing an element is a valid design move.
4. Prefer the simplest structure that preserves meaning and usability.
5. Accessibility and comprehension are constraints, not optional decoration.
6. Critique should explain why, not just say what looks better.

## Roadmap

Possible later modules: design compression, visual contradiction, pattern fatigue, visual narrative, aesthetic accessibility, before/after reasoning, visual metaphor, context shift, and design QA.
