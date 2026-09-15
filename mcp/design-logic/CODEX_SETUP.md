# Design Logic MCP — Codex setup

## Windows

Open PowerShell in the repository, then run:

```powershell
cd .\mcp\design-logic
npm install
npm run build
npm run test:mcp
```

Register the built stdio server:

```powershell
codex mcp add design-logic -- node "C:\FULL\PATH\TO\webapp-factory\mcp\design-logic\dist\index.js"
```

Confirm that it is enabled:

```powershell
codex mcp list
```

## Recommended first test

```text
Open this webpage and inspect it first:
https://example.com

Then use the Design Logic MCP to review it.
Summarize only what you actually observe, then call review_design_source with source_type='web'.
If the page cannot be read, stop instead of guessing.
```

A successful review should identify the exact source, explain the logic behind its critique, recommend KEEP / REMOVE / MERGE / REPLACE / EMPHASIZE / TEST actions, and end with a Safe next-step prompt that does not modify the original.

## Migrating from the old name

If `first-principles-design` is already registered, keep it until the new server works correctly. After confirming `design-logic`, you can remove the old registration separately.

The old source folder is temporarily retained so existing local setups do not break during migration.
