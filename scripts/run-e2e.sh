#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"                                       # get the current directory
ENV=$(grep -v '^#' .env | xargs)                                           # load the environment variables


# Check if we are in a CI environment
if [ -z "$CI" ]; then
  docker-compose up -d db-test                                              # start the database
  echo '🟡 - Waiting for database to be ready...'                            # wait for the database to be ready
  "$DIR"/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'  # wait for the database to be ready
fi

npx playwright install-deps                                                # install playwright dependencies
npx playwright install                                                     # install playwright browsers for testing
npx prisma migrate dev --name init                                         # run the migrations
playwright test                                                            # run playwright tests
