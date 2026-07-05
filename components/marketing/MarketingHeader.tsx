"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";
import CurrencyDropdown from "./CurrencyDropdown";
import { createClient } from "@/lib/supabase/client";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";

const nav = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["How It Works", "/#how-it-works"],
  ["FAQ", "/#faq"],
  ["Contact", "/#contact"],
] as const;

export default function MarketingHeader({ tone = "default" }: { tone?: "default" | "light3d" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isLight3d = tone === "light3d";

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
    <header className={isLight3d ? "sticky top-0 z-[9999] border-b border-white/50 bg-[#FFF8F1]/70 px-4 py-3 backdrop-blur-2xl sm:px-6" : "sticky top-0 z-[9999] border-b border-amber-300/20 bg-[#0B0B0F]/90 backdrop-blur-2xl"}>
      <div className={isLight3d ? "mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/72 px-4 shadow-[0_22px_44px_-30px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:gap-4 sm:px-5 lg:px-6" : "mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8"}>
        <Logo light={!isLight3d} priority className="shrink-0 pr-1" />

        <nav className={isLight3d ? "hidden items-center gap-3 text-sm font-semibold text-[#FF9F00] xl:flex" : "hidden items-center gap-3 text-sm font-semibold text-slate-200 xl:flex"}>
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={isLight3d ? "rounded-lg px-2 py-1.5 transition hover:bg-[#FFF8F1] hover:text-[#0B0B0F]" : "rounded-lg px-2 py-1.5 transition hover:bg-white/10 hover:text-amber-200"}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CurrencyDropdown compact tone={tone} />
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard/account"
                className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-2 text-sm font-bold text-[#FF9F00] transition hover:bg-[#FFF8F1]" : "inline-flex min-h-10 items-center rounded-xl border border-amber-300/35 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-400/20"}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#FFF3E0] bg-white/88 px-4 py-2 text-sm font-bold text-[#0B0B0F] shadow-[0_10px_20px_-14px_rgba(255, 159, 0, .45)] transition hover:border-[#FF9F00]" : "inline-flex min-h-10 items-center rounded-xl border border-amber-300/35 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-amber-300/50 hover:text-amber-200"}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#FFF3E0] bg-white/88 px-4 py-2 text-sm font-bold text-[#0B0B0F] shadow-[0_10px_20px_-14px_rgba(255, 159, 0, .45)] transition hover:border-[#FF9F00]" : "inline-flex min-h-10 items-center rounded-xl border border-amber-300/35 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-amber-300/50 hover:text-amber-200"}>
                Login
              </Link>
              <Link href="/register" className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-2 text-sm font-bold text-[#FF9F00] transition hover:bg-[#FFF8F1]" : "inline-flex min-h-10 items-center rounded-xl border border-amber-300/35 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-400/20"}>
                Sign Up
              </Link>
            </>
          )}
          <PortalCTA className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(255, 196, 0, .65)] transition hover:-translate-y-0.5" : "inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:shadow-amber-400/30"}>
            Start Order
          </PortalCTA>
        </div>

        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} className={isLight3d ? "grid h-11 w-11 place-items-center rounded-xl border border-[#FFF3E0] bg-white/85 text-xl text-[#0B0B0F] shadow-[0_10px_20px_-14px_rgba(255, 159, 0, .45)] lg:hidden" : "grid h-11 w-11 place-items-center rounded-xl border border-amber-300/35 text-xl text-slate-100 lg:hidden"}>
          {open ? "×" : "☰"}
        </button>
      </div>

      <MobileMenuLayer open={open} onClose={() => setOpen(false)} topClassName="top-[6.15rem]" showCloseButton={false}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mx-auto max-h-[calc(100dvh-7rem)] w-full max-w-7xl overflow-y-auto rounded-2xl border border-orange-400/25 bg-[#0B0B0F] px-4 pb-4 pt-3 shadow-[0_24px_55px_-28px_rgba(255,122,0,.55)] lg:hidden"
          >
            <nav className="mx-auto grid max-w-7xl gap-1">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="min-h-10 rounded-xl border border-white/5 bg-white/[.03] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-400/25 hover:bg-orange-400/10 hover:text-orange-100">
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mx-auto mt-3 grid max-w-7xl gap-2 border-t border-orange-400/20 pt-3">
              <div className="w-fit">
                <CurrencyDropdown tone={tone} />
              </div>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard/account"
                    onClick={() => setOpen(false)}
                    className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-3 text-sm font-bold text-[#FF9F00]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/35 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100"}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white/88 px-4 py-3 text-sm font-bold text-[#0B0B0F]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/35 px-4 py-3 text-sm font-bold text-slate-100"}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white/88 px-4 py-3 text-sm font-bold text-[#0B0B0F]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/35 px-4 py-3 text-sm font-bold text-slate-100"}>
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-3 text-sm font-bold text-[#FF9F00]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-300/35 bg-orange-400/10 px-4 py-3 text-sm font-bold text-orange-100"}>
                    Sign Up
                  </Link>
                </>
              )}
              <PortalCTA className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(255, 196, 0, .65)]" : "inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-3 text-sm font-bold text-white"}>
                Start Order
              </PortalCTA>
            </div>
          </motion.div>
      </MobileMenuLayer>
    </header>
  );
}
