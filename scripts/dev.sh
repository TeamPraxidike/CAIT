#DIR="$(cd "$(dirname "$0")" && pwd)"                                       # get the current directory
ENV=$(grep -v '^#' .env | xargs)                                           # load the environment variables
#source .env

./scripts/createSAMLidp.sh

echo "\nRunning migrations..."

npx prisma migrate dev                                                              # run the migrations
#npx tsx ./scripts/seedFileChunkTable.ts
npx tsx ./scripts/seedTriggers.ts && npx tsx ./scripts/publicSchemaRLSPolicies.ts   # auth-public user connection + pub schema policies
#npx tsx ./scripts/seedFileChunkTable.ts


echo 'Checking type of Filesystem...'

# WSL can't find .env, remove this if you don't have this issue
export FILESYSTEM="SUPABASE"

if [ "$FILESYSTEM" = "SUPABASE" ]; then
  echo 'Using the SUPABASE Filesystem, please wait for seeding...'
  npx tsx ./scripts/seedBucket.ts
fi

npx vite dev "$@"                                                               # start the development server