-- Full SMM service catalog sync
-- Ensures all required services exist and max quantity is 1,000,000.

alter table public.services add column if not exists quality_type text not null default 'Premium';
alter table public.services add column if not exists important_instruction text not null default 'Use a public URL only.';

insert into public.categories (name) values
  ('Instagram Growth Campaigns'),
  ('YouTube Reach Campaigns'),
  ('Facebook Page Growth'),
  ('LinkedIn Brand Visibility'),
  ('Telegram Community Growth'),
  ('TikTok Growth Campaigns'),
  ('X/Twitter Engagement Campaigns')
on conflict (name) do nothing;

with catalog as (
  select * from (values
    ('instagram', 'Instagram Growth Campaigns', 'Instagram Real Followers', 'Build profile authority with gradual premium follower delivery.', 599.0000, 100, 1000000, '1-7 days', '30 days refill', 'Premium', 'Use public profile URL only.', true),
    ('instagram', 'Instagram Growth Campaigns', 'Instagram Likes', 'Increase engagement and social proof on posts and reels.', 299.0000, 100, 1000000, '1-3 days', 'Refill eligible', 'Premium', 'Use public post/reel URL.', true),
    ('instagram', 'Instagram Growth Campaigns', 'Instagram Views', 'Increase reach and visibility with high-retention view delivery.', 99.0000, 100, 1000000, '1-3 days', 'Refill eligible', 'Premium', 'Use public reel/post URL.', true),

    ('youtube', 'YouTube Reach Campaigns', 'YouTube Subscribers', 'Strengthen channel credibility with premium subscriber campaigns.', 3999.0000, 100, 1000000, '3-10 days', '30 days refill', 'Premium', 'Use public channel URL.', true),
    ('youtube', 'YouTube Reach Campaigns', 'YouTube Likes', 'Improve engagement and social proof with high-quality YouTube likes.', 499.0000, 100, 1000000, '2-7 days', 'Refill eligible', 'Premium', 'Use public video URL.', true),
    ('youtube', 'YouTube Reach Campaigns', 'YouTube Views', 'Boost discoverability through increased high-retention views.', 499.0000, 100, 1000000, '2-7 days', 'Refill eligible', 'Premium', 'Use public video URL and keep video public.', true),

    ('facebook', 'Facebook Page Growth', 'Facebook Followers', 'Grow page audience and strengthen brand trust.', 499.0000, 100, 1000000, '2-8 days', '30 days refill', 'Premium', 'Use public page/profile URL.', true),
    ('facebook', 'Facebook Page Growth', 'Facebook Likes', 'Increase interactions and social proof across posts.', 299.0000, 100, 1000000, '1-5 days', 'Refill eligible', 'Premium', 'Use public post URL.', true),
    ('facebook', 'Facebook Page Growth', 'Facebook Views', 'Expand content reach and improve campaign visibility.', 199.0000, 100, 1000000, '1-4 days', 'Refill eligible', 'Premium', 'Use public video URL.', true),

    ('linkedin', 'LinkedIn Brand Visibility', 'LinkedIn Profile Followers', 'Improve professional authority and profile visibility.', 1499.0000, 100, 1000000, '2-9 days', 'Refill eligible', 'Professional', 'Use public profile URL and avoid URL changes.', true),
    ('linkedin', 'LinkedIn Brand Visibility', 'LinkedIn Likes', 'Boost credibility with stronger post-level social proof.', 899.0000, 100, 1000000, '1-6 days', 'Refill eligible', 'Professional', 'Use public post URL.', true),

    ('telegram', 'Telegram Community Growth', 'Telegram Members', 'Scale channel audience and strengthen community traction.', 799.0000, 100, 1000000, '2-7 days', 'Refill eligible', 'Premium', 'Use public channel/group URL.', true),

    ('tiktok', 'TikTok Growth Campaigns', 'TikTok Followers', 'Build profile momentum with quality follower growth.', 799.0000, 100, 1000000, '2-7 days', 'Refill eligible', 'Premium', 'Use public profile URL.', true),
    ('tiktok', 'TikTok Growth Campaigns', 'TikTok Likes', 'Increase engagement strength on short-form content.', 249.0000, 100, 1000000, '1-4 days', 'Refill eligible', 'Premium', 'Use public post URL.', true),
    ('tiktok', 'TikTok Growth Campaigns', 'TikTok Views', 'Improve reach and discovery on short-form videos.', 99.0000, 100, 1000000, '1-3 days', 'Refill eligible', 'Premium', 'Use public video URL.', true),

    ('twitter', 'X/Twitter Engagement Campaigns', 'X Followers', 'Increase profile authority and long-term social visibility.', 999.0000, 100, 1000000, '2-7 days', '30 days refill', 'Premium', 'Use public profile URL and avoid handle changes.', true),
    ('twitter', 'X/Twitter Engagement Campaigns', 'X Likes', 'Improve engagement and social proof for campaign posts.', 399.0000, 100, 1000000, '1-5 days', 'Refill eligible', 'Premium', 'Use public post URL.', true)
  ) as t(platform, category_name, service_name, description, rate, min_qty, max_qty, delivery_time, refill_policy, quality_type, important_instruction, is_active)
), category_map as (
  select c.name, c.id from public.categories c
), upserted as (
  insert into public.services (
    category_id, name, rate, min, max, description, status,
    platform, delivery_time, refill_policy, quality_type, important_instruction, is_active
  )
  select
    cm.id,
    cat.service_name,
    cat.rate,
    cat.min_qty,
    cat.max_qty,
    cat.description,
    case when cat.is_active then 'active' else 'inactive' end,
    cat.platform,
    cat.delivery_time,
    cat.refill_policy,
    cat.quality_type,
    cat.important_instruction,
    cat.is_active
  from catalog cat
  join category_map cm on cm.name = cat.category_name
  where not exists (
    select 1 from public.services s where lower(s.name) = lower(cat.service_name)
  )
  returning id
)
select count(*) from upserted;

