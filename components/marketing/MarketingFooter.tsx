"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MessageCircle, Minus, Plus } from "lucide-react";
import Logo from "@/components/Logo";
import FooterSocialLinks from "@/components/marketing/FooterSocialLinks";
import PortalCTA from "@/components/marketing/PortalCTA";
import { customerGuidance } from "@/lib/trust/customer-guidance";

type FooterGroup = { title: string; links: readonly (readonly [string, string])[] };

const groups: readonly FooterGroup[] = [
  { title: "Services", links: [["Instagram", "/services?platform=instagram"], ["YouTube", "/services?platform=youtube"], ["Facebook", "/services?platform=facebook"], ["LinkedIn", "/services?platform=linkedin"], ["X / Twitter", "/services?platform=x"], ["TikTok", "/services?platform=tiktok"], ["Telegram", "/services?platform=telegram"]] },
  { title: "Company", links: [["About Us", "/about"], ["Pricing", "/pricing"], ["Packages", "/packages"], ["Case Studies", "/case-studies"], ["Blog", "/blog"], ["Contact", "/contact"]] },
  { title: "Support", links: [["FAQ", "/faq"], ["Help / Support", "/support"], ["How It Works", "/#how-it-works"], ["Refund Policy", "/refund-policy"], ["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms-and-conditions"]] },
  { title: "Resources", links: [["For Brands", "/for-brands"], ["For Creators", "/for-creators"], ["For Agencies", "/for-agencies"], ["Creator Tools", "/tools"], ["Growth Guides", "/blog"], ["Customer Safety", "/trust"], ["Compare Services", "/compare"], ["Customer Reviews", "/reviews"]] },
  { title: "Markets", links: [["United States", "/us"], ["United Kingdom", "/uk"], ["Canada", "/ca"], ["Australia", "/au"], ["United Arab Emirates", "/ae"], ["Singapore", "/sg"]] },
] as const;

const payments = ["UPI at checkout", "Wallet Balance"] as const;
const trust = ["Review price before checkout", "Public-link ordering", "Order tracking", "Customer support", "Service-specific delivery details", "Service-specific refill details"] as const;

