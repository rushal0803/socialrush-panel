-- Allow an authenticated user to repair a missing profile created outside the app.
-- Role and balance are locked to safe defaults by the policy.
grant select, insert on public.profiles to authenticated;

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'user'
  and balance = 0
);
