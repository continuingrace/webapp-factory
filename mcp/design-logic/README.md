# Design Logic MCP

A source-aware AI design reviewer for questioning the purpose, hierarchy, redundancy, and complexity of real design sources — with a non-destructive revision workflow.

## Documentation

- [한국어 사용법](./README.ko.md)
- [English Guide](./README.en.md)
- [Codex Setup](./CODEX_SETUP.md)

## In one sentence

**Design Logic inspects a real webpage, Figma frame, screenshot, or described interface, reviews whether each major design decision is justified, and proposes safer, simpler alternatives without changing the original until the user explicitly approves.**

## Core capabilities

- Review exact sources: web / Figma / screenshot / manual
- Analyze hierarchy, grouping, CTA emphasis, redundancy, and unnecessary complexity
- Recommend KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST
- Generate a `Safe next-step prompt` for feasibility checks before editing
- Separate review from implementation so the original is not modified during planning

Current version: `0.3.0`
