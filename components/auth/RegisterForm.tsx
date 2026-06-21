"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
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

      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch {
      setError("Unable to create your account right now. Please try again.");
      setLoading(false);
    }
  }

  return <>
    {error && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">{error}</div>}
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="firstName" className="text-sm font-medium text-slate-700">First name</label><input id="firstName" name="firstName" required placeholder="Alex" className="field" /></div><div><label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last name</label><input id="lastName" name="lastName" required placeholder="Morgan" className="field" /></div></div>
      <div><label htmlFor="email" className="text-sm font-medium text-slate-700">Work email</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="field" /></div>
      <div><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className="field" /></div>
      <label className="flex items-start gap-2 text-sm leading-5 text-slate-500"><input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-rush-600" /><span>I agree to the <Link href="/terms-and-conditions" className="font-medium text-rush-600">Terms</Link> and <Link href="/privacy-policy" className="font-medium text-rush-600">Privacy Policy</Link>.</span></label>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account..." : "Create free account"}</button>
    </form>
  </>;
}
