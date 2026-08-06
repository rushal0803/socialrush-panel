-- Stable customer-safe order references.  `orders.id` remains the relational UUID.
alter table public.orders add column if not exists public_order_id text;

create or replace function public.new_public_order_id()
returns text language plpgsql volatile set search_path = public as $$
declare candidate text;
begin
  loop
    candidate := 'SR-' || upper(encode(gen_random_bytes(5), 'hex'));
    exit when not exists (select 1 from public.orders where public_order_id = candidate);
  end loop;
  return candidate;
end;
$$;

-- Existing UUIDs were never customer-facing references. Generate each backfill once.
update public.orders
set public_order_id = public.new_public_order_id()
where public_order_id is null or public_order_id !~ '^SR-[A-Z0-9]{6,}$';

alter table public.orders alter column public_order_id set not null;
alter table public.orders drop constraint if exists orders_public_order_id_format;
alter table public.orders add constraint orders_public_order_id_format
  check (public_order_id ~ '^SR-[A-Z0-9]{6,}$');
create unique index if not exists orders_public_order_id_unique on public.orders(public_order_id);

create or replace function public.assign_public_order_id()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and (new.public_order_id is null or new.public_order_id !~ '^SR-[A-Z0-9]{6,}$') then
    new.public_order_id := public.new_public_order_id();
  elsif tg_op = 'UPDATE' and new.public_order_id is distinct from old.public_order_id then
    raise exception 'Public order reference cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists assign_public_order_id on public.orders;
create trigger assign_public_order_id before insert or update on public.orders
for each row execute function public.assign_public_order_id();
