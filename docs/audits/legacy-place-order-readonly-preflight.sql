-- Read-only preflight for legacy public.place_order correction.
-- Execute only in an authorized SQL editor. This script does not mutate data.
SELECT p.oid::regprocedure::text AS function_signature,
       p.prosecdef AS security_definer,
       pg_get_userbyid(p.proowner) AS function_owner,
       pg_get_functiondef(p.oid) AS current_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'place_order';

SELECT column_name, is_nullable, column_default, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
  AND column_name IN ('user_id','service_id','link','quantity','charge')
ORDER BY ordinal_position;

SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'orders'
ORDER BY trigger_name;

SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE specific_schema = 'public' AND routine_name = 'place_order'
ORDER BY grantee, privilege_type;

-- This does not establish whether dynamic/external callers exist.
-- Never run real order requests or production mutations for verification.
