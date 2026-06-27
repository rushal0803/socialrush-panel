"use client";

import Link from "next/link";
import { ChevronDown, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";
import Logo from "@/components/Logo";
import { getCurrencySymbol, type Currency } from "@/lib/currency";
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
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/85 px-3 text-sm font-bold text-[#17366f] shadow-[0_10px_24px_rgba(79,108,168,.12)] transition hover:-translate-y-0.5 hover:bg-white sm:px-3.5"
      >
        <span className="sm:hidden">{active.symbol} {active.code}</span>
        <span className="hidden sm:inline-flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6a80ad]">Currency:</span>
          <span>{active.code} {active.symbol}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-[#6e84b2]" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[80] mt-2 w-56 overflow-hidden rounded-2xl border border-white/85 bg-white/95 p-2 shadow-[0_24px_60px_-26px_rgba(15,23,42,.35)] backdrop-blur-xl">
          <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#5f79a9]">Select currency</p>
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
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${selected ? "bg-[#eef4ff] text-[#18356f]" : "text-[#4a6598] hover:bg-[#f6f9ff]"}`}
                >
                  <span>{option.code}</span>
                  <span className="text-right font-black text-[#17366f]">{option.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardHeaderBar({ name, role, initials }: { name: string; role: string; initials: string }) {
  return (
    <header className="sticky top-0 z-[60] border-b border-white/70 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-14 max-w-[1800px] items-center gap-1.5 min-[430px]:gap-2 sm:gap-4">
        <Logo compactOnMobile priority />

        <div className="ml-auto flex min-w-0 items-center gap-1.5 min-[430px]:gap-2 sm:gap-3">
          <CurrencySelector />

          <Link
            href="/dashboard/add-funds"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(117,109,255,.6)] transition hover:-translate-y-0.5 sm:w-auto sm:px-4"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Add Funds</span>
          </Link>

          <Link
            href="/dashboard/account"
            aria-label="Open profile"
            className="hidden h-10 items-center gap-2 rounded-xl border border-white/80 bg-white/85 px-2.5 text-left shadow-[0_10px_24px_rgba(79,108,168,.12)] transition hover:-translate-y-0.5 hover:bg-white min-[430px]:inline-flex sm:px-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#ff66b2] via-[#8f8dff] to-[#47c4ff] text-xs font-black text-white shadow-[0_10px_24px_rgba(117,109,255,.3)]">
              {initials}
            </span>
            <span className="hidden min-w-0 flex-col text-left sm:flex">
              <span className="truncate text-sm font-bold text-[#18356f]">{name}</span>
              <span className="truncate text-[11px] capitalize text-[#6880ae]">{role}</span>
            </span>
          </Link>

          <DashboardMobileMenu />
        </div>
      </div>
    </header>
  );
}
