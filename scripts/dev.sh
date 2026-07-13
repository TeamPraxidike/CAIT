#!/usr/bin/env bash
set -euo pipefail

<<<<<<< HEAD
# early exit if 5173 is occupied
# TODO: account for flexible port allocation (e.g. 5174, 5175, etc.)
if lsof -i :5173 &>/dev/null; then
    echo "ERROR: Port 5173 (needed for vite dev) is already in use"
    lsof -i :5173
    exit 1
fi

COMPOSE="docker compose -f docker/docker-compose.yml --env-file docker/.env"

cleanup() {
  echo "Cleaning up..."
  $COMPOSE down

  # port should be free atp, putting it here just in case
  PORT_PID=$(lsof -t -i :5173 2>/dev/null || true)
  echo "Killing port 5173 PID: $PORT_PID"
  [ -n "$PORT_PID" ] && kill $PORT_PID 2>/dev/null || true
}
trap cleanup EXIT

# Start Supabase services
echo "Starting Supabase services..."
$COMPOSE up -d

# Wait for services to be ready
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

# Load environment variables
set -a && source .env && set +a

# Run migrations and seed scripts
echo "Running migrations..."
npx prisma migrate dev

./scripts/createSAMLidp.sh
npx tsx ./scripts/seedTriggers.ts
npx tsx ./scripts/publicSchemaRLSPolicies.ts

if [ "${FILESYSTEM:-}" = "SUPABASE" ]; then
  echo "Using SUPABASE filesystem, seeding buckets..."
  npx tsx ./scripts/seedBucket.ts
else
  echo "\033[31m[DEPRECATED] Using Local Filesystem\033[0m"
fi

# Start dev server
npx vite dev "$@"