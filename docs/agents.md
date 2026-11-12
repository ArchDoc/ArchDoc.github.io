---
title: For agents
description: The MCP server and agent skill that give a coding agent the architecture before it edits.
---

# For agents

A coding agent that starts from the architecture reads less code and breaks less. ArchDoc gives your agent the model through an MCP server and a skill, so that before it edits it can ask: where does this change belong, what depends on it, and which rules and journeys apply?

ArchDoc doesn't run an LLM of its own. Your agent does the reasoning; ArchDoc gives it deterministic answers.

## One tool per question

| Tool | Question | CLI |
|---|---|---|
| `archdoc_context` | Where do I start, and what does it affect? From the task in words, the files to change (even ones that don't exist yet), or an error. With nothing, an overview | `archdoc context` |
| `archdoc_show` | What is this one thing? An element (with its code), actor, journey, data entry, `Entry.field` (its lineage), Triage record, or sealed fact | `archdoc show <id>` |
| `archdoc_check` | What's wrong or stale? With a base, what does my change do: the verdict the [pull request comment](./reviewers.md) will give, each finding with its fix | `archdoc check --base main` |
| `archdoc_seal` | I checked these facts against their code. Says what's left | `archdoc seal <fact>` |
| `archdoc_plan` | Design a change with the person: start a plan, wait for what they want, read it, answer with suggested changes and notes, and carry out its tasks | `archdoc plan` |
| `archdoc_init` | There's no model yet: start one | `archdoc init` |

Every tool reloads the model on every call, so answers follow your edits, and each prints the same answer as the CLI command of the same name. All of them are read-only except `archdoc_seal`, which writes only `.archdoc/archdoc.sum`, and `archdoc_init`, which writes `.archdoc/` only where there's none. The whole tool list an agent reads is under 4,500 characters.

## The workflow

The skill and the `AGENTS.md` snippet teach agents the same loop, in three or four calls:

1. **Start with context.** `archdoc_context` with the task in a few words, the files it plans to change, or both, returns a short brief: the files and functions to open first, other code that does the same job (other callers of the functions those files use), the data and rules involved, the journeys whose steps name those files, the tests to run, the owners, and who uses it. With a [landscape](./landscape.md) synced, that includes other repositories.
2. **Say what it affects.** The agent names the affected journeys and actors in its plan, and asks you first when a critical journey is involved, the change would break a rule, or another repository uses what it would remove or rename.
3. **Edit the code and the model together.** When the change adds a component or a dependency on purpose, the agent adds it to `.archdoc/`, marked as a suggestion (below). When it moves or removes one, it updates the model in the same change.
4. **Check.** `archdoc_check` with base `main` gives the verdict the PR comment will give, then what the change introduced, each with its fix: imports the model doesn't declare, broken rules and journeys, stale code paths, data rules, Triage records, and facts whose code changed since they were sealed. The agent fixes those, or removes a dependency it didn't mean to add, and checks again.
5. **Seal what it checked.** For each fact whose code changed, the agent reads what changed, updates the model where it no longer holds, then seals it with `archdoc_seal`, which says what's left. The PR comment says who checked. It never seals a fact it hasn't read. See [Seals](#seals-what-to-re-check-when-code-changes).

For the PR description, `archdoc_check` with `format: "markdown"` returns the comment itself.

## Set up Claude Code

Install the plugin. It brings the skill and the MCP server, pinned to the CLI version released with it:

```
/plugin marketplace add ArchDoc/archdoc
/plugin install archdoc@archdoc
```

Then open a repository and start a task. In a repository with no `.archdoc/`, ask Claude to start an architecture model: it runs `archdoc_init`, describes what it finds, and runs `archdoc_check` until it's clean. The MCP server runs `npx -y @archdoc/cli@<version> mcp` in the repository Claude Code is open in, so it needs Node.js 22.12 or later.

To set up one repository without the plugin, copy the [skill](https://github.com/ArchDoc/archdoc/tree/main/integrations/claude-plugin/skills/archdoc) to `.claude/skills/archdoc/`, and add the server to `.mcp.json` at the repository's root:

```json
{
  "mcpServers": {
    "archdoc": {
      "command": "npx",
      "args": ["-y", "@archdoc/cli", "mcp"]
    }
  }
}
```

Optionally, add the [`AGENTS.md` snippet](https://github.com/ArchDoc/archdoc/blob/main/integrations/agent-skills/AGENTS.md) to your `CLAUDE.md` or `AGENTS.md`, so the workflow is always in context.

## Set up other agents

1. Paste the [`AGENTS.md` snippet](https://github.com/ArchDoc/archdoc/blob/main/integrations/agent-skills/AGENTS.md) near the top of your repository's `AGENTS.md`. Codex, Cursor, Copilot, and others read it.
2. Copy the [skill](https://github.com/ArchDoc/archdoc/tree/main/integrations/claude-plugin/skills/archdoc) to `.agents/skills/archdoc/` in your repository. Codex looks for skills there, not in `.claude/skills/` or the Claude Code plugin cache.
3. Register the MCP server, which runs `npx -y @archdoc/cli mcp` in the repository:
   - **Cursor:** copy the [Cursor config](https://github.com/ArchDoc/archdoc/blob/main/integrations/agent-skills/mcp/cursor.mcp.json) to `.cursor/mcp.json`.
   - **Codex:** add it to `~/.codex/config.toml`:

     ```toml
     [mcp_servers.archdoc]
     command = "npx"
     args = ["-y", "@archdoc/cli", "mcp"]
     ```

   - **Anything else with MCP:** a stdio server with that command. Without MCP, the agent can run the CLI instead: each tool is a command of the same name, with `--json` where it needs structure.

## Edit the model with the code

The agent edits `.archdoc/` the way it edits code, and marks what it adds:

```yaml
uses:
  billing:
    description: Sends invoice events
    provenance: { source: suggested, by: agent:claude-code }
```

`archdoc_check` catches anything that doesn't validate. Suggested facts show dotted in the explorer and are listed in the [pull request comment](./reviewers.md) as facts to review until a person accepts them by removing the `provenance` block, so the model stays human-owned even when agents write most of the code.

## Start a model

In a repository with no `.archdoc/`, `archdoc_init` (or `archdoc init`) writes a starting model from what the repository declares:

- a container per package or module its manifests name (`package.json`, `go.mod` with one per `cmd/` binary, `Cargo.toml`, `pyproject.toml`, Maven and Gradle), or per code directory no manifest claims, with GitHub Actions recognized
- datastores and queues from compose images (Postgres, MySQL, Mongo, Redis, Kafka, RabbitMQ, NATS, and more), with `depends_on` as uses
- uses from the imports analyzers see between them
- data entries from Prisma, SQL migrations, OpenAPI, and protobuf files, the datastore that stores them, and contracts for OpenAPI documents and proto services

It's deterministic, marks every fact `provenance: { source: inferred }`, never writes over a model, and never seals. On ArchDoc itself it finds all 10 containers and 13 of the 17 uses between them; the rest happen at run time, not in imports.

What it can't know, the agent adds with the code open: what each element does, who uses the system (actors: people, other software that calls in as `kind: system`, and only AI agents as `kind: agent`), the journeys that matter most, each a path from one element to the next, and each data entry's fields, from where the code defines it. `archdoc_check` with `done: true` lists what's still missing, from data entries without fields to elements deployed somewhere other than the node they run on. Then it runs `archdoc_check` until it's clean, and asks you to review the model in [the explorer](./explorer.md). Once you've accepted it, `archdoc seal --all` starts keeping it true.

## Seals: what to re-check when code changes

Code changes faster than anyone remembers which parts of the model describe it: a file is added, an export renamed, a decision's threshold changed, a schema grows a field. Expecting an agent to find every fact a change touched doesn't work. Seals tell it.

`archdoc seal --all` records a fingerprint of the code each model fact points at in `.archdoc/archdoc.sum`. Commit it, like a lockfile. Each kind of fact is fingerprinted by what would make it untrue, so edits that leave it true don't break its seal:

| Fact | Fingerprint | Breaks when |
|---|---|---|
| An element's `code:` paths | the files it owns and the names they export | a file is added or removed, an export is renamed or added; not when a function body changes |
| A snippet (`symbol:` or `lines:`), a decision's or a mapping's `code:` | the lines, without comments and whitespace | the lines change |
| A journey step's `code:` | its entry file's exports | the entry point is renamed or gone |
| A data entry's `source:` | the schema's fields and types | a field is added, removed, or retyped |
| A contract (`provides: api: proto/charges.proto`) | the spec file | the spec changes |

When the code under a fact changes, `archdoc check` (and `archdoc_check`) says which fact, where it is in the model, and what changed; `archdoc check --seals` lists only those, in full:

```
1 fact to check: the code changed since it was sealed.

contract proto/charges.proto of charges (.archdoc/archdoc.yaml:18)
  points at proto/charges.proto
  proto/charges.proto changed (34 → 35 lines)
  → archdoc seal contract:charges#proto/charges.proto
```

The agent reads the change, updates the model if it no longer holds (here, the contract's description now misses an RPC), and runs `archdoc seal <fact> --by agent:<name>`, or `archdoc seal <element-id>` for all of an element's facts. Without facts, `archdoc seal` seals only new ones and keeps changed ones flagged, so nothing gets waved through by accident.

A seal says someone checked; it isn't proof they were right. That's why the [pull request comment](./reviewers.md#seals) lists the facts a change sealed again and who sealed them, and lists any it left unchecked under "To check". Seals are opt-in: nothing happens until a repository has an `archdoc.sum`.

## Planning a change

Ask your agent to plan or design a change, and it starts with `archdoc_plan` instead of writing a markdown plan. It opens the explorer's Plan tab, where you click in the boxes on the map and say what you want there, and waits for you to send it. It then works out the architecture for each thing you asked for against the code and answers on the map: suggested elements, arrows, and steps that carry it out, for you to accept or dismiss, and insights, questions, and risks pinned to what they're about. It never changes what you wrote. Once you mark the plan ready, it writes the tasks, works through them, and edits the model as each lands. See [Plan](./plan.md).

## Triaging a bug

Give your agent a bug to explain or fix: an issue, a log line, a stack trace, or wrong output. It starts with `archdoc_triage`, which:
- places the bug on the journey steps it most likely showed up in
- names the elements its paths and stack frames map to
- writes a Triage record to `.archdoc/triage/<id>.yaml`

The agent then follows the code and fills the record in:
- each lead, ruled in or out
- each step the failing request took, with a role (cause, spreads, symptom) and evidence (reproduced, read, inferred)
- the values it saw against the ones it expected
- the root cause, and the fix if it makes one

You can also hand it a bug from the explorer: paste it into **Start a triage** and press **Send to agent**, or send a record again from its page with what you want now (find the root cause, fix it, look again). The agent picks it up with `archdoc_triage` and `wait: true` (`archdoc triage wait`).

```yaml
triage: report-false-data-changes
title: The PR report says data changed when it didn't
status: fixed
expands: review-ai-change#5
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
root-cause: { summary: The report loads the base revision without its schema sources. }
fix: loadRevision builds both sides the same way.
```

A record is evidence of one bug, not the design, so it's never part of the model. `archdoc check` (and `archdoc_check`) checks it against the model and the code, and holds it to what its status needs. Commit it with the fix, and the PR comment says which bug the change fixes. See [Triage](./triage.md) for the whole format and how the explorer shows it.

## How well it points

`archdoc eval` replays recent commits: it asks `archdoc context` with each commit's subject and counts how many of the files the commit changed the brief pointed at. On ArchDoc's own history, the brief covers about 64% of changed source files, against about 43% for plain search. `--min-recall` fails CI when a model change makes the answers worse.
