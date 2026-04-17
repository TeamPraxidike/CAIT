# CI/CD Pipeline Guide

## Architecture Overview

```
PR opened/updated
       │
       ▼
┌─────────────────────────────────┐
│  Stage 1: Unit & Integration    │  GH Actions runner (ubuntu-latest)
│  ─────────────────────────────  │
│  • Spin up Supabase subset      │  docker-compose.ci.yml
│  • Run Prisma migrations        │  (Postgres + Auth + Storage + Kong)
│  • Run Vitest                   │
│  • Tear down containers         │
│                                 │
│  Concurrency: per-PR,           │
│  cancel-in-progress             │
│  Timeout: 10 minutes            │
└───────────────┬─────────────────┘
                │ pass
                ▼
┌─────────────────────────────────┐
│  Stage 2: Staging E2E           │  GH Actions runner → Hetzner VPS
│  ─────────────────────────────  │
│  • Force-push PR code to        │
│    `staging` branch             │
│  • Trigger Coolify deploy       │  Coolify API on staging VPS
│  • Poll health endpoint         │
│  • SSH: wipe + reseed DB        │
│  • Run Playwright (Chromium)    │  Against STAGING_URL
│  • Upload test report artifact  │
│                                 │
│  Concurrency: global queue,     │
│  single staging instance        │
│  Timeout: 15 minutes            │
└───────────────┬─────────────────┘
                │ pass
                ▼
┌─────────────────────────────────┐
│  PR is mergeable                │  Branch protection enforced
│  ─────────────────────────────  │
│  Developer merges to main       │
│  Coolify production auto-deploys│  Existing setup, unchanged
└─────────────────────────────────┘
```

---

## Setup Checklist

Before the pipeline works, you need to do these things ONCE.

### 1. GitHub Repository

**Branch protection on `main`:**

Go to Settings → Branches → Add rule for `main`.

- Enable "Require status checks to pass before merging"
- Add required checks: `Unit & Integration Tests` and `Staging E2E`
- Enable "Require branches to be up to date before merging"
- Optionally: require PR reviews (orthogonal to CI but good practice)

**Create the `staging` branch:**

```bash
git checkout main
git checkout -b staging
git push origin staging
```

This branch is never worked on directly. The CI pipeline force-pushes PR code to it
as a deployment mechanism. It exists solely as a Coolify deploy target.

### 2. GitHub Secrets

Go to Settings → Secrets and variables → Actions → New repository secret.

| Secret | What it is | How to get it |
|--------|-----------|---------------|
| `STAGING_COOLIFY_API_TOKEN` | Coolify API bearer token | Coolify UI → Settings → API → Generate Token. Use deploy-only scope if available. |
| `STAGING_COOLIFY_APP_UUID` | UUID of staging app in Coolify | Coolify UI → Application → Settings → General. It's in the URL or shown as Application UUID. |
| `STAGING_COOLIFY_BASE_URL` | Coolify instance URL | e.g. `https://coolify.staging.yourdomain.com`. Must be HTTPS. |
| `STAGING_URL` | Public staging app URL | e.g. `https://staging.yourdomain.com`. This is what Playwright hits. |
| `STAGING_SUPABASE_URL` | Staging Supabase API URL | The Kong gateway URL on staging. e.g. `https://staging.yourdomain.com/supabase` or a separate subdomain. |
| `STAGING_SERVICE_ROLE_KEY` | Supabase service_role JWT | From your staging Supabase `.env`. The service_role key has admin access — treat it like a root password. |
| `STAGING_SSH_HOST` | Staging VPS IP or hostname | Your Hetzner VPS IP. |
| `STAGING_SSH_USER` | SSH username | e.g. `deploy` or `root` (prefer a non-root deploy user). |
| `STAGING_SSH_KEY` | SSH private key | See SSH setup below. |

### 3. SSH Key Setup

Generate a dedicated key pair for CI. Don't reuse your personal key.

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-ci" -f ./ci_staging_key -N ""

# Copy the public key to the staging VPS
ssh-copy-id -i ./ci_staging_key.pub deploy@your-staging-vps-ip

# The PRIVATE key (ci_staging_key, NOT .pub) goes into GitHub Secrets
# as STAGING_SSH_KEY. Copy the entire contents including the
# -----BEGIN OPENSSH PRIVATE KEY----- header.
cat ./ci_staging_key
# → paste this as the STAGING_SSH_KEY secret

