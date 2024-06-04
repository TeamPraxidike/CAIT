#!/usr/bin/env bash
export NODE_ENV=test

DIR="$(cd "$(dirname "$0")" && pwd)"                                       # get the current directory
ENV=$(grep -v '^#' .env | xargs)                                           # load the environment variables


# Check if we are in a CI environment
if [ -z "$CI" ]; then
  docker-compose up -d db-test                                              # start the database
  echo '🟡 - Waiting for database to be ready...'                            # wait for the database to be ready
  "$DIR"/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'  # wait for the database to be ready
fi

npx prisma migrate dev --name init                                         # run the migrations
npm run build                                                              # build the project
npm run preview &                                                          # start the server in the background - port 4173
SERVER_PID=$!                                                              # save the server PID so we can kill it later
echo "Server started with PID: $SERVER_PID"
npx vitest -c ./vitest.config.integration.ts                                   # run your tests

kill $SERVER_PID                                                           # kill the server once the tests are done
echo "Killed PID: $SERVER_PID"

# Get PID of the process using port 4173
SOCKET_PID=$(lsof -t -i :4173)

# Kill the server process that is actually using the port
if [[ ! -z "$SOCKET_PID" ]]; then
    echo "Found PID holding up the port, performing cleanup"
    kill $SOCKET_PID
    echo "Killed PID: $SOCKET_PID"
else
    echo "No process found using port."
fi

