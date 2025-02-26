import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

// TODO: USE REVOKE SELECT / GRANT SELECT TYPE OF POLICIES
// VIEWS are another option but I don't know how that would work

async function main() {
	try {
		await sql`
        DO $$
        BEGIN
			-- Enable Row-Level Security (RLS) on public."User" if not already enabled
			ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

			-- USER
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."User" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."User" TO authenticated;

            CREATE POLICY "Admin access to public User" ON public."User"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."PublicationUsedInCourse" if not already enabled
            ALTER TABLE public."PublicationUsedInCourse" ENABLE ROW LEVEL SECURITY;
                   
            -- PublicationUsedInCourse
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."PublicationUsedInCourse" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."PublicationUsedInCourse" TO authenticated;

            CREATE POLICY "Admin access to public PublicationUsedInCourse" ON public."PublicationUsedInCourse"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Publication" if not already enabled
            ALTER TABLE public."Publication" ENABLE ROW LEVEL SECURITY;
                   
            -- Publication
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Publication" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Publication" TO authenticated;

            CREATE POLICY "Admin access to public Publication" ON public."Publication"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."SimilarContent" if not already enabled
            ALTER TABLE public."SimilarContent" ENABLE ROW LEVEL SECURITY;
                   
            -- SimilarContent
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."SimilarContent" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."SimilarContent" TO authenticated;

            CREATE POLICY "Admin access to public SimilarContent" ON public."SimilarContent"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Material" if not already enabled
            ALTER TABLE public."Material" ENABLE ROW LEVEL SECURITY;
                   
            -- Material
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Material" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Material" TO authenticated;

            CREATE POLICY "Admin access to public Material" ON public."Material"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."File" if not already enabled
            ALTER TABLE public."File" ENABLE ROW LEVEL SECURITY;
                   
            -- File
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."File" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."File" TO authenticated;

            CREATE POLICY "Admin access to public File" ON public."File"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Circuit" if not already enabled
            ALTER TABLE public."Circuit" ENABLE ROW LEVEL SECURITY;

            -- Circuit
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Circuit" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Circuit" TO authenticated;

            CREATE POLICY "Admin access to public Circuit" ON public."Circuit"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Node" if not already enabled
            ALTER TABLE public."Node" ENABLE ROW LEVEL SECURITY;

            -- Node
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Node" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Node" TO authenticated;

            CREATE POLICY "Admin access to public Node" ON public."Node"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Edge" if not already enabled
            ALTER TABLE public."Edge" ENABLE ROW LEVEL SECURITY;
                   
            -- Edge
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Edge" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Edge" TO authenticated;

            CREATE POLICY "Admin access to public Edge" ON public."Edge"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
            
            -- Enable Row-Level Security (RLS) on public."Tag" if not already enabled
            ALTER TABLE public."Tag" ENABLE ROW LEVEL SECURITY;

            -- Tag
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Tag" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Tag" TO authenticated;

            CREATE POLICY "Admin access to public Tag" ON public."Tag"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Comment" if not already enabled
            ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
                   
            -- Comment
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Comment" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Comment" TO authenticated;

            CREATE POLICY "Admin access to public Comment" ON public."Comment"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
                   
            -- Enable Row-Level Security (RLS) on public."Reply" if not already enabled
            ALTER TABLE public."Reply" ENABLE ROW LEVEL SECURITY;

            -- Reply
            REVOKE SELECT, INSERT, UPDATE, DELETE ON public."Reply" FROM anon;
            GRANT SELECT, INSERT, UPDATE, DELETE ON public."Reply" TO authenticated;

            CREATE POLICY "Admin access to public Reply" ON public."Reply"
            -- For all means for select, insert, update and delete
			FOR ALL
            TO authenticated
			USING (
				(SELECT is_admin()) = TRUE
			);
        END $$;
        `
	}
	catch (error) {
		console.error(error);
	}

	console.log(
		"Public schema policies added successfully"
	);
	process.exit();
}

main();
