"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import PortalCTA from "@/components/marketing/PortalCTA";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

const platforms = [
  {
    name: "Instagram",
    summary: "Followers, likes, and views with premium quality controls.",
    services: ["Followers", "Likes", "Views"],
    gradient: "from-fuchsia-500 to-rose-500",
  },
  {
    name: "YouTube",
    summary: "Subscriber and video growth for stronger channel authority.",
    services: ["Subscribers", "Likes", "Views"],
    gradient: "from-red-500 to-rose-700",
  },
  {
    name: "LinkedIn",
    summary: "Professional profile visibility and engagement growth.",
    services: ["Followers", "Likes"],
    gradient: "from-sky-500 to-blue-700",
  },
  {
    name: "Facebook",
    summary: "Reliable page growth and post engagement packages.",
    services: ["Followers", "Likes", "Views"],
    gradient: "from-blue-500 to-indigo-700",
  },
  {
    name: "Telegram",
    summary: "Community member growth for channels and groups.",
    services: ["Members"],
    gradient: "from-cyan-500 to-sky-700",
  },
  {
    name: "TikTok",
    summary: "Creator-focused growth packages for profile momentum.",
    services: ["Followers", "Likes", "Views"],
    gradient: "from-violet-500 to-fuchsia-700",
  },
  {
    name: "X / Twitter",
    summary: "Audience and authority growth for public profiles.",
    services: ["Followers"],
    gradient: "from-slate-500 to-slate-800",
  },
] as const;

const premiumPackages = [
  {
    name: "Creator Scale",
    audience: "Creators & Personal Brands",
    features: ["High-volume campaign setup", "Order tracking", "Wallet support"],
    basePriceINR: 24999,
  },
  {
    name: "Brand Growth",
    audience: "D2C Brands & Startups",
    features: ["Multi-platform campaign mix", "Priority support", "Refill-eligible services"],
    basePriceINR: 59999,
  },
  {
    name: "Agency Velocity",
    audience: "Agencies & Teams",
    features: ["Large package plans", "Operational dashboard", "Scalable order flow"],
    basePriceINR: 129999,
  },
] as const;

const trustItems = [
  "Secure Checkout",
  "Wallet Support",
  "WhatsApp Support",
  "Multi-currency Pricing",
  "Order Tracking",
] as const;

const faqs: Array<{ q: string; a: string }> = [
  {
    q: "How do I start a campaign?",
    a: "Create an account, choose your package or service, add your profile/content link, and continue through secure checkout.",
  },
  {
    q: "Can I pay in different currencies?",
    a: "Prices can be viewed in INR, USD, EUR, GBP, and AED. Your selected display currency is saved in localStorage.",
  },
  {
    q: "Where do I track order progress?",
    a: "You can monitor campaign progress from your account dashboard with status and history visibility.",
  },
  {
    q: "Can I ask support before ordering?",
    a: "Yes, WhatsApp support is available for guidance before package selection and checkout.",
  },
];

