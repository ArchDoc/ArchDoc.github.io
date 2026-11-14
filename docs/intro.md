---
slug: /
title: Introduction
description: What ArchDoc is, the problem it solves, and how its parts fit together.
---

# Introduction

ArchDoc helps you understand your architecture while AI builds it. It keeps a model of your system next to the code, owned by the people who build it. Your coding agent reads it before it edits and keeps it true as the code changes, and ArchDoc answers questions about it the same way for you and for your agent.

It's open source (MIT) and lives at [github.com/ArchDoc/archdoc](https://github.com/ArchDoc/archdoc).

:::info Versions
ArchDoc is on npm as `@archdoc/cli`, and follows semantic versioning: [COMPATIBILITY.md](https://github.com/ArchDoc/archdoc/blob/main/COMPATIBILITY.md) says what a release won't break. [Getting started](./getting-started.md) shows how to run it. The v0 viewer (`@archdoc/archdoc-ui`, ArchDoc 0.2 and earlier) is frozen on the [`legacy/v0`](https://github.com/ArchDoc/archdoc/tree/legacy/v0) branch, and its docs are [archived](/v0).
:::

## Why

- **Agents change code faster than people can follow the architecture.** A coding agent can touch five services in an afternoon. Someone still has to know which parts it touched, who depends on them, and which user journeys might break.
- **Architecture docs drift.** Diagrams and wiki pages are written once and stop matching the code, so nobody trusts them.
- **Generated wikis have no owner.** Tools that summarize a repository describe what the code does today, but nobody agreed to them, and they can't tell you what the code is *supposed* to do.

ArchDoc's answer is a small model that people own, kept in the repository, checked against the code on every change.

ArchDoc runs on your machine and sends nothing anywhere: no telemetry, no analytics, no accounts.

## The model

The model lives in `.archdoc/` in each repository, as YAML. It describes four things:

| Part | Answers |
|---|---|
| **Actors** | *Who* uses the system: people, roles, teams, partner organizations, and AI agents |
| **Elements** | *What* the system is made of: systems, containers, components, and datastores, each mapped to code paths |
| **Journeys** | *How* an actor reaches a goal, step by step across elements, checked against the declared relationships |
| **Data** | *With what*: what's sent and stored, how fields map between records, and the logic that runs on request data |

[The model](./model.md) explains each part with examples.

## The engine

`@archdoc/core` loads, validates, and queries the model. It contains no LLM and makes no network calls, so the same question gets the same answer in your editor, in your terminal, and in the browser. When reasoning is needed, your own coding agent does it, using the answers the engine gives it.

## Three surfaces

People and agents reach the engine through the surface that fits the moment:

| Who | When | Surface |
|---|---|---|
| AI coding agents | Before editing | [An MCP server and an agent skill](./agents.md): where does this belong, what depends on it, which rules and journeys apply |
| Everyone | Anytime | [The explorer](./explorer.md): the hierarchy, actors, journeys, data, changes [planned](./plan.md) with your agent, bugs [triaged](./triage.md) to their root cause, and click-through to code |
| Enterprises | Across teams | [The landscape](./landscape.md) (experimental): every repository's model composed into one view |

[Pull request review](./reviewers.md), with a GitHub Action, is experimental too.

## Coming from v0

v0 read a flat YAML file of users and components and drew it as a graph. Today's ArchDoc keeps the idea of a model you write yourself, and adds hierarchy, code mapping, journeys, data, change review, and agents.

`archdoc migrate` converts a v0 file (model format 1) to today's format: users become actors of kind `person`, components become elements (their kind guessed from tags), and `dependencies` become `uses`. It prints the result, or writes it with `-o`, and notes what to review.

```bash
archdoc migrate blog.yaml -o .archdoc/archdoc.yaml
```
