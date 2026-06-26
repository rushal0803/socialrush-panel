import Link from "next/link";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/server";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import { formatCurrency } from "@/lib/currency";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name,role,balance").eq("id", user.id).maybeSingle()
    : { data: null };

  const name = profile?.full_name || user?.email?.split("@")[0] || "Client";
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-[60] border-b border-white/70 bg-white/72 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-3.5">
      <div className="mx-auto flex min-h-14 max-w-[1800px] items-center justify-between gap-3 sm:gap-4">
        <div className="shrink-0 lg:hidden">
          <Logo />
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#4f6daa]">SocialRUSH workspace</p>
          <p className="mt-1 text-sm font-bold text-[#132e66]">Welcome back, {name.split(" ")[0]}</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden rounded-xl border border-white/80 bg-white/80 px-3.5 py-2 text-right shadow-[0_10px_24px_rgba(79,108,168,.15)] sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6680b3]">Wallet</p>
            <p className="mt-0.5 text-sm font-extrabold text-[#1a356c]">{formatCurrency(Number(profile?.balance ?? 0), "INR")}</p>
          </div>

          <Link href="/dashboard/new-campaign" aria-label="New campaign" className="btn-dashboard-primary h-10 shrink-0 px-3 text-[11px] sm:px-4 sm:py-2.5 sm:text-xs">
            <span aria-hidden>+</span>
            <span className="sr-only sm:not-sr-only sm:ml-1">New campaign</span>
          </Link>

          <button
            aria-label="Notifications"
            className="relative hidden h-10 w-10 place-items-center rounded-xl border border-white/80 bg-white/80 text-[#46639a] shadow-[0_8px_18px_rgba(90,117,173,.15)] md:grid"
          >
            <span className="text-sm">◉</span>
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[#18356f]">{name}</p>
            <p className="text-xs capitalize text-[#6880ae]">{profile?.role || "user"}</p>
          </div>

          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ff66b2] via-[#8f8dff] to-[#47c4ff] text-sm font-black text-white shadow-[0_10px_24px_rgba(117,109,255,.35)]">
            {initials}
          </span>
          <DashboardMobileMenu />
        </div>
      </div>
    </header>
  );
}
