-- Extended campaign operations for admin fulfillment and provider preparation.

alter table public.services add column if not exists delivery_time text not null default '1-7 days';
alter table public.orders add column if not exists admin_notes text;
alter table public.orders add column if not exists updated_at timestamptz not null default now();

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in (
  'pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'refunded', 'failed'
));

create or replace function public.set_order_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_order_updated_at on public.orders;
create trigger set_order_updated_at before update on public.orders
for each row execute function public.set_order_updated_at();

create index if not exists orders_provider_order_id_idx on public.orders(provider_order_id) where provider_order_id is not null;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;
