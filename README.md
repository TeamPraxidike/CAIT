<p align="center">
  <img src="static/images/home/caitText.png" alt="CAIT" width="380">
</p>

<p align="center">
  <a href="https://github.com/TeamPraxidike/CAIT/actions/workflows/ci.yml">
    <img src="https://github.com/TeamPraxidike/CAIT/actions/workflows/ci.yml/badge.svg?event=pull_request" alt="CI Pipeline">
  </a>
  <img src="https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

# CAIT - Community Archive for Integrated Teaching

CAIT (pronounced "kite") is a community platform for teachers and lecturers of AI and machine
learning. Educators use it to publish, share, and discover teaching materials, and to build
"circuits", which are structured learning paths made of connected materials.

## What it does

- Publish and browse teaching materials and circuits.
- Organize materials into courses and structured learning paths.
- User profiles, publication ownership, and a reputation system.
- Sign in through institutional single sign-on (SURF SRAM and Auth0 via SAML).

## Tech stack

- SvelteKit (Node adapter) with TypeScript.
- Prisma with PostgreSQL.
- Self-hosted Supabase for auth, storage, and the database layer.
- Docker Compose for the backing services.

## Local setup

### Prerequisites

- Docker, with Docker Compose 2.21 or newer.
- Node 22 (see `.nvmrc`). 

### Steps

1. Clone the repository.

   ```bash
   git clone git@github.com:TeamPraxidike/CAIT.git
   cd CAIT
   ```

2. Set up the two environment files. There is one at the project root and one in `docker/`.
   Both examples hold working local defaults, so you can copy them and run the app as is. You
   only need to change values if you connect to something other than the local stack.

   ```bash
   cp .env.example .env
   cp docker/.env.example docker/.env
   ```

3. Install dependencies and generate the Prisma client.

   ```bash
   npm run setup
   ```

4. Start the app. This brings up the Supabase stack, waits for it to be healthy, runs the
   migrations and seed scripts, then starts the dev server on http://localhost:5173.

   ```bash
   npm run dev
   ```

### Common commands

| Command | What it does |
|---|---|
| `npm run dev` | Brings up the Supabase stack and runs the app on port 5173. |
| `npm run build` | Builds the SvelteKit app. No database work. |
| `npm run test:unit` | Runs the unit tests (Vitest). No Docker needed. |
| `npm run test:integration` | Brings up a local Supabase subset and runs the integration tests. |
| `npm run test:e2e` | Runs the Playwright end-to-end tests against a local build. |

The tests reuse the dev stack's host ports, so stop `npm run dev` before running them.

---

Notes:
- The team uses [YouTrack](https://praxidike.youtrack.cloud/) for stories, issues, and documentation
- The `docker/` folder has its own README describing the Compose files.