# Delete both files from your local machine after setup
rm ci_staging_key ci_staging_key.pub
```

### 4. Coolify Staging Application

In the Coolify UI on your staging VPS:

1. Create a new application pointing at your GitHub repo
2. Set the branch to `staging` (the deployment target branch)
3. **Disable automatic deploys** — the CI pipeline triggers deploys via API,
   you don't want Coolify also auto-deploying on every push to `staging`
4. Configure environment variables (same as production, different values)
5. Note the Application UUID (shown in Settings or the URL)
6. Ensure the API is enabled: Settings → API → Enable API

### 5. Staging Health Endpoint

Your SvelteKit app needs a health endpoint that the CI pipeline can poll.
Create one if you don't have it:

```typescript
// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  // Optionally add a DB ping here to verify full readiness
  return json({ status: 'ok' });
};
```

The workflow polls this at `${STAGING_URL}/api/health`. Adjust the path in
the workflow if your endpoint is elsewhere.

### 6. Docker Compose CI File

The provided `docker-compose.ci.yml` is a template. You MUST adapt it:

1. **Image versions**: Match them to what you run in production. If production
   uses `supabase/postgres:15.6.1.143`, CI should use the same. Mismatched
   versions can cause migration compatibility issues.

2. **Kong config**: You need a `volumes/api/kong.yml` file that defines the
   API gateway routes. Copy this from your existing Supabase setup and strip
   it to only the auth and storage routes.

3. **GoTrue config**: The `GOTRUE_DB_DATABASE_URL` uses `supabase_auth_admin`
   as the role. This is the default Supabase setup — if yours differs, adjust.

4. **Storage config**: Similarly, the `DATABASE_URL` uses
   `supabase_storage_admin`. Match your production setup.

5. **JWT secret**: The hardcoded `super-secret-jwt-token-with-at-least-32-characters-long`
   is the standard Supabase dev JWT secret. The ANON_KEY and SERVICE_ROLE_KEY
   in the workflow are derived from this. If you change the secret, you must
   regenerate the JWTs. Use https://supabase.com/docs/guides/self-hosting.

### 7. Playwright Configuration

Your `playwright.config.ts` should read `BASE_URL` from the environment:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',  // or wherever your E2E tests live
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // In CI, retries help with flaky network-dependent tests.
  // Locally, you want 0 retries so failures are obvious.
  retries: process.env.CI ? 1 : 0,
  // Don't start a dev server — in staging E2E, the app is already deployed.
  // For local development, you might want webServer config here instead.
});
```

### 8. Staging Reset Script

Edit `scripts/reset-staging-db.sh`:

1. Set `DB_CONTAINER_NAME` to match your actual staging Postgres container name.
   SSH into the VPS and run `docker ps` to find it.
2. Uncomment ONE of the seed strategies (A, B, or C) and configure it.
3. If your E2E tests create auth users, uncomment the `TRUNCATE auth.users` line.
4. Make the script executable: `chmod +x scripts/reset-staging-db.sh`

---

## Design Decisions and Rationale

### Why two separate jobs instead of two workflows?

Jobs within a single workflow can share the `needs` dependency graph. If Stage 1
fails, Stage 2 is automatically skipped — no extra logic needed. Two separate
workflows would require workflow_run triggers, which add complexity and make the
dependency less visible in the GitHub UI.

### Why force-push to a `staging` branch?

Coolify applications are bound to a single branch. We can't dynamically tell it
"deploy this arbitrary PR branch." The `staging` branch acts as a deployment
buffer: the CI pipeline writes the desired code to it, then tells Coolify to
deploy. The concurrency lock ensures only one job writes to `staging` at a time,
so there's no race condition.

Alternative considered: Using the Coolify API to update the application's branch
setting, then deploy. This is more brittle because it requires two API calls and
leaves the application in a potentially inconsistent state if the workflow is
canceled between calls.

### Why cancel-in-progress for tests but queue for E2E?

Tests are cheap, fast, and stateless. If you push new code, the old test run is
worthless — cancel it immediately and run the new one. E2E is expensive, stateful
(it deploys and reseeds), and uses a shared resource (the staging VPS). Canceling
a deploy midway could leave staging in a broken state. Queuing is safer.

### Why Chromium only for E2E?

Cross-browser bugs in a SvelteKit app are rare. The rendering layer (Svelte
compiled output) is well-tested by the framework itself. The things E2E catches —
API integration bugs, auth flow issues, deployment misconfigurations — are
browser-independent. Running Firefox and WebKit triples your E2E time for
negligible coverage gain. If you need cross-browser testing, do it periodically
in a separate workflow, not on every PR.

