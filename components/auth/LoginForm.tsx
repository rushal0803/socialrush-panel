"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setLoading(false);
    }
  }

  return <>
    {error && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">{error}</div>}
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div><label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="field" /></div>
      <div><div className="flex justify-between"><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label><Link href="/forgot-password" className="text-sm font-semibold text-rush-600">Forgot password?</Link></div><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" className="field" /></div>
      <label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-rush-600" /> Keep me signed in</label>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Log in to SocialRUSH"}</button>
    </form>
  </>;
}
