"use client";

import Link from "next/link";
import { ChevronDown, Wallet } from "lucide-react";

import { usePathname, useSearchParams } from "next/navigation";
import { dashboardLinks, isDashboardLinkActive } from "@/lib/dashboard/navigation";
import styles from "@/components/dashboard/PremiumWorkspace.module.css";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import NotificationBell from "@/components/dashboard/NotificationBell";
import DashboardSearch from "@/components/dashboard/DashboardSearch";
import Logo, { BrandMark } from "@/components/Logo";
import { currencies } from "@/lib/currency";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { useDashboardBalance } from "./DashboardBalanceProvider";

function CurrencySelector() {
  const { currency, setCurrency } = usePreferredCurrency("INR");

  return (
    <label className="relative inline-flex h-11 shrink-0 items-center rounded-xl border border-white/15 bg-white/[.04] text-sm font-semibold text-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-orange-300">
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value as typeof currency)}
        className="h-full w-12 min-w-0 appearance-none rounded-xl bg-transparent py-2 pl-2 pr-2 text-base text-white outline-none min-[360px]:w-20 min-[360px]:pr-6 sm:w-24 min-[360px]:pl-3 sm:text-sm"
        aria-label="Display currency"
        aria-describedby="dashboard-currency-help"
      >
        {currencies.map(({ code, name }) => (
          <option key={code} value={code} aria-label={`${code}: ${name}`} className="bg-[#12151d] text-white">{code}</option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-1.5 hidden h-3.5 w-3.5 text-slate-400 min-[360px]:block" />
      <span id="dashboard-currency-help" className="sr-only">Display preference only. Wallet ledger and payments remain in INR.</span>
    </label>
  );
}

export default function DashboardHeaderBar({ name, role, initials, balance }: { name: string; role: string; initials: string; balance: number }) {
  const currentBalance = useDashboardBalance(balance);
  const { currency, rates } = usePreferredCurrency("INR");
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const currentPage = dashboardLinks.find(item => isDashboardLinkActive(pathname, item.href, query))?.label || "Customer workspace";
  return (
    <header className="sticky top-0 z-[70] border-b border-white/[.08] bg-[#0c0e14]/95 px-4 py-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,.9)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-12 max-w-[1800px] items-center gap-1 min-[360px]:gap-1.5 min-[430px]:gap-2 sm:min-h-14 sm:gap-4">
        <BrandMark priority className="min-[430px]:hidden lg:hidden" />
        <Logo light compactOnMobile priority className="hidden min-[430px]:inline-flex lg:hidden [&_img]:!h-11 [&_img]:!max-w-[132px]" />
        <p className={styles.workspaceLabel}>Your workspace<span>{currentPage}</span></p>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 min-[430px]:gap-2 sm:gap-3">
          <CurrencySelector />
          <DashboardSearch />
          <NotificationBell />

          <Link href="/dashboard/wallet" className="hidden min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/[.1] bg-white/[.035] px-3 text-left transition hover:border-orange-400/35 hover:bg-orange-500/[.08] md:inline-flex">
            <Wallet className="h-4 w-4 text-[#ff9a2e]" />
            <span><span className="block text-[9px] font-bold uppercase tracking-[.12em] text-[#a8afbd]">Wallet ({currency})</span><span className="block text-sm font-extrabold tabular-nums text-white">{formatCurrency(currentBalance, currency, rates)}</span></span>
          </Link>
          <Link
            href="/dashboard/add-funds"
            aria-label="Add Funds"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7600] to-[#ff9a2e] text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(255,118,0,.5)] transition hover:-translate-y-0.5 xl:w-auto xl:px-4"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden xl:inline">Add Funds</span>
          </Link>

          <Link
            href="/dashboard/account"
            aria-label="Open profile"
            title={name}
            className="hidden min-h-11 shrink-0 items-center gap-2 rounded-xl border border-orange-400/20 bg-white/[.06] px-3 text-left shadow-[0_10px_24px_rgba(0,0,0,.3)] transition hover:-translate-y-0.5 hover:bg-orange-400/10 lg:inline-flex"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-xs font-black text-white shadow-[0_10px_24px_rgba(255, 196, 0, .3)]">
              {initials}
            </span>
            <span className="hidden min-w-0 max-w-32 flex-col text-left xl:flex">
              <span className="truncate text-sm font-bold text-white">{name}</span>
              <span className="truncate text-[11px] capitalize text-[#A8AFBD]">{role}</span>
            </span>
          </Link>

          <DashboardMobileMenu />
        </div>
      </div>
    </header>
  );
}
