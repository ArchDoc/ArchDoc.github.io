---
title: Landscape
description: Share models across repositories, and compose every team's model into one view with a landscape repository.
---

# Landscape

Most systems span more than one repository. In ArchDoc, each repository owns a namespace and models its own part. Repositories import each other's models, and a landscape repository composes all of them into one view of the organization.

## Import another team's model

When a repository depends on another team's, it imports that model and refers to its elements by namespace:

```yaml
# .archdoc/archdoc.yaml in the rides repository
namespace: rides
imports:
  payments: { github: acme/payments, version: ^5 }
elements:
  api-gateway:
    kind: container
    uses:
      payments.charges: { description: Asks for a refund, via: proto/charges.proto }
```

`archdoc sync` reads each import's model at the newest release tag its range allows (such as `v5.2.0`), straight from git, so private repositories work with the credentials you already have. It vendors the models in `.archdoc/vendor/` and pins them in `.archdoc/archdoc.lock`. Commit both: `check`, the explorer, MCP, and CI then work offline and reproducibly, and taking a new release shows up as a diff in review.

From then on, `validate` and `check` report:

- references into other repositories that don't exist at the pinned version
- deprecated targets
- contracts (`via`) the target doesn't `provide`
- journey steps that start in another repository but don't follow its relationships
- imports built against a different major version than yours

`archdoc sync --update` moves to the newest allowed release, and `archdoc sync --frozen` checks the lock in CI. `archdoc publish` writes a validated, versioned bundle (`dist/payments@5.2.0.json`) for repositories that import by `url:`.

## The landscape repository

The landscape repository imports every team's model and adds what no single team owns: teams and roles across the company, journeys that cross teams, business `domains:` for grouping, and org-wide rules.

```bash
archdoc landscape build
```

`landscape build` composes every model into one (each repository a system, its elements inside), checks journeys that cross teams, owners (every team must be defined somewhere), and its rules across repositories. Then it writes the explorer as a static site for GitHub Pages. `archdoc view --landscape --watch` shows the same thing live while you edit.

[`integrations/landscape-template`](https://github.com/ArchDoc/archdoc/tree/main/integrations/landscape-template) is a starting point, with a workflow that opens a weekly pull request taking every team's newest release, and publishes the site on every push to main.

## Connect each team's repository

In each team's `.archdoc/archdoc.yaml`:

```yaml
landscape: { github: acme/architecture, version: ^1 }
```

Then run `archdoc sync` there. From then on:

- owners resolve against the landscape's teams, so `owners: [payments-team]` needs no local copy
- the landscape's rules marked `scope: org` run in the repository's `archdoc check`
- `archdoc context`, `archdoc show`, and the MCP tools list consumers and journeys in other repositories
- the pull request comment says which consumers a change breaks, before it merges

## Try it

The [playground](./getting-started.md#open-the-playground) sets up a demo company of four repositories (payments, trips, rides, and a landscape) that import each other, with a branch for each scenario: personal data sent to an outside fraud scorer, an API another repository uses being renamed, a looser refund threshold, and a renamed classified column.
