---
title: Plan
description: Design a change with your agent on the map of the system. You drive the design, saying what you want where, and your agent turns it into the model, instead of handing you a long markdown plan.
---

# Plan

Asking an agent for an implementation plan usually gets you a long markdown file to skim. **Plan** turns that around. You tell your agent the idea, then click on the explorer's map of the system where it should happen: add a box there, or a note on what you want, in your own words. You drive the design: your agent proposes nothing until you've said what you want, then turns each thing you asked for into the model against the code, and answers on the map with the elements, arrows, and flows that carry it out, plus what it found and what it's unsure of. Where you left a choice open, it asks instead of choosing for you. You take turns, as in a chat, until the plan is solid, and then it carries it out.

A plan lives in `.archdoc/plans/<id>.yaml`, next to the model but not part of it, detailed enough for an agent to build from. Nothing in it changes the model until the work lands.

## Start one

Ask your agent to plan or design the change. With the ArchDoc skill or `AGENTS.md` snippet installed, it starts with the `archdoc_plan` tool and opens the explorer for you. You can also start one yourself:

```bash
archdoc plan start "Let a reviewer export a journey as a PDF"
archdoc view --watch     # then Build → Plan
```

Starting a plan writes it with status `drafting`, with the parts of the model the idea touches as its scope. In the explorer, **Start a plan** at the top of the Plan tab's list does the same. Say what you want to change, and the first line becomes its title.

## Say what you want on the map

The Plan tab draws the model as it would be with your plan made, with the same marks as the Diff tab: new parts marked added, changed ones changed. It keeps the map quiet: only what the plan touches (your intents and the changes and flows for them), the few places the idea landed on, and the arrows between them. **Whole system** in the header brings back the rest, and so does picking a level.

What a click does depends on the mode in the header: **Add** (the default, or press A) or **Explore** (E).

In **Add**, a click on a box, inside a container or the system, or on the map itself opens a small menu where you clicked. It shows what the box is (its kind and description), and offers:

- **New element:** draw a box there. Give it a name and say what it's for. Inside the system it's a container, inside a container a component; on anything else, a box beside it. It's on the map at once, marked added, so you can drag arrows to it, and what it's for goes to your agent as an intent on it, to work out what it needs.
- **New note:** say what you want there, such as "email the shopper a receipt once the charge goes through". It becomes an **intent** (`i1`), pinned where you clicked.
- **Details:** read the box in the panel.

To say how two parts connect, click the arrow between them (or its label), or drag from one box to another, the boxes you drew included, whether or not they're connected yet. The popover asks what should change between them, and the intent is pinned halfway between the two boxes. Dragging empty space still moves the map. Click a pin to change or remove it.

In **Explore**, a click reads the box instead: the panel shows what it is, its description, and what the plan does there. Pins still open their intent.

You don't draw the arrows the design needs, or fill in a box's details: say how you want it done, and the agent follows.

## Take turns with your agent

The panel beside the map is a conversation, a turn each. Everything you add goes to your agent as you add it, so there's no list to review and send. The header says whose turn it is: **Your turn**, **Sent · waiting for your agent** (it picks it up with `archdoc plan wait`), or **Agent is working** once it has read your turn.

Each thing you said is a message from you, with the agent's answer under it:

- **Suggested changes and flows** that carry it out, by the names on the map ("Checkout → Order events: Publishes ReceiptRequested"), drawn dashed on the map. **Accept** one to make it part of the plan, or **Dismiss** it. A dismissed suggestion stays in the file, so it isn't suggested again.
- **Notes** about it: an *insight* it found in the code, a *question* you need to decide, or a *risk*.

Turns where nothing waits on you fold to a line; click one to open it. The box at the bottom answers the agent's open question, or says something new (about the box you selected in Explore, or the system), and sends it. A question with options shows them as buttons: one tap answers it, settles it, and sends it.

Your agent checks each intent against the code and carries out what it says, no more. It never changes what you wrote: a box you drew stays yours, and it suggests what the box needs beside it (its arrows, data, and code). Where an intent leaves a design choice open (which store, sync or queued, a new element or an existing one), it asks, one question at a time, naming the options and what each costs, and suggests once you answer. For an intent about how two parts connect, it answers with an arrow between them, or a new part in between. It can't suggest anything that isn't for one of your intents: `archdoc plan respond` refuses it, and refuses any suggestion before you've said what you want. Answering hands the turn back to you, and it waits for your next turn at once.

An intent stays open until something the agent suggested carries it out, or you settle it. When nothing is open (every intent worked out, no question unanswered, no suggestion waiting, and the check clean), press **Mark ready**. What the plan reaches, its check, and its tasks are under the fold at the bottom of the panel.

