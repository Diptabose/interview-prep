# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **personal interview-prep knowledge base** owned by Soumyadipta Bose. It is a growing library of study notes, published as a website with **MkDocs Material** (hosted on GitHub Pages). The goal is **to help the user actually learn**: notes explain concepts properly (descriptions, code snippets, examples drawn from the docs) while staying focused and readable. Not terse flash cards, not bloated articles — learning notes that are clear enough to understand and structured enough to revise from quickly.

## Hosting

The site is built by MkDocs Material (`mkdocs.yml`) from the `docs/` folder and deployed automatically to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. Navigation is generated from the folder tree, so a new note appears in the site with no config changes. See [docs setup below](#local-preview) for previewing locally.

## Directory structure

All notes live under **`docs/`** (MkDocs' content root). Within it, notes are Markdown files organized by meaning, nested as deep as the topic warrants:

```
docs/<domain>/<topic>/.../<title>.md
```

- Start from a **domain** — top-level area: `js`, `backend`, `frontend`, `cicd`, `system-design`, `dsa`, `databases`, etc.
- **Nest as deep as the topic warrants.** There is no fixed number of levels. A small topic may be `docs/cicd/github-actions/caching.md`; a large one may nest further, e.g. `docs/frontend/react/hooks/effects/useeffect-cleanup.md`. Let the subject dictate the depth.
- Use kebab-case folder and file names.
- `docs/index.md` is the site home page. A folder can have its own `index.md` to act as a section landing page.

Create new folders freely. Prefer reusing an existing domain/topic over inventing a near-duplicate (e.g. don't create both `frontend/react-hooks` and `frontend/hooks`).

### Cross-referencing

Notes should link to each other so the user can navigate the knowledge base easily. When a note touches a concept covered (or worth covering) in another file, add a relative Markdown link, e.g. `[custom hooks](../custom-hooks.md)` or `[dependency injection](../../nestjs/dependency-injection.md)`. Use paths relative to the current file and link to the `.md` file (MkDocs rewrites these to the right site URL). A `## Related` section at the end of a note is a good place to gather these. If a sensible cross-reference target doesn't exist yet, still consider suggesting it as a dependent topic.

## How to write a note (content rules)

Notes are **for learning** — explain, don't just list.

- Open with a short framing: what the concept is and why it matters.
- Explain the mechanics with real prose where prose helps, backed by **code snippets and examples** (adapt them from official docs rather than inventing behavior).
- Use tables, bullets, and diagrams where they clarify.
- Use collapsible blocks to keep long tangents from cluttering the main flow, without losing the depth:
  ```markdown
  <details>
  <summary>Deeper dive / edge cases</summary>

  ... optional depth here ...
  </details>
  ```
- Call out **gotchas and common interview traps** explicitly.
- **Every note ends with a `## References` section** linking to the *exact* official documentation page (deep links, not a docs homepage).
- Add a `## Related` section with cross-reference links to sibling notes where relevant.

### Content validation (required)

**Always research and validate before writing — never write from memory alone.** APIs, versions, and best practices change.

- Use **Context7** (`resolve-library-id` → `query-docs`) for library/framework APIs and current syntax.
- Use **web search** for the latest information, version-specific changes, and to find exact official doc URLs.
- Confirm every API, flag, and behavior still exists and is current before stating it. If something is version-specific or was recently changed/deprecated, note the version and date.

### Note template (adapt freely — depth scales with the topic)

```markdown
# <Title>

> What this is and why it matters (1–2 sentences).

## Overview
Explanation in clear prose — enough to genuinely understand the concept.

## Example
```<lang>
// realistic, doc-grounded snippet
```

<details>
<summary>Deeper dive / edge cases (optional)</summary>

...
</details>

## Gotchas
- Common trap / interview trick.

## Related
- [Adjacent note](../adjacent-note.md)

## References
- [Exact doc page title](https://exact-url)
```

## Short-prep convention

When the user's interview is **less than 2 days away**, curate aggressively (highest-yield content only) and add this banner at the top of each affected note, right under the title:

```markdown
> ⚠️ **Short-prep note** — generated on <YYYY-MM-DD> under tight time constraints. Coverage is prioritized, not comprehensive. Revisit for depth when time allows.
```

Use today's date from context when stamping. Do not add the banner when prep time is ample.

## Authoring workflow

The `/prep` slash command (`.claude/commands/prep.md`) is the entry point the user invokes. It takes a topic, decides where it belongs under `docs/`, asks scoping questions (interview date, depth, dependent topics), then researches, validates, and writes the note(s). Follow that command's flow when it is invoked.

## Local preview

To preview the site before pushing:

```bash
pip install -r requirements.txt
mkdocs serve            # live-reload server at http://127.0.0.1:8000
```

`mkdocs build` produces the static site in `site/` (gitignored). Deployment is handled automatically by GitHub Actions — no need to run `gh-deploy` by hand.
