-- Keep the database service catalog aligned with the canonical ₹30 / 1,000 rate.

update public.services
set rate = 30.0000
where lower(name) in ('instagram views', 'instagram video views');
