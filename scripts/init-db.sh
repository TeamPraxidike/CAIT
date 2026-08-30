#!/usr/bin/bash

npx prisma generate && npx prisma migrate deploy

chmod +x scripts/createSAMLidp.sh
./scripts/createSAMLidp.sh

npx tsx ./scripts/seedTriggers.ts
npx tsx ./scripts/publicSchemaRLSPolicies.ts

echo 'Checking type of Filesystem...'

export FILESYSTEM="SUPABASE"

if [ "$FILESYSTEM" = "SUPABASE" ]; then
  echo 'Using the SUPABASE Filesystem, please wait for seeding...'
  if [ "${SEED_TEST_DATA:-}" = "true" ]; then
    echo "SEEDING E2E test data"
    npx tsx ./scripts/seedTestData.ts
  fi
  npx tsx ./scripts/seedBucket.ts
fi