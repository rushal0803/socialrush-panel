-- Canonical, provider-neutral TikTok standard services. Safe to rerun.
-- This migration intentionally contains no provider mapping, provider cost, or supplier data.
insert into public.categories (name)
values ('TikTok Growth Campaigns')
on conflict (name) do nothing;

with category_row as (
  select id from public.categories where name = 'TikTok Growth Campaigns'
), standard_services as (
  select * from (values
    ('tiktok-followers', 'TikTok Followers', 999.0000::numeric, '30 Days Refill',
      'Increase visible follower activity on an eligible public TikTok profile.',
      'Enter the correct public TikTok profile URL and keep the profile publicly accessible while the order is processing.'),
    ('tiktok-likes', 'TikTok Likes', 199.0000::numeric, 'No Refill',
      'Increase visible engagement on an eligible public TikTok video with like activity.',
      'Enter the correct public TikTok video URL and keep the video publicly accessible while the order is processing.'),
    ('tiktok-views', 'TikTok Views', 29.0000::numeric, 'No Refill',
      'Increase visible viewing activity on an eligible public TikTok video.',
      'Enter the correct public TikTok video URL and keep the video publicly accessible while the order is processing.'),
    ('tiktok-custom-comments', 'TikTok Custom Comments', 1499.0000::numeric, 'No Refill',
      'Add customer-provided comment activity to an eligible public TikTok video.',
      'Enter the correct public TikTok video URL and provide exactly one custom comment per line. The number of comments must match the order quantity.'),
    ('tiktok-story-views', 'TikTok Story Views', 199.0000::numeric, 'No Refill',
      'Increase viewing activity on an eligible public TikTok story.',
      'Enter the correct eligible TikTok target URL and keep the target accessible while the order is processing.'),
    ('tiktok-saves', 'TikTok Saves', 299.0000::numeric, 'No Refill',
      'Increase save activity on an eligible public TikTok video.',
      'Enter the correct public TikTok video URL and keep the video publicly accessible while the order is processing.')
  ) as t(code, name, rate, refill_policy, description, important_instruction)
)
insert into public.services (
  category_id, code, name, rate, min, max, description, status, platform,
  delivery_time, refill_policy, quality_type, important_instruction, input_type,
  is_active, accepts_new_orders
)
select c.id, s.code, s.name, s.rate, 100, 100000, s.description, 'active',
  'tiktok', '1-2 days', s.refill_policy, 'Standard', s.important_instruction,
  'quantity', true, true
from standard_services s cross join category_row c
on conflict (code) where code is not null do update set
  category_id = excluded.category_id,
  name = excluded.name,
  rate = excluded.rate,
  min = excluded.min,
  max = excluded.max,
  description = excluded.description,
  status = 'active',
  platform = 'tiktok',
  delivery_time = '1-2 days',
  refill_policy = excluded.refill_policy,
  quality_type = 'Standard',
  important_instruction = excluded.important_instruction,
  input_type = 'quantity',
  is_active = true,
  accepts_new_orders = true;
