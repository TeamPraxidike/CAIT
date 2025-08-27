import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main(userIdOld: string, userIdNew: string){
	console.log(
		"Migrating user..."
	);

	const [rowOld] = await sql`
		SELECT * 
		FROM public."User"
		WHERE id = ${userIdOld};
	`

	if (!rowOld) {
		throw new Error(`User ${userIdOld} does not exist`);
	}
	else if (rowOld.length > 1) {
		throw new Error(`Unexpected: found ${rowOld.length} users with id ${userIdOld}`);
	}

	console.log("--------");
	console.log(`✅ Old user exists\nName: ${rowOld.firstName} ${rowOld.lastName}\nEmail: ${rowOld.email}\nID: ${userIdOld}`);
	console.log("--------");

	const [rowNew] = await sql`
        SELECT *
        FROM public."User"
        WHERE id = ${userIdNew};
	`

	if (!rowNew) {
		throw new Error(`User ${userIdNew} does not exist`);
	}
	else if (rowNew.length > 1) {
		throw new Error(`Unexpected: found ${rowNew.length} users with id ${userIdNew}`);
	}

	console.log(`✅ New user exists\nName: ${rowNew.firstName} ${rowNew.lastName}\nEmail: ${rowNew.email}\nID: ${userIdNew}`);
	console.log("--------");

	console.log("✅ Ready to migrate\n\n");

	await sql.begin(async (tx) => {
		await tx`UPDATE public."User" SET "reputation" = ${rowOld.reputation}, 
                         "aboutMe" = ${rowOld.aboutMe}, "isAdmin" = ${rowOld.isAdmin} WHERE id = ${userIdNew}`;

		await tx`UPDATE public."Publication" SET "publisherId" = ${userIdNew} WHERE "publisherId" = ${userIdOld}`;
		await tx`UPDATE public."PublicationUsedInCourse" SET "userId" = ${userIdNew} WHERE "userId" = ${userIdOld}`;
		await tx`UPDATE public."SavedByAllTime" SET "userId" = ${userIdNew} WHERE "userId" = ${userIdOld}`;
		await tx`UPDATE public."Comment" SET "userId" = ${userIdNew} WHERE "userId" = ${userIdOld}`;
		await tx`UPDATE public."Reply" SET "userId" = ${userIdNew} WHERE "userId" = ${userIdOld}`;
		await tx`UPDATE public."File" SET "userId" = ${userIdNew} WHERE "userId" = ${userIdOld}`;

		await tx`UPDATE public."_CourseInstructors" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;
		await tx`UPDATE public."_liked" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;
		await tx`UPDATE public."_likedComments" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;
		await tx`UPDATE public."_likedReplies" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;
		await tx`UPDATE public."_maintainers" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;
		await tx`UPDATE public."_reported" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;
		await tx`UPDATE public."_saved" SET "B" = ${userIdNew} WHERE "B" = ${userIdOld}`;

		await tx`UPDATE storage.objects SET "owner" = ${userIdNew}, "owner_id" = ${userIdNew} WHERE "owner_id" = ${userIdOld}`;
	});

	console.log("✅ Migration is done!\n\n");

	process.exit(0);
}

function isUuid(v?: string) {
	return !!v && /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(v);
}

// --- CLI entrypoint ---
(async () => {
	/*
		argv[0] → path to the Node binary
		argv[1] → path to the script being executed
		argv[2] onward → the arguments you passed
	 */
	const [,, oldId, newId] = process.argv;

	if (!oldId || !newId) {
		console.error("Usage: npx tsx migrateUser.ts <OLD_UUID> <NEW_UUID>");
		process.exit(1);
	}
	if (!isUuid(oldId) || !isUuid(newId)) {
		console.error("Both arguments must be valid UUIDs.");
		process.exit(1);
	}
	if (oldId === newId) {
		console.error("OLD and NEW user IDs must be different.");
		process.exit(1);
	}

	try {
		await main(oldId, newId);
		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();