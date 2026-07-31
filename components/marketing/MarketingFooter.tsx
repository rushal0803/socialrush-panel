"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";
import FooterSocialLinks from "@/components/marketing/FooterSocialLinks";
import { platformDisclaimer } from "@/lib/trust/proof-content";

const groups = [
  { title: "Growth services", links: [["Instagram Followers", "/buy-instagram-followers-india"], ["Instagram Likes", "/instagram-likes"], ["Instagram Views", "/instagram-views"], ["YouTube Subscribers", "/youtube-subscribers"], ["YouTube Likes", "/youtube-likes"], ["YouTube Views", "/youtube-views"], ["Facebook Followers", "/facebook-followers"], ["LinkedIn Followers", "/linkedin-followers"], ["Telegram Members", "/telegram-members"], ["Twitter/X Followers", "/twitter-followers"]] },
  { title: "Platform", links: [["Services", "/services"], ["Packages", "/packages"], ["Blog", "/blog"], ["Pricing", "/pricing"], ["Login", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"], ["Support", "/dashboard/support"]] },
  { title: "Company & legal", links: [["About", "/about"], ["Case Studies", "/case-studies"], ["Customer Safety", "/testimonials"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Privacy Policy", "/privacy-policy"], ["Refund Policy", "/refund-policy"], ["Terms & Conditions", "/terms-and-conditions"]] },
];

const mobileGroups = [
  { title: "Services", links: [["Instagram Followers", "/buy-instagram-followers-india"], ["Instagram Likes", "/instagram-likes"], ["Instagram Views", "/instagram-views"], ["YouTube Subscribers", "/youtube-subscribers"], ["Facebook Followers", "/facebook-followers"], ["LinkedIn Followers", "/linkedin-followers"]] },
  { title: "Company", links: [["About", "/about"], ["Case Studies", "/case-studies"], ["Blog", "/blog"], ["Pricing", "/pricing"]] },
  { title: "Support", links: [["Services", "/services"], ["Packages", "/packages"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Support", "/dashboard/support"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Refund Policy", "/refund-policy"], ["Terms & Conditions", "/terms-and-conditions"]] },
] as const;

export default function MarketingFooter({ tone = "default" }: { tone?: "default" | "light3d" }) {
  const isLight3d = tone === "light3d";
  const whatsappUrl = "https://wa.me/918860330771";
  const [openMobileGroup, setOpenMobileGroup] = useState<string>(mobileGroups[0].title);

  return (
    <footer className={isLight3d ? "brand-footer relative overflow-hidden px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-8 text-white sm:px-6 sm:pb-9 sm:pt-12 lg:px-8" : "brand-footer relative px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-8 text-white sm:px-6 sm:pb-8 sm:pt-12 lg:px-8"}>
      <div className={isLight3d ? "pointer-events-none absolute -left-24 top-6 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" : "pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-orange-600/15 blur-3xl"} />
      <div className={isLight3d ? "pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" : "pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl"} />
      <div className="relative mx-auto max-w-7xl">
        <div className={isLight3d ? "brand-footer-surface grid gap-4 rounded-3xl border p-4 backdrop-blur-2xl sm:gap-6 sm:p-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10" : "brand-footer-surface grid gap-4 border pb-6 sm:gap-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10 lg:pb-12"}>
          <div className={isLight3d ? "rounded-2xl border border-[#FFF8F1] bg-white/80 p-4 sm:p-5" : ""}>
            <Logo light className="[&>img]:h-11 sm:[&>img]:h-10 md:[&>img]:h-12" />
            <p className={isLight3d ? "mt-3 max-w-sm text-xs leading-6 text-[#111827] sm:mt-5" : "mt-3 max-w-sm text-xs leading-6 text-slate-400 sm:mt-5"}>
              SocialRUSH helps creators and brands compare social growth services, order with a public link and track progress securely.
            </p>
            <FooterSocialLinks />
            <p className={isLight3d ? "mt-4 max-w-sm text-[11px] leading-6 text-[#111827]" : "mt-4 max-w-sm text-[11px] leading-6 text-slate-500"}>
              {platformDisclaimer}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:flex sm:flex-row sm:flex-wrap">
              <Link
                href="/packages"
                className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 py-2.5 text-center text-xs font-bold text-white shadow-[0_14px_30px_-14px_rgba(255,196,0,.65)] transition hover:-translate-y-0.5 sm:w-auto sm:px-4" : "inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-3 py-2.5 text-center text-xs font-bold transition hover:bg-orange-500 sm:w-auto sm:px-4"}
              >
                View Packages
              </Link>
              <Link
                href="/register"
                className={isLight3d ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-2.5 text-center text-xs font-bold text-[#FF9F00] transition sm:w-auto sm:px-4" : "inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.05] px-3 py-2.5 text-center text-xs font-bold text-white transition hover:border-orange-400/35 sm:w-auto sm:px-4"}
              >
                Create Account
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={isLight3d ? "col-span-2 inline-flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto" : "col-span-2 inline-flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-400/10 sm:w-auto"}
              >
                WhatsApp Support
              </a>
            </div>
          </div>

          <div className="space-y-2 lg:hidden">
            {mobileGroups.map((group) => {
              const isOpen = openMobileGroup === group.title;
              return (
                <div key={group.title} className="overflow-hidden border-b border-white/10">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`footer-mobile-${group.title.toLowerCase()}`}
                    onClick={() => setOpenMobileGroup((current) => (current === group.title ? "" : group.title))}
                    className="flex min-h-11 w-full items-center justify-between px-2 py-2.5 text-left text-xs font-black uppercase tracking-[0.14em] text-white"
                  >
                    {group.title}
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/15 text-orange-200" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <div id={`footer-mobile-${group.title.toLowerCase()}`} className={isOpen ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]"}>
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-3 pt-1">
                        {group.links.map(([label, href]) => (
                          <Link key={label} href={href} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 transition hover:bg-orange-500/10 hover:text-orange-200">
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {groups.map((group) => (
            <div key={group.title} className={isLight3d ? "hidden rounded-2xl border border-[#FFF8F1] bg-white/80 p-4 sm:p-5 lg:block" : "hidden lg:block"}>
              <h3 className={isLight3d ? "text-xs font-bold text-[#0B0B0F]" : "text-xs font-bold"}>{group.title}</h3>
              <div className={isLight3d ? "mt-5 space-y-3 text-xs text-[#111827]" : "mt-5 space-y-3 text-xs text-slate-400"}>
                {group.links.map(([label, href]) => (
                  <Link key={label} href={href} className={isLight3d ? "block transition hover:text-[#0B0B0F]" : "block transition hover:text-white"}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={isLight3d ? "mt-6 flex flex-col justify-between gap-3 border-t border-[#FFF8F1] pt-6 text-[10px] text-[#111827] sm:flex-row" : "flex flex-col justify-between gap-3 pt-7 text-[10px] text-slate-500 sm:flex-row"}>
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Secure Checkout · Wallet Support · WhatsApp Support · Multi-currency Pricing · Order Tracking</p>
        </div>
      </div>
    </footer>
  );
}
