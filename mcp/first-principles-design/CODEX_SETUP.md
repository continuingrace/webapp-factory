# Codex setup

## Windows

1. Open a terminal in this folder.
2. Install dependencies: `npm install`
3. Build the server: `npm run build`
4. Run the protocol smoke test: `npm run test:mcp`
5. Register the built stdio MCP server with Codex using the current absolute path to `dist/index.js`:

   `codex mcp add first-principles-design -- node <ABSOLUTE_PATH_TO_DIST_INDEX_JS>`

6. Start a new Codex session and use `/mcp` to confirm that `first-principles-design` is enabled and exposes `review_design`.

Codex stores local MCP configuration in the user's Codex config and supports stdio registration through `codex mcp add <name> -- <command> <args...>`.

## First live test

Ask Codex:

> Use the first-principles-design MCP to review this UI. The hero has a rounded card, that card contains another rounded feature card, two CTAs have the same visual weight, and every label repeats an icon. The goal is to help a first-time mobile visitor understand the product and start a trial quickly.

The review should prioritize unnecessary grouping and hierarchy problems before decorative details, protect accessibility and affordances, and recommend KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST actions.
