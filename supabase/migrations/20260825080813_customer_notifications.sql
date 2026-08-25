-- In-app, customer-owned notifications. Rows are generated only by database
-- triggers so browser clients cannot forge trusted account events.
create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('order_created','order_status','order_completed','refund','refill','support_reply','account_action')),
  title text not null check (char_length(title) between 1 and 120),
  message text not null check (char_length(message) between 1 and 500),
  href text,
  order_id uuid references public.orders(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists customer_notifications_user_created_idx on public.customer_notifications(user_id, created_at desc);
create index if not exists customer_notifications_unread_idx on public.customer_notifications(user_id, created_at desc) where read_at is null;
alter table public.customer_notifications enable row level security;
grant select, update on public.customer_notifications to authenticated;
drop policy if exists "notifications_select_own" on public.customer_notifications;
create policy "notifications_select_own" on public.customer_notifications for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "notifications_update_own" on public.customer_notifications;
create policy "notifications_update_own" on public.customer_notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.notify_customer_order_event() returns trigger language plpgsql security definer set search_path = public as $$
declare v_label text;
begin
  if tg_op = 'INSERT' then
    insert into customer_notifications(user_id,type,title,message,href,order_id) values (new.user_id, 'order_created', 'Order created', 'Your order has been created and is ready to track.', '/dashboard/orders/' || new.id::text, new.id);
  elsif new.status is distinct from old.status then
    v_label := replace(initcap(replace(new.status, '_', ' ')), 'In Progress', 'In progress');
    insert into customer_notifications(user_id,type,title,message,href,order_id) values (new.user_id, case when new.status = 'completed' then 'order_completed' when new.status in ('refunded','cancelled') then 'refund' when new.status in ('refill_requested','refilling') then 'refill' else 'order_status' end, case when new.status = 'completed' then 'Order completed' else 'Order status updated' end, 'Your order is now ' || v_label || '.', '/dashboard/orders/' || new.id::text, new.id);
  end if;
  return new;
end; $$;
drop trigger if exists customer_order_notification on public.orders;
create trigger customer_order_notification after insert or update of status on public.orders for each row execute function public.notify_customer_order_event();

create or replace function public.notify_customer_support_reply() returns trigger language plpgsql security definer set search_path = public as $$
declare v_ticket public.support_tickets%rowtype;
begin
  select * into v_ticket from support_tickets where id = new.ticket_id;
  if found and new.sender_id is distinct from v_ticket.user_id then
    insert into customer_notifications(user_id,type,title,message,href,order_id) values (v_ticket.user_id, 'support_reply', 'New support reply', 'SocialRUSH Support replied to your ticket.', '/dashboard/support', v_ticket.order_id);
  end if;
  return new;
end; $$;
drop trigger if exists customer_support_reply_notification on public.support_messages;
create trigger customer_support_reply_notification after insert on public.support_messages for each row execute function public.notify_customer_support_reply();
revoke all on function public.notify_customer_order_event() from public;
revoke all on function public.notify_customer_support_reply() from public;
