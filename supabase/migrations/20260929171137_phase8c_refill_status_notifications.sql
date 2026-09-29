create schema if not exists private;

create or replace function private.notify_customer_refill_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_label text;
  v_title text;
  v_message text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  v_label := replace(initcap(replace(new.status, '_', ' ')), 'In Progress', 'In progress');

  v_title := case new.status
    when 'reviewing' then 'Refill request under review'
    when 'approved' then 'Refill request approved'
    when 'processing' then 'Refill is processing'
    when 'completed' then 'Refill completed'
    when 'rejected' then 'Refill request update'
    when 'cancelled' then 'Refill request cancelled'
    else 'Refill status updated'
  end;

  v_message := case new.status
    when 'reviewing' then 'Your refill request is being reviewed. You can track the related order for updates.'
    when 'approved' then 'Your refill request was approved and is ready for processing.'
    when 'processing' then 'Your refill is now processing. Please avoid submitting a duplicate refill request.'
    when 'completed' then 'Your refill has been marked completed. Review the related order for the latest delivery details.'
    when 'rejected' then 'Your refill request could not be approved. Open the related order or support if you need more context.'
    when 'cancelled' then 'Your refill request was cancelled. Open the related order for current status and available actions.'
    else 'Your refill request is now ' || v_label || '.'
  end;

  insert into public.customer_notifications(
    user_id, type, title, message, href, order_id
  )
  values (
    new.customer_id,
    'refill',
    v_title,
    v_message,
    '/dashboard/orders/' || new.order_id::text,
    new.order_id
  );

  return new;
end;
$$;

revoke all on function private.notify_customer_refill_status() from public;
revoke all on function private.notify_customer_refill_status() from anon;
revoke all on function private.notify_customer_refill_status() from authenticated;

drop trigger if exists customer_refill_status_notification on public.order_refill_requests;
create trigger customer_refill_status_notification
after update of status on public.order_refill_requests
for each row
when (old.status is distinct from new.status)
execute function private.notify_customer_refill_status();
