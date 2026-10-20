---
title: For agents
description: The MCP server and agent skill that give a coding agent the architecture before it edits.
---

# For agents

A coding agent that starts from the architecture reads less code and breaks less. ArchDoc gives your agent the model through an MCP server and a skill, so that before it edits it can ask: where does this change belong, what depends on it, and which rules and journeys apply?

ArchDoc doesn't run an LLM of its own. Your agent does the reasoning; ArchDoc gives it deterministic answers.

## The workflow

The skill and the `AGENTS.md` snippet teach agents the same loop:

1. **Find where the change belongs.** `archdoc_search` with a few words for the area, such as `refund approval`, returns the elements involved and their code paths, so the agent knows which files to read.
2. **Check the impact.** `archdoc_impact` on the element, or on the files it plans to change or create, lists what depends on them, the affected journeys and actors (critical first), owners, and the rules that mention them. With a [landscape](./landscape.md) synced, it also lists who uses them from other repositories.
3. **Say what it affects.** The agent names the affected journeys and actors in its plan, and asks you first when a critical journey is involved or the change would break a rule.
4. **Edit, then check for drift.** `archdoc_check` with base `main` reports what the change introduced: imports the model doesn't declare, broken rules and journeys, stale code paths. The agent fixes those, or removes a dependency it didn't mean to add.
5. **Propose the model changes.** When the change adds a component or a dependency on purpose, `archdoc_propose` adds it to `.archdoc/` as a suggestion for a person to review.

`archdoc_locate` tells it which element owns any file, including files that don't exist yet.

## Set up Claude Code

From a built clone of ArchDoc (see [Getting started](./getting-started.md)):

1. Add the MCP server to `.mcp.json` at your repository's root:

   ```json
   {
     "mcpServers": {
       "archdoc": {
         "command": "node",
         "args": ["/path/to/archdoc/packages/cli/dist/bin.js", "mcp"]
       }
     }
   }
   ```

   Once the packages are published, this becomes `npx -y @archdoc/cli mcp`.

2. Copy the skill from [`integrations/agent-skills/claude-code/archdoc/`](https://github.com/ArchDoc/archdoc/tree/main/integrations/agent-skills/claude-code/archdoc) to `.claude/skills/archdoc/`.
3. Optionally, add the [`AGENTS.md` snippet](https://github.com/ArchDoc/archdoc/blob/main/integrations/agent-skills/AGENTS.md) to your `CLAUDE.md` or `AGENTS.md`, so the workflow is always in context.

## Set up other agents

Add the [`AGENTS.md` snippet](https://github.com/ArchDoc/archdoc/blob/main/integrations/agent-skills/AGENTS.md) to your repository's `AGENTS.md`, which Codex, Cursor, Copilot, and others read. If the agent supports MCP, register `archdoc mcp` as a stdio server; there's a [Cursor config](https://github.com/ArchDoc/archdoc/blob/main/integrations/agent-skills/mcp/cursor.mcp.json) to start from. If it doesn't, it can run the same queries through the CLI with `--json`.

## The MCP tools

Every tool reloads the model on every call, so answers follow your edits. All of them are read-only except `archdoc_propose`, which only adds.

| Tool | Answers |
|---|---|
| `archdoc_search` | Where does this live? Elements, actors, and journeys for a few words, with code paths |
| `archdoc_overview` | What is this system? Actors, elements, journeys |
| `archdoc_locate` | Which element owns these files? |
| `archdoc_impact` | What does changing this affect? Consumers, actors, journeys, owners, rules |
| `archdoc_get_element` | Everything about one element |
| `archdoc_code` | An element's code, with the text of its snippets |
| `archdoc_get_actor` | What an actor uses, owns, and takes part in |
| `archdoc_journey` | The steps of a journey, with code entry points |
| `archdoc_data` | A data entry: its fields, where it's sent and stored |
| `archdoc_lineage` | Where a field's value goes, across repositories |
| `archdoc_simulate` | Which path a sample request takes through a journey, and what it writes |
| `archdoc_validate` | Is the model valid? Problems with file and line |
| `archdoc_check` | Did my change drift? With `base`, only what the change introduced |
| `archdoc_diff` | What changed in the model since a ref? |
| `archdoc_propose` | Add elements and relationships as suggestions |

## Suggestions, not silent edits

`archdoc_propose` adds elements and relationships marked `provenance: { source: suggested, by: agent:<name> }`, keeps the files' formatting, and writes a one-line rationale to `.archdoc/proposals/`. It never changes or removes what's there, never edits another repository's namespace, and writes nothing that wouldn't validate. `dryRun` checks a proposal without writing it.

Suggested facts show dashed in the explorer and are listed in the [pull request report](./reviewers.md) under "needs a person's review", so the model stays human-owned even when agents write most of the code.

## What's next

Two additions for agents are planned next. They aren't in the CLI yet.

- **`archdoc context <task or paths>`**: one brief to start a task from, with the files and symbols to begin in, other code that does the same job, the data, rules, and narrowest affected journeys, the tests to run, and the owners.
- **Traces**: a debugging record in `.archdoc/traces/` that ties a symptom to the journey step where it happens, the hops it really took, and the evidence for each claim, so an agent's diagnosis can be checked and reviewed.
