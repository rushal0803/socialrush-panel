"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { currencies, type Currency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["How It Works", "/#how-it-works"],
  ["Blog", "/blog"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

const footerColumns = [
  {
    title: "Quick Links",
    links: [
      ["Home", "/"],
      ["Services", "/services"],
      ["Packages", "/packages"],
      ["Blog", "/blog"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Contact Us", "/contact"],
      ["Support", "/support"],
      ["Account Login", "/login"],
      ["Create Account", "/register"],
      ["Start Order", "/login?next=/dashboard/new-order"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Refund Policy", "/refund-policy"],
      ["Terms & Conditions", "/terms-and-conditions"],
    ],
  },
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
        className={`inline-flex items-center gap-2 rounded-xl border border-[#cfe0ff] bg-white px-3 py-2 text-xs font-bold text-[#1c336b] shadow-[0_8px_20px_rgba(90,116,175,.14)] transition hover:border-[#aec8ff] ${compact ? "min-h-10" : "min-h-11"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currency}</span>
        <span className="text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-xl border border-[#d7e4ff] bg-white shadow-2xl">
          <ul role="listbox" className="py-1">
            {currencies.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency(item.code as Currency);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-[#f2f7ff] ${currency === item.code ? "text-[#204087]" : "text-[#415883]"}`}
                >
                  <span>{item.code}</span>
                  <span className="text-[11px] text-[#7f95c2]">{item.symbol}</span>
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
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/85 bg-white/82 shadow-[0_16px_40px_rgba(88,114,173,.16)] backdrop-blur-xl">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          <Link href="/" aria-label="SocialRUSH home" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-[#18366f]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff69b4] via-[#8f92ff] to-[#52c8ff] text-sm font-black text-white shadow-[0_10px_24px_rgba(124,114,239,.32)]">
              S
            </span>
            <span>
              Social<span className="text-[#4e71ff]">RUSH</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1.5 xl:flex">
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-[#2a4477] transition hover:bg-[#f2f7ff] hover:text-[#17336b]">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <BlogCurrencyDropdown compact />
            {isLoggedIn ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-10 items-center rounded-xl border border-[#d4e1fb] bg-white px-4 py-2 text-sm font-bold text-[#1b3670] transition hover:border-[#b4cafb]"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl border border-[#d4e1fb] bg-white px-4 py-2 text-sm font-bold text-[#1b3670] transition hover:border-[#b4cafb]">
                  Login
                </Link>
                <Link href="/register" className="inline-flex min-h-10 items-center rounded-xl border border-[#d4e1fb] bg-[#f5f8ff] px-4 py-2 text-sm font-bold text-[#244385] transition hover:bg-[#e9f0ff]">
                  Sign Up
                </Link>
              </>
            )}
            <Link href="/login?next=/dashboard/new-order" className="inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_26px_rgba(122,113,241,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(122,113,241,.42)]">
              Start Order
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-[#d5e2ff] bg-white text-xl text-[#1f3972] lg:hidden"
          >
            {open ? "×" : "☰"}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="max-h-[calc(100vh-5.25rem)] overflow-y-auto border-t border-[#e4ebff] px-4 pb-5 pt-3 lg:hidden"
            >
              <nav className="grid gap-1">
                {navLinks.map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#294478] transition hover:bg-[#f2f7ff]">
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 grid gap-2 border-t border-[#e7eeff] pt-4">
                <div className="w-fit">
                  <BlogCurrencyDropdown />
                </div>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d2e0ff] bg-white px-4 py-3 text-sm font-bold text-[#1f3b74]"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d2e0ff] bg-white px-4 py-3 text-sm font-bold text-[#1f3b74]">
                      Login
                    </Link>
                    <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d2e0ff] bg-[#f6f9ff] px-4 py-3 text-sm font-bold text-[#1f3b74]">
                      Sign Up
                    </Link>
                  </>
                )}
                <Link href="/login?next=/dashboard/new-order" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-3 text-sm font-bold text-white">
                  Start Order
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function BlogFooter() {
  return (
    <footer className="relative mt-14 overflow-hidden bg-[radial-gradient(circle_at_top,_#f6ecff_0%,_#eef6ff_45%,_#f7fbff_100%)] px-5 pb-9 pt-14 text-[#203b72] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-pink-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-56 w-56 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="relative mx-auto max-w-7xl rounded-[30px] border border-white/85 bg-white/82 p-7 shadow-[0_20px_45px_rgba(86,112,171,.16)] backdrop-blur sm:p-10">
        <div className="grid gap-9 border-b border-[#e9efff] pb-9 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="SocialRUSH home" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-[#18366f]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff69b4] via-[#8f92ff] to-[#52c8ff] text-sm font-black text-white shadow-[0_10px_24px_rgba(124,114,239,.32)]">
                S
              </span>
              <span>
                Social<span className="text-[#4e71ff]">RUSH</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#5a6f98]">
              Premium social media growth support for creators, brands, and agencies focused on smarter campaign execution and measurable visibility.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold text-[#1f3a74]">{column.title}</h3>
              <div className="mt-4 space-y-2 text-sm text-[#5a6f98]">
                {column.links.map(([label, href]) => (
                  <Link key={href} href={href} className="block transition hover:text-[#214288]">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-6 text-xs text-[#7a8fb8] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Secure checkout, campaign tracking, and creator-first support.</p>
        </div>
      </div>
    </footer>
  );
}

export default function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,_#f8eaff_0%,_#ecf6ff_42%,_#f8fcff_100%)] text-[#122347]">
      <BlogHeader />
      {children}
      <BlogFooter />
    </main>
  );
}
