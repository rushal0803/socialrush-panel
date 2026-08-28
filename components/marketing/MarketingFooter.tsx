"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";
import FooterSocialLinks from "@/components/marketing/FooterSocialLinks";

type FooterGroup = { title: string; links: readonly (readonly [string, string])[] };

const groups: readonly FooterGroup[] = [
  { title: "Services", links: [["Instagram", "/services?platform=instagram"], ["YouTube", "/services?platform=youtube"], ["Facebook", "/services?platform=facebook"], ["LinkedIn", "/services?platform=linkedin"], ["X / Twitter", "/services?platform=x"], ["TikTok", "/services?platform=tiktok"], ["Telegram", "/services?platform=telegram"]] },
  { title: "Company", links: [["About Us", "/about"], ["Pricing", "/pricing"], ["Packages", "/packages"], ["Case Studies", "/case-studies"], ["Blog", "/blog"], ["Contact", "/contact"]] },
  { title: "Support", links: [["FAQ", "/faq"], ["Help / Support", "/support"], ["How It Works", "/#how-it-works"], ["Refund Policy", "/refund-policy"], ["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms-and-conditions"]] },
  { title: "Resources", links: [["Creator Tools", "/tools"], ["Growth Guides", "/blog"], ["Customer Safety", "/trust"], ["Compare Services", "/compare"], ["Customer Reviews", "/reviews"]] },
] as const;

const payments = ["UPI", "Secure online payments", "Net Banking", "Wallet Balance"] as const;
const trust = ["Secure Checkout", "Wallet Support", "Public-Link Ordering", "Order Tracking", "Customer Support", "Multi-Currency Pricing"] as const;

