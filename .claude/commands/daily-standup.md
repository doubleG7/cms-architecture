---
name: daily-standup
description: Generate a standup update by reading today's git commits, open PRs, and any blockers. Use when the user says "standup", "daily update", "what did I do today", "scrum update", "write my standup", or "what should I report".
argument-hint: "[optional context — team name, ticket number, or 'yesterday' for previous day]"
allowed-tools: Bash, Read
---

# daily-standup

You are generating a standup update for a software engineer. Pull everything from the repo itself — commits, PR status, branch state. Do not ask the user what they did. Find it.

The output should be something the engineer can read aloud in under 60 seconds, paste into Slack, or drop into a standup bot. Concise, specific, no filler.

---

## Step 1 — Establish the time window

Determine whose commits to look at and for what period:

```bash
git config user.name
git config user.email
```

Determine the relevant time window:

- If `$ARGUMENTS` contains `yesterday` → use previous working day
- Default → use today (since midnight local time)

Get today's date and yesterday's date:

```bash
date +"%Y-%m-%d"
date -d "yesterday" +"%Y-%m-%d" 2>/dev/null || date -v-1d +"%Y-%m-%d"
```

---

## Step 2 — Pull today's commits

```bash
git log \
  --since="6am today" \
  --author="$(git config user.name)" \
  --oneline \
  --all \
  2>/dev/null
```

If that returns nothing (early morning, or commits were yesterday):

```bash
git log \
  --since="yesterday 6am" \
  --before="today 6am" \
  --author="$(git config user.name)" \
  --oneline \
  --all \
  2>/dev/null
```

Also check for commits across all worktrees if `.claude/worktrees/` exists:

```bash
ls .claude/worktrees/ 2>/dev/null && \
  for d in .claude/worktrees/*/; do
    echo "=== $d ==="
    git -C "$d" log --since="6am today" --author="$(git config user.name)" --oneline 2>/dev/null
  done
```

---

## Step 3 — Check branch and PR state

What branch is active and does it have an open PR?

```bash
git branch --show-current
git log --oneline -5
git status --short
```

Check for open PRs if `gh` is available:

```bash
gh pr list --author "@me" --state open 2>/dev/null || echo "gh not available"
gh pr status 2>/dev/null
```

Get PR review status — are there reviews waiting or reviews to address?

```bash
gh pr list --author "@me" --state open --json number,title,reviewDecision,isDraft 2>/dev/null
```

---

## Step 4 — Check for blockers

Look for signals of blocked or stuck work:

```bash
# Unresolved merge conflicts
git diff --name-only --diff-filter=U 2>/dev/null

# Failed CI on current branch
gh pr checks 2>/dev/null | grep -i "fail\|error" || true

# Stale branches (not pushed in a while)
git log --oneline origin/HEAD..HEAD 2>/dev/null | wc -l
```

Also check for any TODO/FIXME added today that signal something left incomplete:

```bash
git diff --since="6am today" 2>/dev/null | grep "^+" | grep -i "TODO\|FIXME\|BLOCKED\|HACK" | head -10
```

Read `CLAUDE.md` briefly — note any active workstreams or known blockers documented there.

---

## Step 5 — Read open PR descriptions for context

For each open PR, read the title and first paragraph of the description to understand what's in flight:

```bash
gh pr view --json title,body 2>/dev/null | head -30
```

---

## Step 6 — Compose the standup

Write the update in the classic three-part format, but make it specific and human — not a template-filled form.

**Format:**

```
Yesterday / Today
─────────────────
✅ [specific thing completed — name the feature or fix, not just "worked on stuff"]
✅ [another completed item]
🔄 [thing in progress — where it is, what's next]

Next
────
→ [specific next action — concrete enough to know if it's done tomorrow]
→ [another next action]

Blockers
────────
⚠ [specific blocker with enough context for someone to help]
— None  (if no blockers)
```

**Rules for writing each section:**

**Completed items (✅):**
- Name the feature, fix, or task — not the activity ("shipped invoice batch export" not "worked on invoices")
- If there's a PR, mention it: "opened PR #1185 for invoice batch export"
- If something was merged, say merged: "merged auth token rotation fix (#1201)"
- Derive these from the commits — match the commit message type to the achievement

**In progress (🔄):**
- What is the current state? ("security scanner agent — impl done, writing tests")
- Not "working on X" — that's obvious. Say where it is in the flow.

**Next (→):**
- One or two concrete next actions
- Specific enough that tomorrow you'd know if they're done
- Derive from: open PRs needing action, uncommitted changes, the natural next step after today's commits

**Blockers (⚠):**
- Only real blockers — things that prevent progress without outside help
- Include: who or what is blocking, since when, what you've already tried
- If none: "— None"

---

## Step 7 — Add Slack-ready variant

After the formatted standup, output a single-line version for pasting into a Slack thread or standup bot:

```
Slack: "Yesterday: [1-2 items]. Today: [1-2 items]. Blockers: [none / specific]."
```

---

## Step 8 — Optionally note PR actions needed

If there are PRs with review requests or change requests pending, flag them clearly — these are often the first thing a team lead checks:

```
PR actions:
• #1183 — changes requested by @reviewer — needs response
• #1179 — approved, ready to merge
• #1185 — draft, not yet ready for review
```

---

## Output format

```
Daily standup — [Day, Date]
════════════════════════════

Yesterday / Today
─────────────────
✅ [completed item]
✅ [completed item]
🔄 [in progress — current state]

Next
────
→ [specific next action]
→ [specific next action]

Blockers
────────
— None

─────────────────
Slack: "[compressed single line version]"

PR status:
• [PR list with action needed if any]
```

---

## Tone and length

- **Specific over vague.** "Fixed session fixation bug on login (#1201)" beats "fixed a bug."
- **State not activity.** "Invoice export: merged" beats "worked on invoice export."
- **Short.** The whole thing should fit in 15 lines. If it's longer, you have too many items — group them.
- **No padding.** Cut: "I was able to", "I managed to", "I also", "in addition to that." Just say the thing.
- **No jargon inflation.** "Wrote tests" not "implemented comprehensive test coverage strategy."

---

## Hard rules

- **Never fabricate work.** If there are no commits today, say so. Don't invent completed items.
- **Never say "worked on"** as the main verb — it describes activity, not progress.
- **Never list more than 3–4 completed items.** If there are more, group them: "closed 6 PRs related to auth refactor."
- **Never skip blockers.** If there are conflicts, failed CI, or stalled reviews, surface them — that's half the value of a standup.
- **If no commits and no open PRs**, produce this: "No commits today. [Branch name] is current. No blockers." — honest is better than invented.
