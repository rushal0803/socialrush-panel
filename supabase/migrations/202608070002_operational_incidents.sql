-- Privacy-safe, server-written operational incidents. This table is not a payment or customer source of truth.
create table if not exists public.operational_incidents (
  id uuid primary key default gen_random_uuid(), incident_type text not null check (char_length(incident_type) <= 80),
  severity text not null check (severity in ('critical','high','medium','low','informational')),
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  title text not null check (char_length(title) <= 160), safe_summary text not null check (char_length(safe_summary) <= 500),
  source text not null check (char_length(source) <= 80), environment text not null check (char_length(environment) <= 40), fingerprint text not null check (char_length(fingerprint) <= 180),
  related_order_id uuid references public.orders(id) on delete set null, related_payment_reference text, related_service_id bigint references public.services(id) on delete set null,
  first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), occurrence_count integer not null default 1,
  acknowledged_at timestamptz, acknowledged_by uuid references public.profiles(id) on delete set null, resolved_at timestamptz, resolved_by uuid references public.profiles(id) on delete set null,
  resolution_note text check (resolution_note is null or char_length(resolution_note) between 3 and 1000), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(environment, fingerprint)
);
create index if not exists operational_incidents_open_idx on public.operational_incidents(status, severity, last_seen_at desc);
alter table public.operational_incidents enable row level security;
create policy "operational_incidents_admin_select" on public.operational_incidents for select to authenticated using (public.is_admin());
create policy "operational_incidents_admin_update" on public.operational_incidents for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.record_operational_incident(p_incident_type text,p_severity text,p_title text,p_safe_summary text,p_source text,p_environment text,p_fingerprint text,p_metadata jsonb default '{}'::jsonb,p_related_order_id uuid default null,p_related_payment_reference text default null,p_related_service_id bigint default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.operational_incidents(incident_type,severity,title,safe_summary,source,environment,fingerprint,metadata,related_order_id,related_payment_reference,related_service_id)
  values(p_incident_type,p_severity,p_title,p_safe_summary,p_source,p_environment,p_fingerprint,coalesce(p_metadata,'{}'),p_related_order_id,p_related_payment_reference,p_related_service_id)
  on conflict(environment,fingerprint) do update set severity=excluded.severity,title=excluded.title,safe_summary=excluded.safe_summary,metadata=excluded.metadata,last_seen_at=now(),updated_at=now(),occurrence_count=public.operational_incidents.occurrence_count+1,status=case when public.operational_incidents.status='resolved' then 'open' else public.operational_incidents.status end,resolved_at=case when public.operational_incidents.status='resolved' then null else public.operational_incidents.resolved_at end,resolved_by=case when public.operational_incidents.status='resolved' then null else public.operational_incidents.resolved_by end,resolution_note=case when public.operational_incidents.status='resolved' then null else public.operational_incidents.resolution_note end
  returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.record_operational_incident(text,text,text,text,text,text,text,jsonb,uuid,text,bigint) from public;
grant execute on function public.record_operational_incident(text,text,text,text,text,text,text,jsonb,uuid,text,bigint) to service_role;
