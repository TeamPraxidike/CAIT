-- Wipes all app data, preserving migration bookkeeping (_prisma_migrations, auth.schema_migrations).
-- TRUNCATE does not fire row-level DELETE triggers, so on_auth_user_deleted_jic never runs —
-- auth.users must be truncated explicitly or stale accounts block re-registration.
DO $$
DECLARE r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations')
    LOOP
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', r.tablename);
END LOOP;
TRUNCATE auth.users CASCADE;
END
$$;