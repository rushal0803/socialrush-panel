create or replace function private.enforce_abandoned_order_experiment_copy()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_variant text;
  v_service_code text;
  v_quantity integer;
begin
  if new.type <> 'abandoned_order' then
    return new;
  end if;

  select a.variant into v_variant
  from public.first_order_bonus_experiment_assignments a
  where a.user_id=new.user_id;

  if coalesce(v_variant,'') in ('bonus','legacy_bonus') then
    return new;
  end if;

  select d.service_code,d.quantity
  into v_service_code,v_quantity
  from public.order_drafts d
  where d.user_id=new.user_id
  order by d.updated_at desc
  limit 1;

  new.title := 'Your saved order is waiting';
  new.message := case
    when v_service_code is not null and v_quantity is not null
      then 'Your ' || initcap(replace(v_service_code,'-',' ')) ||
           ' order for ' || to_char(v_quantity,'FM999G999G999') ||
           ' is saved. Review the current price and continue when you are ready.'
    else 'Your saved order is ready to continue. Review the current price before completing checkout.'
  end;
  new.href := '/dashboard/new-order?draft=1&source=email_recovery&campaign=in_app_abandoned_order';
  return new;
end
$function$;

drop trigger if exists customer_notifications_abandoned_experiment_guard
on public.customer_notifications;

create trigger customer_notifications_abandoned_experiment_guard
before insert or update of title,message,href
on public.customer_notifications
for each row
when (new.type='abandoned_order')
execute function private.enforce_abandoned_order_experiment_copy();

revoke all on function private.enforce_abandoned_order_experiment_copy() from public;

update public.customer_notifications
set title=title
where type='abandoned_order'
  and read_at is null
  and not exists (
    select 1 from public.first_order_bonus_experiment_assignments a
    where a.user_id=customer_notifications.user_id
      and a.variant in ('bonus','legacy_bonus')
  );