## What check finds

`archdoc check` checks every open plan, and so does the explorer as you work:

- intents nothing carries out yet
- changes and steps without intent, and an intent or `for` that names something that isn't there
- changes the model can't take, and why (removing an element a journey still goes through)
- what the plan would break: problems the model would have with the plan made that it doesn't have now, such as a step along no arrow
- open questions and suggestions
- the journeys, actors, owners, and other repos it reaches, with critical journeys called out, so your agent asks before changing one
- once it's ready, whether it has tasks; while it's carried out, which planned changes the model doesn't show yet

They're warnings while you work, and errors once the plan is ready. Plans that are done or abandoned aren't checked.

## Carry it out

Once it's ready, your agent writes the tasks that carry the plan out, each small enough for one commit: the changes and sequences it carries out, the files it changes, the tests that show it works, and the tasks that come first. Then it works through them in order, editing the model with `archdoc_edit` as each one's code lands (once the plan is ready, `archdoc plan read` gives each change as the edit op that makes it), and marks each task as it goes (`archdoc plan task <id> t1 --status done`). The first task started moves the plan to `executing`, and the last one done moves it to `done`. It stops to ask only when a check fails or a task would change a critical journey.

## What a plan says

```yaml
plan: export-journey-pdf
title: Let a reviewer export a journey as a PDF
status: reviewing          # drafting, reviewing, ready, executing, done, abandoned
goal: Let a reviewer export a journey as a PDF
by: human:@dana
intents:                   # what you want, where you clicked
  - id: i1
    on: toolchain.cli      # the box; left out for the system as a whole
    at: { x: 40, y: 60 }   # where in the box, in percent
    by: human:@dana
    text: Export the journey I'm looking at as a PDF from the command line
  - id: i2
    on: toolchain.cli
    to: toolchain.web      # about how two boxes connect: an arrow you clicked, or a drag
    by: human:@dana
    text: The explorer's Export button uses the same renderer as the command
changes:                   # each one archdoc edit op: add, set, remove, rename, or use
  - id: c1
    by: agent:claude-code
    for: [i1]              # the intents it carries out
    intent: Renders a journey to PDF headless, so the CLI can export too
    add: { id: toolchain.pdf-renderer, kind: container, name: PDF Renderer }
  - id: c2
    by: agent:claude-code
    status: suggested      # proposed (the default), suggested, or dismissed
    for: [i1]
    intent: The CLI command that runs it
    use: { from: toolchain.cli, to: toolchain.pdf-renderer, description: Renders the journey }
sequences:                 # a new journey, or new steps for one the model has
  - id: s1
    for: [i1]
    journey: export-a-journey
    actor: developer
    goal: Share a journey as a PDF
    steps:
      - { from: developer, to: toolchain.cli, action: Runs archdoc export pdf, intent: The entry point }
notes:
  - id: n1
    on: c1
    by: agent:claude-code
    kind: question         # note, insight, question, risk, answer
    text: Headless Chromium, or render the SVG the explorer already draws?
    options:               # shown as buttons; one tap answers
      - Headless Chromium, 150 MB
      - The SVG the explorer draws
    replies:
      - { by: human:@dana, kind: answer, text: The SVG }
tasks:
  - { id: t1, title: Add the renderer, from: [c1, c2], files: [packages/pdf/src/index.ts], tests: [packages/pdf/test/render.test.ts] }
unread:                    # what you changed since the agent last read it
  - { id: n1, what: replied }
sent: 2                    # the rounds you've sent
seen: 2                    # the round the agent last read
answered: 1                # the round it last answered: sent ahead of it is the agent's turn
```

## Commands

| Command | Tool | What it does |
|---|---|---|
| `archdoc plan start <idea>` | `archdoc_plan` `start` | Starts a plan, with its scope |
| `archdoc plan list` | `archdoc_plan` `list` | Lists plans and what's open on each |
| `archdoc plan read <id>` | `archdoc_plan` `read` | Reads a plan, what you changed first. `--peek` leaves it unread |
| `archdoc plan wait <id>` | `archdoc_plan` `wait` | Waits for your next turn, then reads it |
| `archdoc plan respond <id> '<ops>'` | `archdoc_plan` `respond` | The agent's answer: suggested changes and sequences for each intent, notes, replies, and tasks. It hands the turn back |
| `archdoc plan task <id> <task>` | `archdoc_plan` `task` | Sets a task's status |

`archdoc view` writes your edits to the plan file. It takes them only from the explorer's own page, and only against the version the page last read, so you and your agent never write over each other. A site built with `archdoc site` shows plans read-only.
