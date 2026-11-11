---
title: Triage
description: Hand your agent a bug, and get back its root cause as a journey you can walk through, step by step, on the map of the system.
---

# Triage

A journey shows how the system works: who starts it, and each step from one part to the next. **Triage** does the same for a bug. Hand your agent a bug, such as an issue, a log line, a stack trace, or wrong output. It follows the bug to its root cause and writes a **Triage record**. You can then walk through the bug in the explorer, step by step on the map, the same way you walk through a journey.

A record lives in `.archdoc/triage/<id>.yaml`, next to the model but not part of it. The journey is the design, and the record is one bug. Commit the record with the fix, so the pull request says which bug the change fixes, and the next person who hits something similar finds it.

## Start one

Ask your agent to triage the bug, or to explain or fix it. With the ArchDoc skill or `AGENTS.md` snippet installed, the agent starts with the `archdoc_triage` tool. You can also start one yourself:

```bash
archdoc triage start bug.txt --title "Refunds wait for finance" --link https://github.com/acme/rides/issues/412
pbpaste | archdoc triage start -        # or from stdin
```

ArchDoc reads the bug's stack frames, paths, and the names it mentions, including an element named in plain words ("the notifier"), so a report with no stack trace places too. It maps them to elements, ranks the journey steps the bug most likely showed up in, and writes the record with status `investigating`. The new record holds:
- the best journey step
- the elements the bug names, as open leads
- a step for each call between elements that the stack shows

Each guess says `TODO`. The agent then follows the code from there and fills the record in as it goes.

In the explorer, **Start a triage** (at the top of the Triage tab's list) does the placing part in your browser. Paste the bug, and it shows:
- the journey steps it likely showed up in
- the elements it names
- any records already written on those steps or elements
- a prompt to copy into your agent

The explorer never writes anything.

## What a record says

```yaml
triage: small-refund-waits-for-finance
title: A $4 refund on a $12 ride waits for finance instead of going through
status: root-caused
severity: high
reported: { by: rider, at: 2026-10-02, link: https://support.example.com/tickets/4812 }
symptom: |
  refund ref-ch-81 for trip-81: status pending_approval (expected approved)
reproduce: 'POST /refunds { "charge_id": "ch-81", "amount": 4.00 }'
expands: request-refund#4        # the journey step where it showed up

hypotheses:                      # the leads followed, ruled in or out
  - claim: refund-approval sends small refunds to finance
    element: payments.charges.refunds
    verdict: ruled-out
    evidence: read
    note: It auto-approves a refund up to half the charge.
  - claim: The amount is converted to cents twice on the way to payments
    element: api-gateway
    verdict: confirmed
    evidence: inferred

steps:                           # the bug's journey, in journey step syntax
  - { from: app, to: api-gateway, action: Sends the refund request, evidence: read }
  - from: api-gateway
    to: payments.charges
    action: Forwards the refund request, multiplying the amount by 100
    code: services/gateway/src/refunds.ts:42
    role: cause
    evidence: reproduced
    observed: { RefundRequest.amount_cents: 40000 }
    expected: { RefundRequest.amount_cents: 400 }
  - from: payments.charges
    to: payments.ledger
    action: Saves the refund for finance to approve
    role: symptom
    evidence: inferred

root-cause:
  summary: The gateway converts the amount to cents a second time.
  step: 2
fix:
  summary: Pass amount_cents through unchanged in the gateway.
  link: https://github.com/acme/rides/pull/88
  test: services/gateway/src/refunds.test.ts
```

| Field | What it says |
|---|---|
| `title`, `symptom` | The bug in one line, and what the person saw (the log line, error, or wrong output), as given |
| `status` | `open`, `investigating`, `root-caused`, `fixed`, `wont-fix`, or `cannot-reproduce`. If left out, it comes from what the record holds |
| `severity` | `low`, `normal`, `high`, or `critical` |
| `reported` | `by` (an actor or a name), `at`, and `link` to the issue or ticket |
| `reproduce`, `attachments` | How to see it again, and long logs kept beside the record |
| `expands` | The journey step it showed up in, as `<journey>#<step>`. A bug no journey covers says `actor` and `goal` instead |
| `hypotheses` | Each lead followed, with a `verdict` (`open`, `ruled-out`, `confirmed`), `evidence`, a `note`, and the `element` or `code` it's about |
| `steps` | Each step the failing request took, in [journey step](./model.md) syntax, with a `role` (`cause`, `spreads`, `symptom`), `evidence` (`reproduced`, `read`, `inferred`), `observed` and `expected` values, and any `missing` call |
| `root-cause` | Why it happens (`summary`), and the step it happens in |
| `works-in` | Code that does the same job correctly, for comparison |
| `fix` | What fixes it, the pull request, and the test that shows it |

Evidence is how a reader knows what to trust:
- `reproduced` means the step was seen in a run: a log, a test, or a debugger.
- `read` means it was followed in the code.
- `inferred` covers everything else.

A ruled-out lead stays in the record, so the next person doesn't follow it again.

## What check holds a record to

`archdoc check` (and `archdoc_check`) checks every record against the model and the code. It reports:
- elements and journey steps that don't exist
- code references (`path:line`) that no longer match their file
- steps the model doesn't declare: drift found while debugging, worth adding to the model if the code is right
- what the record's status still needs:

| Status | Needs |
|---|---|
| `investigating` | a step or a lead |
| `root-caused` | a step with `role: cause` (or `root-cause.step`) and the `code` where it goes wrong, and `root-cause.summary` |
| `fixed` | the same, plus `fix` |
| `wont-fix`, `cannot-reproduce` | why, in `root-cause.summary` |

Once a record is closed, the code it points at was meant to change, so stale references show as info rather than warnings.

## Walk through it in the explorer

The explorer's **Build → Triage** tab lists records by status, with open work first. A record opens on:
- the report you gave the agent, beside the root cause and the fix
- the leads followed: ruled-out ones struck through, the confirmed one in red
- the bug's journey

The bug's journey plays on the map of the system, one step at a time, like a [journey](./explorer.md#read-a-journey-as-a-story). The cause is in red, the steps where it spreads are in amber, and a step the model doesn't declare is drawn straight across. Switch to **Sequence** to see it as lanes beneath the journey step it opens up, with calls that didn't happen dashed. The panel shows one step at a time: what it does, its code, what was observed and expected, and how that's known.

## Elsewhere

- `archdoc triage list` lists records with open ones first. `--status open-all` shows only the unclosed ones, and `--element payments` only those on an element.
- `archdoc show <id>` prints a record the way the explorer reads it.
- `archdoc context` on a task lists the open records on what the task touches, as known bugs.
- The [pull request comment](./reviewers.md) says whether a change fixes a bug, finds its root cause, or triages it.

## From traces

Before 0.8, these records were called traces and lived in `.archdoc/traces/`, keyed `trace:`. They still load as Triage records, with a note to move them. `archdoc triage migrate` moves them to `.archdoc/triage/`, renames the key, and turns `diagnosis` into `root-cause.summary`, keeping your comments. Old `#traces=` links in the explorer open the Triage tab.
