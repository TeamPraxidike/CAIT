#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=test

# early exit if 4173 is occupied
# TODO: this could be better, vite will try to use the next available, you can also try to follow that logic
if lsof -i :4173 &>/dev/null; then
    echo "ERROR: Port 4173 is already in use"
    lsof -i :4173
    exit 1
fi

SERVER_PID=""

# ---------------------------------------------------------------------------
# Determine compose command based on environment
# ---------------------------------------------------------------------------
if [ -n "${CI:-}" ]; then
  echo "Starting Supabase services for CI integration tests..."
  COMPOSE="docker compose -f docker/docker-compose.yml -f cicd/docker-compose.ci.yml --env-file cicd/.env.ci"
else
  echo "Starting Supabase services for local integration tests..."
  COMPOSE="docker compose -f docker/docker-compose.yml --env-file docker/.env"
fi

cleanup() {
  echo "Cleaning up..."
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
  PORT_PID=$(lsof -t -i :4173 2>/dev/null || true)
  [ -n "$PORT_PID" ] && kill $PORT_PID 2>/dev/null || true
  $COMPOSE down -v
}
trap cleanup EXIT

if [ -n "${CI:-}" ]; then
  $COMPOSE up -d db analytics supavisor kong auth rest storage imgproxy minio minio-createbucket
else
  $COMPOSE up -d
fi

# ---------------------------------------------------------------------------
# Wait for services to be ready
# ---------------------------------------------------------------------------
wait_healthy() {
  local service=$1
  echo "Waiting for $service to be healthy..."
  for i in $(seq 1 60); do
    STATUS=$($COMPOSE ps $service --format '{{.Health}}' 2>/dev/null || echo "unknown")
    [ "$STATUS" = "healthy" ] && echo "$service is healthy." && return 0
    [ "$i" -eq 60 ] && echo "ERROR: $service not healthy (status: $STATUS)" && exit 1
    sleep 2
  done
}

wait_healthy db
wait_healthy analytics
wait_healthy supavisor
wait_healthy kong

# ---------------------------------------------------------------------------
# Set env vars for the SvelteKit app
# ---------------------------------------------------------------------------
if [ -n "${CI:-}" ]; then
  set -a && source cicd/.env.app.ci && set +a
else
  set -a && source .env && set +a

  # TODO: split local dev and local test environments at some point
  echo "Wiping database..."

  # skip prisma migrations, otherwise it will try to reapply all of them and crash
  # because the tables/columns/constraints already exist, we're just removing rows
  docker exec supabase-db psql -U supabase_admin -d postgres -c "
    DO \$\$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations')
      LOOP
        EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', r.tablename);
      END LOOP;
      TRUNCATE auth.users CASCADE;
    END
    \$\$;
  "
fi

# ---------------------------------------------------------------------------
# Build and start preview server
# ---------------------------------------------------------------------------
echo "Building app..."
npm run build

echo "Starting preview server..."
npm run start:preview &
SERVER_PID=$!

for i in $(seq 1 15); do
  curl -sf http://localhost:4173/ > /dev/null 2>&1 && break
  [ "$i" -eq 15 ] && echo "ERROR: Preview server not ready" && exit 1
  sleep 2
done
echo "Preview server is ready."

# ---------------------------------------------------------------------------
# Run integration tests
# ---------------------------------------------------------------------------
echo "Running integration tests..."
npx vitest run -c ./vitest.config.integration.ts
