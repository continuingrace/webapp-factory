# Language QA MCP — English Guide

Language QA MCP reviews Korean spelling and spacing, English grammar and naturalness, and Konglish or Korean-influenced English.

## What it checks

### Korean
- spelling
- spacing
- particles and endings
- sentence agreement
- punctuation
- repeated or redundant wording
- awkward word order
- translationese
- context-appropriate phrasing

### English
- grammar
- articles and prepositions
- tense and subject-verb agreement
- literal Korean-to-English phrasing
- collocation and idiomatic word choice
- register and tone
- sentences that are grammatical but still sound unnatural

### Konglish
It also checks expressions commonly used in Korean that may be nonstandard, misleading, or unnatural in international English.

Possible classifications:
- natural international English
- understandable but nonstandard
- potentially misleading in English
- mainly Korean-only usage

## Core principles

Language QA is designed to avoid unnecessary rewrites.

1. Preserve intended meaning first.
2. Separate objective errors from stylistic preferences.
3. Separate required corrections from optional naturalness improvements.
4. Do not rewrite text that is already correct and natural.
5. In English, distinguish grammar errors from phrases that are grammatical but awkward.

## Basic usage

```text
Use the Language QA MCP to review the text below.
Separate actual errors from optional naturalness suggestions.

Text:
[insert text]
```

## Korean proofreading

```text
Use korean_proofread on the Korean text below.
Check spelling, spacing, particles, endings, sentence agreement, and punctuation first.
Separate required corrections from optional style improvements.

Text:
오늘 회의에서 이야기 했던 내용 정리해서 공유 드립니다.
```

## Natural English review

```text
Use natural_english to review the English below.
Separate grammar errors from wording that is grammatical but unnatural.
Suggest a fluent alternative that fits the context.

Text:
Happy thankful today.
Context: Instagram caption
```

## Konglish check

```text
Use konglish_check on the text below.
Classify each questionable expression as natural international English,
understandable but nonstandard, misleading in English, or mainly Korean-only usage.
Suggest a natural alternative when needed.

Text:
Let's do skinship after meeting at the pension.
```

## Mixed Korean-English copy

```text
Use Language QA in mixed mode.
Check Korean spacing and English usage together.
Do not casually replace brand names or established proper nouns.

Text:
이번 Leadership Workshop에서 우리 팀의 Action Plan을 같이 만들어봐요.
```

## Available capabilities

### Tool
`review_language`

Inputs:
- `text` — text to review
- `language` — `auto` / `ko` / `en` / `mixed`
- `tone` — `preserve` / `natural` / `concise` / `formal` / `warm` / `professional` / `casual`
- `context` — email, UI copy, social caption, report, presentation, etc.
- `audience` — intended audience
- `explain_changes` — whether to explain important edits

### Prompts
- `korean_proofread` — Korean spelling, spacing, grammar, and naturalness
- `natural_english` — English grammar and idiomatic naturalness
- `konglish_check` — Konglish and Korean-influenced English

## Local installation

Requirements:
- Node.js 24 recommended
- npm
- an MCP-capable host such as Codex

```bash
npm install
npm run build
npm run test:mcp
```

Expected output:

```text
Language QA MCP protocol smoke test passed
```

Codex registration example:

```powershell
codex mcp add language-qa -- node "C:\path\to\webapp-factory\mcp\language-qa\dist\index.js"
```

Check registration:

```powershell
codex mcp list
```

## Suggested response structure

Language QA is designed to return results in this order:

1. **Corrected version** — minimal correction only
2. **Natural version** — only when it materially improves the text
3. **Key changes** — classified as Error / Naturalness / Konglish / Tone
4. **Alternatives** — only when there are meaningfully different good options

Current version: `0.1.0`
