import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {

	await sql`
        CREATE OR REPLACE FUNCTION is_admin()
		  RETURNS boolean AS
		$$
		BEGIN
			return exists(select from public."User" where auth.uid() = id and isAdmin = TRUE);
		END;
		$$ language plpgsql security definer;
	`

	await sql`
        CREATE OR REPLACE FUNCTION set_owner_id_from_metadata()
		RETURNS TRIGGER AS 
        $$
		BEGIN
			-- Ensure owner_id is NOT NULL, reject the insert if missing
			IF NEW.metadata->>'ownerId' IS NULL THEN
				RAISE EXCEPTION 'Metadata must contain a valid ownerId';
        	END IF;
        	
		  	-- Extract ownerId from metadata and set it as owner_id
			NEW.owner := (NEW.metadata->>'ownerId')::UUID;
			
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`

	await sql`
        CREATE OR REPLACE TRIGGER on_object_inserted
			AFTER INSERT ON storage.objects
			FOR EACH ROW EXECUTE PROCEDURE insert_profile_for_new_user();
	`;


	await sql`
        CREATE OR REPLACE FUNCTION public.insert_profile_for_new_user()
		 RETURNS trigger
		 LANGUAGE plpgsql
		 SECURITY DEFINER
		AS $function$
        BEGIN
        INSERT INTO public."User" (id, email, "firstName", "lastName")
        VALUES (
                   NEW.id,
                   NEW.email,
                   new.raw_user_meta_data ->> 'firstName',
				   new.raw_user_meta_data ->> 'lastName'
               );
        RETURN NEW;
        END;
        $function$;
	`;

	await sql`
        CREATE OR REPLACE TRIGGER on_auth_user_created
			AFTER INSERT ON auth.users
			FOR EACH ROW EXECUTE PROCEDURE public.insert_profile_for_new_user();
	`;

	/////////////////////////////////////////////////////////////
	// IF USER IS DELETED VIA SUPABASE CLIENT
	/////////////////////////////////////////////////////////////

	await sql`
        CREATE OR REPLACE FUNCTION public.handle_delete_user()
		 RETURNS trigger
		 LANGUAGE plpgsql
		 SECURITY DEFINER
		AS $function$
        BEGIN
		DELETE FROM public."User"
		WHERE id = OLD.id;
		RETURN OLD;
        END;
        $function$;
	`;

	await sql`
        CREATE OR REPLACE TRIGGER on_auth_user_deleted
			AFTER DELETE ON auth.users
			FOR EACH ROW EXECUTE PROCEDURE public.handle_delete_user();
	`;

	/////////////////////////////////////////////////////////////
	// IF USER IS DELETED VIA PRISMA ORM
	/////////////////////////////////////////////////////////////

	await sql`
        CREATE OR REPLACE FUNCTION auth.handle_delete_user_other_way_jic()
		 RETURNS trigger
		 LANGUAGE plpgsql
		 SECURITY DEFINER
		AS $function$
        BEGIN
		DELETE FROM auth.users
		WHERE id = OLD.id;
		RETURN OLD;
        END;
        $function$;
	`;

	await sql`
        CREATE OR REPLACE TRIGGER on_auth_user_deleted_jic
			AFTER DELETE ON public."User"
			FOR EACH ROW EXECUTE PROCEDURE auth.handle_delete_user_other_way_jic();
	`;

	console.log(
		"Finished adding triggers and functions for profile handling."
	);
	process.exit();
}

main();
