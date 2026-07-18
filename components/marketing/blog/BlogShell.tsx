"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { currencies, type Currency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const navLinks = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["How It Works", "/#how-it-works"],
  ["Blog", "/blog"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

function BlogCurrencyDropdown({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = usePreferredCurrency("INR");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-xl border border-orange-400/35 bg-white/[.06] px-3 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(255, 159, 0, .14)] transition hover:border-[#FF9F00] ${compact ? "min-h-10" : "min-h-11"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currency}</span>
        <span className="text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-xl border border-orange-400/30 bg-[#111111] shadow-2xl">
          <ul role="listbox" className="py-1">
            {currencies.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency(item.code as Currency);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-orange-400/10 ${currency === item.code ? "text-orange-200" : "text-[#D1D5DB]"}`}
                >
                  <span>{item.code}</span>
                  <span className="text-[11px] text-[#FF9F00]">{item.symbol}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BlogHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setIsLoggedIn(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-[9999] border-b border-orange-400/20 bg-[#050505]/90 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-orange-400/25 bg-[#0B0B0F]/88 shadow-[0_16px_40px_rgba(255, 122, 0, .18)] backdrop-blur-xl">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          <Logo priority />

          <nav className="hidden items-center gap-1.5 xl:flex">
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-[#D1D5DB] transition hover:bg-white/[.06] hover:text-orange-200">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <BlogCurrencyDropdown compact />
            {isLoggedIn ? (
              <>
                <Link href="/dashboard/account" className="inline-flex min-h-10 items-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-2 text-sm font-bold text-white transition hover:border-[#FF9F00] hover:bg-orange-400/10">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex min-h-10 items-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-2 text-sm font-bold text-white transition hover:border-[#FF9F00] hover:bg-orange-400/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-2 text-sm font-bold text-white transition hover:border-[#FF9F00] hover:bg-orange-400/10">
                  Login
                </Link>
                <Link href="/register" className="inline-flex min-h-10 items-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-2 text-sm font-bold text-white transition hover:border-[#FF9F00] hover:bg-orange-400/10">
                  Sign Up
                </Link>
              </>
            )}
            <Link href="/login?next=/dashboard/new-order" className="inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_26px_rgba(255, 196, 0, .35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(255, 196, 0, .42)]">
              Start Order
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={(event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            }}
            className="grid h-11 w-11 place-items-center rounded-xl border border-orange-400/35 bg-white/[.06] text-xl text-white lg:hidden"
          >
            {open ? "×" : "☰"}
          </button>
        </div>

        <MobileMenuLayer open={open} onClose={() => setOpen(false)} topClassName="top-[6.25rem]" showCloseButton={false}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mx-auto max-h-[calc(100dvh-7rem)] w-full max-w-7xl overflow-y-auto rounded-2xl border border-orange-400/25 bg-[#0B0B0F] px-4 pb-4 pt-3 shadow-[0_24px_55px_-28px_rgba(255,122,0,.55)] lg:hidden"
            >
              <nav className="grid gap-1">
                {navLinks.map(([label, href]) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="min-h-10 rounded-xl border border-white/5 bg-white/[.03] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-400/25 hover:bg-orange-400/10 hover:text-orange-100">
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 grid gap-2 border-t border-orange-400/20 pt-3">
                <div className="w-fit">
                  <BlogCurrencyDropdown />
                </div>
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard/account" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-3 text-sm font-bold text-white">
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-3 text-sm font-bold text-white"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-3 text-sm font-bold text-white">
                      Login
                    </Link>
                    <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/35 bg-white/[.06] px-4 py-3 text-sm font-bold text-white">
                      Sign Up
                    </Link>
                  </>
                )}
                <Link href="/login?next=/dashboard/new-order" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-3 text-sm font-bold text-white">
                  Start Order
                </Link>
              </div>
            </motion.div>
        </MobileMenuLayer>
      </div>
    </header>
  );
}

export default function BlogShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main key={pathname} className="public-dark min-h-screen overflow-x-clip bg-[#050505] text-white">
      <BlogHeader />
      {children}
      <MarketingFooter />
    </main>
  );
}
