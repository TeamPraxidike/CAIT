#!/usr/bin/bash

sed -i '/await server.init/i \
globalThis.__filename = fileURLToPath(import.meta.url); \
globalThis.__dirname = path.dirname(__filename);' ./build/handler.js

npx tsx ./scripts/seedTriggers.ts && npx tsx ./scripts/publicSchemaRLSPolicies.ts

echo 'Checking type of Filesystem...'

export FILESYSTEM="SUPABASE"

if [ "$FILESYSTEM" = "SUPABASE" ]; then
  echo 'Using the SUPABASE Filesystem, please wait for seeding...'
  npx tsx ./scripts/seedBucket.ts
fi
