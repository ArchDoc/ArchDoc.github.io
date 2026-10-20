# ArchDoc website

The source of [archdoc.github.io](https://archdoc.github.io), the website and docs for [ArchDoc](https://github.com/ArchDoc/archdoc): an architecture control plane for AI-assisted development. It's built with [Docusaurus 2](https://docusaurus.io/).

## What's where

| Path | What it is |
|---|---|
| `src/pages/index.tsx` | The landing page |
| `docs/` | The current docs, for ArchDoc v2, served at `/docs/` |
| `sidebars.js` | The v2 docs sidebar |
| `versioned_docs/version-1.0.0/` | The v0 docs (the `@archdoc/archdoc-ui` viewer and the v1.0 specification), served at `/docs/v0/` as "v0 (legacy)" |
| `blog/` | Blog posts. The 2023 post describes v0 and is marked as historical |
| `docusaurus.config.js` | Site settings, navbar, footer, doc versions, and redirects from the old v0 URLs |

The docs describe what's in the [main repository](https://github.com/ArchDoc/archdoc). When a command, MCP tool, or model field changes there, update the page here that mentions it. The v0 docs are frozen; change them only to fix links.

## Run it locally

You need Node.js 16.14 or later.

```bash
npm ci
npm start        # a dev server that reloads as you edit
npm run build    # the static site, in build/; fails on broken links
npm run serve    # serve the build locally
npm run typecheck
```

## Deploy

`npm run deploy` builds the site and pushes it to the `gh-pages` branch, which GitHub Pages serves.

```bash
GIT_USER=<your GitHub username> npm run deploy
# or, with SSH:
USE_SSH=true npm run deploy
```
