import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {
	await sql`
        DO $$
        BEGIN
          create index if not exists metadata_extension_idx
          on public."FileChunk" ((metadata->>'extension'));

		  create index on public."FileChunk" using hnsw (embedding vector_cosine_ops);

        END $$;
`

	console.log(
		"✅ Custom SQL for hnsw index applied"
	);
	process.exit();
}

main();


// import fs from "fs";
// import path from "path";
// import {execSync} from "child_process";
// import { fileURLToPath } from 'node:url';
//
// // const MIGRATION_NAME = "add_vector_indexes";
//
// function runCommand(command: string){
// 	console.log(`Running ${command}`);
// 	execSync(command, { stdio: "inherit" });
// }
//
// // Fix __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// async function main() {
// 	// Step 1: Create the migration (without applying it yet)
// 	runCommand(`npx prisma migrate dev --create-only --name new_migration`);
//
// 	// Step 2: Find the latest migration folder
// 	const migrationsPath = path.join(__dirname, "../prisma/migrations");
// 	const migrationDirs = fs
// 		.readdirSync(migrationsPath)
// 		.filter((m) => m.includes("new_migration"))
// 		.sort()
// 		.reverse(); // Get the latest one
//
// 	if (migrationDirs.length === 0) {
// 		console.error("❌ No migration folder found!");
// 		process.exit(1);
// 	}
//
// 	const latestMigration = migrationDirs[0];
// 	const migrationSqlPath = path.join(migrationsPath, latestMigration, "migration.sql");
//
// 	console.log(`📁 Found migration: ${latestMigration}`);
//
// 	// Step 3: Define the custom SQL to append
// 	const customSQL = `
// -- Enable the pgvector extension (and some other extensions, otherwise drift detected?)
// CREATE EXTENSION IF NOT EXISTS "vector";
// CREATE EXTENSION IF NOT EXISTS "pg_graphql";
// CREATE EXTENSION IF NOT EXISTS "pg_net";
// CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
// CREATE EXTENSION IF NOT EXISTS "pgcrypto";
// CREATE EXTENSION IF NOT EXISTS "pgjwt";
// CREATE EXTENSION IF NOT EXISTS "pgsodium";
// CREATE EXTENSION IF NOT EXISTS "supabase_vault";
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
//
//
// -- Create index for metadata->>'extension'
// CREATE INDEX IF NOT EXISTS metadata_extension_idx
// ON public."FileChunk" ((metadata->>'extension'));
//
// -- Create HNSW index for the embedding column
// CREATE INDEX IF NOT EXISTS file_chunk_embedding_idx
// ON public."FileChunk" USING hnsw (embedding vector_cosine_ops);
//   `;
//
// 	// Step 4: Append the custom SQL to the migration file
// 	fs.appendFileSync(migrationSqlPath, customSQL);
// 	console.log("✅ Custom SQL appended to migration file.");
//
// 	// Step 5: Apply the migration
// 	runCommand(`npx prisma migrate dev`);
// }
//
// main().catch((err) => {
// 	console.error("❌ Migration script failed:", err);
// 	process.exit(1);
// });