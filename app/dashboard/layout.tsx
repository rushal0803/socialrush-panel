import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile, ProfileSetupError } from "@/lib/auth/ensure-profile";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  try {
    await ensureUserProfile(supabase, user);
  } catch (error) {
    const message = error instanceof ProfileSetupError ? error.message : "Unable to prepare your account profile.";
    return <main className="grid min-h-screen place-items-center bg-slate-50 px-6"><section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Dashboard setup required</p><h1 className="mt-3 text-2xl font-bold text-slate-900">Your account is signed in</h1><p className="mt-4 text-sm leading-7 text-slate-600">{message}</p><p className="mt-4 text-xs leading-6 text-slate-400">Ask the project administrator to apply the latest Supabase migrations, then refresh this page.</p></section></main>;
  }
  return <div className="flex min-h-screen bg-slate-50"><Sidebar /><div className="min-w-0 flex-1"><Header />{children}</div></div>;
}
