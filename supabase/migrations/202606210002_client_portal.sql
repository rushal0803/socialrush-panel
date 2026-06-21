-- Client portal account, support, and billing metadata. Safe to rerun.
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists billing_address text;
alter table public.profiles add column if not exists gst_number text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.support_tickets add column if not exists category text not null default 'service_question';
alter table public.support_tickets add column if not exists priority text not null default 'normal';
alter table public.support_tickets add column if not exists updated_at timestamptz not null default now();

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','paid','void','refunded')),
  invoice_number text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists invoices_user_created_idx on public.invoices(user_id, created_at desc);
alter table public.invoices enable row level security;

drop policy if exists "invoices_select_own_or_admin" on public.invoices;
create policy "invoices_select_own_or_admin" on public.invoices for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "invoices_admin_insert" on public.invoices;
create policy "invoices_admin_insert" on public.invoices for insert to authenticated with check (public.is_admin());
drop policy if exists "invoices_admin_update" on public.invoices;
create policy "invoices_admin_update" on public.invoices for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop function if exists public.update_my_account(text,text,text,text,text);
create or replace function public.update_my_account(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_company_name text,
  p_website text,
  p_billing_address text,
  p_gst_number text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.profiles set
    full_name = coalesce(nullif(trim(concat_ws(' ', p_first_name, p_last_name)), ''), full_name),
    phone = nullif(trim(p_phone), ''),
    company_name = nullif(trim(p_company_name), ''),
    website = nullif(trim(p_website), ''),
    billing_address = nullif(trim(p_billing_address), ''),
    gst_number = nullif(upper(trim(p_gst_number)), ''),
    updated_at = now()
  where id = auth.uid();
end; $$;
revoke all on function public.update_my_account(text,text,text,text,text,text,text) from public;
grant execute on function public.update_my_account(text,text,text,text,text,text,text) to authenticated;