function groupId(title: string) {
  return `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function FooterLinks({ group }: { group: FooterGroup }) {
  return (
    <ul className="mt-4 space-y-0.5">
      {group.links.map(([label, href]) => (
        <li key={label}>
          <Link
            href={href}
            className="inline-flex min-h-10 items-center text-sm leading-6 text-content-secondary outline-none transition duration-fast hover:translate-x-0.5 hover:text-orange-200 focus-visible:rounded focus-visible:shadow-sr-focus motion-reduce:transform-none"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MarketingFooter({ tone = "default" }: { tone?: "default" | "light3d" }) {
  void tone;
  const [openGroup, setOpenGroup] = useState(groups[0].title);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-sr-border bg-[#06070b] px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-8 text-white sm:px-6 sm:pb-10 lg:px-8 lg:pt-12">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-80 w-[54rem] max-w-[95vw] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,118,0,.10),transparent_66%)]" />

      <div className="relative mx-auto max-w-sr-content">
        <section className="overflow-hidden rounded-[28px] border border-action/20 bg-[linear-gradient(135deg,rgba(255,118,0,.13),rgba(16,18,25,.97)_48%,rgba(16,18,25,.98))] p-5 shadow-sr-card sm:p-7 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-8" aria-label="Start a SocialRUSH campaign">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-orange-200">Ready when you are</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-content-primary sm:text-3xl">Build your next social growth campaign from one place.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-content-secondary">Browse the available services, review the live details shown for your selection, and move into checkout when you are ready.</p>
          </div>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:mt-0 lg:shrink-0">
            <Link href="/services" className="inline-flex min-h-12 items-center justify-center rounded-sr-control border border-sr-border-strong bg-white/[.04] px-5 py-3 text-sm font-black text-white outline-none transition hover:border-action/30 hover:bg-white/[.07] focus-visible:shadow-sr-focus">
              Browse services
            </Link>
            <PortalCTA className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-sr-control bg-sr-brand px-5 py-3 text-sm font-black text-white shadow-sr-button outline-none transition duration-normal ease-sr-out hover:-translate-y-0.5 focus-visible:shadow-sr-focus motion-reduce:transform-none">
              Start Order
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </PortalCTA>
          </div>
        </section>

        <section className="mt-8 grid gap-6 rounded-[28px] border border-sr-border bg-surface-elevated/75 p-5 sm:p-7 lg:grid-cols-[1.35fr_.65fr] lg:items-start lg:p-8" aria-label="About SocialRUSH">
          <div className="min-w-0">
            <Logo light className="[&>img]:h-11 [&>img]:max-w-[190px] sm:[&>img]:h-12" />
            <p className="mt-4 max-w-2xl text-sm leading-6 text-content-secondary">SocialRUSH gives creators, brands and businesses one clear place to explore services, review current pricing, place public-link orders, track campaigns, and reach customer support.</p>
            <div className="mt-5 grid gap-2.5 sm:max-w-xl sm:grid-cols-2">
              <a href="mailto:support@getsocialrush.com" className="flex min-h-12 items-center gap-3 rounded-xl border border-sr-border bg-white/[.025] px-3.5 text-sm font-semibold text-content-primary outline-none transition hover:border-action/25 hover:bg-action/[.06] focus-visible:shadow-sr-focus">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-action/10 text-orange-300"><Mail className="h-4 w-4" aria-hidden="true" /></span>
                <span className="min-w-0 truncate">support@getsocialrush.com</span>
              </a>
              <a href="https://wa.me/918860330771" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-sr-border bg-white/[.025] px-3.5 text-sm font-semibold text-content-primary outline-none transition hover:border-emerald-400/25 hover:bg-emerald-400/[.06] focus-visible:shadow-sr-focus">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><MessageCircle className="h-4 w-4" aria-hidden="true" /></span>
                WhatsApp Support
              </a>
            </div>
          </div>
          <div className="lg:justify-self-end">
            <FooterSocialLinks />
          </div>
        </section>

        <nav className="mt-9" aria-label="Footer navigation">
          <div className="space-y-1 lg:hidden">
            {groups.map((group) => {
              const open = openGroup === group.title;
              const id = groupId(group.title);
              return (
                <section key={group.title} className="border-b border-sr-border">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={id}
                      onClick={() => setOpenGroup(open ? "" : group.title)}
                      className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-xs font-black uppercase tracking-[.14em] text-content-primary outline-none focus-visible:shadow-sr-focus"
                    >
                      <span>{group.title}</span>
                      <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${open ? "border-action/30 bg-action/12 text-orange-200" : "border-sr-border bg-white/[.03] text-content-muted"}`}>
                        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </h2>
                  <div id={id} className={`grid transition-[grid-template-rows] duration-normal ease-sr-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-1 gap-x-4 pb-4 min-[390px]:grid-cols-2"><FooterLinks group={group} /></div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="hidden gap-x-7 gap-y-10 lg:grid lg:grid-cols-5">
            {groups.map((group) => (
              <section key={group.title} className="min-w-0">
                <h2 className="text-xs font-black uppercase tracking-[.14em] text-content-primary">{group.title}</h2>
                <FooterLinks group={group} />
              </section>
            ))}
          </div>
        </nav>

        <section className="mt-10 grid gap-6 rounded-2xl border border-sr-border bg-white/[.02] p-5 md:grid-cols-2 md:p-6" aria-label="Payment and trust information">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[.14em] text-content-primary">Supported payment methods</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {payments.map((item) => <li key={item} className="rounded-lg border border-sr-border bg-white/[.04] px-3 py-2 text-xs font-semibold text-content-secondary">{item}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[.14em] text-content-primary">Ordering with confidence</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {trust.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs font-semibold leading-5 text-content-secondary">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-7 text-xs leading-6 text-content-muted" aria-label="Customer safety and independence">
          <p>SocialRUSH is an independent service provider and is not affiliated with, endorsed by or officially connected to Instagram, Meta, YouTube, Google, LinkedIn, X, TikTok or Telegram.</p>
          <p className="mt-2">{customerGuidance.publicLink}</p>
        </section>

        <div className="flex flex-col gap-4 border-t border-sr-border pt-6 text-xs text-content-muted sm:flex-row sm:items-center">
          <div>
            <p>© {year} SocialRUSH. All rights reserved.</p>
            <p className="mt-1">SocialRUSH is owned and operated by RUSHAL.</p>
          </div>
          <nav aria-label="Footer legal links" className="flex flex-wrap gap-x-4 gap-y-2 sm:ml-auto">
            <Link href="/privacy-policy" className="min-h-10 py-2 outline-none transition hover:text-orange-200 focus-visible:rounded focus-visible:shadow-sr-focus">Privacy</Link>
            <Link href="/terms-and-conditions" className="min-h-10 py-2 outline-none transition hover:text-orange-200 focus-visible:rounded focus-visible:shadow-sr-focus">Terms</Link>
            <Link href="/refund-policy" className="min-h-10 py-2 outline-none transition hover:text-orange-200 focus-visible:rounded focus-visible:shadow-sr-focus">Refunds</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
