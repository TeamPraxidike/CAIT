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

cleanup() {
  echo "Cleaning up..."
  echo "Killing server PID: $SERVER_PID"
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
  PORT_PID=$(lsof -t -i :4173 2>/dev/null || true)
  echo "Killing port 4173 PID: $PORT_PID"
  [ -n "$PORT_PID" ] && kill $PORT_PID 2>/dev/null || true
  docker compose -f docker/docker-compose.yml --env-file docker/.env down
}
trap cleanup EXIT


echo "Starting Supabase services..."
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d

# ---------------------------------------------------------------------------
# Wait for services to be ready
# ---------------------------------------------------------------------------
COMPOSE="docker compose -f docker/docker-compose.yml --env-file docker/.env"

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

# TODO: split local dev and local test environments at some point
echo "Wiping database..."

# skip prisma migrations, otherwise it will try to reapply all of them and crash
# because the tables/columns/constraints already exist, we're just removing rows
#docker exec supabase-db psql -U supabase_admin -d postgres -c "
#  DO \$\$
#  DECLARE r RECORD;
#  BEGIN
#    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations')
#    LOOP
#      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', r.tablename);
#    END LOOP;
#    TRUNCATE auth.users CASCADE;
#  END
#  \$\$;
#"

docker exec -i supabase-db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 < scripts/utility/wipe-db.sql

echo "Building..."
npm run build

echo "Starting preview server with vite preview (for local build version)"
# run it in background, $! captures PID of most recently executed background process
npm run start:preview &
SERVER_PID=$!

echo "Waiting for server to be ready..."
for i in $(seq 1 30); do
  # vite preview spins it up on port 4173, look for http code 200 in the healthcheck endpoint
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/api/health | grep -q "200"; then
    echo "Server is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Server did not start after 30s"
    # goes to trap
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests..."
npx playwright test


