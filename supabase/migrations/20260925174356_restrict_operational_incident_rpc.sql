revoke execute on function public.record_operational_incident(
  text, text, text, text, text, text, text, jsonb, uuid, text, bigint
) from public, anon, authenticated;
grant execute on function public.record_operational_incident(
  text, text, text, text, text, text, text, jsonb, uuid, text, bigint
) to service_role;
