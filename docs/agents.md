---
title: For agents
description: The MCP server and agent skill that give a coding agent the architecture before it edits.
---

# For agents

A coding agent that starts from the architecture reads less code and breaks less. ArchDoc gives your agent the model through an MCP server and a skill, so that before it edits it can ask: where does this change belong, what depends on it, and which rules and journeys apply?

ArchDoc doesn't run an LLM of its own. Your agent does the reasoning; ArchDoc gives it deterministic answers.

## The workflow

The skill and the `AGENTS.md` snippet teach agents the same loop:

1. **Get a starting point.** `archdoc_context` with the task in a few words, the files it plans to change, or both, returns a short brief: the files and functions to open first, other code that does the same job (other callers of the functions those files use), the data and rules involved, the journeys whose steps name those files, the tests to run, and the owners. `archdoc_search` answers "where does this live?" for an area.
2. **Check the impact.** `archdoc_impact` on the element, or on the files it plans to change or create, lists what depends on them, the affected journeys and actors (critical first), owners, and the rules that mention them. With a [landscape](./landscape.md) synced, it also lists who uses them from other repositories.
3. **Say what it affects.** The agent names the affected journeys and actors in its plan, and asks you first when a critical journey is involved or the change would break a rule.
4. **Edit, then check for drift.** `archdoc_check` with base `main` reports what the change introduced: imports the model doesn't declare, broken rules and journeys, stale code paths. The agent fixes those, or removes a dependency it didn't mean to add.
5. **Propose the model changes.** When the change adds a component or a dependency on purpose, `archdoc_propose` adds it to `.archdoc/` as a suggestion for a person to review.
6. **Read the verdict before opening a PR.** `archdoc_report` gives the verdict the [pull request comment](./reviewers.md) will give, with what blocks the merge and how to fix it.

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
| `archdoc_context` | Where do I start? Files and functions to open, other code doing the same job, rules, journeys, tests, owners |
| `archdoc_search` | Where does this live? Elements, actors, journeys, and files for a few words, with code paths |
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
| `archdoc_report` | What will the PR comment say about my change? |
| `archdoc_anchor` | Which journey step did this error show up in? With a trace to start from |
| `archdoc_trace_check` | Is this trace sound? Elements, hops, code references |
| `archdoc_propose` | Add elements and relationships as suggestions |

## Suggestions, not silent edits

`archdoc_propose` adds elements and relationships marked `provenance: { source: suggested, by: agent:<name> }`, keeps the files' formatting, and writes a one-line rationale to `.archdoc/proposals/`. It never changes or removes what's there, never edits another repository's namespace, and writes nothing that wouldn't validate. `dryRun` checks a proposal without writing it.

Suggested facts show dashed in the explorer and are listed in the [pull request report](./reviewers.md) under "needs a person's review", so the model stays human-owned even when agents write most of the code.

## Explaining a bug

Give your agent an error: a log line, a stack trace, or wrong output. `archdoc_anchor` maps its paths and stack frames to elements and ranks the journey steps it most likely showed up in. The agent follows the code from there and writes a **trace** to `.archdoc/traces/<id>.yaml`: the path the failing request actually took, as a change to the journey step it expands, with a role (cause, spreads, symptom) and evidence (reproduced, read, inferred) on every step, the values it saw against the ones it expected, and any call that didn't happen.

```yaml
trace: report-false-data-changes
title: The PR report says data changed when it didn't
expands: review-ai-change#4
steps:
  - from: cli
    to: core.loader
    action: Loads base at the ref
    code: packages/cli/src/commands/report.ts:42
    role: cause
    evidence: reproduced
    observed: { Charge.id.type: undefined }
    expected: { Charge.id.type: uuid }
    missing: { to: analyzers, call: applySchemas }
```

A trace is evidence of one run, not the design, so it's never part of the model. `archdoc trace check` (or `archdoc_trace_check`) checks it against the model and the code, and flags hops the model doesn't declare: drift found while debugging. Commit it with the fix, and the PR comment says which bug the change fixes.

## How well it points

`archdoc eval` replays recent commits: it asks `archdoc context` with each commit's subject and counts how many of the files the commit changed the brief pointed at. On ArchDoc's own history, the brief covers about 64% of changed source files, against about 43% for plain search. `--min-recall` fails CI when a model change makes the answers worse.
