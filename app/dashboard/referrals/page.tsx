"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Link2,
  MessageCircle,
  MousePointerClick,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { track } from "@/lib/analytics/events";

const shareUrl =
  "https://www.getsocialrush.com/?utm_source=customer_referral&utm_medium=share&utm_campaign=referral_center";
const shareText =
  "I use SocialRUSH for social media growth services. You can review the current services, pricing and order details here:";

const referralHighlights: Array<{
  icon: LucideIcon;
  title: string;
  body: string;
}> = [
  {
    icon: Users,
    title: "Share with the right people",
    body: "Creators, local businesses, agencies, resellers and teams already looking for social growth support.",
  },
  {
    icon: MousePointerClick,
    title: "Track referral visits",
    body: "The referral link helps SocialRUSH separate attributed landing visits from normal organic and direct traffic.",
  },
  {
    icon: ShieldCheck,
    title: "Clear and honest sharing",
    body: "No invented cashback, commission or discount. Any incentive will appear here only when an active program exists.",
  },
];

const distributionSteps = [
  {
    number: "01",
    title: "Choose the right person",
    body: "Share only when someone has a genuine social media growth requirement.",
  },
  {
    number: "02",
    title: "Send your unique link",
    body: "Copy the trackable link or share it directly through WhatsApp.",
  },
  {
    number: "03",
    title: "Let them explore",
    body: "They can compare current services, pricing, delivery and refill information before ordering.",
  },
];

export default function ReferralCenter() {
  const [copied, setCopied] = useState(false);

  async function copyReferralLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    track("referral_share_clicked", { channel: "copy" });
    window.setTimeout(() => setCopied(false), 1800);
  }

  function shareOnWhatsApp() {
    track("referral_share_clicked", { channel: "whatsapp" });
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-28 pt-6 text-white sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-48 -z-10 h-80 w-80 rounded-full bg-amber-400/[.06] blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-orange-400/30 bg-[radial-gradient(circle_at_88%_10%,rgba(255,122,0,.20),transparent_34%),linear-gradient(145deg,#17120f_0%,#0d0e13_55%,#101116_100%)] p-6 shadow-[0_28px_80px_-45px_rgba(255,122,0,.75)] sm:p-10">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/80 to-transparent" />
        <div className="relative grid gap-9 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-orange-200">
              <Sparkles className="h-3.5 w-3.5" />
              Referral Center
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] text-white sm:text-6xl">
              Share SocialRUSH.
              <span className="block bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">
                Help someone grow.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Know a creator, business or agency that needs social media growth support? Share your trackable referral link and help them discover the right service.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
                Your referral link
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-200">
                <BadgeCheck className="h-3 w-3" />
                Ready to share
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-[#08090d] px-4 py-3">
              <Link2 className="h-4 w-4 shrink-0 text-orange-300" />
              <p className="min-w-0 truncate text-xs font-semibold text-slate-200">
                getsocialrush.com/?utm_source=customer_referral…
              </p>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              This link uses campaign attribution to measure referral visits. Your account credentials are never included.
            </p>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-white shadow-[0_14px_34px_-18px_rgba(16,185,129,.9)] transition hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 motion-reduce:transform-none"
          >
            <MessageCircle className="h-5 w-5" />
            Share on WhatsApp
          </button>
          <button
            type="button"
            onClick={copyReferralLink}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-orange-300/35 bg-orange-400/10 px-5 text-sm font-black text-orange-100 transition hover:-translate-y-0.5 hover:border-orange-300/60 hover:bg-orange-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 motion-reduce:transform-none"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-300" /> : <Copy className="h-5 w-5" />}
            {copied ? "Referral link copied" : "Copy referral link"}
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Referral details">
        {referralHighlights.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="group rounded-2xl border border-white/10 bg-[#111319] p-6 shadow-[0_20px_45px_-35px_rgba(0,0,0,.9)] transition hover:-translate-y-1 hover:border-orange-300/35 motion-reduce:transform-none"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-orange-300/20 bg-orange-400/10 text-orange-300">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-lg font-black text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0f15] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">
              How referrals work
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Three simple steps to share responsibly
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-bold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            No password sharing
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {distributionSteps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-white/[.08] bg-white/[.035] p-5">
              <p className="text-sm font-black text-orange-300">{step.number}</p>
              <h3 className="mt-4 font-black text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-white/[.08] pt-6 sm:flex-row">
          <Link
            href="/services"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-black text-white shadow-[0_14px_32px_-18px_rgba(255,122,0,.85)] transition hover:brightness-110"
          >
            Browse services
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/for-agencies#bulk-lead-engine"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-black text-slate-100 transition hover:border-orange-300/40 hover:text-orange-100"
          >
            Agency & bulk enquiries
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-slate-500">
        Current service pricing, availability, delivery estimates and refill details shown before checkout remain authoritative.
      </p>
    </main>
  );
}
