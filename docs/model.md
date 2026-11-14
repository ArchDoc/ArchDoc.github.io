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

An actor is someone or something that uses the system for a reason. Its `kind` is `person`, `role`, `team`, or `organization` for people; `system` for software that calls in on its own, such as another service, a scheduler, a CI job, or a webhook sender; or `agent` for an AI agent, an LLM or assistant that acts on its own. `uses` says which elements it uses and why.

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

A journey is how an actor reaches a goal, step by step across elements. `importance` (`critical`, `high`, or `normal`) ranks it when a change affects it. `section` names the topic it belongs to, such as Checkout or Accounts: the explorer lists journeys under their sections, so a model with many reads by what they're about. Give one to every journey once there are more than eight; `archdoc check --done` asks for them.

```yaml
journeys:
  book-a-ride:
    actor: passenger
    goal: Get a ride to a destination
    importance: critical
    section: Rides
    steps:
      - { from: passenger, to: mobile-app, action: Enters destination and confirms }
      - { from: mobile-app, to: api-gateway, action: POST /trips }
```

`archdoc validate` checks every step against the declared relationships, so a journey can't walk an arrow that doesn't exist. A journey is also a path: each step starts where the flow already is, at an element an earlier step reached, and `archdoc check` warns about a step that jumps to an element out of nowhere. Only an actor, or an external system acting on its own (a webhook arriving), may start a step out of the flow. When a change removes a relationship a critical journey still uses, validation fails and the pull request report names the journey.

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

## Where it runs

Elements say what the system is made of; environments say where it runs. Each environment (production, staging, a developer's machine) holds its infrastructure as nodes inside nodes, such as a cloud region, a cluster, a namespace, or a managed service, each with its `kind`, `technology`, and the `code` that defines it (Terraform, Helm, Kubernetes manifests, compose files). Each container, datastore, and queue says where it's deployed with `deploy`: a node's path, a list of them, or a node with what's true of it there.

```yaml
environments:
  production:
    nodes:
      aws:
        kind: region
        technology: AWS us-east-1
        nodes:
          eks: { kind: cluster, technology: EKS 1.30, code: infra/terraform/eks.tf }
          rds: { kind: managed, technology: Amazon RDS }
  local:
    nodes:
      compose: { kind: host, code: docker-compose.yaml }

elements:
  api:
    kind: container
    deploy:
      - { to: production.aws.eks, replicas: 3-12, technology: Helm chart, url: "https://api.example.com" }
      - local.compose
  db:
    kind: datastore
    deploy: [production.aws.rds, local.compose]
```

The explorer's Infrastructure tab draws one environment at a time: its nodes as boxes inside boxes, each container on the node it runs on, the uses between them lifted from their components and labelled with how they travel, and what they talk to outside the environment (actors, externals, and elements that run elsewhere) around it. The sidebar picks the environment, lists its nodes as a tree, and names the containers that don't say they run there. `archdoc show production.aws.eks` lists a node's infrastructure and what runs on it, and `archdoc show api` says where an element runs (a component runs where its container does). `validate` fails on a `deploy` that names no environment or node, and once a model has environments, warns about a container that doesn't say where it's deployed. `check` warns about deployment code that matches no file, and with seals, a change to a node's or a deployment's code flags it for a re-check. [examples/deployment.yaml](https://github.com/ArchDoc/archdoc/blob/main/examples/deployment.yaml) shows a shop on a CDN, a cluster, and managed services, with staging and local alongside.

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

Every fact can say where it came from with `provenance`: `declared` (written by a person, the default), `inferred` (found by `archdoc init` or an analyzer), or `suggested` (proposed by an agent and not yet accepted). Inferred and suggested facts show dotted in the explorer and are listed by `archdoc check --base` as facts to review until a person accepts them by removing the `provenance` block.

```yaml
uses:
  billing:
    description: Sends invoice events
    provenance: { source: suggested, by: agent:claude-code }
```

## Other repositories

Elements and data in another repository are referenced by namespace, such as `payments.charges` or `payments.Charge`. [Landscape](./landscape.md) explains how repositories import each other's models.

## The format's version

The first line of the root file names the model format: `archdoc: "2.0"`. It counts separately from ArchDoc's own version, because it changes far less often. A new field arrives with a new minor format (`2.1`), and an older ArchDoc that meets it says to upgrade instead of calling the field unknown. [COMPATIBILITY.md](https://github.com/ArchDoc/archdoc/blob/main/COMPATIBILITY.md) has the details.

For validation and completion in your editor, point the YAML language server at the JSON Schema (`archdoc schema` prints it too):

```yaml
# yaml-language-server: $schema=https://cdn.jsdelivr.net/npm/@archdoc/spec@1/schema/archdoc.v2.schema.json
```

