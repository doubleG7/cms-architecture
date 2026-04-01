---
name: commit-push-pr
description: Stage all changes, write a conventional commit message, push to the current branch, and open a draft pull request with a structured description. Use when the user says "ship it", "open a PR", "commit and push", "create a pull request", or "submit this for review".
argument-hint: "[optional short description to seed the commit message]"
allowed-tools: Bash, Read
---

# commit-push-pr

You are completing the final step of a development cycle: committing finished work, pushing it, and opening a pull request for human review.

Do this in order. Do not skip steps. Do not ask clarifying questions before starting — gather what you need from the repo itself.

---

## Step 1 — Confirm there is something to ship

```bash
git status --short
git diff --stat HEAD
```

If there are no changes (clean working tree, nothing staged), stop and say:
> "Nothing to commit — working tree is clean."

If there are **untracked files only** with no staged or modified tracked files, ask:
> "I see untracked files. Should I include them? Run `git add <files>` first, or tell me which to include."

---

## Step 2 — Review what changed

Read the actual diff before writing anything:

```bash
git diff HEAD
```

Also check recent commit history for context on naming conventions this team uses:

```bash
git log --oneline -8
```

Read `CLAUDE.md` if present — check for any commit message format requirements specific to this project.

---

## Step 3 — Stage everything

```bash
git add -A
```

Confirm what is staged:

```bash
git status --short
```

If any files look like they should NOT be committed (e.g. `.env`, `*.secret`, large binaries, `node_modules/`, build artifacts), **do not proceed**. List the suspicious files and ask:
> "I noticed these files are staged — are you sure you want to include them? `[list]`"

---

## Step 4 — Write the commit message

Use the **Conventional Commits** format:

```
<type>(<scope>): <short summary>

<body — what changed and why, not how>

<footer — breaking changes, issue refs>
```

**Types:**
- `feat` — new feature or capability
- `fix` — bug fix
- `refactor` — code change with no behaviour change
- `perf` — performance improvement
- `test` — adding or fixing tests
- `docs` — documentation only
- `chore` — build, tooling, dependency updates
- `ci` — CI/CD pipeline changes
- `style` — formatting, no logic change

**Rules:**
- Summary line: imperative mood, lowercase after the colon, no period, max 72 chars
- Body: explain *what* changed and *why* — not *how* (the diff shows how)
- Scope: the module, component, or area affected (optional but recommended)
- Breaking changes: `BREAKING CHANGE:` in the footer with migration notes
- Issue refs: `Closes #123` or `Refs #456` in the footer if a ticket number is identifiable from branch name or `$ARGUMENTS`

**Examples:**
```
feat(invoices): add batch export endpoint

Adds POST /v2/invoices/export supporting date range and status filters.
Returns a paginated CSV stream. Capped at 10,000 rows per request.

Closes #1184
```

```
fix(auth): prevent session fixation on privilege change

Session ID was not rotated after successful login, allowing session
fixation attacks. Now calls regenerateId() before setting user context.

Refs #1201
```

```
refactor(reporting): extract InvoiceExportService from ReportingService

ReportingService exceeded 800 lines with mixed responsibilities.
Extracted invoice export logic into a dedicated service class.
No behaviour changes — all existing tests pass unchanged.
```

Derive the type, scope, and body from the diff you read in Step 2. If `$ARGUMENTS` was provided, use it as a hint — it may contain a ticket number, scope, or short description.

---

## Step 5 — Commit

```bash
git commit -m "<summary line>" -m "<body paragraph>" -m "<footer>"
```

Or for simple single-line commits:

```bash
git commit -m "<type>(<scope>): <summary>"
```

Show the commit hash after:

```bash
git log --oneline -1
```

---

## Step 6 — Push

Get the current branch name:

```bash
git branch --show-current
```

If the branch is `main`, `master`, `develop`, or `release/*` — **stop**. Do not push directly to protected branches. Say:
> "I won't push directly to `[branch]`. Create a feature branch first: `git checkout -b feat/your-feature-name`"

Push to origin:

```bash
git push origin HEAD
```

If the push is rejected because the remote branch doesn't exist yet:

```bash
git push --set-upstream origin HEAD
```

If the push is rejected due to a non-fast-forward (someone else pushed):

```bash
git pull --rebase origin HEAD
git push origin HEAD
```

If the rebase produces conflicts, stop and report them — do not attempt to resolve merge conflicts automatically.

---

## Step 7 — Open the pull request

Use the GitHub CLI if available:

```bash
gh --version 2>/dev/null && echo "gh available" || echo "gh not found"
```

**If `gh` is available:**

```bash
gh pr create \
  --draft \
  --title "<same as commit summary line>" \
  --body "<PR body — see format below>"
```

**PR body format:**

```markdown
## What

<1–2 sentences: what does this PR do?>

## Why

<1–2 sentences: why is this change needed? Link to issue or requirement.>

## How

<Key implementation decisions. Note anything non-obvious. This is optional — skip if the what/why is self-explanatory.>

## Testing

<How was this tested? Unit tests, integration tests, manual steps.>

## Checklist

- [ ] Tests added or updated
- [ ] Documentation updated if needed
- [ ] No secrets or credentials introduced
- [ ] Ready for review
```

Derive the What/Why/How from the commit message and the diff. The PR body should be readable without the diff — write for a reviewer who hasn't seen the code yet.

After creating the PR, output the PR URL.

**If `gh` is not available:**

Output the PR body as formatted markdown so the user can paste it:

```
gh is not installed. Here's your PR description — open a PR manually and paste this in:

---
[formatted PR body]
---

Install gh for automatic PR creation: https://cli.github.com
```

---

## Step 8 — Final summary

Output a clean summary of what was done:

```
✅ Committed: feat(invoices): add batch export endpoint
✅ Pushed:    origin/feat/invoice-batch-export
✅ PR opened: https://github.com/org/repo/pull/1185 (draft)

Next: address review comments, then mark as ready when approved.
```

---

## Hard rules

- **Never push to `main`, `master`, `develop`, or `release/*`** without explicit instruction.
- **Never commit `.env`, credentials, secrets, or build artifacts** — flag them and stop.
- **Never auto-resolve merge conflicts** — report them and stop.
- **Never skip the diff review** before writing the commit message — writing a message without reading the diff produces generic, useless commits.
- **Never force-push** (`--force` or `--force-with-lease`) without explicit instruction.
- **Open PRs as draft** by default — the human decides when it is ready for review.
