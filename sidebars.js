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
      items: ['agents', 'reviewers', 'explorer', 'landscape'],
    },
  ],
};

module.exports = sidebars;
