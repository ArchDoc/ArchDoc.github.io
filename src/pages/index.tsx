import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

const repo = 'https://github.com/ArchDoc/archdoc';

const problems = [
  {
    title: 'Agents change code faster than people can follow the architecture.',
    body: 'A coding agent can touch five services in an afternoon. Someone still has to know which parts it touched, who depends on them, and which user journeys might break.',
  },
  {
    title: 'Architecture docs drift.',
    body: "Diagrams and wiki pages are written once and stop matching the code. Once they're wrong a few times, nobody trusts them.",
  },
  {
    title: 'Generated wikis have no owner.',
    body: "A summary of the repository describes what the code does today. Nobody agreed to it, and it can't tell you what the code is supposed to do.",
  },
];

const parts = [
  {
    name: 'Actors',
    question: 'Who uses the system?',
    body: 'People, roles, teams, partner organizations, and AI agents, and what each one uses.',
  },
  {
    name: 'Elements',
    question: "What's it made of?",
    body: 'Systems, containers, components, and datastores, nested, and each mapped to the code that implements it.',
  },
  {
    name: 'Journeys',
    question: 'How do actors reach their goals?',
    body: 'Step by step across elements, checked against the relationships the model declares.',
  },
  {
    name: 'Data',
    question: "What's sent and stored?",
    body: 'Records, messages, and events with classified fields, how fields map between records, and the decisions made on request data.',
  },
];

const surfaces = [
  {
    who: 'AI agents',
    when: 'before editing',
    what: 'An MCP server and an agent skill. Where does this change belong? What depends on it? Which rules and journeys apply?',
    to: '/docs/agents',
  },
  {
    who: 'Reviewers',
    when: 'before merging',
    what: 'A pull request check that lists the affected journeys, owners, data changes, and consumers in other repositories, and flags drift.',
    to: '/docs/reviewers',
  },
  {
    who: 'Everyone',
    when: 'anytime',
    what: 'The explorer: the hierarchy, actor and journey views, data, a before/after view of a change, and click-through to code.',
    to: '/docs/explorer',
  },
  {
    who: 'Enterprises',
    when: 'across teams',
    what: "The landscape: every repository's model composed into one view, with journeys and rules that cross teams.",
    to: '/docs/landscape',
  },
];

const modelExample = `# .archdoc/archdoc.yaml
archdoc: "2.0"
namespace: rides

actors:
  passenger:
    kind: person
    uses:
      mobile-app: Requests rides, pays, rates drivers

elements:
  mobile-app:
    kind: container
    code: [{ path: apps/mobile/** }]
    uses:
      api-gateway: Calls all backend APIs
  api-gateway:
    kind: container
    code: [{ path: services/gateway/** }]

journeys:
  book-a-ride:
    actor: passenger
    goal: Get a ride to a destination
    importance: critical
    steps:
      - { from: passenger, to: mobile-app, action: Enters destination }
      - { from: mobile-app, to: api-gateway, action: POST /trips }`;

const quickStart = `git clone https://github.com/ArchDoc/archdoc.git
cd archdoc
pnpm install && pnpm build
pnpm playground --open`;

function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <p className={styles.eyebrow}>ArchDoc</p>
        <h1 className={styles.headline}>
          An architecture control plane for AI-assisted development
        </h1>
        <p className={styles.lede}>
          Keep a model of your system next to the code, owned by the people who
          build it. ArchDoc tells your coding agent where a change belongs, tells
          reviewers which journeys it affects, and shows everyone how the system
          fits together.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Get started
          </Link>
          <Link className="button button--secondary button--lg" href={repo}>
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function Why() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Why</h2>
        <div className="row">
          {problems.map((p) => (
            <div key={p.title} className={clsx('col col--4', styles.item)}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
        <p className={styles.answer}>
          ArchDoc's answer is a small model that people own, kept in the
          repository, and checked against the code on every change.
        </p>
      </div>
    </section>
  );
}

function Model() {
  return (
    <section className={clsx(styles.section, styles.alt)}>
      <div className="container">
        <h2>The model</h2>
        <p className={styles.intro}>
          The model is YAML in <code>.archdoc/</code>, versioned with the code. It
          describes four things.
        </p>
        <div className="row">
          <div className="col col--6">
            {parts.map((p) => (
              <div key={p.name} className={styles.part}>
                <h3>
                  {p.name} <span className={styles.question}>{p.question}</span>
                </h3>
                <p>{p.body}</p>
              </div>
            ))}
            <p>
              A deterministic engine, <code>@archdoc/core</code>, answers every
              question about the model. It contains no LLM, so the same question
              gets the same answer in your editor, in the browser, and in CI. Your
              own coding agent does the reasoning.
            </p>
            <Link to="/docs/model">Read about the model</Link>
          </div>
          <div className="col col--6">
            <CodeBlock language="yaml">{modelExample}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function Surfaces() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>One engine, four surfaces</h2>
        <p className={styles.intro}>
          People and agents reach the same answers through the surface that fits
          the moment.
        </p>
        <div className="row">
          {surfaces.map((s) => (
            <div key={s.who} className={clsx('col col--3', styles.item)}>
              <h3>
                {s.who} <span className={styles.question}>{s.when}</span>
              </h3>
              <p>{s.what}</p>
              <Link to={s.to}>More</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  return (
    <section className={clsx(styles.section, styles.alt)}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <h2>Try it</h2>
            <p>
              The packages aren't published yet, so you run ArchDoc from a clone.
              You need Node.js 22.12 or later and pnpm 10.
            </p>
            <p>
              The playground sets up a demo company of four repositories that
              import each other's models, with a branch for each scenario worth
              trying, and opens the whole org in the explorer.
            </p>
            <p>
              <Link to="/docs/getting-started">Getting started</Link> covers
              viewing a single model with <code>archdoc view</code> and adding a
              model to your own repository.
            </p>
          </div>
          <div className="col col--6">
            <CodeBlock language="bash">{quickStart}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function Status() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.status}>
          ArchDoc v2 is under active development. The v0 viewer is frozen at{' '}
          <Link href={`${repo}/releases/tag/v0.2.0`}>v0.2.0</Link> on the{' '}
          <Link href={`${repo}/tree/legacy/v0`}>legacy/v0</Link> branch, and its
          docs are kept as <Link to="/docs/v0/archdoc-ui/">v0 (legacy)</Link>.
        </p>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="An architecture control plane for AI-assisted development"
      description="ArchDoc keeps a human-owned architecture model next to the code, and answers what a change affects for coding agents, reviewers, and everyone learning the system.">
      <Hero />
      <main>
        <Why />
        <Model />
        <Surfaces />
        <QuickStart />
        <Status />
      </main>
    </Layout>
  );
}
