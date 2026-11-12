---
title: Plan
description: Design a change with your agent on the map of the system, with the intent behind each part, instead of skimming a long markdown plan.
---

# Plan

Asking an agent for an implementation plan usually gets you a long markdown file to skim. **Plan** turns that around. You tell your agent the idea, then sketch the change yourself on the explorer's map of the system: the new parts, the arrows between them, and the flows they take part in, each with what you mean it to do. Your agent checks every part against the code, answers on the map with what it found, questions, and suggestions, and you go back and forth until the plan is solid. Then it carries it out.

A plan lives in `.archdoc/plans/<id>.yaml`, next to the model but not part of it, detailed enough for an agent to build from. Nothing in it changes the model until the work lands.

## Start one

Ask your agent to plan or design the change. With the ArchDoc skill or `AGENTS.md` snippet installed, it starts with the `archdoc_plan` tool and opens the explorer for you. You can also start one yourself:

```bash
archdoc plan start "Let a reviewer export a journey as a PDF"
archdoc view --watch     # then Build → Plan
```

Starting a plan writes it with status `drafting`, with the parts of the model the idea touches as its scope. In the explorer, **Start a plan** at the top of the Plan tab's list does the same.

## Sketch it on the map

The Plan tab draws the model as it would be with your plan made, with the same marks as the Diff tab: new parts marked added, changed ones changed. You work on the map itself:

- **Add an element:** double-click the map. Double-click inside an open box to put it there.
- **Draw an arrow:** drag from a box's right edge to another box.
- **Change or remove something:** click its box.
- **Record a sequence:** press **New sequence**, click who starts it, then each box it goes to, in order. Give each step what it does. Or pick a journey to change its steps.
- **Leave a note:** on any change, step, or box, or on the plan as a whole.

Every element, arrow, change, and step needs its **intent**: what you mean it to do and why. The form won't save without it. Intent is what the agent reviews against, and what it builds from later.

When you want your agent's review, press **Send to agent**. The header counts the edits it hasn't seen yet.

## Review it with your agent

Your agent waits for you to send it (`archdoc plan wait`), then reads what you changed since it last looked, every part with its intent, what the plan reaches, and what ArchDoc's check found. It checks each part against the code and answers on the map:

- **Notes** pinned to what they're about: an *insight* it found in the code, a *question* you need to decide, or a *risk*. Reply to any of them, answer a question, and resolve it when it's settled.
- **Suggestions:** elements, arrows, and steps it thinks the plan needs, drawn dashed. **Accept** one to make it part of the plan, or **Dismiss** it. A dismissed suggestion stays in the file, so it isn't suggested again.

It never changes your parts. If it thinks one is wrong, it says so in a note or suggests one beside it.

Send it again after each round. When nothing is open (no question unanswered, no suggestion waiting, every part with its intent, and the check clean), press **Mark ready**.

## What check finds

`archdoc check` checks every open plan, and so does the explorer as you sketch:

- parts without intent
- changes the model can't take, and why (removing an element a journey still goes through)
- what the plan would break: problems the model would have with the plan made that it doesn't have now, such as a step along no arrow
- open questions and suggestions
- the journeys, actors, owners, and other repos it reaches, with critical journeys called out, so your agent asks before changing one
- once it's ready, whether it has tasks; while it's carried out, which planned changes the model doesn't show yet

They're warnings while you sketch, and errors once the plan is ready. Plans that are done or abandoned aren't checked.

## Carry it out

Once it's ready, your agent writes the tasks that carry the plan out, each small enough for one commit: the changes and sequences it carries out, the files it changes, the tests that show it works, and the tasks that come first. Then it works through them in order, editing the model with `archdoc_edit` as each one's code lands, and marks each task as it goes (`archdoc plan task <id> t1 --status done`). The first task started moves the plan to `executing`, and the last one done moves it to `done`. It stops to ask only when a check fails or a task would change a critical journey.

## What a plan says

```yaml
plan: export-journey-pdf
title: Let a reviewer export a journey as a PDF
status: reviewing          # drafting, reviewing, ready, executing, done, abandoned
goal: Let a reviewer export a journey as a PDF
by: human:@dana
changes:                   # each one archdoc edit op: add, set, remove, rename, or use
  - id: c1
    by: human:@dana
    intent: Renders a journey to PDF headless, so the CLI can export too
    add: { id: toolchain.pdf-renderer, kind: container, name: PDF Renderer }
  - id: c2
    by: agent:claude-code
    status: suggested      # proposed (the default), suggested, or dismissed
    intent: The CLI command that runs it
    use: { from: toolchain.cli, to: toolchain.pdf-renderer, description: Renders the journey }
sequences:                 # a new journey, or new steps for one the model has
  - id: s1
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
    replies:
      - { by: human:@dana, kind: answer, text: The SVG }
tasks:
  - { id: t1, title: Add the renderer, from: [c1, c2], files: [packages/pdf/src/index.ts], tests: [packages/pdf/test/render.test.ts] }
unread:                    # what you changed since the agent last read it
  - { id: n1, what: replied }
sent: 2
```

## Commands

| Command | Tool | What it does |
|---|---|---|
| `archdoc plan start <idea>` | `archdoc_plan` `start` | Starts a plan, with its scope |
| `archdoc plan list` | `archdoc_plan` `list` | Lists plans and what's open on each |
| `archdoc plan read <id>` | `archdoc_plan` `read` | Reads a plan, what you changed first. `--peek` leaves it unread |
| `archdoc plan wait <id>` | `archdoc_plan` `wait` | Waits until you send it, then reads it |
| `archdoc plan respond <id> '<ops>'` | `archdoc_plan` `respond` | The agent's answer: notes, replies, suggestions, and tasks |
| `archdoc plan task <id> <task>` | `archdoc_plan` `task` | Sets a task's status |

`archdoc view` writes your edits to the plan file. It takes them only from the explorer's own page, and only against the version the page last read, so you and your agent never write over each other. A site built with `archdoc site` shows plans read-only.
