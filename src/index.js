import fs from "fs/promises"
import path from "path"
import os from "os"
import crypto from "crypto"

const MEMORY_ROOT = path.join(os.homedir(), ".memory")

/** @type {import("@opencode-ai/plugin").Plugin} */
export default async (input) => {
  await fs.mkdir(MEMORY_ROOT, { recursive: true })

  const projectDir = resolveProjectDir(input.directory, input.worktree)
  await fs.mkdir(projectDir, { recursive: true })

  // Write a mapping file so humans can find which hash belongs to which project
  await fs.writeFile(path.join(projectDir, ".project"), input.directory || input.worktree || "unknown").catch(() => {})

  // sessionID → agent name mapping (in-memory, populated by chat hooks)
  const sessionAgentMap = new Map()

  /**
   * Ensure an agent-specific memory directory exists and is seeded.
   */
  async function ensureAgentMemoryDir(agent) {
    const memoryDir = agent
      ? path.join(projectDir, "agents", agent)
      : projectDir
    await fs.mkdir(memoryDir, { recursive: true })
    const memoryMdPath = path.join(memoryDir, "MEMORY.md")
    await fs.access(memoryMdPath).catch(() =>
      fs.writeFile(memoryMdPath, "")
    )
    return memoryDir
  }

  // Seed default memory dir for backward compatibility (no agent)
  await ensureAgentMemoryDir(null)

  function captureAgent(sessionID, agent) {
    if (sessionID && agent) sessionAgentMap.set(sessionID, agent)
  }

  return {
    // chat.message: agent is optional — may be absent
    "chat.message": async (input) => {
      captureAgent(input.sessionID, input.agent)
    },

    // chat.params: agent is always present — most reliable source
    "chat.params": async (input) => {
      captureAgent(input.sessionID, input.agent)
    },

    // event hook: captures agent from message.updated events as early as possible
    event: async ({ event }) => {
      if (event.type === "message.updated" && event.properties.info.role === "user") {
        const msg = event.properties.info
        captureAgent(msg.sessionID, msg.agent)
      }
    },

    "experimental.chat.system.transform": async (input, output) => {
      const agent = input.sessionID ? sessionAgentMap.get(input.sessionID) : undefined
      const memoryDir = await ensureAgentMemoryDir(agent)
      const memoryMd = await readMemoryMd(memoryDir)
      output.system.push(buildSystemPrompt(memoryDir, memoryMd))
    },
  }
}

/**
 * Derive memory directory path from project directory.
 * Uses the git worktree root (or project dir) to generate a stable slug,
 * so all worktrees within the same repo share one memory directory.
 */
function resolveProjectDir(directory, worktree) {
  const root = directory && directory !== "/" ? directory : worktree && worktree !== "/" ? worktree : os.homedir()
  const hash = crypto.createHash("sha256").update(root).digest("hex").slice(0, 12)
  return path.join(MEMORY_ROOT, hash)
}

/**
 * Read MEMORY.md, truncated to first 200 lines.
 */
async function readMemoryMd(memoryDir) {
  const filepath = path.join(memoryDir, "MEMORY.md")
  try {
    const content = await fs.readFile(filepath, "utf-8")
    const lines = content.split("\n")
    if (lines.length > 200) {
      return lines.slice(0, 200).join("\n")
    }
    return content
  } catch {
    return ""
  }
}

/**
 * Build the system prompt for auto memory.
 * Verbatim from Claude Code, with path adapted for opencode.
 */
function buildSystemPrompt(memoryDir, memoryMdContent) {
  let prompt = `# auto memory

You have a persistent auto memory directory at \`${memoryDir}\`. Its contents persist across conversations.

As you work, consult your memory files to build on previous experience.

## How to save memories:
- Organize memory semantically by topic, not chronologically
- Use the Write and Edit tools to update your memory files
- \`MEMORY.md\` is always loaded into your conversation context — lines after 200 will be truncated, so keep it concise
- Create separate topic files (e.g., \`debugging.md\`, \`patterns.md\`) for detailed notes and link to them from MEMORY.md
- Update or remove memories that turn out to be wrong or outdated
- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.

## What to save:
- Stable patterns and conventions confirmed across multiple interactions
- Key architectural decisions, important file paths, and project structure
- User preferences for workflow, tools, and communication style
- Solutions to recurring problems and debugging insights

## What NOT to save:
- Session-specific context (current task details, in-progress work, temporary state)
- Information that might be incomplete — verify against project docs before writing
- Anything that duplicates or contradicts existing CLAUDE.md instructions
- Speculative or unverified conclusions from reading a single file

## Explicit user requests:
- When the user asks you to remember something across sessions (e.g., "always use bun", "never auto-commit"), save it — no need to wait for multiple interactions
- When the user asks to forget or stop remembering something, find and remove the relevant entries from your memory files`

  if (memoryMdContent) {
    prompt += `\n\nContents of ${memoryDir}/MEMORY.md:\n\n${memoryMdContent}`
  } else {
    prompt += `\n\nMEMORY.md already created for you at \`${memoryDir}/MEMORY.md\`. No memories saved yet.`
  }

  return prompt
}
