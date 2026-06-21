-- User-editable account settings without exposing protected balance or role fields.

alter table public.profiles add column if not exists notification_preferences jsonb not null default '{"orders":true,"payments":true,"support":true,"marketing":false,"security":true}'::jsonb;
alter table public.profiles add column if not exists api_access boolean not null default false;

create or replace function public.update_my_settings(p_full_name text, p_notifications jsonb, p_api_access boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_full_name)) < 2 then raise exception 'Full name is required'; end if;
  update public.profiles set full_name = trim(p_full_name), notification_preferences = coalesce(p_notifications, notification_preferences), api_access = coalesce(p_api_access, api_access) where id = auth.uid();
end; $$;

revoke all on function public.update_my_settings(text,jsonb,boolean) from public;
grant execute on function public.update_my_settings(text,jsonb,boolean) to authenticated;
