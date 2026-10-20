// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const repo = 'https://github.com/ArchDoc/archdoc';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ArchDoc',
  tagline: 'An architecture control plane for AI-assisted development.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://archdoc.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub Pages deployment (`npm run deploy` pushes the build to gh-pages).
  organizationName: 'ArchDoc',
  projectName: 'ArchDoc.github.io',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/ArchDoc/ArchDoc.github.io/edit/main/',
          // The current docs describe v2. The 1.0.0 version holds the v0 viewer
          // and the v1.0 specification, kept as the legacy docs.
          lastVersion: 'current',
          versions: {
            current: {
              label: 'v2',
              path: '',
            },
            '1.0.0': {
              label: 'v0 (legacy)',
              path: 'v0',
              banner: 'unmaintained',
            },
          },
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'ArchDoc blog',
          blogDescription: 'News from the ArchDoc project.',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // The v0 docs used to live at /docs/archdoc-ui and /docs/specification.
        // Keep those links working by sending them to /docs/v0/.
        createRedirects(existingPath) {
          const legacy = /^\/docs\/v0\/(archdoc-ui|specification|category)(\/|$)/;
          if (legacy.test(existingPath)) {
            return [existingPath.replace('/docs/v0/', '/docs/')];
          }
          return undefined;
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/archdoc_social_card.jpg',
      metadata: [
        {
          name: 'description',
          content:
            'ArchDoc keeps a human-owned architecture model next to the code, and answers what a change affects for coding agents, reviewers, and everyone learning the system.',
        },
      ],
      navbar: {
        logo: {
          alt: 'ArchDoc logo',
          src: 'img/archdoc_logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {to: '/docs/getting-started', label: 'Getting started', position: 'left'},
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            href: repo,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/docs/'},
              {label: 'Getting started', to: '/docs/getting-started'},
              {label: 'The model', to: '/docs/model'},
              {label: 'v0 docs (legacy)', to: '/docs/v0/archdoc-ui/'},
            ],
          },
          {
            title: 'Surfaces',
            items: [
              {label: 'For agents', to: '/docs/agents'},
              {label: 'For reviewers', to: '/docs/reviewers'},
              {label: 'Explorer', to: '/docs/explorer'},
              {label: 'Landscape', to: '/docs/landscape'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'GitHub', href: repo},
              {label: 'Issues', href: `${repo}/issues`},
              {label: 'Contributing', href: `${repo}/blob/main/CONTRIBUTING.md`},
              {label: 'Roadmap', href: `${repo}/blob/main/docs/revival/04-roadmap.md`},
              {label: 'Blog', to: '/blog'},
            ],
          },
        ],
        copyright: `ArchDoc is open source under the MIT license. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
