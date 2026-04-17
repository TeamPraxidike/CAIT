#!/usr/bin/env bash
# =============================================================================
# reset-staging-db.sh — Wipe and reseed the staging database
# =============================================================================
#
# This script runs on the STAGING VPS via SSH from GitHub Actions.
# It is executed BEFORE every Playwright E2E run.
#
# DESIGN DECISION: This is a precondition, not a postcondition.
#
# We wipe-then-seed at the START of each run rather than cleaning up after.
# Why? Because postconditions are unreliable:
#   - The GH Actions job might be canceled (timeout, manual, concurrency)
#   - The SSH connection might drop
#   - The Playwright process might segfault
#   - The runner might be preempted
#
# If any of that happens, the "after" hook never runs and the next test run
# inherits garbage data. By wiping first, the system is self-healing:
# a failed run leaves mess behind, but the next run doesn't care.
#
# WHAT THIS SCRIPT DOES:
#   1. Finds the app's database container via docker/Coolify
#   2. Truncates all tables in the public schema (CASCADE handles FK order)
#   3. Runs the seed SQL or Prisma seed command
#
# PREREQUISITES ON THE STAGING VPS:
#   - Docker is running and the database container is accessible
#   - The SSH user has permission to run docker commands
#   - The seed file exists at the expected path (see SEED_PATH below)
#
# IMPORTANT: Adjust the container name, database credentials, and seed
# mechanism to match YOUR staging setup. The values below are placeholders.
# =============================================================================

set -euo pipefail

# =============================================================================
# CONFIGURATION — adjust these to match your staging environment
# =============================================================================

# How to identify the Postgres container. Coolify typically names containers
# with a predictable pattern. Run `docker ps` on your staging VPS to find it.
# You can match by name or by image.
DB_CONTAINER_NAME="supabase-db"  # Adjust to your actual container name

DB_USER="postgres"
DB_NAME="postgres"

# Path to the seed file ON THE STAGING VPS. Options:
#   1. A SQL file that Coolify deploys with the app
#   2. A path inside the app container
#   3. Use Prisma seed via the app container
# See the SEED STRATEGY section below.
SEED_SQL_PATH=""  # Set if using raw SQL seed approach

# =============================================================================
# STEP 1: Verify the database container is running
# =============================================================================
echo "=== Staging DB Reset ==="
echo "Checking database container..."

if ! docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER_NAME"; then
    echo "ERROR: Database container '$DB_CONTAINER_NAME' is not running."
    echo "Running containers:"
    docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
    exit 1
fi

echo "Database container is running."

# =============================================================================
# STEP 2: Truncate all tables in the public schema
# =============================================================================
#
# This is more surgical than DROP SCHEMA + recreate because:
#   - It preserves the schema structure (no need to re-run migrations)
#   - It preserves Supabase's internal schemas (auth, storage, extensions)
#   - CASCADE handles foreign key dependencies automatically
#   - It's faster than a full migration reset
#
# We only truncate the `public` schema because that's where Prisma puts
# your application tables. The `auth` and `storage` schemas are managed
# by GoTrue and Storage respectively.
#
# If you also need to wipe auth users and storage objects, uncomment the
# additional truncation lines below.
# =============================================================================
echo "Truncating all tables in public schema..."

docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'EOSQL'
DO $$
DECLARE
    table_name text;
BEGIN
    -- Disable triggers temporarily to avoid FK constraint issues during truncate
    SET session_replication_role = 'replica';

    -- Truncate all tables in the public schema
    FOR table_name IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename != '_prisma_migrations'  -- Preserve migration history
    LOOP
        EXECUTE format('TRUNCATE TABLE public.%I CASCADE', table_name);
        RAISE NOTICE 'Truncated: public.%', table_name;
    END LOOP;

    -- Re-enable triggers
    SET session_replication_role = 'origin';
END
$$;

-- ============================================================================
-- OPTIONAL: Also wipe auth users if your E2E tests need a clean auth state.
-- Uncomment if needed. This deletes ALL users from Supabase Auth.
-- ============================================================================
-- TRUNCATE auth.users CASCADE;

-- ============================================================================
-- OPTIONAL: Also wipe storage objects if your E2E tests upload files.
-- Uncomment if needed.
-- ============================================================================
-- TRUNCATE storage.objects CASCADE;
-- TRUNCATE storage.buckets CASCADE;

EOSQL

echo "All public tables truncated."

# =============================================================================
# STEP 3: Seed the database
# =============================================================================
#
# CHOOSE ONE of the following seed strategies and uncomment it.
# Delete or leave commented the ones you don't use.
#
# ---------------------------------------------------------------------------
# STRATEGY A: Raw SQL seed file on the VPS
# Best if: you have a static seed.sql checked into the repo and deployed
# by Coolify alongside the app.
# ---------------------------------------------------------------------------
# echo "Running SQL seed..."
# docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" \
#     -f /path/to/seed.sql

# ---------------------------------------------------------------------------
# STRATEGY B: Prisma seed via the app container
# Best if: you have a prisma/seed.ts that creates realistic test data.
# Replace APP_CONTAINER_NAME with your actual app container name.
# ---------------------------------------------------------------------------
# APP_CONTAINER_NAME="your-app-container"
# echo "Running Prisma seed..."
# docker exec "$APP_CONTAINER_NAME" npx prisma db seed

# ---------------------------------------------------------------------------
# STRATEGY C: Seed script via SQL passed inline
# Best if: you want the seed data defined right here, no external files.
# Good for small seed datasets. Gets unwieldy for large ones.
# ---------------------------------------------------------------------------
# echo "Running inline seed..."
# docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" <<'EOSQL'
#     INSERT INTO public.roles (id, name) VALUES
#         ('role_admin', 'admin'),
#         ('role_user', 'user');
#     -- Add more seed data here
# EOSQL

echo ""
echo "=== Staging DB Reset Complete ==="
