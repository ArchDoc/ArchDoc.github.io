---
title: The model
description: Actors, elements, journeys, and data, the four parts of an ArchDoc model, with examples.
---

# The model

An ArchDoc model is YAML in `.archdoc/`, next to the code it describes. People write and own it; agents can suggest additions, which a person accepts or rejects in review. It can be one file, or split however the team likes: `actors.yaml`, `model/*.yaml`, `journeys/*.yaml`, `rules.yaml`.

Every model starts with its spec version and a namespace. The namespace is how other repositories refer to it.

```yaml
# .archdoc/archdoc.yaml
archdoc: "2.0"
namespace: rides
name: Rides Platform
```

The rest describes four things: actors, elements, journeys, and data.

## Actors: who uses the system

An actor is someone or something that uses the system for a reason. Its `kind` is `person`, `role`, `team`, `organization`, or `agent`. `uses` says which elements it uses and why.

```yaml
actors:
  passenger:
    kind: person
    description: Books and pays for rides from the mobile app.
    uses:
      mobile-app: Requests rides, pays, rates drivers
```

Actors are what make impact readable. A change to the API gateway is abstract; "passengers can't book a ride" isn't.

## Elements: what it's made of

Elements are the parts of the system: `system`, `container`, `component`, `datastore`, `queue`, and `external`. They nest, so a system holds containers and a container holds components. `uses` declares a relationship, with a description of what it's for.

`code:` maps an element to the code that implements it. It can name whole paths and globs, a line range, or a declaration:

```yaml
elements:
  mobile-app:
    kind: container
    technology: React Native
    code: [{ path: apps/mobile/** }]
    uses:
      api-gateway: Calls all backend APIs
  api-gateway:
    kind: container
    owners: [platform-team]
    code:
      - { path: services/gateway/** }
      - { path: services/gateway/src/auth.ts, symbol: verifyToken, description: Checks every request's token }
```

Code mapping is what lets ArchDoc answer "which element owns this file?" and "what does changing this file affect?". It also lets `archdoc check` compare the model with the code: it reads workspace manifests and TS/JS imports, and reports dependencies the model doesn't declare, code paths that match nothing, and snippets that no longer match the code.

Elements can also name their `owners` (actors of kind `team`, defined in the model or in the [landscape](./landscape.md)), their `status` (such as `planned` or `deprecated`), the contracts they `provide` (an API, a topic, or an event), and where to read more (`links`).

## Journeys: how actors reach their goals

A journey is how an actor reaches a goal, step by step across elements. `importance` (`critical`, `high`, or `normal`) ranks it when a change affects it.

```yaml
journeys:
  book-a-ride:
    actor: passenger
    goal: Get a ride to a destination
    importance: critical
    steps:
      - { from: passenger, to: mobile-app, action: Enters destination and confirms }
      - { from: mobile-app, to: api-gateway, action: POST /trips }
```

`archdoc validate` checks every step against the declared relationships, so a journey can't walk an arrow that doesn't exist. When a change removes a relationship a critical journey still uses, validation fails and the pull request report names the journey.

## Data: what's sent and stored

Boxes and arrows say *that* two things talk. Data says *what* they exchange and *where* it lands. A data entry is a record (`entity`), a request or response (`message`), or an `event`, with fields. Sensitive fields carry a `classification`, and an entity can have a lifecycle.

```yaml
data:
  Charge:
    kind: entity
    fields:
      card_last4: { type: string, classification: pci }
      status: { type: enum, values: [authorized, captured, refunded] }
    states:
      - authorized -> captured -> refunded
elements:
  ledger:
    kind: datastore
    stores: { charges: { entity: Charge } }
  charges:
    kind: container
    provides:
      - { api: proto/charges.proto, accepts: RefundRequest, returns: Refund }
    uses:
      ledger: { description: Records charges, sends: Charge }
```

Relationships `send` data, contracts `accept`, `return`, or `carry` it, datastores `store` it, and journey steps say what they `send`, `create`, and `change` (`Charge.status: captured -> refunded`).

Fields don't have to be retyped. Point an entry at the schema it comes from, and keep only what the schema can't say, such as classifications. `archdoc check` reads SQL migrations, Prisma, OpenAPI and JSON Schema, and Protobuf, and reports when the schema and the model disagree, for example a classified column that was renamed.

```yaml
data:
  Charge:
    kind: entity
    source: { prisma: prisma/schema.prisma#Charge }
    fields:
      card_last4: { classification: pci }
```

Mappings say how one record becomes another, field by field, as [CEL](https://cel.dev) expressions. Logic blocks say how an element decides on the data it receives, and journey steps name the decision they take:

```yaml
logic:
  refund-approval:
    runs-in: charges
    input: { request: RefundRequest, charge: Charge }
    rules:
      - when: "request.reason == 'safety'"
        then: escalate-to-safety
      - when: "request.amount_cents <= charge.amount_cents / 2"
        then: auto-approve
      - else: needs-finance-approval
```

With data in the model, `archdoc show Refund.amount_cents` lists every place a value is copied or derived and the tables it lands in. Running a journey on a sample request (simulation) is experimental, and hidden from the CLI and explorer for now.

## Rules

Rules say what the architecture must keep true. They live in `.archdoc/rules.yaml` or under `rules:`, and `archdoc check` enforces them on every change. Data rules say where classified data may be stored and where it may never go:

```yaml
rules:
  - id: pci-stays-in-payments
    data: { classification: pci, stored-in: { namespace: payments } }
  - id: no-pii-to-external
    data: { classification: pii, not-sent-to: { kind: external } }
```

## Who wrote what

Every fact can say where it came from with `provenance`: `declared` (written by a person, the default), `inferred` (found by `archdoc init` or an analyzer), or `suggested` (proposed by an agent and not yet accepted). Inferred and suggested facts show dotted in the explorer and are listed in the pull request report as facts to review until a person accepts them by removing the `provenance` block.

```yaml
uses:
  billing:
    description: Sends invoice events
    provenance: { source: suggested, by: agent:claude-code }
```

## Other repositories

Elements and data in another repository are referenced by namespace, such as `payments.charges` or `payments.Charge`. [Landscape](./landscape.md) explains how repositories import each other's models.
