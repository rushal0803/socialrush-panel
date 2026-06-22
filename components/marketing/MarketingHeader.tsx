"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";

const nav = [
  ["Home", "/"],
  ["Services", "/#services"],
  ["Packages", "/packages"],
  ["How It Works", "/#how-it-works"],
  ["FAQ", "/#faq"],
  ["Contact", "/#contact"],
] as const;

export default function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20placing%20an%20order";

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="SocialRUSH home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg px-2 py-1.5 transition hover:bg-blue-50 hover:text-blue-700">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
            Login
          </Link>
          <Link href="/register" className="inline-flex min-h-10 items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
            Sign Up
          </Link>
          <PortalCTA className="inline-flex min-h-10 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            Start Order
          </PortalCTA>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
            WhatsApp Support
          </a>
        </div>

        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-xl text-[#07152f] lg:hidden">
          {open ? "×" : "☰"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="border-t border-slate-100 bg-white px-4 py-5 shadow-xl lg:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mx-auto mt-4 grid max-w-7xl gap-2 border-t border-slate-100 pt-4">
              <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                Login
              </Link>
              <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                Sign Up
              </Link>
              <PortalCTA className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">
                Start Order
              </PortalCTA>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                WhatsApp Support
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}