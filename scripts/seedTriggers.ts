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
			return exists(select from public."User" where auth.uid() = id and "isAdmin" = TRUE);
		END;
		$$ language plpgsql security definer;
	`

	await sql`
        CREATE OR REPLACE FUNCTION public.insert_profile_for_new_user()
		 RETURNS trigger
		 LANGUAGE plpgsql
		 SECURITY DEFINER
		AS $function$
		DECLARE 
			raw_meta jsonb := NEW.raw_user_meta_data::jsonb;
			custom_claims jsonb := raw_meta -> 'custom_claims';
			firstname text := 'placeholder';
			lastname text := 'placeholder';
			platform_id text := 'placeholder';
			institution_id text := 'placeholder';
			temp_second_split text := 'placeholder';
        BEGIN

        --  If custom claims is null then we have a normal registration (email + pass) (will be DEPRECATED soon!!)       
        IF custom_claims IS NULL THEN 
			firstname := raw_meta ->> 'firstName';
			lastname := raw_meta ->> 'lastName';
	   	ELSE
-- 	   		If platformId is present then we are in the SRAM branch
	   		IF NULLIF(custom_claims ->> 'platformId', '') IS NOT NULL THEN
	   			firstname := NULLIF(custom_claims ->> 'firstName','');
	   			lastname := NULLIF(custom_claims ->> 'lastName','');
	   			platform_id := NULLIF(custom_claims ->> 'platformId','');
	   			institution_id := NULLIF(custom_claims ->> 'institutionId','');
	   			
--          If firstname is not null then it has to be GooGoo
        	ELSIF NULLIF(custom_claims ->> 'firstName','') IS NOT NULL THEN
				firstname := NULLIF(custom_claims ->> 'firstName','');
	   	
--            	lastName could be null tho (WHY GOOGOO WHY?!?), check it
           		IF NULLIF(custom_claims ->> 'lastName','') IS NOT NULL THEN
					lastname := NULLIF(custom_claims ->> 'lastName','');
				ELSE
           			lastname := 'PlaceholderLastName';
	   			END IF;
			ELSE
				firstname := split_part(custom_claims ->> 'fullName',' ',1);
-- 				Github has the same problem WHYYYYYYY????????
				IF NULLIF(split_part(custom_claims ->> 'fullName',' ',2), '') IS NOT NULL THEN
				   	temp_second_split := custom_claims ->> 'fullName';
-- 				   	example ->Yoan Popov
-- 				   	substring from position returns " Popov" (so starting from the ' ' onwards)
-- 				   	then just trim whitespace
-- 				    this handles cases where people have multiword lastnames (kinda, but not exactly)
					lastname := ltrim(substring(temp_second_split from position(' ' in temp_second_split)));
				ELSE
					lastname := 'PlaceholderLastName';
				END IF;
			END IF;
		END IF;
           
        INSERT INTO public."User" (id, email, "firstName", "lastName")
        VALUES (
			NEW.id,
			NEW.email,
			firstname,
			lastname
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
