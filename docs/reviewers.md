---
title: For reviewers
description: The GitHub Action that comments on every pull request with its architectural impact and flags drift.
---

# For reviewers

A diff shows which lines changed. It doesn't show that those lines sit on the checkout journey, that the payments team owns them, or that another repository calls the API being renamed. The ArchDoc GitHub Action puts that on the pull request before anyone merges.

## What the comment says

On every pull request, the Action posts one comment and keeps it up to date. It's built for the few seconds a reviewer gives a bot comment, so it leads with a verdict:

```
⛔ ArchDoc: 1 blocking issue · 2 critical journeys · 3 teams to ask
```

Then, in order:

- **What blocks the merge**, each with how to fix it and the line it's about: errors the change introduces, such as a broken rule or an import the model doesn't declare, and consumers in other repositories it breaks.
- **To check**: new warnings, sensitive data going somewhere new, a changed decision and the journeys that decide with it, consumers elsewhere that may be affected, facts whose code changed under their seal, and facts an agent suggested.
- **Before merging**: a checklist of who to involve. Owners approve, other repositories' teams know, and critical journeys still work. Boxes ticked stay ticked when the comment updates.
- **What changed**: a Mermaid diagram of only the elements and arrows that changed, and a link to the change in the [explorer](./explorer.md) when you set `explorer-url`.
- Folded below: the affected journeys as sequence diagrams, with branches drawn as branches; consumers in other repositories; data; drift; model changes; and findings already on the base.

When a pull request doesn't change the architecture, the Action stays quiet: no new comment. When it fixes a bug traced in `.archdoc/traces/`, the comment says which one.

## Seals

In a repository that keeps `.archdoc/archdoc.sum` (see [Seals](./agents.md#seals-what-to-re-check-when-code-changes)), each model fact carries a fingerprint of the code it points at. When the pull request changes that code, the comment says so under "To check": "**Code changed under the model.**", the fact, what changed (a new file, a renamed export, a schema's new field), and where the fact is in the model. Check that the model still describes the code; the `archdoc seal` command it names records that someone did.

When the author or their agent already checked, the comment says that instead:

```
Re-checked against changed code by agent:claude-code: `element:payments.charges`, `data:Refund`.
```

A seal is an attestation, not proof. That line is where to look: the facts named are the ones someone says still hold after the change, so they're worth a glance in the diff of `.archdoc/`.

The findings the pull request introduces also show on the lines they're about, in Files changed. The same report goes to the job summary. The job fails when the pull request introduces drift at the severity you choose. A finding counts as introduced only when the merge base, checked the same way, didn't have it.

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
