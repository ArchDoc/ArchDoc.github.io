---
title: Explorer
description: The browser view of a model, with the hierarchy, actors, journeys, data, changes, and click-through to code.
---

# Explorer

The explorer is where people learn a system: someone new to the team, a reviewer following a change, or you, six months from now. `archdoc view` serves it from your repository:

```bash
archdoc view --watch --open
```

With `--watch`, it updates as you save model files and shows any problems at the top.

## Start from what people do

The explorer opens on an **Overview**: what the system does, its journeys as cards (most important first, each with the path it takes and how many steps, repos, and decisions it has), and who owns what, beside a map of the top level. Hover a journey to light its path on the map.

On the map, a box's shape says what it is: actors are pills, datastores have a lid, and what lives in another repo is dashed. Click a box to see what it uses, who uses it, and which journeys pass through it; open it to see what's inside, one level at a time. Each element links to its code paths and snippets, down to the lines that hold its logic.

In a repository that keeps [seals](./agents.md#seals-what-to-re-check-when-code-changes), the overview lists the facts whose code changed since someone checked them, a box with any carries a "re-check" mark, and its panel says what changed and which `archdoc seal` to run once the model holds again.

## Read a journey as a story

The **Journeys** tab draws a journey as lanes, one per participant, with a numbered arrow per step and the data it sends. After a decision, the steps that follow are grouped by outcome, each labelled with its condition, so branches read as branches. The panel beside it shows one step at a time: what it does, between whom and through which contract, the message's fields with their values, the records it writes, and its code.

"Try a sample" runs the journey on a sample in your browser (one named after it, a file in `samples/`, or example data from each field's type) and fades the branches it doesn't take. "Show on map" plays it on the system map instead.

## Follow the data

The **Data** tab lists data entries, including other repos'. Pick a message and the uses it travels along light up. Pick an entity and the datastore that stores it opens into its tables, with a line for each foreign key. Click a field and its lineage lights up across tables and repos.

## See where a bug went

The **Traces** tab shows the bugs traced in `.archdoc/traces/`: the error, the diagnosis, the journey step as modeled with the path the failing request really took beneath it, the cause in red, calls that didn't happen, hops the model doesn't declare, and the evidence for each step. See [For agents](./agents.md#explaining-a-bug).

## Review a change

The **Changes** tab compares the model on two branches, or a branch and your working tree, and leads with the same verdict as the [pull request comment](./reviewers.md): what blocks the merge and how to fix it, what to check, who to ask before merging, the journeys affected (other repos' too), elements and uses, data, and facts to review (suggested by an agent, or inferred by `archdoc init`). On the map, new and changed boxes are marked, removed ones appear as ghosts, and facts to review are dotted.

```bash
archdoc view --base main
archdoc site --base main --out site   # the same, as a static site a PR can link to
```

Pick the branches at the top. The address keeps the pair, so a link opens the same comparison.

## See the whole org

`archdoc view --landscape` shows every repository synced into a [landscape](./landscape.md), grouped by repository, team, or domain, and marks where a journey crosses from one repository into another. `archdoc landscape build` writes the same explorer as a static site for GitHub Pages.
