
#DIR="$(cd "$(dirname "$0")" && pwd)"                                       # get the current directory
ENV=$(grep -v '^#' .env | xargs)                                           # load the environment variables
#source .env

#docker-compose up -d db-test                                                # start the database
#echo '🟡 - Waiting for database to be ready...'                            # wait for the database to be ready
#"$DIR"/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'  # wait for the database to be ready

npx prisma migrate dev && npx tsx ./scripts/seedTriggers.ts               # run the migrations

echo 'Checking type of Filesystem...'

# WSL can't find .env, remove this if you don't have this issue
export FILESYSTEM="SUPABASE"

if [ "$FILESYSTEM" = "SUPABASE" ]; then
  echo 'Using the SUPABASE Filesystem, please wait for seeding...'
  npx tsx ./scripts/seedBucket.ts
fi

npx vite dev                                                               # start the development server