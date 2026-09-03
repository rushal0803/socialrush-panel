-- Twitter/X crypto-based catalogue entries.
alter table public.services add column if not exists input_type text not null default 'quantity'
  check (input_type in ('quantity', 'custom_comments'));

insert into public.categories (name)
values ('Twitter / X - Crypto Based Services')
on conflict (name) do nothing;

with category_row as (
  select id from public.categories where name = 'Twitter / X - Crypto Based Services'
), crypto_services as (
  select * from (values
    ('twitter-crypto-followers', 'Twitter / X Crypto-Based Followers', 4999.0000::numeric, 100, 10000, 'Up to 1K/day', 'Crypto-Based', 'quantity', 'Grow your crypto-focused Twitter/X profile with specialized crypto-based followers. Suitable for cryptocurrency, Web3, blockchain, NFT and related profiles.', 'Twitter/X profile must remain public during delivery. Fixed delivery speed. No refill.'),
    ('twitter-crypto-likes', 'Twitter / X Crypto-Based Likes', 5499.0000::numeric, 100, 10000, 'Up to 1K/day', 'Crypto-Based', 'quantity', 'Increase engagement on crypto-related Twitter/X posts with specialized crypto-based likes. Suitable for crypto, Web3, blockchain, NFT and related content.', 'Post must remain public during delivery. Fixed delivery speed. No refill.'),
    ('twitter-crypto-retweets', 'Twitter / X Crypto-Based Retweets', 5999.0000::numeric, 100, 10000, 'Up to 1K/day', 'Crypto-Based', 'quantity', 'Expand the reach of crypto-related Twitter/X posts with specialized crypto-based retweets. Ideal for cryptocurrency, Web3, blockchain, NFT and related content.', 'Post must remain public during delivery. Fixed delivery speed. No refill.'),
    ('twitter-crypto-custom-comments', 'Twitter / X Crypto-Based Custom Comments', 6999.0000::numeric, 100, 10000, 'Up to 250/day', 'Crypto-Based - Custom Comments', 'custom_comments', 'Add custom crypto-focused comments to eligible Twitter/X posts. Enter the comments you want delivered and keep the post public while the order is processing.', 'Post must remain public during delivery. Enter one comment per line. Fixed delivery speed. No refill.')
  ) as t(code, name, rate, min, max, delivery_time, quality_type, input_type, description, important_instruction)
)
insert into public.services (category_id, code, name, rate, min, max, description, status, platform, delivery_time, refill_policy, quality_type, important_instruction, input_type, is_active)
select c.id, s.code, s.name, s.rate, s.min, s.max, s.description, 'active', 'twitter', s.delivery_time, 'No Refill', s.quality_type, s.important_instruction, s.input_type, true
from crypto_services s cross join category_row c
on conflict (code) where code is not null do update set
  category_id = excluded.category_id, name = excluded.name, rate = excluded.rate, min = excluded.min, max = excluded.max, description = excluded.description,
  platform = excluded.platform, delivery_time = excluded.delivery_time, refill_policy = excluded.refill_policy,
  quality_type = excluded.quality_type, important_instruction = excluded.important_instruction,
  input_type = excluded.input_type, status = 'active', is_active = true;
