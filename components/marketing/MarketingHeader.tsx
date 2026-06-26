"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";
import CurrencyDropdown from "./CurrencyDropdown";
import { createClient } from "@/lib/supabase/client";

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
    window.location.href = "/login";
  }

  return (
    <header className={isLight3d ? "sticky top-0 z-50 px-4 pt-3 sm:px-6" : "sticky top-0 z-50 border-b border-violet-300/20 bg-[#070c1d]/85 backdrop-blur-2xl"}>
      <div className={isLight3d ? "mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/72 px-4 shadow-[0_22px_44px_-30px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:gap-4 sm:px-5 lg:px-6" : "mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8"}>
        <Link href="/" aria-label="SocialRUSH home" className="shrink-0 pr-1">
          {isLight3d ? (
            <span className="inline-flex items-center gap-2.5 font-bold tracking-tight text-[#17366f]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-sm font-extrabold text-white shadow-[0_12px_28px_-14px_rgba(117,109,255,.7)]">
                SR
              </span>
              <span>
                Social<span className="bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] bg-clip-text text-transparent">RUSH</span>
              </span>
            </span>
          ) : (
            <Logo light />
          )}
        </Link>

        <nav className={isLight3d ? "hidden items-center gap-3 text-sm font-semibold text-[#3f5f97] xl:flex" : "hidden items-center gap-3 text-sm font-semibold text-slate-200 xl:flex"}>
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={isLight3d ? "rounded-lg px-2 py-1.5 transition hover:bg-[#edf4ff] hover:text-[#193a73]" : "rounded-lg px-2 py-1.5 transition hover:bg-white/10 hover:text-cyan-200"}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CurrencyDropdown compact tone={tone} />
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#d7e4ff] bg-white/88 px-4 py-2 text-sm font-bold text-[#1f3f77] shadow-[0_10px_20px_-14px_rgba(27,55,103,.45)] transition hover:border-[#adc5ff]" : "inline-flex min-h-10 items-center rounded-xl border border-cyan-300/35 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-200"}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#d7e4ff] bg-white/88 px-4 py-2 text-sm font-bold text-[#1f3f77] shadow-[0_10px_20px_-14px_rgba(27,55,103,.45)] transition hover:border-[#adc5ff]" : "inline-flex min-h-10 items-center rounded-xl border border-cyan-300/35 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-200"}>
                Login
              </Link>
              <Link href="/register" className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl border border-[#d7e4ff] bg-[#eef4ff] px-4 py-2 text-sm font-bold text-[#35548d] transition hover:bg-[#e6eeff]" : "inline-flex min-h-10 items-center rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"}>
                Sign Up
              </Link>
            </>
          )}
          <PortalCTA className={isLight3d ? "inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(117,109,255,.65)] transition hover:-translate-y-0.5" : "inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-cyan-400/30"}>
            Start Order
          </PortalCTA>
        </div>

        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={isLight3d ? "grid h-11 w-11 place-items-center rounded-xl border border-[#d7e4ff] bg-white/85 text-xl text-[#21407a] shadow-[0_10px_20px_-14px_rgba(27,55,103,.45)] lg:hidden" : "grid h-11 w-11 place-items-center rounded-xl border border-violet-300/35 text-xl text-slate-100 lg:hidden"}>
          {open ? "×" : "☰"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={isLight3d ? "mx-4 mt-2 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-3xl border border-white/80 bg-white/92 px-4 py-5 shadow-[0_24px_48px_-30px_rgba(15,23,42,.48)] backdrop-blur-2xl sm:mx-6 lg:hidden" : "border-t border-violet-300/20 bg-[#070c1d] px-4 py-5 shadow-xl lg:hidden"}
          >
            <nav className="mx-auto grid max-w-7xl gap-1">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className={isLight3d ? "rounded-xl px-3 py-3 text-sm font-semibold text-[#41619a] transition hover:bg-[#edf4ff] hover:text-[#193a73]" : "rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-cyan-200"}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className={isLight3d ? "mx-auto mt-4 grid max-w-7xl gap-2 border-t border-[#e2ecff] pt-4" : "mx-auto mt-4 grid max-w-7xl gap-2 border-t border-violet-300/20 pt-4"}>
              <div className="w-fit">
                <CurrencyDropdown tone={tone} />
              </div>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={logout}
                  className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7e4ff] bg-white/88 px-4 py-3 text-sm font-bold text-[#1f3f77]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-300/35 px-4 py-3 text-sm font-bold text-slate-100"}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7e4ff] bg-white/88 px-4 py-3 text-sm font-bold text-[#1f3f77]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-300/35 px-4 py-3 text-sm font-bold text-slate-100"}>
                    Login
                  </Link>
                  <Link href="/register" className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7e4ff] bg-[#eef4ff] px-4 py-3 text-sm font-bold text-[#35548d]" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-3 text-sm font-bold text-fuchsia-100"}>
                    Sign Up
                  </Link>
                </>
              )}
              <PortalCTA className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(117,109,255,.65)]" : "inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white"}>
                Start Order
              </PortalCTA>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
