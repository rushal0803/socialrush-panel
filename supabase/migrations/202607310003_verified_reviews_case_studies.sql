-- Verified reviews and permission-backed case studies.
create table public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 3 and 100),
  message text not null check (char_length(message) between 20 and 2000),
  quality_feedback text check (char_length(quality_feedback) <= 1000),
  delivery_feedback text check (char_length(delivery_feedback) <= 1000),
  public_permission boolean not null default false,
  display_name_preference text not null default 'first_name' check (display_name_preference in ('first_name','initials','anonymous')),
  display_name text not null default 'Verified customer',
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  featured boolean not null default false,
  removal_requested_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_moderation_notes (
  review_id uuid primary key references public.customer_reviews(id) on delete cascade,
  note text not null default '',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, platform text not null, service_name text not null,
  customer_type text not null, challenge text not null, service_selected text not null,
  ordered_quantity integer check (ordered_quantity > 0), delivery_timeline text,
  outcome text not null, customer_quote text, permission_confirmed boolean not null default false,
  published boolean not null default false, featured boolean not null default false,
  seo_title text, seo_description text, related_service_href text, related_packages_href text,
  source_order_id uuid references public.orders(id) on delete set null,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (not published or permission_confirmed)
);

alter table public.customer_reviews enable row level security;
alter table public.review_moderation_notes enable row level security;
alter table public.case_studies enable row level security;

create policy reviews_owner_read on public.customer_reviews for select using (auth.uid() = user_id or public.is_admin());
create policy reviews_admin_update on public.customer_reviews for update using (public.is_admin()) with check (public.is_admin());
create policy notes_admin_all on public.review_moderation_notes for all using (public.is_admin()) with check (public.is_admin());
create policy case_studies_admin_all on public.case_studies for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_verified_review(p_order_id uuid, p_rating smallint, p_title text, p_message text, p_quality text, p_delivery text, p_permission boolean, p_display text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_id uuid; v_name text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from orders where id=p_order_id and user_id=v_user and status='completed') then raise exception 'Only your completed orders can be reviewed'; end if;
  select coalesce(nullif(trim(full_name),''),'Verified customer') into v_name from profiles where id=v_user;
  if p_display='anonymous' then v_name='Verified customer'; elsif p_display='initials' then v_name=upper(left(v_name,1)); else v_name=split_part(v_name,' ',1); end if;
  insert into customer_reviews(order_id,user_id,rating,title,message,quality_feedback,delivery_feedback,public_permission,display_name_preference,display_name)
  values(p_order_id,v_user,p_rating,trim(p_title),trim(p_message),nullif(trim(p_quality),''),nullif(trim(p_delivery),''),p_permission,p_display,v_name)
  returning id into v_id; return v_id;
end $$;

create or replace function public.update_pending_review(p_id uuid, p_rating smallint, p_title text, p_message text, p_quality text, p_delivery text, p_permission boolean, p_display text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update customer_reviews set rating=p_rating,title=trim(p_title),message=trim(p_message),quality_feedback=nullif(trim(p_quality),''),delivery_feedback=nullif(trim(p_delivery),''),public_permission=p_permission,display_name_preference=p_display,updated_at=now()
  where id=p_id and user_id=auth.uid() and moderation_status='pending';
  if not found then raise exception 'Only your pending review can be edited'; end if;
end $$;

create or replace function public.request_review_removal(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin update customer_reviews set removal_requested_at=now(),updated_at=now() where id=p_id and user_id=auth.uid(); if not found then raise exception 'Review not found'; end if; end $$;

revoke all on function public.submit_verified_review(uuid,smallint,text,text,text,text,boolean,text) from public;
revoke all on function public.update_pending_review(uuid,smallint,text,text,text,text,boolean,text) from public;
revoke all on function public.request_review_removal(uuid) from public;
grant execute on function public.submit_verified_review(uuid,smallint,text,text,text,text,boolean,text) to authenticated;
grant execute on function public.update_pending_review(uuid,smallint,text,text,text,text,boolean,text) to authenticated;
grant execute on function public.request_review_removal(uuid) to authenticated;
grant select on public.customer_reviews to authenticated;
grant select,update on public.customer_reviews to authenticated;
grant all on public.review_moderation_notes, public.case_studies to authenticated;

create index customer_reviews_public_idx on public.customer_reviews(moderation_status,public_permission,featured,published_at desc);
create index case_studies_public_idx on public.case_studies(published,featured,published_at desc);
