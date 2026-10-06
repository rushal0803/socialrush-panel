-- Keep the authoritative YouTube Subscribers selling rate aligned with the
-- current public SocialRUSH price. Ordering continues to price from the
-- active services row at checkout.

update public.services
set rate = 6999.0000
where code = 'youtube-subscribers'
  and status = 'active'
  and is_active = true;
