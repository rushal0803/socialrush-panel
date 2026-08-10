# Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key from **Project Settings > API**.
3. Apply `supabase/migrations/202606190001_initial_schema.sql` with the Supabase CLI (`supabase db push`) or the SQL editor.
4. In **Authentication > URL Configuration**, set the site URL and add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://www.getsocialrush.com/auth/callback`
   - `https://getsocialrush.com/auth/callback`
   - `https://*-<vercel-team-or-account-slug>.vercel.app/**` (Vercel Preview deployments)

   Keep `https://www.getsocialrush.com` as the Site URL. The Preview pattern is
   an additional Redirect URL: Supabase requires the `redirectTo` URL to match
   this allowlist and otherwise falls back to the Site URL.
5. Keep email confirmation enabled in **Authentication > Providers > Email** to require email verification.
6. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

To promote a user to admin, update the profile from the Supabase SQL editor using a trusted administrator connection:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Never expose the Supabase service-role key in this Next.js application. The app uses the anon key with authenticated sessions and database Row Level Security.
