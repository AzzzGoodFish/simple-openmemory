# simple-openmemory

Auto memory for [OpenCode](https://github.com/sst/opencode) — a port of Claude Code's built-in memory system.

Gives your agent persistent, per-project memory that survives across sessions. The agent reads and writes plain files using its standard tools — no extra API, no database.

## How it works

1. On session start, the plugin creates a memory directory under `~/.memory/<hash>/` (one per project).
2. A `MEMORY.md` file is seeded if it doesn't exist.
3. Every message turn, the plugin injects a system prompt that:
   - Tells the agent where its memory directory is
   - Includes the contents of `MEMORY.md` (first 200 lines)
   - Instructs the agent how and when to save/update memories

The agent uses its normal file read/write tools to manage memory files — no special API needed.

## Install

### One-click (let your agent do it)

Paste this link into your OpenCode or Claude Code session:

```
https://raw.githubusercontent.com/AzzzGoodFish/simple-openmemory/main/install.md
```

The agent will auto-detect your environment, install the plugin, and optionally add enhanced memory rules.

### Manual

Install the package globally from GitHub:

```bash
npm install -g github:AzzzGoodFish/simple-openmemory
```

Add the plugin to your OpenCode config (`~/.config/opencode/opencode.json`):

```json
{
  "plugin": [
    "simple-openmemory"
  ]
}
```

Or load from a local path during development:

```json
{
  "plugin": [
    "file:///path/to/simple-openmemory/src/index.js"
  ]
}
```

## Storage layout

```
~/.memory/
├── a1b2c3d4e5f6/          # project directory (hash of project path)
│   ├── .project           # plain text — maps hash back to original path
│   ├── MEMORY.md          # fallback memory (sessions with no agent identifier)
│   ├── agents/
│   │   ├── frontend/      # per-agent memory directory
│   │   │   ├── MEMORY.md
│   │   │   ├── WORKING.md
│   │   │   └── ...
│   │   └── backend/
│   │       ├── MEMORY.md
│   │       └── ...
│   └── ...
└── 7f8e9d0c1b2a/          # another project
    └── ...
```

Project directories are identified by a 12-character SHA-256 hash of the project root path. The `.project` file inside each directory records the original path for human reference.

## Why hashes instead of readable names?

OpenCode's built-in `opencode-anthropic-auth` plugin rewrites system prompts, replacing certain keywords. Using hashes for directory names avoids path corruption.

## License

MIT
