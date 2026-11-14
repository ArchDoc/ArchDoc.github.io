import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';
// Real output, from scripts/build-demo.mjs (npm run demo).
import {brief, comment} from '../data/demo';

const repo = 'https://github.com/ArchDoc/archdoc';
const install = 'npx -y @archdoc/cli init';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const loop = [
  {
    n: '01',
    name: 'Context',
    cmd: 'archdoc_context',
    body: 'Before it greps, your agent asks where the task belongs. It gets the files and functions to open first, the journeys and data rules in play, the tests to run, and who owns it.',
  },
  {
    n: '02',
    name: 'Edit',
    cmd: 'archdoc_edit',
    body: 'It changes the model with the code, by ID: add, set, rename, remove. All of a batch lands or none of it, and an edit that would add errors is refused.',
  },
  {
    n: '03',
    name: 'Check',
    cmd: 'archdoc_check',
    body: 'Before you see the PR, it gets the verdict the PR comment will give: undeclared imports, broken rules and journeys, stale paths, and personal data going somewhere new.',
  },
  {
    n: '04',
    name: 'Seal',
    cmd: 'archdoc_seal',
    body: "It re-reads each fact whose code changed and seals it by name. Reviewers see exactly what the agent vouched for, so the model can't quietly drift.",
  },
];

type Tab = {
  id: string;
  group: 'Explore' | 'Build';
  label: string;
  title: string;
  body: string;
  points: string[];
  img: string;
  alt: string;
  to: string;
};

const tabs: Tab[] = [
  {
    id: 'plan',
    group: 'Build',
    label: 'Plan',
    title: 'Design the change on the map, with your agent',
    body: 'Click where the change belongs and say what you want. Your agent checks it against the code and answers in the same thread: proposed boxes and arrows you accept or dismiss, and a question with one-tap options when a design choice is yours to make.',
    points: [
      'Add or Explore, from a menu where you click',
      'A turn-by-turn conversation, one question at a time',
      'Mark it ready, and the agent builds it task by task',
    ],
    img: '/img/v1/plan.png',
    alt: 'The Plan tab: a receipt mailer proposed on the map, with the agent asking who sends the email',
    to: '/docs/plan',
  },
  {
    id: 'triage',
    group: 'Build',
    label: 'Triage',
    title: 'Hand your agent a bug, get a root cause on the record',
    body: 'Paste an error, a stack trace, or what went wrong. The explorer places it on the system, and your agent follows it hop by hop with evidence until it reaches the cause, then commits the record with the fix.',
    points: [
      'Find the root cause, or fix it, in one click',
      'Every hop backed by code and evidence',
      'Records stay in the repo, checked like the model',
    ],
    img: '/img/v1/triage.png',
    alt: 'The Triage tab with a stack trace pasted and a menu to send it to the agent',
    to: '/docs/triage',
  },
  {
    id: 'overview',
    group: 'Explore',
    label: 'Overview',
    title: 'Start from what people do',
    body: 'Open any repository and see what the system is for: its journeys as cards, most important first, beside a C4 map you open one level at a time. Hover a journey to light up its path.',
    points: [
      'Context, containers, and components, one level at a time',
      'Shapes and colors say what each box is',
      'Click through from any box to its code',
    ],
    img: '/img/v1/overview.png',
    alt: 'The Overview tab: journeys grouped by section beside the system context map',
    to: '/docs/explorer',
  },
  {
    id: 'journeys',
    group: 'Explore',
    label: 'Journeys',
    title: 'Read a journey like a story',
    body: 'Every journey plays step by step on the system map, or as lanes in a sequence: what each step does, the message it sends, the records it writes, and the code behind it.',
    points: [
      'Grouped into sections, critical ones first',
      'A step that breaks the model is drawn in red',
      'Map or Sequence, and the explorer remembers',
    ],
    img: '/img/v1/journeys.png',
    alt: 'The Journeys tab playing a checkout journey step by step on the map',
    to: '/docs/explorer',
  },
];

