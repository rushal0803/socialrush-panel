"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";
import CurrencyDropdown from "./CurrencyDropdown";
import { createClient } from "@/lib/supabase/client";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";

const nav = [
  ["Services", "/services"],
  ["How It Works", "/#how-it-works"],
  ["Why SocialRUSH", "/#why-socialrush"],
  ["Reviews", "/reviews"],
  ["Tools", "/tools"],
  ["Support", "/support"],
] as const;

export default function MarketingHeader({ tone = "default" }: { tone?: "default" | "light3d" }) {
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
    <header className="sticky top-0 z-[9999] border-b border-orange-400/25 bg-[#07080D]/90 backdrop-blur-2xl after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#FF7600]/70 after:to-transparent">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-1.5 px-3 min-[390px]:gap-2 min-[390px]:px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Logo light priority className="min-w-0 shrink [&_img]:max-w-[150px] min-[390px]:[&_img]:max-w-[174px] sm:[&_img]:max-w-[218px]" />

        <nav className="hidden items-center gap-1 text-sm font-semibold text-[#A8AFBD] xl:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => {
            const active = !href.includes("#") && pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-3 py-2 transition hover:bg-white/[0.05] hover:text-white ${active ? "bg-white/[0.05] text-white" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CurrencyDropdown compact tone={tone} />
          {isLoggedIn ? (
            <>
              <Link href="/dashboard/account" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-[#151821] px-4 py-2 text-sm font-bold text-[#F8FAFC] transition hover:border-orange-400/40">Profile</Link>
              <button type="button" onClick={logout} className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-bold text-[#A8AFBD] transition hover:border-orange-400/40 hover:text-white">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-bold text-[#F8FAFC] transition hover:border-orange-400/40">Login</Link>
              <Link href="/register" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-[#151821] px-4 py-2 text-sm font-bold text-[#F8FAFC] transition hover:border-orange-400/40">Sign Up</Link>
            </>
          )}
          <PortalCTA className="inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#FF6200] to-[#FF9A00] px-4 py-2 text-sm font-black text-white shadow-[0_12px_26px_rgba(255,118,0,.18)] transition hover:-translate-y-0.5">
            Start Order
          </PortalCTA>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <PortalCTA className="hidden min-h-10 items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-[#FF6200] to-[#FF9A00] px-2.5 py-2 text-xs font-black text-white min-[360px]:inline-flex min-[390px]:px-3 sm:px-4 sm:text-sm">
            Start Order
          </PortalCTA>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }}
            className={`grid h-11 w-11 place-items-center rounded-xl border text-white transition ${
              open
                ? "border-orange-400/60 bg-gradient-to-br from-[#FF6200] to-[#FF9A00] shadow-[0_10px_24px_rgba(255,118,0,.24)]"
                : "border-white/10 bg-[#151821] hover:border-orange-400/40"
            }`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <MobileMenuLayer open={open} onClose={() => setOpen(false)} topClassName="top-[4.4rem]" showCloseButton={false}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mx-auto max-h-[calc(100dvh-5.2rem)] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0C0E14] p-4 shadow-[0_24px_60px_rgba(0,0,0,.45)] lg:hidden"
        >
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-[#D7DBE3] transition hover:border-orange-400/25 hover:bg-orange-400/[0.07] hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-white/[0.08] pt-3">
            <div className="w-fit"><CurrencyDropdown tone={tone} /></div>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard/account" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-[#151821] px-4 py-3 text-sm font-bold text-white">Profile</Link>
                <button type="button" onClick={logout} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-[#D7DBE3]">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white">Login</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-400/[0.08] px-4 py-3 text-sm font-bold text-orange-100">Sign Up</Link>
              </>
            )}
            <PortalCTA className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF6200] to-[#FF9A00] px-4 py-3 text-sm font-black text-white">Start Order</PortalCTA>
          </div>
        </motion.div>
      </MobileMenuLayer>
    </header>
  );
}
