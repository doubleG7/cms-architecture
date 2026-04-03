---
# No paths: frontmatter — this rule file loads at startup on every session.
# It applies universally across all files in this repository.
# Keep under 100 lines.
---

# Agent memory — Trimble CMS

> Agents: read and apply these rules whenever reading from or writing to memory.
> Check existing memory before starting any non-trivial task. Write back when you learn something reusable.
> If a rule conflicts with a task requirement, flag it — do not silently ignore it.

---

## Memory scopes

| Scope | Path | Lifetime | Use for |
|---|---|---|---|
| User | `/memories/` | Permanent, roams across all workspaces | User preferences, patterns that apply everywhere |
| Session | `/memories/session/` | Current conversation only | In-progress task state, temporary working notes |
| Repository | `/memories/repo/` | Permanent, scoped to this workspace | Codebase conventions, build commands, verified architecture facts |

---

## When to read memory

- **Before every non-trivial task:** check `/memories/repo/` for known conventions, gotchas, and verified facts about this codebase.
- **Before writing tests, migrations, or feature code:** confirm nothing in repo memory contradicts your approach.
- **Session memory:** read any existing session files at the start of a multi-step session to restore context.

Do not start implementation before consulting repo memory — repeating a known mistake wastes every subsequent step.

---

## When to write memory

Write to repo memory (`/memories/repo/`) when you:
- Confirm a build command, test command, or run command that works in this repository
- Discover a non-obvious convention not covered by the rule files
- Hit a gotcha, work around a known trap, or identify a dependency ordering constraint
- Verify an architectural fact (e.g. which DB context to use for reads vs. writes)

Write to session memory (`/memories/session/`) when you:
- Begin a multi-step task that will span multiple tool calls
- Need to track a plan, intermediate state, or decision rationale within a conversation

Write to user memory (`/memories/`) when you:
- Observe a persistent user preference (formatting style, communication tone, tool choices)
- Learn something that should apply across all of this user's projects

---

## What NOT to store in memory

- **Credentials, tokens, secrets, or connection strings** — ever, in any scope
- **PII** — user names, email addresses, account IDs from live data
- **Temporary scratchpad thoughts** — only store conclusions that would help a future agent
- **Redundant facts** — if it is already in a rule file or `CLAUDE.md`, do not duplicate it
- **Unverified assumptions** — only write what you have confirmed, not what you infer

---

## Format rules

- **Entries must be concise:** one fact per bullet, no lengthy prose
- **Include context for gotchas:** state *why* the constraint exists if it is non-obvious
- **Organise by topic** in separate files — do not dump all facts into one file
- **Update stale entries** rather than appending contradicting facts — stale memory is worse than no memory
- **Repository memory only supports `create`** — to update, use `str_replace`; never leave contradicting content

---

## Repository memory file naming

Use kebab-case filenames that match the topic area:

| Topic | Example filename |
|---|---|
| Build and run commands | `build-commands.md` |
| Architecture conventions | `architecture.md` |
| Known gotchas and traps | `gotchas.md` |
| Database and data access | `data-access.md` |
| External service quirks | `external-services.md` |

---

## What this file does NOT cover

- Memory tool syntax → see `<memoryInstructions>` in the system prompt
- Architecture conventions to store → `CLAUDE.md`
- Testing facts to remember → `rules/testing.md`
- Security constraints → `rules/security.md`
