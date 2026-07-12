---
description: Curate an interview-prep learning note for a topic — decides placement, scopes with questions, researches, validates, and writes the .md
argument-hint: <topic> (e.g. "react hooks", "nestjs DI", "github actions caching")
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, mcp__plugin_context7_context7__resolve-library-id, mcp__plugin_context7_context7__query-docs, AskUserQuestion
---

The user wants a learning note for: **$ARGUMENTS**

Notes are for **learning** (explanations, descriptions, code snippets — see CLAUDE.md), not terse flash cards. Follow this flow. Do NOT skip straight to writing.

## 1. Decide placement (propose, don't assume silently)

Map the topic onto the repo structure `docs/<domain>/<topic>/.../<title>.md` (see CLAUDE.md). All notes live under `docs/`. Depth is not fixed — nest as deep as the topic warrants.

- First `Glob` the existing `docs/` tree so you reuse existing domains/topics instead of creating near-duplicates.
- Infer the domain (`js`, `backend`, `frontend`, `cicd`, `system-design`, `dsa`, `databases`, …) and however many nested levels fit, ending in a kebab-case title.
- State your proposed path in one line before asking anything, e.g. `Proposed: docs/frontend/react/hooks/effects/useeffect-cleanup.md`.

## 2. Scope it — ask the user (use the AskUserQuestion tool)

Ask a small batch of questions. Always include the first three; add topic-specific ones when useful.

1. **When is the interview?** Offer options like "Today / tomorrow (<2 days)", "This week", "2+ weeks away", "No fixed date". If **< 2 days**, curate to highest-yield content only and stamp the short-prep banner (see CLAUDE.md). Compute the gap using today's date from context.
2. **How deep?** e.g. "Quick refresher", "Interview-ready (solid understanding + gotchas)", "Deep dive (internals + edge cases)". Scale the note's length, prose, and use of collapsible `<details>` accordingly.
3. **Dependent / adjacent topics?** Suggest 2–4 concrete related notes you could also create (e.g. for `react hooks` → `useMemo vs useCallback`, `rules of hooks`, `custom hooks`). Let the user pick which extras to generate — these also become cross-reference targets.

Add topic-specific scoping questions when they materially change the content (e.g. "React version 18 or 19?", "Node runtime or browser?").

## 3. Research and validate — never write from memory

- Use **Context7** (`resolve-library-id` then `query-docs`) for any library/framework API and current syntax.
- Use **WebSearch/WebFetch** for the latest info, version-specific changes, and to find the *exact* official doc URLs.
- **Validate correctness and currency**: confirm every API, flag, and behavior still exists and is not deprecated/outdated before stating it. Note versions and dates where behavior is version-specific.

## 4. Write the note(s)

- Create folders as needed (any depth) and write to the proposed path, plus any extra dependent-topic notes the user chose.
- Follow the learning-note content rules and template in CLAUDE.md: framing → clear explanation → doc-grounded code examples → optional `<details>` depth → gotchas → `## Related` cross-reference links → `## References` with **deep links to exact doc pages**.
- Add relative cross-reference links between the notes you create (and to existing relevant notes) so navigation is easy.
- Apply the short-prep banner with today's date if the interview is < 2 days out.

## 5. Report

List every file created (as clickable relative-path links) and a one-line summary of what each covers.
