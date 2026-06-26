import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile, ProfileSetupError } from "@/lib/auth/ensure-profile";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  try {
    await ensureUserProfile(supabase, user);
  } catch (error) {
    const message = error instanceof ProfileSetupError ? error.message : "Unable to prepare your account profile.";
    return (
      <main className="dashboard-shell grid min-h-screen place-items-center px-6">
        <section className="dashboard-glass w-full max-w-lg p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f59f0b]">Dashboard setup required</p>
          <h1 className="mt-3 text-2xl font-black text-[#122a5c]">Your account is signed in</h1>
          <p className="mt-4 text-sm leading-7 text-[#4d6796]">{message}</p>
          <p className="mt-4 text-xs leading-6 text-[#6d84b3]">
            Ask the project administrator to apply the latest Supabase migrations, then refresh this page.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-shell relative flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        {children}
      </div>
    </div>
  );
}
