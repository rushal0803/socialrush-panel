"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";
import CurrencyDropdown from "./CurrencyDropdown";
import AndroidAppDownload from "@/components/pwa/AndroidAppDownload";
import { createClient } from "@/lib/supabase/client";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";

const primaryNav = [
  ["Pricing", "/pricing"],
  ["Packages", "/packages"],
  ["Case Studies", "/case-studies"],
] as const;

const resourceNav = [
  ["Blog", "/blog", BookOpen],
  ["Creator Tools", "/tools", Sparkles],
  ["Compare Services", "/compare", LayoutGrid],
  ["Customer Reviews", "/reviews", ShieldCheck],
] as const;

const companyNav = [
  ["About Us", "/about", BriefcaseBusiness],
  ["Contact", "/contact", CircleHelp],
] as const;

const platforms = [
  ["Instagram", "/services?platform=instagram"],
  ["YouTube", "/services?platform=youtube"],
  ["Facebook", "/services?platform=facebook"],
  ["LinkedIn", "/services?platform=linkedin"],
  ["TikTok", "/services?platform=tiktok"],
  ["Telegram", "/services?platform=telegram"],
  ["X / Twitter", "/services?platform=x"],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.split("?")[0]);
}

function DesktopDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group relative">
      <summary
        className={`flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-sr-control px-3 py-2 outline-none transition duration-fast ease-sr-out hover:bg-white/[0.05] hover:text-content-primary focus-visible:shadow-sr-focus [&::-webkit-details-marker]:hidden ${
          active ? "bg-white/[0.06] text-content-primary" : "text-content-secondary"
        }`}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-fast group-open:rotate-180" aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}

