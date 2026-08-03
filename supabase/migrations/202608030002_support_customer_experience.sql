-- Customer-only metadata for unread support replies and a safely bounded payment reference.
alter table public.support_tickets
  add column if not exists payment_reference text check (payment_reference is null or (char_length(payment_reference) between 3 and 120 and payment_reference ~ '^[A-Za-z0-9._:/-]+$')),
  add column if not exists customer_last_read_at timestamptz;

create index if not exists support_tickets_customer_unread_idx
  on public.support_tickets(user_id, last_reply_at desc)
  where status in ('open', 'waiting_for_support', 'waiting_for_customer');

-- `last_reply_at` represents a customer-visible support reply only. Customer
-- messages update general activity but must never create their own unread badge.
update public.support_tickets set last_reply_at = null where status = 'waiting_for_support';

create or replace function public.create_support_ticket(
  p_category text, p_subject text, p_message text, p_order_id uuid default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_ticket uuid; v_order public.orders%rowtype;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_category not in ('order_pending','partial_delivery','drop_or_refill','incorrect_public_link','cancellation_request','payment_or_wallet','account_issue','service_availability','other') then raise exception 'Invalid issue category'; end if;
  if char_length(trim(p_subject)) < 3 or char_length(trim(p_message)) < 1 then raise exception 'Subject and message are required'; end if;
  if p_order_id is not null then
    select * into v_order from public.orders where id = p_order_id and user_id = v_user;
    if not found then raise exception 'Related order not found'; end if;
    if p_category = 'drop_or_refill' and not coalesce(v_order.refill_eligible, false) then raise exception 'This order is not currently eligible for refill.'; end if;
    if exists (select 1 from public.support_tickets where user_id=v_user and order_id=p_order_id and category=p_category and status in ('open','waiting_for_support','waiting_for_customer')) then raise exception 'You already have an active support request for this issue.'; end if;
  elsif p_category in ('order_pending','partial_delivery','drop_or_refill','incorrect_public_link','cancellation_request') then raise exception 'A related order is required for this issue';
  end if;
  insert into public.support_tickets(user_id,order_id,category,subject,status,updated_at)
  values(v_user,p_order_id,p_category,trim(p_subject),'waiting_for_support',now()) returning id into v_ticket;
  insert into public.support_messages(ticket_id,sender_id,message) values(v_ticket,v_user,trim(p_message));
  return v_ticket;
end; $$;

create or replace function public.reply_to_support_ticket(p_ticket_id uuid, p_message text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.support_tickets where id=p_ticket_id and user_id=auth.uid() and status not in ('resolved','closed')) then raise exception 'Ticket is closed or unavailable'; end if;
  insert into public.support_messages(ticket_id,sender_id,message) values(p_ticket_id,auth.uid(),trim(p_message));
  update public.support_tickets set status='waiting_for_support',updated_at=now() where id=p_ticket_id;
end; $$;

create or replace function public.create_support_ticket_with_reference(
  p_category text, p_subject text, p_message text, p_order_id uuid default null, p_payment_reference text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_ticket uuid;
begin
  if p_payment_reference is not null and (char_length(trim(p_payment_reference)) not between 3 and 120 or trim(p_payment_reference) !~ '^[A-Za-z0-9._:/-]+$') then
    raise exception 'Invalid payment reference';
  end if;
  v_ticket := public.create_support_ticket(p_category, p_subject, p_message, p_order_id);
  update public.support_tickets set payment_reference = nullif(trim(p_payment_reference), '') where id = v_ticket and user_id = auth.uid();
  return v_ticket;
end; $$;

create or replace function public.mark_support_ticket_read(p_ticket_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.support_tickets set customer_last_read_at = now()
  where id = p_ticket_id and user_id = auth.uid();
$$;

revoke all on function public.create_support_ticket_with_reference(text,text,text,uuid,text) from public;
revoke all on function public.mark_support_ticket_read(uuid) from public;
grant execute on function public.create_support_ticket_with_reference(text,text,text,uuid,text) to authenticated;
grant execute on function public.mark_support_ticket_read(uuid) to authenticated;
