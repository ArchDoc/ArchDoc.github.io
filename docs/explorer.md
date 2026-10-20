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

## Find your way around

- **Click a box** to see what it is, what it uses, who uses it, and which journeys pass through it.
- **Open a box** to see what's inside: a system's containers, a container's components.
- **Focus on an actor** to see what it uses and owns.
- **Follow code links.** Each element links to its code paths and snippets, down to the lines that hold its logic.

## Step through a journey

Pick a journey and step through it. Each step's message travels along its arrow, the current step says what it does and what it carries, and the datastores it writes to open into their tables, showing the row each step adds or the fields it changes.

A journey runs when it opens, on a sample named after it (`<journey>.sample.json`, or a file in `samples/`) or on example data made up from each field's name and type. Edit a sample and run it again, and the views show the branch each decision takes and the records each step writes. "Inspect data" opens the record a step sends, with sensitive fields marked.

## Follow the data

Pick a message and the arrows it travels along light up. Pick an entity and the datastore that stores it opens into its tables, with a line for each foreign key. Click a field and its lineage lights up: the field in every table on the way, the arrows its value travels, and each mapping expression in the details panel.

## Review a change

The Changes tab compares the model on two branches, or a branch and your working tree. It lists changes in the order to review them: what breaks (rules and checks the change newly fails), the journeys affected, elements and arrows, data (including sensitive data that goes somewhere new), and facts an agent suggested. On the canvas, new and changed boxes are marked, removed ones appear as ghosts, and suggested facts are dashed.

```bash
archdoc view --base main
```

Pick the branches at the top. The address keeps the pair, so a link opens the same comparison.

## See the whole org

`archdoc view --landscape` shows every repository synced into a [landscape](./landscape.md), grouped by repository, team, or domain, and marks where a journey crosses from one repository into another. `archdoc landscape build` writes the same explorer as a static site for GitHub Pages.