const capabilities = [
  {
    title: 'Ten MCP tools',
    body: 'context, show, find, edit, check, seal, init, paths, plan, and triage. Each one is also a CLI command of the same name.',
    to: '/docs/agents',
  },
  {
    title: 'A PR check that leads with a verdict',
    body: 'What blocks the merge and how to fix it, what to check, who to involve, and which journeys it touches, in other repos too.',
    to: '/docs/reviewers',
  },
  {
    title: 'Diff any two branches',
    body: "Build's Diff tab reads both sides from git: new and changed boxes marked on the map, removed ones as ghosts.",
    to: '/docs/explorer',
  },
  {
    title: 'Init that reads your stack',
    body: 'Workspaces, manifests, and imports in TypeScript, Python, Go, Java, and Rust, and routes in the frameworks you use.',
    to: '/docs/getting-started',
  },
  {
    title: 'Data with lineage',
    body: 'Classified fields, sources read from SQL, Prisma, OpenAPI, and Protobuf, and rules for where personal data may go.',
    to: '/docs/model',
  },
  {
    title: 'Across every repo',
    body: 'Reference another repo’s elements by namespace, pin them in a lockfile, and see the whole landscape at once.',
    to: '/docs/landscape',
  },
];

const stacks = [
  'TypeScript',
  'Python',
  'Go',
  'Java',
  'Rust',
  'Next.js',
  'Spring',
  'Rails',
  'Laravel',
  'Django',
  'axum',
  'actix-web',
];

const agents = ['Claude Code', 'Cursor', 'Codex', 'Any MCP client'];

const trust = [
  {
    stat: 'No LLM',
    label: 'in the engine',
    body: '@archdoc/core is deterministic and makes no network calls. Same question, same answer, in your editor, your browser, and CI.',
  },
  {
    stat: '74%',
    label: 'leaner skill',
    body: 'The agent skill loads only the everyday workflow. Init, triage, and plan are read when a task needs them, from 8,571 words to 2,219.',
  },
  {
    stat: 'Local',
    label: 'by default',
    body: 'The explorer answers only on your own machine, and your own agent does the reasoning. The model never leaves the repo.',
  },
  {
    stat: 'Signed',
    label: 'releases',
    body: 'Published to npm with trusted publishing, every GitHub Action pinned by commit, and integrations pinned to the CLI released with them.',
  },
];

const quickStart = `# In Claude Code
/plugin marketplace add ArchDoc/archdoc
/plugin install archdoc@archdoc

# Anywhere, with Node.js 22.12 or later
npx -y @archdoc/cli init    # start a model in this repository
npx -y @archdoc/cli view    # open it in the explorer`;

const modelExample = `# .archdoc/archdoc.yaml
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

journeys:
  book-a-ride:
    actor: passenger
    goal: Get a ride to a destination
    importance: critical
    steps:
      - { from: passenger, to: mobile-app, action: Enters destination }
      - { from: mobile-app, to: api-gateway, action: POST /trips }`;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Window({src, alt, className}: {src: string; alt: string; className?: string}) {
  return (
    <div className={clsx(styles.window, className)}>
      <div className={styles.windowBar} aria-hidden="true">
        <span />
        <span />
        <span />
        <em>localhost · archdoc view</em>
      </div>
      <img src={useBaseUrl(src)} alt={alt} loading="lazy" />
    </div>
  );
}

function CopyInstall() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.install}
      onClick={() => {
        navigator.clipboard?.writeText(install).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          },
          () => undefined,
        );
      }}
      aria-label={`Copy ${install}`}>
      <span className={styles.prompt}>&gt;</span>
      <code>{install}</code>
      <span className={styles.copy}>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={clsx('container', styles.heroInner)}>
        <Link className={styles.badge} to="/docs/">
          <span className={styles.badgeTag}>1.0</span>
          Plan, Triage, and Diff, in one explorer your agent shares
          <span aria-hidden="true"> →</span>
        </Link>
        <h1 className={styles.headline}>
          Architecture your AI agents can read,
          <span className={styles.headlineAccent}> and your PRs can't quietly break.</span>
        </h1>
        <p className={styles.lede}>
          ArchDoc keeps a model of your system next to the code, owned by the
          people who build it. Your coding agent reads it before every edit and
          checks its work against it after. You see the change on a map before
          it merges.
        </p>
        <div className={styles.ctas}>
          <Link className={clsx(styles.btn, styles.btnPrimary)} to="/docs/getting-started">
            Get started
          </Link>
          <Link className={clsx(styles.btn, styles.btnGhost)} to="pathname:///demo/">
            Open the live demo
          </Link>
          <Link className={clsx(styles.btn, styles.btnGhost)} href={repo}>
            GitHub
          </Link>
        </div>
        <CopyInstall />
        <p className={styles.meta}>Open source · MIT · Works with Claude Code, Cursor, Codex, and any MCP client</p>
      </div>
      <div className={clsx('container', styles.heroShot)}>
        <Window
          src="/img/v1/plan.png"
          alt="The ArchDoc explorer's Plan tab: a change proposed on the system map while the agent asks a design question"
        />
      </div>
    </header>
  );
}

