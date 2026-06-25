"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";
import CurrencyDropdown from "./CurrencyDropdown";

const nav = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["How It Works", "/#how-it-works"],
  ["FAQ", "/#faq"],
  ["Contact", "/#contact"],
] as const;

export default function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-300/20 bg-[#070c1d]/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="SocialRUSH home" className="shrink-0 pr-1">
          <Logo light />
        </Link>

        <nav className="hidden items-center gap-3 text-sm font-semibold text-slate-200 xl:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg px-2 py-1.5 transition hover:bg-white/10 hover:text-cyan-200">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CurrencyDropdown compact />
          <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl border border-cyan-300/35 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-200">
            Login
          </Link>
          <Link href="/register" className="inline-flex min-h-10 items-center rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20">
            Sign Up
          </Link>
          <PortalCTA className="inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-cyan-400/30">
            Start Order
          </PortalCTA>
        </div>

        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl border border-violet-300/35 text-xl text-slate-100 lg:hidden">
          {open ? "×" : "☰"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t border-violet-300/20 bg-[#070c1d] px-4 py-5 shadow-xl lg:hidden"
          >
            <nav className="mx-auto grid max-w-7xl gap-1">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-cyan-200">
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mx-auto mt-4 grid max-w-7xl gap-2 border-t border-violet-300/20 pt-4">
              <div className="w-fit">
                <CurrencyDropdown />
              </div>
              <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-300/35 px-4 py-3 text-sm font-bold text-slate-100">
                Login
              </Link>
              <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-3 text-sm font-bold text-fuchsia-100">
                Sign Up
              </Link>
              <PortalCTA className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white">
                Start Order
              </PortalCTA>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
