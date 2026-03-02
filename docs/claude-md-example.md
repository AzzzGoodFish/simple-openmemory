# Enhanced Memory Rules for CLAUDE.md

The plugin provides the base memory infrastructure. These rules go in your `CLAUDE.md` (or `AGENTS.md`) to teach the agent **how** to use it effectively.

Copy the sections below into your global instruction file and adapt to taste.

---

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