function Strip() {
  return (
    <section className={styles.strip}>
      <div className={clsx('container', styles.stripInner)}>
        <div>
          <p className={styles.stripLabel}>Reads the code you already have</p>
          <ul className={styles.chips}>
            {stacks.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.stripLabel}>Works with your agent</p>
          <ul className={styles.chips}>
            {agents.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.kicker}>Why</p>
        <h2 className={styles.h2}>Agents write code faster than anyone can follow the architecture.</h2>
        <div className={styles.problemGrid}>
          <div>
            <h3>Diagrams drift</h3>
            <p>A wiki page is right the day it's drawn. After it's wrong a few times, nobody trusts it, and nobody updates it.</p>
          </div>
          <div>
            <h3>Generated summaries have no owner</h3>
            <p>A summary says what the code does today. Nobody agreed to it, so it can't say what the code is supposed to do.</p>
          </div>
          <div>
            <h3>Reviews miss the blast radius</h3>
            <p>A diff shows lines. It doesn't show the critical journey a change sits on, or the email field now leaving the building.</p>
          </div>
        </div>
        <p className={styles.answer}>
          ArchDoc's answer: a small model people own, kept in the repository,
          read by agents, and checked against the code on every change.
        </p>
      </div>
    </section>
  );
}

function Loop() {
  return (
    <section className={clsx(styles.section, styles.dark)}>
      <div className="container">
        <p className={styles.kicker}>The everyday loop</p>
        <h2 className={styles.h2}>Every task: context, edit, check, seal.</h2>
        <p className={styles.intro}>
          Install the plugin and your agent follows the same four steps on
          every change, through MCP or the CLI. It's the fastest way for it to
          find where code lives, and the reason the model stays true.
        </p>
        <ol className={styles.loop}>
          {loop.map((s) => (
            <li key={s.name} className={styles.loopStep}>
              <span className={styles.loopN}>{s.n}</span>
              <h3>{s.name}</h3>
              <code>{s.cmd}</code>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The comment's first blocking issue: its headline, title, message, and fix. */
function firstBlock(md: string) {
  const lines = md.split('\n');
  const headline = (lines.find((l) => l.startsWith('⛔')) ?? '').replace(/\*\*/g, '');
  const quote = lines
    .slice(lines.findIndex((l) => l.startsWith('> [!CAUTION]')) + 1)
    .filter((_, i, all) => all.slice(0, i + 1).every((l) => l.startsWith('> ')))
    .map((l) => l.slice(2));
  const [title = '', message = '', fix = ''] = quote;
  return {
    headline,
    title: title.replace(/\*\*/g, ''),
    message,
    fix: fix.replace(/ · `[^`]+`$/, '').replace(/^To fix: /, ''),
  };
}

function Story() {
  const block = firstBlock(comment);
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.kicker}>Thirty seconds, real output</p>
        <h2 className={styles.h2}>What your agent knows before it edits, and what the PR gets after.</h2>
        <p className={styles.intro}>
          A shop's agent is asked to send each order to an analytics tool. Both
          panels are real output from the CLI on a small repository.
        </p>
        <div className={styles.storyGrid}>
          <div className={styles.storyCard}>
            <div className={styles.storyHead}>
              <span className={styles.step}>Before it edits</span>
              <code>archdoc_context</code>
            </div>
            <CodeBlock className={styles.brief}>{brief.trim()}</CodeBlock>
          </div>
          <div className={styles.storyCard}>
            <div className={styles.storyHead}>
              <span className={styles.step}>Before it merges</span>
              <code>archdoc check --base main</code>
            </div>
            <div className={styles.comment}>
              <p className={styles.verdict}>{block.headline}</p>
              <div className={styles.caution}>
                <strong>{block.title}</strong>
                <p>{block.message}</p>
                <p>
                  <em>To fix:</em> {block.fix}
                </p>
              </div>
            </div>
            <p className={styles.storyFoot}>
              The agent sent the whole order anyway, email included. The PR
              gets one comment, and it blocks.{' '}
              <Link to="pathname:///demo/#changes">Open this change in the explorer →</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <section className={clsx(styles.section, styles.alt)}>
      <div className="container">
        <p className={styles.kicker}>The explorer</p>
        <h2 className={styles.h2}>Explore the system. Build the change. One map, shared with your agent.</h2>
        <p className={styles.intro}>
          <code>archdoc view</code> opens it in your browser. Explore shows the
          system as the model describes it; Build is where you plan a change,
          triage a bug, and diff two branches, with your agent on the other end.
        </p>
        <div className={styles.tabs} role="tablist">
          {(['Build', 'Explore'] as const).map((g) => (
            <div key={g} className={styles.tabGroup}>
              <span className={styles.tabGroupLabel}>{g}</span>
              {tabs
                .filter((t) => t.group === g)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={t.id === active}
                    className={clsx(styles.tab, t.id === active && styles.tabActive)}
                    onClick={() => setActive(t.id)}>
                    {t.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <div className={styles.showcase}>
          <div className={styles.showcaseText}>
            <h3>{tab.title}</h3>
            <p>{tab.body}</p>
            <ul className={styles.ticks}>
              {tab.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Link to={tab.to}>Read about {tab.label} →</Link>
          </div>
          <Window key={tab.id} src={tab.img} alt={tab.alt} className={styles.showcaseShot} />
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.kicker}>What's in 1.0</p>
        <h2 className={styles.h2}>Everything a change touches, answered the same way everywhere.</h2>
        <div className={styles.capGrid}>
          {capabilities.map((c) => (
            <Link key={c.title} to={c.to} className={styles.cap}>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Model() {
  return (
    <section className={clsx(styles.section, styles.alt)}>
      <div className="container">
        <div className={styles.split}>
          <div>
            <p className={styles.kicker}>The model</p>
            <h2 className={styles.h2}>Plain YAML in <code>.archdoc/</code>, versioned with the code.</h2>
            <dl className={styles.parts}>
              <dt>Actors</dt>
              <dd>Who uses the system: people, roles, partner organizations, automated systems, and AI agents.</dd>
              <dt>Elements</dt>
              <dd>What it's made of, nested from systems to components, each mapped to the code that implements it.</dd>
              <dt>Journeys</dt>
              <dd>How actors reach their goals, step by step, checked against the relationships the model declares.</dd>
              <dt>Data</dt>
              <dd>What's sent and stored, with classified fields and lineage from one record to the next.</dd>
            </dl>
            <Link to="/docs/model">Read about the model →</Link>
          </div>
          <div>
            <CodeBlock language="yaml">{modelExample}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.kicker}>Built to be trusted</p>
        <h2 className={styles.h2}>Your agent reasons. ArchDoc keeps the facts straight.</h2>
        <div className={styles.trustGrid}>
          {trust.map((t) => (
            <div key={t.stat} className={styles.trust}>
              <p className={styles.stat}>{t.stat}</p>
              <p className={styles.statLabel}>{t.label}</p>
              <p>{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Start() {
  return (
    <section className={clsx(styles.section, styles.dark, styles.cta)}>
      <div className="container">
        <div className={styles.split}>
          <div>
            <h2 className={styles.h2}>Model your repository in one session.</h2>
            <p className={styles.ctaText}>
              Install the plugin, open a repository, and ask your agent to start
              an architecture model. It runs <code>archdoc init</code>, shapes
              and describes what it finds, and checks the result until the model
              is done. From then on, every task starts from it.
            </p>
            <div className={styles.ctas}>
              <Link className={clsx(styles.btn, styles.btnPrimary)} to="/docs/getting-started">
                Get started
              </Link>
              <Link className={clsx(styles.btn, styles.btnGhost)} to="/docs/agents">
                Cursor, Codex, and other agents
              </Link>
            </div>
          </div>
          <div>
            <CodeBlock language="bash">{quickStart}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Architecture your AI agents can read, and your PRs can't quietly break"
      description="ArchDoc keeps a human-owned architecture model next to the code. Your coding agent reads it before every edit, every pull request is checked against it, and you plan changes and triage bugs with your agent on one map.">
      <Hero />
      <main>
        <Strip />
        <Problem />
        <Loop />
        <Showcase />
        <Story />
        <Capabilities />
        <Model />
        <Trust />
        <Start />
      </main>
    </Layout>
  );
}
