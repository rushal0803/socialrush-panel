import type { Metadata } from "next";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ProfileSetupError } from "@/lib/auth/ensure-profile";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let context;
  try {
    context = await getDashboardContext();
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
  if (!context.user || !context.profile) redirect("/login?next=/dashboard");

  return (
    <div className="dashboard-shell relative flex min-h-screen">
      <Sidebar initialBalance={context.profile.balance} userId={context.user.id} />
      <div className="min-w-0 flex-1">
        <Header
          email={context.user.email || ""}
          fullName={context.profile.full_name}
          role={context.profile.role}
        />
        {children}
      </div>
    </div>
  );
}
