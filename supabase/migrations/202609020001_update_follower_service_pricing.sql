-- The canonical code is the customer-order identity. Updating by it keeps
-- display names and legacy aliases out of pricing decisions.
update public.services
set rate = case code
  when 'instagram-followers' then 799.0000
  when 'x-followers' then 1499.0000
  when 'linkedin-followers' then 3999.0000
  else rate
end,
updated_at = now()
where code in ('instagram-followers', 'x-followers', 'linkedin-followers');

-- Compatibility for deployments that have not yet received canonical codes.
update public.services
set rate = case
  when lower(name) in ('instagram followers', 'instagram real followers') then 799.0000
  when lower(name) in ('x followers', 'twitter/x followers') then 1499.0000
  when lower(name) in ('linkedin followers', 'linkedin profile followers') then 3999.0000
  else rate
end,
updated_at = now()
where code is null
  and lower(name) in (
    'instagram followers', 'instagram real followers',
    'x followers', 'twitter/x followers',
    'linkedin followers', 'linkedin profile followers'
  );
