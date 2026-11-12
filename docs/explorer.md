---
title: Explorer
description: The browser view of a model, with the hierarchy, actors, journeys, data, bugs, changes, and click-through to code.
---

# Explorer

The explorer is where people learn a system: someone new to the team, a reviewer following a change, or you, six months from now. `archdoc view` serves it from your repository:

```bash
archdoc view --watch --open
```

With `--watch`, it updates as you save model files and shows any problems at the top.

## Start from what people do

The explorer opens on an **Overview**: what the system does, its journeys as cards (most important first, each with the path it takes and how many steps, repos, and decisions it has), and who owns what, beside a map of the top level. Hover a journey to light its path on the map.

On the map, a box's shape says what it is: actors are pills, datastores have a lid, and what lives in another repo is dashed. Its color says what kind it is: people, AI agents, and automated systems that call in each have one, as does each kind of element. The **Key and layout** box in the corner names the colors, turns the map top down or left to right, and turns the lines' descriptions on and off. Click a box to see what it uses, who uses it, and which journeys pass through it; open it to see what's inside, one level at a time. Each element links to its code paths and snippets, down to the lines that hold its logic.

In a repository that keeps [seals](./agents.md#seals-what-to-re-check-when-code-changes), the overview lists the facts whose code changed since someone checked them, a box with any carries a "re-check" mark, and its panel says what changed and which `archdoc seal` to run once the model holds again.

## Read a journey as a story

The **Journeys** tab draws a journey as lanes, one per participant, with a numbered arrow per step and the data it sends. After a decision, the steps that follow are grouped by outcome, each labelled with its condition, so branches read as branches. The panel beside it shows one step at a time: what it does, between whom and through which contract, the message's fields with their values, the records it writes, and its code.

"Show on map" plays it on the system map instead. A step that doesn't follow a use is drawn straight across between its boxes, in red, with the error in the step's panel.

## Follow the data

The **Data** tab lists data entries, including other repos'. It opens on where the data lives: each datastore and queue with its tables, their keys, the entry each holds, and who writes and uses it, then the requests, messages, and events that travel between the parts. Pick an entry for its page: its schema (each field's type, key, classification, and the entry it points to), where it's stored, who makes and gets it, the journey steps that send or write it, and the entries related to it. Entries without fields yet are marked, so the gaps are easy to see.

Switch the entry to **Map** to see it on the system map: a message lights up the uses it travels along, and an entity opens the datastore that stores it into its tables, with a line for each foreign key. Click a field and its lineage lights up across tables and repos.

## Plan a change

The **Plan** tab, under Build, is where you design a change with your agent. It draws the model as it would be with the [plan](./plan.md) made. Click in a box, and a small popover opens where you clicked: say what you want there, and it's pinned to the spot. You drive the design: once you send it, your agent turns each into the elements, arrows, and flows that carry it out, asking where you left a choice open, and they show up on the map dashed, for you to accept or dismiss, with its notes beside them. **Send to agent** hands it what you said; **Mark ready** says the plan is agreed.

## Walk through a bug

The **Triage** tab, under Build, lists the [Triage records](./triage.md) in `.archdoc/triage/` by status, with open work first. A record shows the report beside the root cause and the fix, then the leads followed. It then plays the bug's journey on the map, one step at a time, like a journey: the cause in red, the steps where it spreads in amber, and a step the model doesn't declare drawn straight across. **Sequence** shows the same steps as lanes beneath the journey step as modeled, with calls that didn't happen dashed. **Start a triage** places a pasted error on the system, and the buttons under it hand it to your agent: **Send to agent: find the root cause**, or **Find and fix it**. A record's page has the same buttons for what's next, such as **Send to agent: fix it** once it's root-caused.

## Review a change

The **Diff** tab compares the model on two branches, or a branch and your working tree (pick them in its header), and leads with the same verdict as the [pull request comment](./reviewers.md): what blocks the merge and how to fix it, what to check, who to ask before merging, the journeys affected (other repos' too), elements and uses, data, and facts to review (suggested by an agent, or inferred by `archdoc init`). On the map, new and changed boxes are marked, removed ones appear as ghosts, and facts to review are dotted.

```bash
archdoc view --base main
archdoc site --base main --out site   # the same, as a static site a PR can link to
```

Pick the branches at the top. The address keeps the pair, so a link opens the same comparison.

## See the whole org

`archdoc view --landscape` shows every repository synced into a [landscape](./landscape.md), grouped by repository, team, or domain, and marks where a journey crosses from one repository into another. `archdoc landscape build` writes the same explorer as a static site for GitHub Pages.
