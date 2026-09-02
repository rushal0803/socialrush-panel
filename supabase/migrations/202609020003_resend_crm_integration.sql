-- Resend adapter state only; the provider-neutral CRM tables remain unchanged.
create table if not exists public.crm_resend_webhook_events (
  event_id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);
alter table public.crm_resend_webhook_events enable row level security;
create policy "admins read Resend webhook events" on public.crm_resend_webhook_events for select to authenticated using (public.is_admin());

insert into public.crm_outreach_settings (enabled, auto_send, require_verified_business_email, require_compliance_eligible, global_daily_send_limit, from_name, from_email, reply_to, provider, default_timezone)
select true, false, true, true, 20, 'SocialRUSH', 'growth@outreach.getsocialrush.com', 'growth@outreach.getsocialrush.com', 'resend', 'Asia/Kolkata'
where not exists (select 1 from public.crm_outreach_settings);

update public.crm_outreach_settings
set provider = 'resend', from_name = 'SocialRUSH', from_email = 'growth@outreach.getsocialrush.com', reply_to = 'growth@outreach.getsocialrush.com', auto_send = false
where provider is null or provider = 'resend';
