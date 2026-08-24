-- Keep database and storage policies aligned with the application role model.
-- The legacy isAdmin predicate remains until that column is removed.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public."User"
    WHERE auth.uid() = id
      AND ("isAdmin" = TRUE OR "role" = 'ADMIN')
  );
END;
$$;
