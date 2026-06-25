"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAttempted(true);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const fullName = `${String(formData.get("firstName") || "").trim()} ${String(formData.get("lastName") || "").trim()}`.trim();

    try {
      const supabase = createClient();
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: "https://socialrush-panel.vercel.app/auth/callback",
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      router.replace("/services");
      router.refresh();
    } catch {
      setError("Unable to create your account right now. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setAttempted(true);
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      
      // Get the site URL for the callback
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      
      // Build callback URL - signup defaults to /services
      const redirectUrl = `${siteUrl}/auth/callback?next=/services`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        // Check if error is due to unconfigured provider
        if (oauthError.message?.toLowerCase().includes("provider") || 
            oauthError.message?.toLowerCase().includes("configured")) {
          setError("Google sign-in is not configured yet. Please use email signup.");
        } else {
          setError(oauthError.message || "Unable to sign up with Google. Please try again.");
        }
        setGoogleLoading(false);
      }
      // If no error, the signInWithOAuth will redirect the page to Google
    } catch (err) {
      setError("An error occurred. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <>
      {attempted && error && (
        <div role="alert" aria-live="polite" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
          {error}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading || loading}
        className="mt-7 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleLoading ? "Signing up with Google..." : "Sign up with Google"}
      </button>

      {/* Divider */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-xs font-medium text-slate-500">or continue with email</span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      {/* Email Signup Form */}
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First name</label>
            <input id="firstName" name="firstName" required placeholder="Alex" className="auth-field" />
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last name</label>
            <input id="lastName" name="lastName" required placeholder="Morgan" className="auth-field" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="auth-field" />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className="auth-field" />
        </div>
        <label className="flex items-start gap-2 text-sm leading-5 text-slate-500">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-pink-500" />
          <span>
            I agree to the{" "}
            <Link href="/terms-and-conditions" className="font-semibold text-pink-600 transition hover:text-pink-500">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy-policy" className="font-semibold text-pink-600 transition hover:text-pink-500">Privacy Policy</Link>.
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-300/40 transition hover:brightness-105 hover:shadow-pink-400/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </>
  );
}
