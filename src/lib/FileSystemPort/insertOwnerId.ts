import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

export async function insertOwnerId(objectId: string, ownerId: string) {

    await sql`
        UPDATE storage.objects
        SET owner_id = ${ownerId}
        WHERE id = ${objectId}
    `
}