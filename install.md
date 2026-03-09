# Install simple-openmemory

You are an AI agent being asked to install the **simple-openmemory** plugin. Follow the steps below precisely.

## Step 1 — Detect environment

Check which tool the user is running:

- **OpenCode**: `~/.config/opencode/opencode.json` exists (or `opencode.json` in the current project)
- **Claude Code**: `~/.claude/` directory exists

If both exist, ask the user which one they want to configure.

---

## Step 2a — Install for OpenCode

### 2a.1 Install the npm package

Run:

```bash
npm install -g github:AzzzGoodFish/simple-openmemory
```

### 2a.2 Update OpenCode config

Read `~/.config/opencode/opencode.json`. If it doesn't exist, create it.

Add `"simple-openmemory"` to the `plugin` array. If the array doesn't exist, create it.

**Example result:**

```json
{
  "plugin": [
    "simple-openmemory"
  ]
}
```

If other plugins already exist, append to the array. Do NOT overwrite existing plugins.

### 2a.3 Confirm

Tell the user:

> simple-openmemory has been installed. It will activate on your next OpenCode session.
>
> The plugin will:
> - Create a per-project memory directory under `~/.memory/`
> - Auto-inject memory instructions into every conversation turn
> - Your agent will learn to read/write memories using plain files

Then proceed to **Step 3**.

---

## Step 2b — Install for Claude Code

Claude Code has built-in memory support — the plugin itself is not needed.

Tell the user:

> Claude Code already has a built-in memory system, so the plugin is not needed. However, I can add enhanced memory rules to your configuration that teach me how to use memory more effectively — with structured write/read policies, working memory, and worktree isolation.

Then proceed to **Step 3**.

---

## Step 3 — Enhanced memory rules (ask the user)

Ask the user:

> Would you like me to add enhanced memory rules to your agent configuration? These rules teach your agent structured memory management — including write policies, read policies, working memory for long tasks, and worktree memory isolation. (yes/no)

- If **no** → Done. Tell the user the installation is complete.
- If **yes** → Proceed to Step 4.

---

## Step 4 — Add enhanced memory rules

### For OpenCode

Append the rules below to the project-level `AGENTS.md` (or create one if it doesn't exist). If the user prefers a different file, follow their preference.

### For Claude Code

Append the rules below to `~/.claude/CLAUDE.md` (global) or the project-level `CLAUDE.md`. Ask the user which one they prefer. If they have no preference, use the global `~/.claude/CLAUDE.md`.

### Content to append

Append the following content (do NOT modify it):

```markdown
## Continuity

You wake up fresh each session. Memory files are how you persist — read them, update them.

### Memory Structure

- **`MEMORY.md`** — Index file (auto-loaded every session). One-line summary per topic file: what it covers, when to read it. Keep under 200 lines.
- **Topic files** — One file per domain (e.g., `project-foo.md`, `preferences.md`, `debug-notes.md`). Never mix unrelated topics.
- **`WORKING.md`** — Working memory. See below.

### Write Policy: Patterns and Lessons

Memory preserves two kinds of reusable assets:
- **Patterns** — Approaches that work: build/test/deploy sequences, debugging strategies, code conventions discovered in practice.
- **Lessons** — Hard-won knowledge: pitfalls, failed approaches and why, non-obvious constraints.

Heuristic: **Would a fresh session benefit from knowing this?** Yes → write.

Write triggers:
- User says "remember" → write immediately, no judgment needed.
- You discover non-obvious reusable knowledge → write proactively, inform user.
- A decision is made with trade-offs → record the choice and reasoning.
- Task completes → extract reusable knowledge from WORKING.md before clearing.

Don't record: speculative conclusions, one-off debug traces, completed trivial fixes.

### Read Policy: Recall Before You Act

Before any significant action, check whether memory has relevant context:
- Before writing or modifying code → read for architecture, conventions, code style.
- Before running tests → read for test strategy, environment setup, known quirks.
- Before making tool/approach decisions → read for stated preferences.

If memory is silent on the topic, proceed with best judgment — but note the gap and consider recording what you learn.

### Hygiene

- Check existing entries before writing. Update over duplicate.
- Delete stale memories. Don't let noise accumulate.

### Working Memory (`WORKING.md`)

Tracks exactly one active task. Core purpose: **survive context compression without losing critical info.**

Contents:
- Current goal and acceptance criteria
- Completed steps and key outputs
- Next actions
- Blockers and open questions
- Key file paths and code locations

Rules:
- Update after every significant step.
- Clear or archive to a topic file when the task is done.
- After context compression, read `WORKING.md` to restore context before continuing.

### Worktree Memory Isolation

Worktrees get their own memory directory — they cannot see the main project's memory files.

**On worktree creation:** Copy the main project's memory files into the worktree's memory directory so context carries over.

**On worktree teardown:** Sync key incremental and reusable memories back to the main project's memory directory. Discard worktree-specific throwaway state.
```

After appending, tell the user:

> Enhanced memory rules have been added. Your agent will now use structured memory management with write/read policies, working memory, and worktree isolation.

---

## Done

Tell the user the installation is complete. If they installed for OpenCode, remind them to restart their session for the plugin to take effect.
