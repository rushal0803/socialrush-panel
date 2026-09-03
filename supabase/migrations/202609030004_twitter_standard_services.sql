-- Canonical, provider-neutral Twitter/X standard services. Safe to rerun.
-- UI uses platform "x"; production service rows continue to use "twitter".
insert into public.categories (name)
values ('X/Twitter Engagement Campaigns')
on conflict (name) do nothing;

with category_row as (
  select id from public.categories where name = 'X/Twitter Engagement Campaigns'
), standard_services as (
  select * from (values
    ('twitter-likes', 'Twitter / X Likes', 499.0000::numeric, 100, 1000,
      'Increase visible engagement on a public Twitter/X post with like activity.',
      'Submit the correct public Twitter/X post URL and keep the post public while the order is processing.'),
    ('twitter-views', 'Twitter / X Views', 49.0000::numeric, 100, 100000,
      'Increase visible reach and activity on an eligible public Twitter/X post.',
      'Submit the correct public Twitter/X post URL and keep the post public while the order is processing.'),
    ('twitter-retweets', 'Twitter / X Retweets', 599.0000::numeric, 100, 100000,
      'Increase distribution and visible sharing activity on a public Twitter/X post.',
      'Submit the correct public Twitter/X post URL and keep the post public while the order is processing.')
  ) as t(code, name, rate, min_qty, max_qty, description, important_instruction)
)
insert into public.services (
  category_id, code, name, rate, min, max, description, status, platform,
  delivery_time, refill_policy, quality_type, important_instruction, input_type, is_active
)
select c.id, s.code, s.name, s.rate, s.min_qty, s.max_qty, s.description,
  'active', 'twitter', 'Estimate shown before checkout', 'No Refill', 'Standard',
  s.important_instruction, 'quantity', true
from standard_services s cross join category_row c
on conflict (code) where code is not null do update set
  category_id = excluded.category_id,
  name = excluded.name,
  rate = excluded.rate,
  min = excluded.min,
  max = excluded.max,
  description = excluded.description,
  status = 'active',
  platform = 'twitter',
  delivery_time = excluded.delivery_time,
  refill_policy = 'No Refill',
  quality_type = 'Standard',
  important_instruction = excluded.important_instruction,
  input_type = 'quantity',
  is_active = true;
