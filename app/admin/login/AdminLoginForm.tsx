"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm({ initialError = "" }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(signInError?.message || "Unable to sign in.");
      setLoading(false);
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError("Unable to verify administrator access. Please try again.");
      setLoading(false);
      return;
    }

    if (profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setLoading(false);
      return;
    }

    const { data: blockedProfile } = await supabase
      .from("profiles")
      .select("is_blocked")
      .eq("id", data.user.id)
      .maybeSingle();

    if (blockedProfile?.is_blocked) {
      await supabase.auth.signOut();
      setError("This account is blocked.");
      setLoading(false);
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  }

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,#FFF3E0_0,transparent_35%),linear-gradient(180deg,#FFF8F1,#FFF8F1)] p-5"><section className="w-full max-w-md rounded-3xl border border-white bg-white/90 p-7 shadow-[0_30px_100px_-35px_rgba(255, 159, 0, .45)] backdrop-blur-xl sm:p-9"><Logo /><div className="mt-8"><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-600">Private administration</p><h1 className="mt-3 text-3xl font-black text-[#0B0B0F]">Admin sign in</h1><p className="mt-2 text-sm leading-6 text-slate-500">Use an account whose profile role is set to admin.</p></div><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-xs font-bold text-slate-700">Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" /></label><label className="block text-xs font-bold text-slate-700">Password<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" /></label>{error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 disabled:opacity-60">{loading ? "Checking access…" : "Sign in to admin"}</button></form><a href="/" className="mt-5 block text-center text-xs font-semibold text-slate-500 hover:text-orange-600">← Return to website</a></section></main>;
}
