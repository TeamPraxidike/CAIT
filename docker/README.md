# Docker: the self-hosted Supabase stack

This folder holds the self-hosted Supabase stack that CAIT runs on, plus the Compose files
for each environment. The stack is the standard set of Supabase services: the database
(Postgres), the auth server (GoTrue), PostgREST, the storage server with minio as the S3
backend, the Kong API gateway, the Studio dashboard, the connection pooler (supavisor), and
a few supporting services.

Docker Compose version 2.21 or newer is required, since the Compose files use the `!override`
tag and merge behavior that older versions handle differently.

## Environment file

The stack reads its configuration from `docker/.env`. The example holds working local
defaults, so copy it and you are ready for local development.

```bash
cp docker/.env.example docker/.env
```

## Compose files

- `docker-compose.yml`: the base stack, used for local development. It defines every service,
  including minio and S3 storage. You normally do not run it by hand. `npm run dev` brings it
  up for you. To run it manually from the repo root:

  ```bash
  docker compose -f docker/docker-compose.yml --env-file docker/.env up -d
  ```

  Note: an older setup layered a separate `docker-compose.s3.yml` on top of the base file.
  That file is gone. minio and S3 storage are now part of the base file.

- `docker-compose.test.yml`: the local test override. It runs as a separate Compose project
  named `cait-test`, layered on the base file. It overrides only the container names and the
  data mounts, so the test stack keeps its own data under `docker/volumes-test`. It reuses the
  dev stack's host ports, so it must never run at the same time as the dev stack. The test
  scripts (`scripts/run-integration.sh`, `scripts/run-e2e.sh`) use it and enforce this with a
  guard.

- `docker-compose.prod.yml`: the production stack. This is what the production server runs,
  deployed as a Coolify application. It uses the same services as the base file, tuned for
  production (S3 storage, the pooler exposed for the app, SSO, and so on).

- `../cicd/docker-compose.ci.yml`: the CI override (kept next to the other CI files). It runs
  the database on tmpfs so CI needs no cleanup. See the CI/CD article on YouTrack for details.

## Ports (local)

| Service | Local address |
|---|---|
| Kong (Supabase API gateway) | http://localhost:8000 |
| Studio (Supabase dashboard) | http://localhost:3000 |
| Postgres pooler (transaction) | localhost:6543 |
| Postgres pooler (session / direct) | localhost:5432 |

## More

These guides live on YouTrack:

- Local development (full setup, ports, and common issues): <PLACEHOLDER - YouTrack local dev article>
- CI/CD and tests (how these files are used in the pipeline): https://praxidike.youtrack.cloud/articles/CAI-A-58/CI-CD-Tests
