# Rain Canvas Studio

An interactive rainfall pattern studio for exploring, comparing, and documenting storm distributions used in hydrologic and hydraulic modeling.

This project provides a browser-based workspace for browsing a large library of rainfall patterns, reviewing their metadata and documentation, and supporting storm selection workflows relevant to SWMM, InfoDrainage, InfoWorks, and related drainage modeling tools.

---

## Overview

Rain Canvas Studio is a TypeScript/React application built for rainfall pattern exploration and reference. It appears to function as a pattern catalog and studio environment, with a substantial data and documentation layer reflected by the `public` assets, a dedicated `supabase` folder, and recent commits such as “Added 38 patterns across tiers,” “Update API docs for 265 patterns,” and “Add 7 Canadian patterns.” 

The repository currently uses the default Lovable-generated README, so replacing it with project-specific documentation will make the purpose of the app much clearer for users and contributors.

---

## Features

- Interactive web application for rainfall-pattern browsing and exploration.
- Large pattern library, with repository history indicating at least **265 documented patterns**.
- Multi-tier pattern organization, suggested by recent commits referencing tier-based additions.
- Support for regional expansion, including **Canadian patterns** added in recent updates.
- Public documentation assets served from the `public/` directory.
- Frontend application source in `src/`.
- Backend/data integration scaffolding in `supabase/`.
- Modern component system based on React, TypeScript, Tailwind CSS, and shadcn/ui.

---

## Repository structure

```text
rain-canvas-studio/
├── public/          # Public assets and documentation
├── src/             # Frontend application source
├── supabase/        # Backend/data integration resources
├── HANDOVER.md      # Project handover and implementation notes
├── README.md        # Repository documentation
├── package.json     # Dependencies and scripts
├── vite.config.ts   # Vite configuration
├── tailwind.config.ts
├── components.json
└── index.html
```

This structure suggests a frontend-first application with supporting content/data infrastructure rather than a simple static site.

---

## Tech stack

The current repository README and file structure indicate the project is built with:

- **Vite**
- **React**
- **TypeScript**
- **shadcn/ui**
- **Tailwind CSS**

GitHub also reports the repository is **99.8% TypeScript**, reinforcing that the application logic is almost entirely TypeScript-based.

---

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/SWMMEnablement/rain-canvas-studio.git
cd rain-canvas-studio
npm install
npm run dev
```

This starts the local development server with live reload using the Vite-based workflow described in the existing README template.

---

## Purpose

This repository appears intended to support hydrologic design workflows by making rainfall patterns easier to inspect, compare, and use. In practice, that can help with:

- Reviewing available temporal distributions.
- Comparing patterns by region or tier.
- Referencing pattern documentation.
- Supporting rainfall selection for stormwater and drainage modeling studies.
- Organizing a reusable rainfall library for engineering use.

---

## Data and content

The repository history suggests the project is not just a UI shell; it also includes a significant curated pattern dataset and associated docs. Commits referencing **265 patterns**, additional tiered patterns, and region-specific additions imply that the application’s value comes from both the interface and the underlying rainfall library.

The presence of a `supabase/` directory also suggests that some part of the application may use hosted data, metadata, or content-management workflows.

---

## Documentation

The repository includes a `HANDOVER.md` file in the root, which likely contains deeper implementation details, architecture notes, and maintenance guidance. That document should be the first stop for developers extending the app or updating the rainfall library.

---

## Suggested use cases

Rain Canvas Studio is well suited for:

- Stormwater modelers preparing design storms.
- Engineers comparing rainfall distributions across standards or regions.
- Teams maintaining a shared rainfall-pattern library.
- Educational use for explaining temporal rainfall distributions.
- Toolchains associated with SWMM-enabled drainage workflows.

---

## Status

The repository is active, with **833 commits** shown on the main branch and recent pattern/documentation updates. The current README should be treated as a placeholder and replaced with this project-specific version.

---

## Contributing

1. Review the project structure and any notes in `HANDOVER.md`.
2. Install dependencies and run the app locally.
3. Make updates in `src/`, data/content assets, or `supabase/` resources as needed.
4. Test changes locally before committing.
5. Open a pull request with a clear description of the pattern, UI, or documentation updates.

---

## License

Add the project’s license here if one is intended for the repository.

---

## Maintainers

Developed within the **SWMMEnablement** organization, with contributions visible from `dickinsonre` and `lovable-dev[bot]`.
