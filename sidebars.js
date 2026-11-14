// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    'getting-started',
    'model',
    {
      type: 'category',
      label: 'Surfaces',
      collapsed: false,
      items: ['agents', 'explorer', 'plan', 'triage'],
    },
    {
      type: 'category',
      label: 'Experimental',
      collapsed: true,
      items: ['reviewers', 'landscape'],
    },
  ],
};

module.exports = sidebars;