update public.services s
set
  rate = cat.rate,
  min = cat.min_qty,
  max = cat.max_qty,
  description = cat.description,
  status = case when cat.is_active then 'active' else 'inactive' end,
  platform = cat.platform,
  delivery_time = cat.delivery_time,
  refill_policy = cat.refill_policy,
  quality_type = cat.quality_type,
  important_instruction = cat.important_instruction,
  is_active = cat.is_active
from (
  select * from (values
    ('Instagram Real Followers', 'instagram', 599.0000, 100, 1000000, 'Build profile authority with gradual premium follower delivery.', '1-7 days', '30 days refill', 'Premium', 'Use public profile URL only.', true),
    ('Instagram Likes', 'instagram', 299.0000, 100, 1000000, 'Increase engagement and social proof on posts and reels.', '1-3 days', 'Refill eligible', 'Premium', 'Use public post/reel URL.', true),
    ('Instagram Views', 'instagram', 99.0000, 100, 1000000, 'Increase reach and visibility with high-retention view delivery.', '1-3 days', 'Refill eligible', 'Premium', 'Use public reel/post URL.', true),
    ('YouTube Subscribers', 'youtube', 3999.0000, 100, 1000000, 'Strengthen channel credibility with premium subscriber campaigns.', '3-10 days', '30 days refill', 'Premium', 'Use public channel URL.', true),
    ('YouTube Likes', 'youtube', 499.0000, 100, 1000000, 'Improve engagement and social proof with high-quality YouTube likes.', '2-7 days', 'Refill eligible', 'Premium', 'Use public video URL.', true),
    ('YouTube Views', 'youtube', 499.0000, 100, 1000000, 'Boost discoverability through increased high-retention views.', '2-7 days', 'Refill eligible', 'Premium', 'Use public video URL and keep video public.', true),
    ('Facebook Followers', 'facebook', 499.0000, 100, 1000000, 'Grow page audience and strengthen brand trust.', '2-8 days', '30 days refill', 'Premium', 'Use public page/profile URL.', true),
    ('Facebook Likes', 'facebook', 299.0000, 100, 1000000, 'Increase interactions and social proof across posts.', '1-5 days', 'Refill eligible', 'Premium', 'Use public post URL.', true),
    ('Facebook Views', 'facebook', 199.0000, 100, 1000000, 'Expand content reach and improve campaign visibility.', '1-4 days', 'Refill eligible', 'Premium', 'Use public video URL.', true),
    ('LinkedIn Profile Followers', 'linkedin', 1499.0000, 100, 1000000, 'Improve professional authority and profile visibility.', '2-9 days', 'Refill eligible', 'Professional', 'Use public profile URL and avoid URL changes.', true),
    ('LinkedIn Likes', 'linkedin', 899.0000, 100, 1000000, 'Boost credibility with stronger post-level social proof.', '1-6 days', 'Refill eligible', 'Professional', 'Use public post URL.', true),
    ('Telegram Members', 'telegram', 799.0000, 100, 1000000, 'Scale channel audience and strengthen community traction.', '2-7 days', 'Refill eligible', 'Premium', 'Use public channel/group URL.', true),
    ('TikTok Followers', 'tiktok', 799.0000, 100, 1000000, 'Build profile momentum with quality follower growth.', '2-7 days', 'Refill eligible', 'Premium', 'Use public profile URL.', true),
    ('TikTok Likes', 'tiktok', 249.0000, 100, 1000000, 'Increase engagement strength on short-form content.', '1-4 days', 'Refill eligible', 'Premium', 'Use public post URL.', true),
    ('TikTok Views', 'tiktok', 99.0000, 100, 1000000, 'Improve reach and discovery on short-form videos.', '1-3 days', 'Refill eligible', 'Premium', 'Use public video URL.', true),
    ('X Followers', 'twitter', 999.0000, 100, 1000000, 'Increase profile authority and long-term social visibility.', '2-7 days', '30 days refill', 'Premium', 'Use public profile URL and avoid handle changes.', true),
    ('X Likes', 'twitter', 399.0000, 100, 1000000, 'Improve engagement and social proof for campaign posts.', '1-5 days', 'Refill eligible', 'Premium', 'Use public post URL.', true)
  ) as t(service_name, platform, rate, min_qty, max_qty, description, delivery_time, refill_policy, quality_type, important_instruction, is_active)
) cat
where lower(s.name) = lower(cat.service_name);

update public.services
set max = 1000000
where status = 'active' and max <> 1000000;
