import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';

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
    body: 'Before it hands the work back, it checks the change against the model: undeclared dependencies, broken rules and journeys, stale paths, and personal data going somewhere new.',
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
  label: string;
  title: string;
  body: string;
  points: string[];
  img: string;
  alt: string;
  to: string;
};

const exploreTabs: Tab[] = [
  {
    id: 'containers',
    label: 'C4 map',
    title: 'Open it one level at a time',
    body: 'Start at the context, then open the system for its containers and datastores, and a container for its components. Every arrow says what it carries and how, and the journeys that matter sit beside the map, most important first.',
    points: [
      'Context, containers, and components, the C4 way',
      'Shapes and colors say what each box is',
      'Click through from any box to its code',
    ],
    img: '/img/v1/containers.png',
    alt: 'The Overview tab at the Containers level: an electricity utility\'s portals, APIs, stream processors, and databases, beside its journeys',
    to: '/docs/explorer',
  },
  {
    id: 'journeys',
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
  {
    id: 'data',
    label: 'Data',
    title: 'See what your system sends and stores',
    body: 'Every record, message, and event, where it lives and what carries it, with sensitive fields classified. Pick an entry for its schema and everything that makes, stores, and reads it.',
    points: [
      'PII, PHI, and PCI fields marked where they travel',
      'Field lineage from one record to the next',
      'Schemas read from SQL, Prisma, OpenAPI, and Protobuf',
    ],
    img: '/img/v1/data.png',
    alt: 'The Data tab: a clinical database with its tables, and the messages that travel between parts, with PHI fields marked',
    to: '/docs/model',
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    title: 'See where it all runs',
    body: 'Each environment as a map: clouds, regions, clusters, namespaces, and managed services, with every container and datastore placed where it is deployed, and the traffic between them.',
    points: [
      'Production, staging, and local side by side',
      'Replicas, technology, and URLs on each deployment',
      'The same elements as the system map, so nothing is drawn twice',
    ],
    img: '/img/v1/infrastructure.png',
    alt: 'The Infrastructure tab: production on AWS with CloudFront, EKS namespaces, RDS, ElastiCache, and SQS',
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
    title: 'Seals that catch drift',
    body: 'Each fact is fingerprinted against its code. When the code moves, ArchDoc says which facts to re-read, so the map never quietly goes stale.',
    to: '/docs/model',
  },
  {
    title: 'Diff any two branches',
    body: "Build's Diff tab reads both sides from git: what your agent's branch changed, with new and changed boxes marked on the map and removed ones as ghosts.",
    to: '/docs/explorer',
  },
  {
    title: 'Init that reads your stack',
    body: 'Workspaces, manifests, and imports in TypeScript, Python, Go, Java, and Rust, and routes in the frameworks you use.',
    to: '/docs/getting-started',
  },
  {
    title: 'Rules for where data may go',
    body: 'Say where classified data may be stored and where it may never go, and every check holds your agents to it.',
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
    stat: 'Yours',
    label: 'plain YAML',
    body: 'The model lives in your repository next to the code, versioned and reviewed like it, and owned by the people who build the system.',
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
        <a className={styles.badge} href="#explore">
          <span className={styles.badgeTag}>1.0</span>
          Explore your system, triage bugs, and plan changes with your agent
          <span aria-hidden="true"> →</span>
        </a>
        <h1 className={styles.headline}>
          Understand your architecture
          <span className={styles.headlineAccent}>while AI builds it.</span>
        </h1>
        <p className={styles.lede}>
          Agents now write code faster than anyone can follow. ArchDoc keeps a
          living map of your system next to the code: your agents read it
          before every edit and keep it true as they go, so you always see
          what your system is, what's changing, and why.
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
          src="/img/v1/overview.png"
          alt="The ArchDoc explorer's Overview: a shop's journeys grouped by section beside its C4 context map"
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
        <h2 className={styles.h2}>Your agents build fast. Your understanding has to keep up.</h2>
        <div className={styles.problemGrid}>
          <div>
            <h3>You lose the picture</h3>
            <p>An agent can touch five services in an afternoon. A week later, nobody on the team can say how the system fits together anymore.</p>
          </div>
          <div>
            <h3>Generated summaries have no owner</h3>
            <p>A summary says what the code does today. Nobody agreed to it, so it can't say what the code is supposed to do.</p>
          </div>
          <div>
            <h3>Diagrams drift</h3>
            <p>A wiki page is right the day it's drawn. After it's wrong a few times, nobody trusts it, and nobody updates it.</p>
          </div>
        </div>
        <p className={styles.answer}>
          ArchDoc's answer: a model people own and agents can read, kept in
          the repository, updated with every change, and always there to explore.
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

function Explore() {
  const [active, setActive] = useState(exploreTabs[0].id);
  const tab = exploreTabs.find((t) => t.id === active) ?? exploreTabs[0];
  return (
    <section id="explore" className={clsx(styles.section, styles.alt)}>
      <div className="container">
        <p className={styles.kicker}>Explore</p>
        <h2 className={styles.h2}>See your whole architecture, one C4 level at a time.</h2>
        <p className={styles.intro}>
          <code>archdoc view</code> opens your system in the browser. Start at
          the C4 context: the system, the people who use it, and what it talks
          to. Open it for its containers, open a container for its components,
          and click through any box to its code. Journeys, data, and
          infrastructure are one tab away.
        </p>
        <div className={styles.tabs} role="tablist" aria-label="Explore">
          <div className={styles.tabGroup}>
            {exploreTabs.map((t) => (
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
            <Link to={tab.to}>Read about the explorer →</Link>
          </div>
          <Window key={tab.id} src={tab.img} alt={tab.alt} className={styles.showcaseShot} />
        </div>
      </div>
    </section>
  );
}

function Triage() {
  return (
    <section id="triage" className={styles.section}>
      <div className="container">
        <div className={clsx(styles.feature, styles.featureFlip)}>
          <div className={styles.showcaseText}>
            <p className={styles.kicker}>Triage</p>
            <h2 className={styles.h2}>Your agent shows you why the bug happened.</h2>
            <p>
              Paste an error, a stack trace, or what went wrong, and send it to
              your agent. It follows the bug through your system hop by hop,
              with evidence at every step, and draws the path on your
              architecture: the step where it went wrong, what it carried, what
              was observed, and what was expected.
            </p>
            <ul className={styles.ticks}>
              <li>The bug's path drawn as a map or a sequence</li>
              <li>The root cause marked, with the code behind it</li>
              <li>Observed and expected, side by side</li>
              <li>A record kept in the repo, with the fix</li>
            </ul>
            <Link to="/docs/triage">Read about Triage →</Link>
          </div>
          <Window
            src="/img/v1/triage.png"
            alt="A Triage record drawn as a sequence: four steps across the agent, MCP, analyzers, and the model editor, with the root cause highlighted at step 3"
            className={styles.showcaseShot}
          />
        </div>
      </div>
    </section>
  );
}

function Plan() {
  return (
    <section id="plan" className={clsx(styles.section, styles.alt)}>
      <div className="container">
        <div className={styles.feature}>
          <div className={styles.showcaseText}>
            <p className={styles.kicker}>Plan</p>
            <h2 className={styles.h2}>Craft the implementation plan with your agent, on the map.</h2>
            <p>
              Skip the long markdown plan. Click where the change belongs and
              say what you want. Your agent checks it against the code and
              answers in turn: the boxes and arrows that carry it out, for you
              to accept or dismiss, and a question with one-tap options
              whenever a design choice is yours to make.
            </p>
            <ul className={styles.ticks}>
              <li>You drive the design; the agent proposes nothing you didn't ask for</li>
              <li>A turn-by-turn conversation, one question at a time</li>
              <li>Mark it ready, and the agent builds it task by task</li>
            </ul>
            <Link to="/docs/plan">Read about Plan →</Link>
          </div>
          <Window
            src="/img/v1/plan.png"
            alt="The Plan tab: a receipt mailer proposed on the map, with the agent asking who sends the email"
            className={styles.showcaseShot}
          />
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
            <h2 className={styles.h2}>Map your system in one session. Keep up with it from then on.</h2>
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
      title="Understand your architecture while AI builds it"
      description="ArchDoc keeps a living architecture map next to the code. Your AI agents read it before every edit and keep it true as they go, so you can explore your system, plan changes, and triage bugs with your agent on one map.">
      <Hero />
      <main>
        <Strip />
        <Problem />
        <Explore />
        <Triage />
        <Plan />
        <Loop />
        <Capabilities />
        <Model />
        <Trust />
        <Start />
      </main>
    </Layout>
  );
}
