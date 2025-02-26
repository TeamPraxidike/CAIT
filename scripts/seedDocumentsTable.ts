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
          -- Enable the pgvector extension to work with embedding vectors
          create extension if not exists vector;
        
          create index if not exists metadata_extension_idx 
          on public."Document" ((metadata->>'extension'));
    
        END $$;
`

	console.log(
		"Successfully ran the seedDocumentsTable script."
	);
	process.exit();
}

main();