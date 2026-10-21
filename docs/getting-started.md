---
title: Getting started
description: Build ArchDoc from a clone, open the playground, and view a model.
---

# Getting started

ArchDoc's packages aren't published to npm yet, so you run it from a clone of the repository.

## What you need

- Node.js 22.12 or later (or 24)
- pnpm 10. Running `corepack enable` once sets it up from the repository's `packageManager` field.
- git

## Build it

```bash
git clone https://github.com/ArchDoc/archdoc.git
cd archdoc
pnpm install && pnpm build
```

## Open the playground

The playground is the quickest way to see everything. One command sets up a demo company in `.playground/`: four repositories that import each other's models, released and synced, with a branch ready for each scenario. Then it opens the whole org in the explorer.

```bash
pnpm playground --open
```

`.playground/PLAYGROUND.md` lists what to try, including:

- simulating a refund request through the journey that handles it
- following one field's value across repositories
- what a pull request is told when it sends personal data to a third party, breaks an API another repository uses, loosens a decision, or renames a classified column

Run `pnpm playground` again for a fresh copy. It builds ArchDoc first if it isn't built yet.

## View a model

`archdoc view` opens the explorer in your browser. From the clone, `pnpm archdoc` runs the CLI you just built:

```bash
pnpm archdoc view --watch --open                 # ArchDoc's own model, in .archdoc/
pnpm archdoc view examples/quickstart.yaml --open  # a small online shop, in one file
```

With `--watch`, the explorer updates as you save model files and shows any problems at the top. The [explorer](./explorer.md) page says what you can do in it.

The [`examples/`](https://github.com/ArchDoc/archdoc/tree/main/examples) folder has one model per part of the platform: a quickstart, a modular monolith split into components, an event-driven system, decisions and simulation, a 24-table schema, and sensitive data. Each is a single file you can open with `archdoc view`.

## Use it on your own repository

To run the CLI from anywhere, point a shell alias at your build:

```bash
alias archdoc="node $PWD/packages/cli/dist/bin.js"
```

Then, in your repository:

1. Create `.archdoc/archdoc.yaml`. Start with a few actors, the elements they use with their `code:` paths, and one journey. [The model](./model.md) shows how, and [`examples/quickstart.yaml`](https://github.com/ArchDoc/archdoc/blob/main/examples/quickstart.yaml) is a complete small model to copy from. If you have a v0 file, `archdoc migrate old.yaml -o .archdoc/archdoc.yaml` converts it.
2. Check it with `archdoc validate`. It reports problems as `file:line:column` and exits nonzero on errors.
3. See how it covers the code with `archdoc map`, and what it's missing with `archdoc check`.
4. Open it with `archdoc view --watch --open`.

For editor validation, `archdoc schema -o archdoc.schema.json` writes the JSON Schema.

## The commands

| Command | What it does |
|---|---|
| `archdoc view` | Open the explorer. `--watch` reloads on save, `--base main` compares with a branch, `--landscape` shows every synced repository |
| `archdoc validate` | Check the schema, every reference, and every journey step against the declared relationships |
| `archdoc search <words>` | Where does this live? Elements, actors, and journeys, with code paths |
| `archdoc show <id>` | The details of an element, actor, journey, or data entry. `--code` prints an element's code snippets |
| `archdoc locate <paths>` | Which element owns these files, including files that don't exist yet |
| `archdoc impact <element-or-path>` | What depends on it, and which actors, journeys, owners, and rules a change affects |
| `archdoc map` | How the repository's files map onto the model, and which files no element claims |
| `archdoc check` | Drift: dependencies the model doesn't declare, broken rules and journeys, code paths that match nothing. `--base main` marks what your change introduced |
| `archdoc verify`, `archdoc seal` | Which model facts point at code that changed since someone checked them; `seal` records that you did. Opt-in with `archdoc seal --all` |
| `archdoc diff <ref>` | What changed in the model, by element, relationship, actor, and journey |
| `archdoc report --base main` | Your branch's architectural impact, as markdown for a pull request |
| `archdoc lineage <Entry.field>` | Every place a field's value is copied or derived, and where it's stored |
| `archdoc simulate <journey> --sample <file>` | Run a journey against a sample request, without running anything |
| `archdoc sync` | Pin imported repositories' models in `archdoc.lock` |
| `archdoc publish <version>` | Write the bundle other repositories import |
| `archdoc landscape build` | In a landscape repository: check the composed model and write the explorer as a static site |
| `archdoc mcp` | Start the MCP server for coding agents |
| `archdoc migrate <file>` | Convert a v0 or v1 model to v2 |
| `archdoc schema` | Print the JSON Schema for model files |

Most commands take `--json` for scripts and agents.