export default function HomepageContent() {
  const { currency } = usePreferredCurrency("INR");
  const [activeFaq, setActiveFaq] = useState(0);

  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20want%20help%20choosing%20a%20service";

  const packageCards = useMemo(
    () =>
      premiumPackages.map((item) => ({
        ...item,
        displayPrice: formatCurrency(item.basePriceINR, currency),
      })),
    [currency],
  );

  return (
    <main className="overflow-hidden bg-[radial-gradient(circle_at_12%_4%,rgba(99,102,241,.24),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(34,211,238,.15),transparent_32%),linear-gradient(180deg,#050816_0%,#070b1f_32%,#0a122b_100%)] text-white">
      <MarketingHeader />

      <section className="relative px-5 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="hero-grid absolute inset-0 opacity-20" />
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-20 top-12 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.04fr_.96fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/35 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-violet-200 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              TRUSTED SOCIAL GROWTH PLATFORM
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-[-.04em] text-white sm:text-5xl lg:text-[62px]">
              Premium Social Media Growth Platform for Creators, Brands &amp; Agencies
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Launch high-volume growth campaigns across Instagram, YouTube, LinkedIn, Facebook, Telegram, TikTok, and X with secure checkout, wallet support, WhatsApp assistance, multi-currency pricing, and professional order tracking.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/packages" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-violet-300/35 bg-violet-500/10 px-6 py-3 text-sm font-bold text-violet-100 transition hover:border-cyan-300/50 hover:text-cyan-200">
                View Packages
              </Link>
              <Link href="/register" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-6 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20">
                Create Account
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-6 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/20">
                WhatsApp Support
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Instagram", "YouTube", "LinkedIn", "Facebook", "Telegram", "TikTok", "X/Twitter"].map((platform) => (
                <span key={platform} className="rounded-full border border-violet-300/25 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-200 backdrop-blur">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="landing-float relative">
            <div className="absolute -inset-6 rounded-[34px] bg-gradient-to-br from-violet-500/25 via-cyan-400/10 to-emerald-400/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-violet-300/25 bg-slate-950/80 p-4 shadow-[0_45px_110px_-45px_rgba(16,185,129,.45)] backdrop-blur-xl sm:p-5">
              <div className="rounded-2xl border border-violet-300/25 bg-[#090f24] p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-200">SocialRUSH Campaign Dashboard</p>
                    <h2 className="mt-2 text-base font-bold">Live Order Management &amp; Tracking</h2>
                  </div>
                  <span className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-emerald-200">Support Online</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {["Selected Growth Package", "Wallet Support", "Secure Checkout", "Order Tracking", "Multi-currency Pricing"].map((label) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[.05] p-3 text-[10px] font-semibold text-cyan-200">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Platform Services Preview</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Seven-platform growth coverage from one premium interface.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {platforms.map((platform) => (
              <article key={platform.name} className="group rounded-3xl border border-violet-300/20 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-white/[.08]">
                <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white ${platform.gradient}`}>
                  {platform.name.slice(0, 2).toUpperCase()}
                </span>
                <h3 className="mt-5 text-lg font-bold">{platform.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{platform.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {platform.services.map((service) => (
                    <span key={service} className="rounded-full border border-violet-300/25 bg-white/[.06] px-3 py-1 text-[10px] font-bold text-violet-100">
                      {service}
                    </span>
                  ))}
                </div>
                <Link href="/services" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-cyan-200">
                  Explore Services
                  <MarketingIcon name="arrow" className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/5 px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Big Packages Preview</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">High-volume package plans for serious growth teams.</h2>
              <p className="mt-3 text-sm text-slate-300">No small-order focus on homepage. Premium package pricing previews are shown in your selected display currency.</p>
            </div>
            <Link href="/packages" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100">
              View All Packages
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {packageCards.map((item) => (
              <article key={item.name} className="rounded-3xl border border-violet-300/25 bg-[#0c1633]/70 p-6 shadow-[0_28px_50px_-35px_rgba(59,130,246,.55)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-200">{item.audience}</p>
                <h3 className="mt-3 text-2xl font-bold">{item.name}</h3>
                <p className="mt-3 text-3xl font-black text-cyan-200">{item.displayPrice}</p>
                <p className="mt-1 text-xs text-slate-400">starting package value</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-200">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">How It Works</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Create Account",
              "Choose Package",
              "Add Profile/Link",
              "Checkout & Track",
            ].map((step, index) => (
              <article key={step} className="rounded-2xl border border-violet-300/20 bg-white/5 p-5 backdrop-blur">
                <span className="text-2xl font-black text-violet-300">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/5 px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Trust</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustItems.map((item) => (
              <article key={item} className="rounded-2xl border border-violet-300/20 bg-white/5 p-4 text-center text-sm font-bold text-slate-100 backdrop-blur">
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-bold uppercase tracking-[.2em] text-cyan-300">FAQ</p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">Everything before your first order.</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((item, index) => (
              <article key={item.q} className="overflow-hidden rounded-2xl border border-violet-300/20 bg-white/5 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setActiveFaq((current) => (current === index ? -1 : index))}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold">{item.q}</span>
                  <span className="text-lg text-cyan-300">{activeFaq === index ? "-" : "+"}</span>
                </button>
                {activeFaq === index && <p className="border-t border-violet-300/20 px-5 py-4 text-sm text-slate-300">{item.a}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-5 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-violet-300/25 bg-gradient-to-br from-[#0d1738] to-[#111f4a] p-7 shadow-[0_30px_70px_-40px_rgba(45,212,191,.55)] backdrop-blur sm:p-9">
          <h2 className="text-3xl font-bold tracking-tight">Ready to launch your next premium growth campaign?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Use package-first planning, secure checkout, and centralized tracking to scale social growth with confidence.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/packages" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-300/35 bg-violet-500/10 px-6 py-3 text-sm font-bold text-violet-100">
              View Packages
            </Link>
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-6 py-3 text-sm font-bold text-cyan-100">
              Create Account
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-6 py-3 text-sm font-bold text-emerald-200">
              WhatsApp Support
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
