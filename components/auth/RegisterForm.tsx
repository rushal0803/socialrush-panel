"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/events";
import {
  DEFAULT_CUSTOMER_DESTINATION,
  getSafeCustomerDestination,
} from "@/lib/auth/destination";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerDestination = getSafeCustomerDestination(searchParams.get("next"));
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAttempted(true);
    setLoading(true);
    track("sign_up_started");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const fullName = String(formData.get("fullName") || "").trim();

    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", customerDestination || DEFAULT_CUSTOMER_DESTINATION);
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Account creation is confirmed by Supabase; no credentials are tracked.
        void fetch("/api/analytics/auth-completed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "sign_up_completed" }) });
        router.replace(customerDestination);
      } else {
        router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError("Unable to create your account right now. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {attempted && error && (
        <div role="alert" aria-live="polite" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
          {error}
        </div>
      )}

      {/* Email Signup Form */}
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label htmlFor="fullName" className="text-sm font-semibold text-[#D1D5DB]">Full name</label>
          <input id="fullName" name="fullName" autoComplete="name" required placeholder="Alex Morgan" className="auth-field" />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-[#D1D5DB]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="auth-field" />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-[#D1D5DB]">Password</label>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="auth-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-white/5 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#D1D5DB]">Confirm password</label>
          <div className="relative mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Re-enter your password"
              className="auth-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-2 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-white/5 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm leading-5 text-[#D1D5DB]">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-orange-500" />
          <span>
            I agree to the{" "}
            <Link href="/terms-and-conditions" className="font-semibold text-orange-600 transition hover:text-orange-500">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy-policy" className="font-semibold text-orange-600 transition hover:text-orange-500">Privacy Policy</Link>.
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-orange-400/50 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </>
  );
}
