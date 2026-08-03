-- A separate request record keeps the original fulfillment status intact.
create table if not exists public.order_refill_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','reviewing','approved','processing','completed','rejected','cancelled')),
  customer_note text check (customer_note is null or char_length(customer_note) <= 500),
  admin_note text,
  requested_at timestamptz not null default now(), reviewed_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists order_refill_one_active_request_idx on public.order_refill_requests(order_id)
  where status in ('requested','reviewing','approved','processing');
create index if not exists order_refill_customer_created_idx on public.order_refill_requests(customer_id, created_at desc);
alter table public.order_refill_requests enable row level security;
create policy "refill_requests_select_owner_or_admin" on public.order_refill_requests for select to authenticated using (customer_id = auth.uid() or public.is_admin());
create policy "refill_requests_admin_update" on public.order_refill_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.request_order_refill(p_order_id uuid, p_customer_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_order public.orders%rowtype; v_id uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select * into v_order from public.orders where id = p_order_id and user_id = v_user for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status in ('cancelled','refunded') then raise exception 'Refills are not available for cancelled or refunded orders'; end if;
  if v_order.status <> 'completed' or not coalesce(v_order.refill_eligible,false) then raise exception 'This order is not eligible for refill'; end if;
  if exists (select 1 from public.order_refill_requests where order_id=p_order_id and status in ('requested','reviewing','approved','processing')) then raise exception 'An active refill request already exists'; end if;
  insert into public.order_refill_requests(order_id,customer_id,customer_note) values (p_order_id,v_user,nullif(trim(p_customer_note),'')) returning id into v_id;
  update public.orders set refill_requested_at=now() where id=p_order_id;
  return v_id;
end; $$;
revoke all on function public.request_order_refill(uuid,text) from public;
grant execute on function public.request_order_refill(uuid,text) to authenticated;
