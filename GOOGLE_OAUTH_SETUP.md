# Google OAuth Setup Guide for SocialRUSH

Google Sign-In has been added to the login and signup pages. To enable it, follow these steps:

## 1. Get Google OAuth Credentials

### Option A: Using Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "Credentials" in the left menu
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://www.getsocialrush.com/auth/callback`
   - Also allow: `https://getsocialrush.com/auth/callback`

   Do not add Preview deployment URLs to Google Cloud. Google always returns to
   Supabase at `https://<project-ref>.supabase.co/auth/v1/callback`; add this
   Preview allowlist entry instead in **Supabase > Authentication > URL
   Configuration > Redirect URLs**:

   - `https://*-<vercel-team-or-account-slug>.vercel.app/**`
7. Copy your **Client ID** and **Client Secret**

## 2. Configure Google Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** provider
5. Enable it (toggle switch)
6. Paste your Google OAuth:
   - **Client ID**: (from step 1.7)
   - **Client Secret**: (from step 1.7)
7. Click **Save**

## 3. Update Callback URL (if not already set)

Ensure your redirect URI in Google Cloud matches your Supabase callback:

- **Redirect URI**: `https://<your-supabase-url>.supabase.co/auth/v1/callback`

Note: Supabase will show this URL in the provider settings.

## 4. Test the Integration

1. Go to `/login` page
2. Click **"Continue with Google"** button
3. You should be redirected to Google's login page
4. After authorizing, you'll be redirected back and automatically logged in
5. Same flow applies on `/register` for new account creation

## How It Works

- **Login Page** (`/login`):
  - Supports `?next=/path` parameter to redirect after login
  - Example: `/login?next=/dashboard/new-order` will redirect to `/dashboard/new-order` after Google login
  - Default redirect: `/services`

- **Signup Page** (`/register`):
  - Redirects to `/services` after successful Google signup
  - User profile is automatically created

- **Error Handling**:
  - If Google provider is not configured, shows: "Google sign-in is not configured yet. Please use email login."
  - Users can always fall back to email/password authentication

## Environment Variables

Google OAuth configuration is **NOT** stored in your codebase. All secrets are managed securely in Supabase:

- ✅ Client ID: Stored in Supabase Dashboard
- ✅ Client Secret: Stored securely in Supabase
- ✅ No hardcoded secrets in your application

## Troubleshooting

### "Google sign-in is not configured yet"

- **Solution**: Make sure you enabled the Google provider in Supabase and saved the credentials

### Redirect URI mismatch error

- **Solution**: Verify the redirect URI in Google Cloud Console matches your deployment URL

### "Invalid Client" error

- **Solution**: Double-check your Client ID and Client Secret are correctly pasted in Supabase

### User not redirected after Google login

- **Solution**: Check your Supabase auth callback route is accessible at `/auth/callback`

## Files Modified

- `components/auth/LoginForm.tsx` - Added Google OAuth button and handler
- `components/auth/RegisterForm.tsx` - Added Google OAuth button and handler
- `app/auth/callback/route.ts` - Already supports OAuth callbacks (no changes needed)

## Security Notes

- ✅ No secrets hardcoded in frontend code
- ✅ OAuth flow handled securely by Supabase
- ✅ Email/password authentication still available as fallback
- ✅ User session managed by Supabase auth
- ✅ ?next parameter validated server-side to prevent open redirects

---

**Questions?** Check Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
