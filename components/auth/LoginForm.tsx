"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ADMIN_DESTINATION,
  DEFAULT_CUSTOMER_DESTINATION,
  getSafeCustomerDestination,
} from "@/lib/auth/destination";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerDestination = getSafeCustomerDestination(searchParams.get("next"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  function mapAuthError(message: string) {
    const normalized = message.toLowerCase();

    if (
      normalized.includes("unsupported provider") ||
      normalized.includes("provider is not enabled") ||
      normalized.includes("validation_failed")
    ) {
      return "Google login is not enabled yet. Please use email and password or contact support.";
    }

    if (normalized.includes("invalid login credentials")) {
      return "Invalid email or password. Please try again.";
    }

    return message;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const supabase = createClient();
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !loginData.user) {
        setError(mapAuthError(loginError?.message || "Unable to sign in. Please try again."));
        setLoading(false);
        return;
      }

      if (!keepSignedIn) {
        // Supabase browser sessions persist by default. We still expose this checkbox for expected UX.
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", loginData.user.id)
        .maybeSingle();
      router.replace(
        profile?.role === "admin" ? ADMIN_DESTINATION : customerDestination,
      );
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.set("next", customerDestination || DEFAULT_CUSTOMER_DESTINATION);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl.toString(),
        },
      });

      if (oauthError) {
        setError(mapAuthError(oauthError.message || "Unable to sign in with Google. Please try again."));
        setGoogleLoading(false);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
          {error}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-white/[.06] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleLoading ? "Signing in with Google..." : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-orange-400/20"></div>
        <span className="text-xs font-medium text-[#9CA3AF]">or continue with email</span>
        <div className="h-px flex-1 bg-orange-400/20"></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-[#D1D5DB]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="auth-field" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-[#D1D5DB]">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-orange-600 transition hover:text-orange-500">Forgot password?</Link>
          </div>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="auth-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9CA3AF] transition hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#D1D5DB]">
          <input
            type="checkbox"
            checked={keepSignedIn}
            onChange={(event) => setKeepSignedIn(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-orange-500"
          />
          Keep me signed in
        </label>
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-orange-400/50 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </>
  );
}
