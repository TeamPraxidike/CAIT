#!/usr/bin/bash

set -euo pipefail

# early exit if 4173 is occupied
# TODO: this could be better, vite will try to use the next available, you can also try to follow that logic
if lsof -i :4173 &>/dev/null; then
    echo "ERROR: Port 4173 is already in use"
    lsof -i :4173
    exit 1
fi

SERVER_PID=""

COMPOSE="docker compose -p cait-test -f docker/docker-compose.yml -f docker/docker-compose.test.yml --env-file docker/.env"

# test stack reuses the dev stack's host ports — refuse to start over a running dev stack
if [ -n "$(docker ps -q --filter 'name=^supabase-')" ]; then
  echo "ERROR: dev Supabase stack is running. Stop it (exit dev.sh) before running tests."
  exit 1
fi

cleanup() {
  echo "Cleaning up..."
  echo "Killing server PID: $SERVER_PID"
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
  PORT_PID=$(lsof -t -i :4173 2>/dev/null || true)
  echo "Killing port 4173 PID: $PORT_PID"
  [ -n "$PORT_PID" ] && kill $PORT_PID 2>/dev/null || true
  # stop, not down: the test stack persists and is reused on the next run
  $COMPOSE stop
}
trap cleanup EXIT


echo "Starting Supabase test stack..."
$COMPOSE up -d db analytics supavisor kong auth rest storage imgproxy minio minio-createbucket

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

# -a auto-export, source the .env, +a turns off auto-export
set -a && source .env && set +a

echo "Wiping database..."
$COMPOSE exec -T db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < scripts/utility/wipe-db.sql

echo "Building..."
npm run build

echo "Starting preview server with vite preview (for local build version)"
# run it in background, $! captures PID of most recently executed background process
SEED_TEST_DATA=true npm run start:preview &
SERVER_PID=$!

echo "Waiting for server to be ready..."
for i in $(seq 1 60); do
  # vite preview spins it up on port 4173, look for http code 200 in the healthcheck endpoint
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/api/health | grep -q "200"; then
    echo "Server is ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "ERROR: Server did not start after 60s"
    # goes to trap
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests..."
npx playwright test