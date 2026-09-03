-- Canonical, provider-neutral Telegram standard services. Safe to rerun.
-- This migration intentionally contains no provider mapping, provider cost, or supplier data.
insert into public.categories (name)
values ('Telegram Community Growth')
on conflict (name) do nothing;

with category_row as (
  select id from public.categories where name = 'Telegram Community Growth'
), standard_services as (
  select * from (values
    ('telegram-post-views', 'Telegram Post Views', 99.0000::numeric,
      'Increase visible viewing activity on an eligible public Telegram channel post.',
      'Submit the exact public Telegram post and keep it accessible while the order is processing.'),
    ('telegram-post-reactions', 'Telegram Post Reactions', 499.0000::numeric,
      'Increase visible engagement on an eligible public Telegram post with reaction activity.',
      'Submit the exact public Telegram post that should receive reactions and keep it accessible while processing.'),
    ('telegram-poll-votes', 'Telegram Poll Votes', 699.0000::numeric,
      'Increase voting activity on an eligible public Telegram poll.',
      'Submit the exact public Telegram post containing the poll and keep it accessible while processing.')
  ) as t(code, name, rate, description, important_instruction)
)
insert into public.services (
  category_id, code, name, rate, min, max, description, status, platform,
  delivery_time, refill_policy, quality_type, important_instruction, input_type,
  is_active, accepts_new_orders
)
select c.id, s.code, s.name, s.rate, 100, 100000, s.description, 'active',
  'telegram', '1-2 days', 'No Refill', 'Standard', s.important_instruction,
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
  platform = 'telegram',
  delivery_time = '1-2 days',
  refill_policy = 'No Refill',
  quality_type = 'Standard',
  important_instruction = excluded.important_instruction,
  input_type = 'quantity',
  is_active = true,
  accepts_new_orders = true;