export default function MarketingHeader({ tone = "default" }: { tone?: "default" | "light3d" }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

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

  const servicesActive = pathname.startsWith("/services");
  const resourcesActive = resourceNav.some(([, href]) => isActive(pathname, href));
  const companyActive = companyNav.some(([, href]) => isActive(pathname, href));

  return (
    <header className="sticky top-0 z-[9999] border-b border-sr-border bg-surface-page/85 shadow-[0_14px_45px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl supports-[backdrop-filter]:bg-surface-page/72">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-action/70 to-transparent" />

      <div className="mx-auto flex h-[72px] max-w-sr-content items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo
            light
            priority
            className="min-w-0 shrink [&_img]:max-w-[154px] min-[390px]:[&_img]:max-w-[174px] sm:[&_img]:max-w-[205px]"
          />
          <span className="hidden rounded-full border border-action/20 bg-action/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-200 2xl:inline-flex">
            Growth platform
          </span>
        </div>

        <nav className="hidden items-center gap-0.5 text-[13px] font-semibold xl:flex" aria-label="Primary navigation">
          <DesktopDropdown label="Services" active={servicesActive}>
            <div className="absolute left-0 top-[calc(100%+.65rem)] z-30 w-[28rem] overflow-hidden rounded-2xl border border-sr-border-strong bg-surface-elevated/98 p-2.5 shadow-[0_28px_70px_-28px_rgba(0,0,0,.9)] backdrop-blur-xl">
              <Link
                href="/services"
                className="group/all flex items-center justify-between gap-4 rounded-xl border border-action/15 bg-action/[0.07] p-4 outline-none transition hover:border-action/30 hover:bg-action/[0.11] focus-visible:shadow-sr-focus"
              >
                <span>
                  <span className="block text-sm font-black text-content-primary">Browse all services</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-content-muted">Compare platforms, quantities and live service details.</span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sr-brand text-white shadow-sr-button">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {platforms.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex min-h-10 items-center rounded-xl px-3 text-xs font-semibold text-content-secondary outline-none transition hover:bg-white/[.05] hover:text-content-primary focus-visible:shadow-sr-focus"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </DesktopDropdown>

          {primaryNav.map(([label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-sr-control px-3 py-2 text-content-secondary outline-none transition duration-fast ease-sr-out hover:bg-white/[0.05] hover:text-content-primary focus-visible:shadow-sr-focus ${
                  active ? "bg-white/[0.06] text-content-primary" : ""
                }`}
              >
                {label}
              </Link>
            );
          })}

          <DesktopDropdown label="Resources" active={resourcesActive}>
            <div className="absolute left-1/2 top-[calc(100%+.65rem)] z-30 w-72 -translate-x-1/2 rounded-2xl border border-sr-border-strong bg-surface-elevated/98 p-2 shadow-[0_28px_70px_-28px_rgba(0,0,0,.9)] backdrop-blur-xl">
              {resourceNav.map(([label, href, Icon]) => (
                <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-content-secondary outline-none transition hover:bg-white/[.05] hover:text-content-primary focus-visible:shadow-sr-focus">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-sr-border bg-white/[.03] text-orange-300"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  {label}
                </Link>
              ))}
            </div>
          </DesktopDropdown>

          <DesktopDropdown label="Company" active={companyActive}>
            <div className="absolute right-0 top-[calc(100%+.65rem)] z-30 w-60 rounded-2xl border border-sr-border-strong bg-surface-elevated/98 p-2 shadow-[0_28px_70px_-28px_rgba(0,0,0,.9)] backdrop-blur-xl">
              {companyNav.map(([label, href, Icon]) => (
                <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-content-secondary outline-none transition hover:bg-white/[.05] hover:text-content-primary focus-visible:shadow-sr-focus">
                  <Icon className="h-4 w-4 text-orange-300" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </DesktopDropdown>
        </nav>

        <div className="hidden items-center gap-1.5 xl:flex">
          <CurrencyDropdown compact tone={tone} />
          {isLoggedIn ? (
            <>
              <Link href="/dashboard/account" className="inline-flex min-h-10 items-center gap-2 rounded-sr-control border border-sr-border bg-surface-secondary px-3.5 py-2 text-sm font-bold text-content-primary outline-none transition hover:border-sr-border-strong hover:bg-white/[.05] focus-visible:shadow-sr-focus">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Profile
              </Link>
              <button type="button" onClick={logout} className="grid h-10 w-10 place-items-center rounded-sr-control border border-transparent text-content-muted outline-none transition hover:border-sr-border hover:bg-white/[.04] hover:text-content-primary focus-visible:shadow-sr-focus" aria-label="Log out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex min-h-10 items-center rounded-sr-control px-3.5 py-2 text-sm font-bold text-content-secondary outline-none transition hover:bg-white/[.04] hover:text-content-primary focus-visible:shadow-sr-focus">Login</Link>
              <Link href="/register" className="inline-flex min-h-10 items-center rounded-sr-control border border-sr-border bg-surface-secondary px-3.5 py-2 text-sm font-bold text-content-primary outline-none transition hover:border-sr-border-strong hover:bg-white/[.05] focus-visible:shadow-sr-focus">Sign Up</Link>
            </>
          )}
          <PortalCTA className="group inline-flex min-h-10 items-center gap-2 rounded-sr-control bg-sr-brand px-4 py-2 text-sm font-black text-white shadow-sr-button outline-none transition duration-normal ease-sr-out hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(255,118,0,.28)] focus-visible:shadow-sr-focus motion-reduce:transform-none">
            Start Order
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </PortalCTA>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <PortalCTA className="hidden min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-sr-control bg-sr-brand px-3 py-2 text-xs font-black text-white shadow-sr-button min-[390px]:inline-flex sm:px-4 sm:text-sm">
            Start Order
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </PortalCTA>
          <button
            type="button"
            ref={menuTriggerRef}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={(event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            }}
            className={`grid h-11 w-11 place-items-center rounded-sr-control border text-white outline-none transition duration-fast focus-visible:shadow-sr-focus ${
              open
                ? "border-action/50 bg-sr-brand shadow-sr-button"
                : "border-sr-border bg-surface-secondary hover:border-sr-border-strong hover:bg-white/[.05]"
            }`}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <MobileMenuLayer
        open={open}
        onClose={() => setOpen(false)}
        variant="drawer"
        hiddenFrom="xl"
        initialFocusRef={menuCloseRef}
        returnFocusRef={menuTriggerRef}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: 18 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-surface-page xl:hidden"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-sr-border bg-surface-page/95 pb-3 pl-4 pr-[calc(1rem+env(safe-area-inset-right))] pt-[calc(.75rem+env(safe-area-inset-top))] backdrop-blur-xl">
            <div>
              <Logo light priority className="min-w-0 [&_img]:h-10 [&_img]:max-w-[145px]" />
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.14em] text-content-muted">Growth platform</p>
            </div>
            <button
              ref={menuCloseRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sr-control border border-action/35 bg-action/10 text-white shadow-[0_12px_28px_-18px_rgba(255,122,0,.8)] outline-none transition hover:bg-action/15 active:scale-[.98] focus-visible:shadow-sr-focus"
            >
              <X className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 pr-[calc(1rem+env(safe-area-inset-right))] [-webkit-overflow-scrolling:touch]">
            <section className="rounded-2xl border border-action/20 bg-[linear-gradient(145deg,rgba(255,118,0,.11),rgba(16,18,25,.96)_55%)] p-4 shadow-sr-card">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-200">Your next campaign</p>
              <p className="mt-1 text-sm font-bold leading-6 text-content-primary">Choose a service, review live details and start from one place.</p>
              <PortalCTA onClick={() => setOpen(false)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sr-control bg-sr-brand px-4 py-3 text-sm font-black text-white shadow-sr-button">
                Start Order
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </PortalCTA>
            </section>

            <nav className="mt-4 grid gap-1" aria-label="Mobile navigation">
              <Link href="/services" onClick={() => setOpen(false)} className={`flex min-h-12 items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-bold outline-none transition ${servicesActive ? "border-action/25 bg-action/10 text-white" : "border-transparent text-content-secondary hover:border-sr-border hover:bg-white/[.04] hover:text-white"}`}>
                Services
                <ArrowRight className="h-4 w-4 text-orange-300" aria-hidden="true" />
              </Link>
              {primaryNav.map(([label, href]) => {
                const active = isActive(pathname, href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center rounded-xl border px-3.5 py-2.5 text-sm font-semibold outline-none transition ${active ? "border-action/25 bg-action/10 text-white" : "border-transparent text-content-secondary hover:border-sr-border hover:bg-white/[.04] hover:text-white"}`}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <section className="mt-4 border-t border-sr-border pt-4" aria-labelledby="mobile-platforms">
              <h2 id="mobile-platforms" className="px-1 text-[10px] font-black uppercase tracking-[.16em] text-orange-200">Explore platforms</h2>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {platforms.map(([label, href]) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-10 items-center rounded-xl border border-sr-border bg-white/[.025] px-3 text-xs font-semibold text-content-secondary outline-none transition hover:border-action/25 hover:bg-action/[.07] hover:text-white focus-visible:shadow-sr-focus">
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-4 border-t border-sr-border pt-4" aria-labelledby="mobile-resources">
              <h2 id="mobile-resources" className="px-1 text-[10px] font-black uppercase tracking-[.16em] text-content-muted">Resources & company</h2>
              <div className="mt-2 grid gap-1">
                {[...resourceNav, ...companyNav].map(([label, href, Icon]) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-content-secondary outline-none transition hover:bg-white/[.04] hover:text-white focus-visible:shadow-sr-focus">
                    <Icon className="h-4 w-4 text-orange-300" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            <div className="mt-4 grid gap-2.5 border-t border-sr-border pt-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-sr-border bg-surface-secondary p-2.5">
                <span className="text-xs font-bold text-content-muted">Display currency</span>
                <CurrencyDropdown tone={tone} />
              </div>
              <AndroidAppDownload compact />
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard/account" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sr-control border border-sr-border bg-surface-secondary px-4 py-3 text-sm font-bold text-white">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>
                  <button type="button" onClick={logout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sr-control border border-sr-border px-4 py-3 text-sm font-bold text-content-secondary">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-sr-control border border-sr-border px-4 py-3 text-sm font-bold text-white">Login</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-sr-control border border-action/25 bg-action/10 px-4 py-3 text-sm font-bold text-orange-100">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </MobileMenuLayer>
    </header>
  );
}
