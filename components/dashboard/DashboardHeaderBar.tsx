"use client";

import Link from "next/link";
import { ChevronDown, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import NotificationBell from "@/components/dashboard/NotificationBell";
import DashboardSearch from "@/components/dashboard/DashboardSearch";
import Logo from "@/components/Logo";
import { getCurrencySymbol, type Currency } from "@/lib/currency";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

const dashboardCurrencies: Currency[] = ["INR", "USD", "AED", "EUR", "GBP"];

function CurrencySelector() {
  const { currency, setCurrency } = usePreferredCurrency("INR");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () => dashboardCurrencies.map((code) => ({ code, symbol: getCurrencySymbol(code) })),
    [],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const active = options.find((item) => item.code === currency) || options[0];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Currency: ${active.code}`}
        className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-orange-400/25 bg-white/[.06] px-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,.3)] transition hover:-translate-y-0.5 hover:bg-orange-400/10 min-[360px]:px-3 sm:px-3.5"
      >
        <span className="min-[360px]:hidden">{active.symbol}</span>
        <span className="hidden min-[360px]:inline sm:hidden">{active.symbol} {active.code}</span>
        <span className="hidden sm:inline-flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">Currency:</span>
          <span>{active.code} {active.symbol}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-[#9CA3AF] min-[360px]:block" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[80] mt-2 w-56 overflow-hidden rounded-2xl border border-orange-400/25 bg-[#111111]/95 p-2 shadow-[0_24px_60px_-26px_rgba(0,0,0,.8)] backdrop-blur-xl">
          <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#A8AFBD]">Select currency</p>
          <div className="grid gap-1">
            {options.map((option) => {
              const selected = option.code === currency;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    setCurrency(option.code);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${selected ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white" : "text-slate-300 hover:bg-orange-400/10 hover:text-white"}`}
                >
                  <span>{option.code}</span>
                  <span className={`text-right font-black ${selected ? "text-[#0B0B0F]" : "text-[#D7DBE3]"}`}>{option.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardHeaderBar({ name, role, initials, balance }: { name: string; role: string; initials: string; balance: number }) {
  const { currency, rates } = usePreferredCurrency("INR");
  return (
    <header className="sticky top-0 z-[70] border-b border-white/[.08] bg-[#0c0e14]/95 px-4 py-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,.9)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-12 max-w-[1800px] items-center gap-1 min-[360px]:gap-1.5 min-[430px]:gap-2 sm:min-h-14 sm:gap-4">
        <Logo light compactOnMobile priority className="[&_img]:!h-10 [&_img]:!max-w-[112px] min-[360px]:[&_img]:!h-11 min-[360px]:[&_img]:!max-w-[132px] sm:[&_img]:!h-[3.25rem] sm:[&_img]:!max-w-[218px]" />

        <div className="ml-auto flex min-w-0 items-center gap-1.5 min-[430px]:gap-2 sm:gap-3">
          <CurrencySelector />
          <DashboardSearch />
          <NotificationBell />

          <Link href="/dashboard/wallet" className="hidden min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/[.1] bg-white/[.035] px-3 text-left transition hover:border-orange-400/35 hover:bg-orange-500/[.08] md:inline-flex">
            <Wallet className="h-4 w-4 text-[#ff9a2e]" />
            <span><span className="block text-[9px] font-bold uppercase tracking-[.12em] text-[#747b89]">Wallet (INR)</span><span className="block text-sm font-extrabold text-white">{formatCurrency(balance, currency, rates)}</span></span>
          </Link>
          <Link
            href="/dashboard/add-funds"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7600] to-[#ff9a2e] text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(255,118,0,.5)] transition hover:-translate-y-0.5 sm:w-auto sm:px-4"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Add Funds</span>
          </Link>

          <Link
            href="/dashboard/account"
            aria-label="Open profile"
            className="hidden h-10 items-center gap-2 rounded-xl border border-orange-400/20 bg-white/[.06] px-2.5 text-left shadow-[0_10px_24px_rgba(0,0,0,.3)] transition hover:-translate-y-0.5 hover:bg-orange-400/10 min-[430px]:inline-flex sm:px-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-xs font-black text-white shadow-[0_10px_24px_rgba(255, 196, 0, .3)]">
              {initials}
            </span>
            <span className="hidden min-w-0 flex-col text-left sm:flex">
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
