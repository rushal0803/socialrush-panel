"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Logo from "./Logo";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { groupDashboardLinks, isDashboardLinkActive, isWorkspaceRoute } from "@/lib/dashboard/navigation";

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
    campaign: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h10A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 4 17.5z" /><path d="M8 9h7M8 13h7M8 17h4" /></>,
    clients: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5M16 5.5a3 3 0 0 1 0 5M16 15c2.6 0 4.1 1.5 4.5 4" /></>,
    heart: <path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.8 1.8Z" />,
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
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    packages: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="2" />
        <rect x="4" y="14" width="16" height="6" rx="2" />
        <path d="M12 4v16" />
      </>
    ),
    bookmark: (
      <>
        <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />
      </>
    ),
    gift: (
      <>
        <path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12" />
        <path d="M12 9H8.5a2.5 2.5 0 1 1 2.5-2.5V9Zm0 0h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
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

const mobileGroupOrder = ["Main", "Money", "Workspace", "Account", "Help"] as const;

export function NavLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = groupDashboardLinks();

  function renderItems(items: (typeof groups)["Main"]) {
    return items.map((item) => {
      const active = isDashboardLinkActive(pathname, item.href);
      const primaryAction = item.href === "/dashboard/new-order";
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={`group relative flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${active
            ? "border-orange-400/45 bg-gradient-to-r from-[#ff7900] to-[#f59e0b] text-[#160c03] shadow-[0_8px_20px_-14px_rgba(255,122,0,.75)]"
            : primaryAction
              ? "border-orange-400/25 bg-orange-400/[.10] text-orange-200 hover:border-orange-400/45 hover:bg-orange-400/[.16]"
              : "border-transparent text-slate-200 hover:border-white/10 hover:bg-white/[.07] hover:text-white"}`}
        >
          <span className={`shrink-0 ${active ? "text-[#251002]" : primaryAction ? "text-orange-300" : "text-slate-400 group-hover:text-orange-200"}`}><NavIcon name={item.icon} /></span>
          <span className="min-w-0 flex-1 break-words">{item.label}</span>
          {active ? <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#251002]" /> : null}
        </Link>
      );
    });
  }

  const section = (group: keyof typeof groups) => (
    <section key={group} aria-label={group === "Main" ? "Essentials" : group} className="space-y-1">
      <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">
        {group === "Main" ? "Essentials" : group === "Money" ? "Payments & billing" : group}
      </p>
      <div className="grid gap-1">{renderItems(groups[group])}</div>
    </section>
  );

  if (mobile) {
    return (
      <nav className="grid gap-4" aria-label="Dashboard navigation" data-dashboard-mobile-links>
        {mobileGroupOrder.map((group) => group === "Workspace" ? (
          <details key={group} defaultOpen={isWorkspaceRoute(pathname)} className="group rounded-2xl border border-white/10 bg-white/[.025] p-2" data-dashboard-workspace-group>
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-orange-300 [&::-webkit-details-marker]:hidden">
              <span className="flex-1">More workspace tools</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-400">{groups.Workspace.length}</span>
              <span aria-hidden="true" className="text-lg text-orange-300 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-1 grid gap-1 border-t border-white/10 pt-2">{renderItems(groups.Workspace)}</div>
          </details>
        ) : section(group))}
      </nav>
    );
  }

  return <nav className="flex min-h-0 flex-col gap-5" aria-label="Dashboard navigation" data-dashboard-desktop-links>
    {(["Main", "Workspace", "Money", "Account", "Help"] as const).map(section)}
  </nav>;
}

export default function Sidebar({
  initialBalance,
  userId,
}: {
  initialBalance: number;
  userId: string;
}) {
  const { currency, rates } = usePreferredCurrency("INR");
  const [balance, setBalance] = useState<number>(initialBalance);

  useEffect(() => {
    const supabase = createClient();

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
  }, [userId]);

  return (
    <aside className="dashboard-sidebar hidden h-screen w-[17.5rem] shrink-0 flex-col overflow-y-auto overscroll-contain px-3 py-5 lg:sticky lg:top-0 lg:flex">
      <div className="px-2">
        <Logo light />
      </div>

      <div className="mx-2 mt-6 border-l-2 border-[#ff7600] px-3 py-1">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#ff9a2e]">Customer workspace</p>
        <p className="mt-1 text-xs font-semibold text-[#a8afbd]">Growth control center</p>
      </div>

      <Link href="/dashboard/new-order" className="mx-1 mt-6 flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ff7900] to-[#ffae22] px-4 text-sm font-bold text-[#211006] shadow-[0_12px_22px_-17px_rgba(255,122,0,.8)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"><span aria-hidden="true" className="text-xl leading-none">+</span> Create new order</Link>
      <div className="mt-6"><NavLinks /></div>

      <div className="mt-4 rounded-2xl border border-white/[.09] bg-white/[.035] p-4 text-white shadow-[0_14px_30px_rgba(0,0,0,.22)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#a8afbd]">Available balance</p>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <p className="mt-2 text-2xl font-black text-white">{formatCurrency(balance, currency, rates)}</p>
        {currency !== "INR" ? <p className="mt-1 text-[10px] text-[#a8afbd]">Ledger balance remains INR</p> : null}

        <Link href="/dashboard/add-funds" className="btn-dashboard-primary mt-4 flex min-h-11 w-full items-center justify-center py-2.5 text-xs">
          Add Funds
        </Link>
      </div>

      <form action={logout} className="mt-4">
        <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[.07] hover:text-white">
          <span>↪</span> Log out
        </button>
      </form>
    </aside>
  );
}
