import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

// The privacy statement promises that usage records from server-side logging are kept
// for at most one year. GoTrue never purges auth.audit_log_entries, so a daily pg_cron
// job deletes older entries. cron.schedule() updates a job that already has the same
// name, so this script is safe to run on every start.
async function main() {
	await sql`CREATE EXTENSION IF NOT EXISTS pg_cron`;

	await sql`
		SELECT cron.schedule(
			'prune-auth-audit-log',
			'0 3 * * *',
			$$DELETE FROM auth.audit_log_entries WHERE created_at < now() - interval '1 year'$$
		)
	`;

	// pg_cron stores one row per job run; keep 30 days of that history
	await sql`
		SELECT cron.schedule(
			'prune-cron-history',
			'10 3 * * *',
			$$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '30 days'$$
		)
	`;

	console.log("Finished scheduling data retention jobs.");
	process.exit();
}

main();
