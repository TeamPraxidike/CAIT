#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=test

# ---------------------------------------------------------------------------
# Start Supabase services (skip in CI — the workflow handles this)
# ---------------------------------------------------------------------------
#if [ -z "${CI:-}" ]; then
echo "Starting Supabase services..."
docker compose -f cicd/docker-compose.ci.yml --env-file cicd/.env.ci up -d
#fi

# ---------------------------------------------------------------------------
# Wait for services to be ready
# ---------------------------------------------------------------------------
COMPOSE="docker compose -f cicd/docker-compose.ci.yml --env-file cicd/.env.ci"

wait_healthy() {
  local service=$1
  echo "Waiting for $service to be healthy..."
  for i in $(seq 1 30); do
    STATUS=$($COMPOSE ps $service --format '{{.Health}}' 2>/dev/null || echo "unknown")
    [ "$STATUS" = "healthy" ] && echo "$service is healthy." && return 0
    [ "$i" -eq 30 ] && echo "ERROR: $service not healthy (status: $STATUS)" && exit 1
    sleep 2
  done
}

wait_healthy db
wait_healthy kong

# ---------------------------------------------------------------------------
# Set env vars for the SvelteKit app (THESE ARE NOT PROD SECRETS)
# we can also include a .env.ci file for sveltekit, but it's not a priority
# ---------------------------------------------------------------------------
export DATABASE_URL="postgres://postgres.1:123@localhost:6543/postgres?pgbouncer=true"
export SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.PqdH6E8yzZhWwB_c9o9e4LjdYXDTbEf5tdAqbBIrzKQ
export DIRECT_URL="postgres://postgres.1:123@localhost:5432/postgres"
export PUBLIC_SUPABASE_URL="http://localhost:8000"
export PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
export FILESYSTEM="SUPABASE"
export SAML_METADATA_IDP_URL=https://dev-gibxq4rldhm2q1st.eu.auth0.com/samlp/metadata/A7xXQ9i7TlNy98eaPhNbQAczMFVLTLxq
export SRAM_SAML_METADATA_IDP_URL=https://meta.sram.surf.nl/metadata/proxy_idp.xml
export PUBLIC_SAML_IDP_DOMAIN=dev-gibxq4rldhm2q1st.eu.auth0.com
export PUBLIC_SRAM_SAML_IDP_DOMAIN=sram.surf.nl
export PUBLIC_ENVIRONMENT="dev"

# ---------------------------------------------------------------------------
# Build and start preview server
# ---------------------------------------------------------------------------
echo "Building app..."
npm run build

echo "Starting preview server..."
npm run preview &
SERVER_PID=$!
echo "Preview server PID: $SERVER_PID"

# Wait for preview server to be ready
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
# temp disable exit-on-error to capture test result
set +e
npx vitest run -c ./vitest.config.integration.ts
TEST_EXIT=$?
set -e

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
echo "Stopping preview server..."
kill $SERVER_PID 2>/dev/null || true
SOCKET_PID=$(lsof -t -i :4173 2>/dev/null || true)
[ -n "$SOCKET_PID" ] && kill $SOCKET_PID 2>/dev/null || true

#if [ -z "${CI:-}" ]; then
echo "Stopping Supabase services..."
docker compose -f cicd/docker-compose.ci.yml --env-file cicd/.env.ci down -v
#fi

exit $TEST_EXIT
