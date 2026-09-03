-- Canonical, provider-neutral LinkedIn USA services. Safe to rerun.
-- No provider mapping, supplier identifier, external API routing, or provider cost is stored here.
insert into public.categories (name)
values ('LinkedIn Brand Visibility')
on conflict (name) do nothing;

with category_row as (
  select id from public.categories where name = 'LinkedIn Brand Visibility'
), usa_services as (
  select * from (values
    ('linkedin-usa-connections', 'LinkedIn USA Connections', 9999.0000::numeric, 'No Refill', 'Increase connection activity for an eligible public LinkedIn personal profile with the USA-targeted service option.', 'Enter the correct public LinkedIn personal profile URL and keep the profile accessible while the order is processing.'),
    ('linkedin-usa-post-likes', 'LinkedIn USA Post Likes', 4999.0000::numeric, '30 Days Refill', 'Increase visible like activity on an eligible public LinkedIn post with the USA-targeted service option.', 'Enter the exact public LinkedIn post URL and keep the post accessible while the order is processing.'),
    ('linkedin-usa-endorsements', 'LinkedIn USA Endorsements', 17999.0000::numeric, 'No Refill', 'Increase endorsement activity for a specified skill on an eligible public LinkedIn personal profile with the USA-targeted service option.', 'Enter the correct public LinkedIn personal profile URL and specify the exact skill that should receive endorsements.'),
    ('linkedin-usa-followers', 'LinkedIn USA Followers', 4999.0000::numeric, '30 Days Refill', 'Increase follower activity on an eligible public LinkedIn personal profile with the USA-targeted service option.', 'Enter the correct public LinkedIn personal profile URL and keep the profile accessible while the order is processing.'),
    ('linkedin-usa-group-members', 'LinkedIn USA Group Members', 9999.0000::numeric, '30 Days Refill', 'Increase member activity for an eligible LinkedIn Group with the USA-targeted service option.', 'Enter the correct LinkedIn Group URL and keep the group accessible as required while the order is processing.'),
    ('linkedin-usa-custom-comments', 'LinkedIn USA Custom Comments', 19999.0000::numeric, 'No Refill', 'Add customer-provided comment activity to an eligible public LinkedIn post with the USA-targeted service option.', 'Enter the exact public LinkedIn post URL and provide exactly one custom comment per line. The number of valid comments must match the order quantity.'),
    ('linkedin-usa-reposts', 'LinkedIn USA Reposts', 8999.0000::numeric, 'No Refill', 'Increase repost activity on an eligible public LinkedIn post with the USA-targeted service option.', 'Enter the exact public LinkedIn post URL and keep the post accessible while the order is processing.')
  ) as t(code, name, rate, refill_policy, description, important_instruction)
)
insert into public.services (category_id, code, name, rate, min, max, description, status, platform, delivery_time, refill_policy, quality_type, important_instruction, input_type, is_active, accepts_new_orders)
select c.id, s.code, s.name, s.rate, 100, 10000, s.description, 'active', 'linkedin', '1-3 days', s.refill_policy, 'Professional', s.important_instruction, 'quantity', true, true
from usa_services s cross join category_row c
on conflict (code) where code is not null do update set
  category_id = excluded.category_id, name = excluded.name, rate = excluded.rate, min = excluded.min, max = excluded.max,
  description = excluded.description, status = 'active', platform = 'linkedin', delivery_time = '1-3 days',
  refill_policy = excluded.refill_policy, quality_type = 'Professional', important_instruction = excluded.important_instruction,
  input_type = 'quantity', is_active = true, accepts_new_orders = true;
