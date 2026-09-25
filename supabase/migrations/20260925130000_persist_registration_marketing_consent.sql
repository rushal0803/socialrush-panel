create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  marketing_opt_in boolean := lower(coalesce(new.raw_user_meta_data ->> 'marketing_opt_in','false')) = 'true';
  has_marketing_choice boolean := coalesce(new.raw_user_meta_data ? 'marketing_opt_in',false);
begin
  insert into public.profiles (id, email, full_name, notification_preferences)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    jsonb_build_object('marketing', marketing_opt_in)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
    notification_preferences = case
      when has_marketing_choice then jsonb_set(
        coalesce(public.profiles.notification_preferences,'{}'::jsonb),
        '{marketing}',
        to_jsonb(marketing_opt_in),
        true
      )
      else public.profiles.notification_preferences
    end;
  return new;
end;
$function$;
