"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

export const dashboardLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "New Order", href: "/dashboard/new-order", icon: "plus" },
  { label: "Packages", href: "/dashboard/packages", icon: "packages" },
  { label: "Orders", href: "/dashboard/orders", icon: "orders" },
  { label: "Wallet", href: "/dashboard/wallet", icon: "wallet" },
  { label: "Billing", href: "/dashboard/billing", icon: "orders" },
  { label: "Support", href: "/dashboard/support", icon: "support" },
  { label: "Account", href: "/dashboard/account", icon: "settings" },
] as const;

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 7.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12" />
        <path d="M16 13h5M17 13h.01" />
      </>
    ),
    orders: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    packages: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="2" />
        <rect x="4" y="14" width="16" height="6" rx="2" />
        <path d="M12 4v16" />
      </>
    ),
    support: (
      <>
        <path d="M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-7h4M4 13v7h4v-7H4Z" />
        <path d="M16 20c0 1-1.8 2-4 2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function NavLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={mobile ? "grid gap-2" : "space-y-1"} aria-label="Dashboard navigation">
      {dashboardLinks.map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
              active ? "text-white" : "text-[#4b669b] hover:bg-white/70 hover:text-[#1f3d77]"
            }`}
          >
            {active && (
              <motion.span
                layoutId={mobile ? "mobile-dashboard-active" : "dashboard-active"}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] shadow-[0_12px_26px_rgba(117,109,255,.35)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <NavIcon name={item.icon} />
            </span>
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currency } = usePreferredCurrency("INR");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let userId = "";

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBalance(0);
        return;
      }

      userId = user.id;
      const { data } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .maybeSingle();

      setBalance(Number(data?.balance ?? 0));
    };

    void load();

    const handleBalance = (event: Event) => {
      setBalance(Number((event as CustomEvent<number>).detail ?? 0));
    };

    window.addEventListener("wallet-balance-updated", handleBalance);

    const channel = supabase
      .channel("sidebar-balance")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as { id?: string; balance?: number | string };
          if (row.id === userId) setBalance(Number(row.balance ?? 0));
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("wallet-balance-updated", handleBalance);
      void supabase.removeChannel(channel);
    };
  }, [pathname]);

  return (
    <aside className="dashboard-sidebar hidden h-screen w-72 shrink-0 flex-col px-4 py-6 lg:sticky lg:top-0 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <div className="mx-2 mt-6 rounded-xl border border-white/85 bg-white/82 px-3 py-2.5 shadow-[0_10px_20px_rgba(85,113,175,.12)]">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#4f6daa]">Dashboard</p>
        <p className="mt-1 text-xs font-semibold text-[#1e3d77]">Growth control center</p>
      </div>

      <p className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f85b0]">Main menu</p>
      <NavLinks />

      <div className="mt-auto rounded-2xl border border-white/85 bg-white/86 p-4 text-[#1f3a72] shadow-[0_14px_30px_rgba(81,108,168,.14)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#6b82af]">Available balance</p>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        {balance === null ? (
          <div className="mt-3 h-7 w-32 animate-pulse rounded-lg bg-[#e2ebff]" />
        ) : (
          <p className="mt-2 text-2xl font-black text-[#16346c]">{formatCurrency(balance, currency)}</p>
        )}

        <Link href="/dashboard/wallet" className="btn-dashboard-primary mt-4 flex w-full justify-center py-2.5 text-xs">
          Add Funds
        </Link>
      </div>

      <form action={logout} className="mt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#5e77a6] hover:bg-white/70 hover:text-[#1f3b75]">
          <span>↪</span> Log out
        </button>
      </form>
    </aside>
  );
}