function groupId(title: string) { return `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }

function FooterLinks({ group }: { group: FooterGroup }) {
  return <ul className="mt-4 space-y-1">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="inline-flex min-h-11 items-center text-sm leading-6 text-[#A8AFBD] outline-none transition hover:text-orange-300 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-orange-400">{label}</Link></li>)}</ul>;
}

export default function MarketingFooter({ tone = "default" }: { tone?: "default" | "light3d" }) {
  void tone;
  const [openGroup, setOpenGroup] = useState(groups[1].title);
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-orange-400/15 bg-[#07080D] px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-10 text-white sm:px-6 sm:pb-10 lg:px-8 lg:pt-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-[34rem] max-w-full -translate-x-1/2 bg-orange-500/[.08] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <section className="grid gap-5 rounded-2xl border border-white/[.08] bg-[#101219] p-5 lg:grid-cols-[1.35fr_.65fr] lg:items-start lg:p-6" aria-label="About SocialRUSH">
          <div className="min-w-0">
            <Logo light className="[&>img]:h-11 [&>img]:max-w-[190px] sm:[&>img]:h-12" />
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#A8AFBD]">SocialRUSH helps creators, brands and businesses order social media growth services through transparent pricing, public-link ordering, secure checkout, dashboard tracking and customer support.</p>
            <div className="mt-5 flex flex-col items-start gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5">
              <a href="mailto:support@getsocialrush.com" className="min-h-10 break-all py-2 font-semibold text-orange-300 outline-none hover:text-orange-200 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-orange-400">support@getsocialrush.com</a>
              <a href="https://wa.me/918860330771" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center py-2 font-semibold text-emerald-300 outline-none hover:text-emerald-200 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-emerald-400">WhatsApp Support</a>
            </div>
          </div>
          <FooterSocialLinks />
        </section>

        <nav className="mt-8" aria-label="Footer navigation">
          <div className="space-y-1 lg:hidden">
            {groups.map((group) => { const open = openGroup === group.title; const id = groupId(group.title); return <section key={group.title} className="border-b border-white/10"><h2><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpenGroup(open ? "" : group.title)} className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-xs font-black uppercase tracking-[.14em] text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"><span>{group.title}</span><span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-400/20 bg-orange-500/10 text-lg text-orange-300">{open ? "−" : "+"}</span></button></h2><div id={id} className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><div className="grid grid-cols-1 gap-x-4 pb-4 min-[390px]:grid-cols-2"><FooterLinks group={group} /></div></div></div></section>; })}
          </div>
          <div className="hidden gap-x-7 gap-y-10 lg:grid lg:grid-cols-4">
            {groups.map((group) => <section key={group.title} className="min-w-0"><h2 className="text-xs font-black uppercase tracking-[.14em] text-white">{group.title}</h2><FooterLinks group={group} /></section>)}
          </div>
        </nav>

        <section className="mt-10 grid gap-6 border-y border-white/10 py-7 md:grid-cols-2" aria-label="Payment and trust information">
          <div><h2 className="text-xs font-black uppercase tracking-[.14em]">Supported Payment Methods</h2><ul className="mt-4 flex flex-wrap gap-2">{payments.map(item => <li key={item} className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-semibold text-[#D1D5DB]">{item}</li>)}</ul></div>
          <div><h2 className="text-xs font-black uppercase tracking-[.14em]">Ordering with confidence</h2><ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">{trust.map(item => <li key={item} className="flex items-center gap-2 text-xs font-semibold text-[#A8AFBD]"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{item}</li>)}</ul></div>
        </section>

        <section className="py-7 text-xs leading-6 text-[#8F96A3]" aria-label="Customer safety and independence">
          <p>SocialRUSH is an independent service provider and is not affiliated with, endorsed by or officially connected to Instagram, Meta, YouTube, Google, LinkedIn, X, TikTok or Telegram.</p>
          <p className="mt-2">SocialRUSH never asks for your social media password, OTP or recovery code. Only a valid public profile, post, page, channel or video link is required.</p>
        </section>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#8F96A3] sm:flex-row sm:items-center">
  <div>
    <p>© {year} SocialRUSH. All rights reserved.</p>
    <p className="mt-1">
      SocialRUSH is owned and operated by RUSHAL.
    </p>
  </div>

  <a
    href="https://buildlist.io"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex w-fit shrink-0 items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
  >
    <img
      src="https://buildlist.io/badge.svg"
      alt="Featured on Buildlist"
      style={{ height: 40, width: "auto", maxWidth: "100%" }}
    />
  </a>

  <a
    href="https://marketingdb.live"
    target="_blank"
    rel="noopener noreferrer nofollow sponsored"
    className="inline-flex w-fit shrink-0 max-w-full items-center"
  >
    <img
      src="https://marketingdb.live/badge.svg"
      alt="Listed on MarketingDB"
      width="190"
      height="44"
      className="h-auto max-w-full"
    />
  </a>

  <a
    href="https://submitforbacklinks.com/badge/hjDF9kVOdBe4bbi5kUeWHxv9?ref=badge"
    target="_blank"
    rel="noopener"
    data-s4b-token="hjDF9kVOdBe4bbi5kUeWHxv9"
    data-s4b-theme="dark"
    className="inline-flex w-fit shrink-0 max-w-full items-center"
  >
    <img
      src="https://submitforbacklinks.com/api/badge/hjDF9kVOdBe4bbi5kUeWHxv9.svg?variant=verified&theme=dark"
      alt="SocialRUSH — Verified on SubmitForBacklinks"
      width="220"
      height="48"
      loading="lazy"
      className="h-auto max-w-full"
    />
  </a>

  <nav aria-label="Footer legal links" className="flex flex-wrap gap-x-4 gap-y-2 sm:ml-auto">
    <Link href="/privacy-policy" className="min-h-10 py-2 hover:text-orange-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">Privacy</Link>
    <Link href="/terms-and-conditions" className="min-h-10 py-2 hover:text-orange-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">Terms</Link>
    <Link href="/refund-policy" className="min-h-10 py-2 hover:text-orange-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">Refunds</Link>
  </nav>
</div>
</div>
    </footer>
  );
}
