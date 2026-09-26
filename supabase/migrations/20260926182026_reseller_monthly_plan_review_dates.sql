alter table public.reseller_monthly_plans
  add column if not exists next_review_on date;

create index if not exists reseller_monthly_plans_user_next_review_idx
  on public.reseller_monthly_plans(user_id, next_review_on)
  where next_review_on is not null;
