---
title: For reviewers
description: The GitHub Action that comments on every pull request with its architectural impact and flags drift.
---

# For reviewers

A diff shows which lines changed. It doesn't show that those lines sit on the checkout journey, that the payments team owns them, or that another repository calls the API being renamed. The ArchDoc GitHub Action puts that on the pull request before anyone merges.

## What the comment says

On every pull request, the Action posts one comment and keeps it up to date. It leads with Mermaid diagrams, which GitHub renders natively:

- a diagram of the change: the elements it touches and the model changes, colored added, changed, or removed, with suggested facts dotted and unchanged neighbors in grey
- a sequence diagram of each of the most important journeys it affects, with the steps that pass through the change highlighted

Below them:

- with a [landscape](./landscape.md) synced, consumers in other repositories, marked when the change breaks them (an element they use is removed, or a contract they use `via`), and their journeys
- the elements the change touches, and their owners
- the journeys and actors it affects, critical ones first
- what changed in the model, and facts an agent suggested that need a person's review
- data the change touches: entries, mappings and decisions (with their expressions before and after), and sensitive data that goes somewhere new, external services first
- drift the change introduced: imports the model doesn't declare, and broken rules

The same report goes to the job summary. The job fails when the pull request introduces drift at the severity you choose. Drift that was already there is listed separately and doesn't fail it.

## Set it up

```yaml
# .github/workflows/archdoc.yml
name: ArchDoc
on: pull_request

permissions:
  contents: read
  pull-requests: write

jobs:
  impact:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # the base commit must be in the checkout
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: ArchDoc/archdoc/integrations/github-action@main
        with:
          fail-on: error # or warning, or never to only comment
```

Until the packages are published, build ArchDoc in the job, outside your checkout, and point the Action at the build with `command`. These steps go after `setup-node` (Node 22.12 or later):

```yaml
      - name: Build ArchDoc
        run: |
          git clone --depth 1 https://github.com/ArchDoc/archdoc.git "$RUNNER_TEMP/archdoc"
          cd "$RUNNER_TEMP/archdoc" && corepack enable && pnpm install --frozen-lockfile && pnpm build
      - uses: ArchDoc/archdoc/integrations/github-action@main
        with:
          command: node ${{ runner.temp }}/archdoc/packages/cli/dist/bin.js
```

## Inputs

| Input | Default | What it does |
|---|---|---|
| `base` | the pull request's base commit | What to compare with |
| `model` | `.` | Repository, `.archdoc` directory, or model file |
| `fail-on` | `error` | Fail on introduced findings at this severity or above: `error`, `warning`, or `never` |
| `comment` | `true` | Post and update the pull request comment |
| `command` | `npx -y @archdoc/cli` | How to run ArchDoc, such as `node path/to/cli/dist/bin.js` for a local build |
| `github-token` | `github.token` | Token used to comment |

Pull requests from forks get a read-only token, so the comment step is skipped there; the job summary still has the report.

## What counts as introduced

A finding is introduced by the pull request when a file behind it changed, for example the file with an undeclared import. Rule and journey findings also count when the pull request changes the model. Everything else is listed as already there, folded away, and doesn't fail the job. This lets you turn the check on in a repository whose model isn't complete yet.

## Without the Action

The same report is a command away:

```bash
archdoc report --base main      # the pull request comment, as markdown
archdoc check --base main       # only the drift your branch introduced
archdoc diff main               # what changed in the model, by element, relationship, actor, and journey
archdoc view --base main        # the change on the explorer's canvas
```

`report --base main` is ready to paste into a pull request description.
