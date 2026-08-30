-- Favourites need an immutable customer-order service identity. `code` remains
-- nullable because legacy and generic catalog rows are deliberately not mapped.
alter table public.services add column if not exists code text;

-- These are the verified production IDs for the current customer-order rows.
-- Deliberately do not derive this mapping from names, platform values, or any
-- fuzzy/partial matching: older rows can use the same presentation values.
with canonical_codes(id, code) as (
  values
    (22::bigint, 'instagram-followers'), (20::bigint, 'instagram-likes'),
    (27::bigint, 'instagram-views'), (37::bigint, 'instagram-comments'),
    (38::bigint, 'instagram-saves'), (39::bigint, 'instagram-shares'),
    (32::bigint, 'youtube-subscribers'), (35::bigint, 'youtube-likes'),
    (21::bigint, 'youtube-views'), (40::bigint, 'youtube-comments'),
    (41::bigint, 'youtube-watch-hours'), (19::bigint, 'facebook-followers'),
    (34::bigint, 'facebook-likes'), (26::bigint, 'facebook-views'),
    (36::bigint, 'facebook-shares'), (30::bigint, 'linkedin-followers'),
    (29::bigint, 'linkedin-likes'), (24::bigint, 'telegram-members'),
    (28::bigint, 'tiktok-followers'), (23::bigint, 'tiktok-likes'),
    (33::bigint, 'tiktok-views'), (25::bigint, 'x-followers')
)
update public.services service
set code = canonical_codes.code
from canonical_codes
where service.id = canonical_codes.id
  and service.code is null;

create unique index if not exists services_code_unique_idx
  on public.services (code)
  where code is not null;
