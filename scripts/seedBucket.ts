import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {
	// // Create the bucket
	// await sql`
    //     INSERT INTO storage.buckets (id, name, public)
    //     VALUES (gen_random_uuid(), 'uploadedFiles', false);
	// `;
	//
	// // Enable RLS (could remove if already enabled)
	// await sql`
    //     ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
	// `;
	//
	// // SELECT Policy
	// await sql`
    //     CREATE POLICY "Allow SELECT on uploadedFiles for authenticated users"
	// 	ON storage.objects
	// 	FOR SELECT
	//     USING (
	// 		auth.role() = 'authenticated'
	// 		AND bucket_id = (SELECT id FROM storage.buckets WHERE name = 'uploadedFiles')
	//     );
	// `;
	//
	// // INSERT Policy
	// await sql`
    //     CREATE POLICY "Allow INSERT on uploadedFiles for authenticated users"
	// 	ON storage.objects
	// 	FOR INSERT
	// 	WITH CHECK (
	// 	   auth.role() = 'authenticated'
	// 	   AND bucket_id = (SELECT id FROM storage.buckets WHERE name = 'uploadedFiles')
	// 	);
	// `;
	//
	// // UPDATE Policy, using a combination of "USING" and "WITH CHECK"
	//
	// await sql`
    //     CREATE POLICY "Allow UPDATE on uploadedFiles for authenticated users"
	// 	ON storage.objects
	// 	FOR UPDATE
	//     USING (
	// 		auth.role() = 'authenticated'
	// 		AND bucket_id = (SELECT id FROM storage.buckets WHERE name = 'uploadedFiles')
	//     )
    //     WITH CHECK (
	// 		auth.role() = 'authenticated'
	// 		AND bucket_id = (SELECT id FROM storage.buckets WHERE name = 'uploadedFiles')
	//     );
	// `;
	//
	//
	// // DELETE Policy
	// await sql`
    //     CREATE POLICY "Allow DELETE on uploadedFiles for authenticated users"
	// 	ON storage.objects
	// 	FOR DELETE
	// 	USING (
	// 	  auth.role() = 'authenticated'
	// 	  AND bucket_id = (SELECT id FROM storage.buckets WHERE name = 'uploadedFiles')
	// 	);
	// `;

	await sql`
			DO $$
			DECLARE
				bucket_exists BOOLEAN;
				bucket_id TEXT;
			BEGIN
				-- Check if the bucket already exists
				SELECT EXISTS (
					SELECT 1 FROM storage.buckets WHERE name = 'uploadedFiles'
				) INTO bucket_exists;
		
				IF NOT bucket_exists THEN
					-- Insert the new bucket
					INSERT INTO storage.buckets (id, name, public)
					VALUES ('uploadedFiles', 'uploadedFiles', false)
					RETURNING id INTO bucket_id;
			
					RAISE NOTICE 'Bucket "uploadedFiles" created with ID: %', bucket_id;
			
					-- Enable Row-Level Security (RLS) on storage.objects if not already enabled
					ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
			
					-- ALLOWED FOR ALL AUTH USERS
					-- Existing table rows are checked against the expression specified in USING
					-- SELECT Policy
					CREATE POLICY "Allow SELECT on uploadedFiles for authenticated users"
					ON storage.objects
					FOR SELECT
					USING (
					   auth.role() = 'authenticated'
					   AND storage.objects.bucket_id = bucket_id
					);

            		-- ALLOWED FOR ALL AUTH USERS
					-- New rows that would be created via INSERT  are checked against 
					-- the expression specified in WITH CHECK
					-- INSERT Policy
					CREATE POLICY "Allow INSERT on uploadedFiles for authenticated users"
					ON storage.objects
					FOR INSERT
					WITH CHECK (
						auth.role() = 'authenticated'
						AND storage.objects.bucket_id = bucket_id
					);
			
					-- ALLOWED FOR ALL AUTH USERS (IF FILE BELONGS TO USER)
					-- New rows that would be created via UPDATE are checked against 
					-- the expression specified in WITH CHECK
					-- Existing table rows are checked against the expression specified in USING
					-- UPDATE Policy
					CREATE POLICY "Allow UPDATE on uploadedFiles for authenticated users"
					ON storage.objects
					FOR UPDATE
					USING (
						auth.role() = 'authenticated'
						AND storage.objects.bucket_id = bucket_id
						AND auth.uid() = owner_id::uuid
					)
					WITH CHECK (
						auth.role() = 'authenticated'
						AND storage.objects.bucket_id = bucket_id
						AND auth.uid() = owner_id::uuid
					);

            		-- ALLOWED FOR ALL AUTH USERS (IF FILE BELONGS TO USER)
					-- Existing table rows are checked against the expression specified in USING
					-- DELETE Policy
					CREATE POLICY "Allow DELETE on uploadedFiles for authenticated users"
					ON storage.objects
					FOR DELETE
					USING (
						auth.role() = 'authenticated'
						AND storage.objects.bucket_id = bucket_id
					    AND auth.uid() = owner_id::uuid
					);
			
					RAISE NOTICE 'Policies for "uploadedFiles" bucket have been created.';
				ELSE
					RAISE NOTICE 'Bucket "uploadedFiles" already exists. No action taken.';
				END IF;
			END
			$$ LANGUAGE plpgsql;
`

	console.log(
		"Successfully ran the seedBucket script."
	);
	process.exit();
}

main();
