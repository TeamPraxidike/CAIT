
DIR="$(cd "$(dirname "$0")" && pwd)"                                       # get the current directory
ENV=$(grep -v '^#' .env | xargs)                                           # load the environment variables

docker-compose up -d db-test                                                # start the database
echo '🟡 - Waiting for database to be ready...'                            # wait for the database to be ready
"$DIR"/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'  # wait for the database to be ready

npx prisma migrate dev --name dev                                          # run the migrations
npx vite dev                                                               # start the development server