### Why SSH for database reset instead of exposing the DB port?

The staging Postgres should not be reachable from the internet. Period. Even
with strong passwords and SSL, an exposed database port is an unnecessary attack
surface. SSH adds one layer of indirection but keeps the database behind the
VPS firewall.

### Why tmpfs for CI Postgres?

GitHub Actions runners have decent CPUs but the disk I/O is mediocre (they're
shared infrastructure). Postgres on tmpfs runs entirely in memory, which makes
migrations and write-heavy tests significantly faster. The data doesn't need to
survive the CI run, so there's no downside.

---

## Using the Supabase Service Role Client in Playwright Tests

For per-test data setup and cleanup, create a helper:

```typescript
// e2e/helpers/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

Usage in a test:

```typescript
// e2e/user-profile.spec.ts
import { test, expect } from '@playwright/test';
import { createAdminClient } from './helpers/supabase-admin';

test.describe('User Profile', () => {
  let testUserId: string;

  test.beforeEach(async () => {
    const admin = createAdminClient();

    // Create a test user with a unique email to avoid collisions
    // if running tests in parallel (see note below)
    const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: 'test-password-123',
      email_confirm: true,
    });

    if (error) throw error;
    testUserId = data.user.id;
  });

  test.afterEach(async () => {
    // Cleanup: best-effort, not critical (global wipe handles leftovers)
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(testUserId);
  });

  test('should display user email on profile page', async ({ page }) => {
    // ... test logic using the created user
  });
});
```

**Parallel test workers**: If you run Playwright with `workers: 1` (serial), you
don't need to worry about data collisions. If you want parallelism, use unique
identifiers per test (timestamps + random strings) as shown above. At your
current scale, serial is fine and simpler.

---

## Troubleshooting

### Tests pass locally but fail in CI

**First check: timing.** CI runners are slower than your local machine.
Add explicit waits or increase timeouts for network-dependent operations.

**Second check: environment variables.** Print them (masked) at the start
of the test step. Missing or incorrect env vars are the #1 cause of
"works locally, fails in CI."

### Exit code 137 in the test job

That's OOM. The Docker containers + your app + Vitest exceeded the runner's
7GB RAM. Options:

1. Remove imgproxy if you're not testing image transforms (saves ~300MB)
2. Reduce Postgres `shared_buffers` (add `-c shared_buffers=128MB` to the db command)
3. Run fewer Vitest workers: `npx vitest run --pool-options.threads.maxThreads=2`
4. Switch to a larger runner (GitHub offers 16GB runners, costs more)

### Coolify deploy times out

If the 4-minute health poll isn't enough:

1. SSH into the VPS and check `docker ps` — is the container actually starting?
2. Check Coolify logs for build errors
3. Increase the poll duration in the workflow (but investigate root cause first)
4. Ensure the health endpoint doesn't depend on slow startup tasks

### Staging database has stale data

This should be impossible if the wipe-then-seed precondition is working.
If it happens:

1. SSH into staging and verify the reset script can run manually
2. Check the GH Actions logs for the "Reset staging database" step
3. Verify the DB_CONTAINER_NAME in the script matches the actual container

### Concurrent staging runs despite the queue

Check that the concurrency group name matches exactly: `staging-e2e`.
If someone created a second workflow file with a different group name,
the lock won't work. There should be exactly one job with `group: staging-e2e`.

---

## What This Pipeline Does NOT Cover (and Why)

**Preview environments per PR**: Tools like Vercel give you a unique URL per
PR. With a single Hetzner VPS running Coolify, this isn't practical. You'd
need either multiple Coolify apps (one per PR, auto-created and destroyed)
or a container orchestrator like Kubernetes. At 10 PRs/month, the complexity
isn't justified.

**Database migration safety checks**: This pipeline doesn't verify that your
Prisma migrations are backwards-compatible or reversible. If a migration
breaks the running app during deployment, you'll see it in staging E2E (good),
but you won't have an automated rollback. Consider adding a step that runs
migrations against a copy of the production schema to catch issues earlier.

**Load testing / performance testing**: Not included. This is a correctness
pipeline. If you need performance baselines, add it as a separate periodic
workflow, not on every PR.

**Notifications**: The pipeline doesn't notify Slack/Discord/email on
failure. GitHub's built-in PR status checks and email notifications are
usually sufficient. If you want more, add a final `if: failure()` step
that posts to a webhook.
