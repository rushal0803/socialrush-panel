"use client";

import Link from "next/link";
import { homepageFaqItems as faqItems } from "@/lib/seo/homepage-faq";
import { usePathname, useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m as motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import SafeImage from "@/components/SafeImage";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";
import HowToOrderSection from "@/components/marketing/HowToOrderSection";
import MarketingFooter from "@/components/marketing/MarketingFooter";

/* ─────────────────── animation variants ─────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const cardAnim: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ─────────────────── data ─────────────────── */
const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/contact" },
] as const;

const trustBadges = [
  { label: "No Password Required", icon: "✓", color: "from-[#FF7A00] to-[#FFB000]" },
  { label: "Secure Checkout", icon: "✓", color: "from-[#FF7A00] to-[#FFB000]" },
  { label: "Real-time Order Tracking", icon: "↗", color: "from-[#FF7A00] to-[#FFB000]" },
  { label: "WhatsApp Support", icon: "◎", color: "from-[#FF7A00] to-[#FFB000]" },
] as const;

const whySocialRush = [
  {
    title: "Public-Link Ordering",
    text: "Start with the relevant public profile, post, video, channel, or page link.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    grad: "from-orange-500 to-red-500",
    bg: "from-orange-50 to-red-50",
    border: "border-orange-100",
  },
  {
    title: "Secure Checkout",
    text: "Trusted payment flow and protected account ordering process.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    grad: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-100",
  },
  {
    title: "Transparent Pricing",
    text: "Review the applicable price and total before confirming an order.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    grad: "from-amber-400 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    title: "Dashboard Tracking",
    text: "Follow order status and available progress updates from your account.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    grad: "from-amber-500 to-amber-600",
    bg: "from-amber-50 to-amber-50",
    border: "border-amber-100",
  },
  {
    title: "WhatsApp Assistance",
    text: "Ask for help with service selection, ordering, and support questions.",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    grad: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
  },
  {
    title: "Refill Support If Eligible",
    text: "Eligible services clearly show the applicable refill coverage.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    grad: "from-orange-500 to-amber-500",
    bg: "from-orange-50 to-amber-50",
    border: "border-amber-100",
  },
] as const;

const featuredServices = [
  {
    name: "Instagram Campaign Support",
    platform: "instagram",
    href: "/buy-instagram-followers-india",
    text: "Explore profile and content campaign options for Instagram.",
    grad: "from-orange-500 to-orange-600",
    bg: "from-orange-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    name: "YouTube Channel Support",
    platform: "youtube",
    href: "/youtube-subscribers",
    text: "Compare channel and video support services with clear delivery details.",
    grad: "from-red-500 to-red-600",
    bg: "from-red-50 to-red-50",
    border: "border-red-100",
  },
  {
    name: "LinkedIn Profile Support",
    platform: "linkedin",
    href: "/linkedin-followers",
    text: "Review professional profile and company page support options.",
    grad: "from-amber-500 to-orange-600",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-100",
  },
  {
    name: "Facebook Page Support",
    platform: "facebook",
    href: "/facebook-followers",
    text: "Find page and content campaign services with transparent pricing.",
    grad: "from-orange-500 to-orange-600",
    bg: "from-orange-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    name: "TikTok Campaign Support",
    platform: "tiktok",
    href: "/tiktok-followers",
    text: "Explore structured campaign support for public TikTok profiles and content.",
    grad: "from-[#FF7A00] to-[#FFB000]",
    bg: "from-orange-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    name: "Twitter/X Profile Support",
    platform: "twitter",
    href: "/twitter-followers",
    text: "Explore profile campaign options with visible pricing and tracking.",
    grad: "from-amber-500 to-slate-700",
    bg: "from-amber-50 to-slate-50",
    border: "border-amber-100",
  },
] as const;

const homepagePosts = [
  {
    title: "How to Grow Fast on Instagram",
    href: "/blog/how-to-grow-fast-on-instagram",
    category: "Social Strategy",
    excerpt: "Practical ways to improve profile clarity, publishing consistency and campaign planning.",
  },
  {
    title: "YouTube Views: What Helps a Video Get More Reach",
    href: "/blog/youtube-views-get-more-reach",
    category: "Video Strategy",
    excerpt: "Learn how stronger packaging, retention and distribution can support broader video reach.",
  },
  {
    title: "LinkedIn Growth Tips for Personal Brands",
    href: "/blog/linkedin-growth-tips-personal-brands",
    category: "Professional Growth",
    excerpt: "Build a clearer professional presence with focused content, positioning and profile updates.",
  },
] as const;

const homepageSeoLinks = [
  {
    title: "Buy Instagram Followers",
    href: "/buy-instagram-followers-india",
    text: "Compare Instagram follower packages in India with public-link ordering and dashboard tracking.",
  },
  {
    title: "YouTube Subscribers",
    href: "/youtube-subscribers",
    text: "Review YouTube subscriber pricing, delivery guidance, and channel-link requirements.",
  },
  {
    title: "Instagram Likes",
    href: "/instagram-likes",
    text: "Support selected public posts or reels with clear Instagram likes pricing.",
  },
  {
    title: "Facebook Followers",
    href: "/facebook-followers",
    text: "Explore Facebook page growth options for public pages and profiles.",
  },
  {
    title: "LinkedIn Followers",
    href: "/linkedin-followers",
    text: "Plan LinkedIn profile growth campaigns for professional visibility.",
  },
  {
    title: "Social Media Growth Packages",
    href: "/packages",
    text: "Browse SocialRUSH packages across Instagram, YouTube, Facebook, LinkedIn and more.",
  },
  {
    title: "Growth Blog",
    href: "/blog",
    text: "Read helpful guides on pricing, safety, public-link ordering and campaign planning.",
  },
] as const;

const supportedPlatforms = [
  { label: "Instagram", platform: "instagram", href: "/buy-instagram-followers-india" },
  { label: "YouTube", platform: "youtube", href: "/youtube-subscribers" },
  { label: "Facebook", platform: "facebook", href: "/facebook-followers" },
  { label: "LinkedIn", platform: "linkedin", href: "/linkedin-followers" },
  { label: "X / Twitter", platform: "twitter", href: "/twitter-followers" },
  { label: "Telegram", platform: "telegram", href: "/telegram-members" },
  { label: "TikTok", platform: "tiktok", href: "/tiktok-followers" },
] as const;

/* ─────────────────── SVG icon component ─────────────────── */
function SvgIcon({ path, size = 20, className = "" }: { path: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

/* ─────────────────── main component ─────────────────── */
export default function HomepageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const startOrderHref = "/dashboard/new-order";

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setIsLoggedIn(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="public-dark homepage-performance overflow-x-clip bg-[#050505] text-white">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 hidden overflow-hidden sm:block">
        <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-[28rem] w-[28rem] rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute -bottom-12 right-1/4 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" />
      </div>

      {/* HEADER */}
      <header id="home" className="sticky top-0 z-[9999] border-b border-orange-400/15 bg-[#0B0B0F]/95 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0F] px-4 py-3 shadow-[0_16px_40px_-20px_rgba(0,0,0,.8)] sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Logo light priority />
            <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-300 lg:flex">
              {navLinks.map((item) => (
                <Link key={item.label} href={item.href} className="relative rounded-lg px-3 py-2 transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#FF7A00] after:transition-transform hover:bg-white/5 hover:text-white hover:after:scale-x-100">{item.label}</Link>
              ))}
            </nav>
            <div className="hidden items-center gap-2 lg:flex">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard/account" className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-400/20">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:text-orange-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:text-orange-300">Login</Link>
                </>
              )}
              <Link href={startOrderHref} className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-950/30 transition hover:brightness-110">Get Started</Link>
            </div>
            <button type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={(event) => { event.stopPropagation(); setMenuOpen((v) => !v); }} className="grid h-10 w-10 place-items-center rounded-xl border border-orange-400/30 bg-white/5 text-white lg:hidden">
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
          <MobileMenuLayer open={menuOpen} onClose={() => setMenuOpen(false)} showCloseButton={false}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-orange-400/20 bg-[#0B0B0F]/98 px-4 pb-4 pt-4 shadow-2xl">
                <div className="max-h-full overflow-y-auto border-t border-white/10 pt-3">
                  <nav className="grid gap-0.5">
                    {navLinks.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-orange-300">{item.label}</Link>
                    ))}
                  </nav>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                    {isLoggedIn ? (
                      <>
                        <Link href="/dashboard/account" onClick={() => setMenuOpen(false)} className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2.5 text-center text-sm font-semibold text-orange-200">
                          Profile
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="rounded-xl border border-white/15 bg-white/[.06] px-3 py-2.5 text-center text-sm font-semibold text-white"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-white/15 bg-white/[.06] px-3 py-2.5 text-center text-sm font-semibold text-white">Login</Link>
                        <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2.5 text-center text-sm font-semibold text-orange-200">Sign Up</Link>
                      </>
                    )}
                    <Link href={startOrderHref} onClick={() => setMenuOpen(false)} className="col-span-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-orange-300/40">Start Order</Link>
                  </div>
                </div>
              </motion.div>
          </MobileMenuLayer>
        </div>
      </header>

      {/* HERO */}
      <motion.section variants={fadeUp} initial={false} animate="show" className="relative overflow-hidden bg-[#050505] px-4 pb-14 pt-10 text-white sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#FF7A00]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#FF9F00]/12 blur-3xl" />
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative z-10">
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
              SMART GROWTH • REAL RESULTS
            </motion.span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[58px]">
              Transparent Social Media Growth Services{" "}
              <span className="bg-gradient-to-r from-[#FF7A00] via-[#FF9F00] to-[#FFC400] bg-clip-text text-transparent">for Creators and Brands</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">SocialRUSH helps creators, brands and businesses manage social media growth campaigns with public-link ordering, transparent pricing, secure checkout, dashboard tracking and WhatsApp support.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={startOrderHref} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3 text-sm font-bold text-white shadow-xl shadow-orange-300/40 transition hover:-translate-y-0.5 hover:brightness-105">Start Your Order</Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-orange-400/50 bg-white/[.06] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:border-[#FF7A00] hover:bg-orange-400/10">View Packages</Link>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <motion.div key={badge.label} variants={cardAnim} whileHover={{ y: -4, scale: 1.04 }} className="flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-white/[.06] px-4 py-2.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,.7)] backdrop-blur">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-md ${badge.color}`}>{badge.icon}</span>
                  <span className="text-xs font-bold text-slate-200">{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-orange-300/25 blur-3xl" />
            {["instagram", "youtube", "linkedin", "twitter"].map((platform, index) => (
              <span key={platform} className={`absolute z-20 hidden h-12 w-12 place-items-center rounded-2xl border border-white/80 bg-white text-[#FF7A00] shadow-xl lg:grid ${index === 0 ? "-left-3 top-12" : index === 1 ? "right-6 -top-4" : index === 2 ? "-left-5 bottom-20" : "right-1 bottom-10"}`}>
                <PlatformIcon platform={platform} className="h-6 w-6" />
              </span>
            ))}
            <div className="relative overflow-hidden rounded-[30px] border border-orange-400/25 bg-[#111111] p-2 shadow-[0_36px_90px_-24px_rgba(255,122,0,.42)] sm:p-3">
              <div className="overflow-hidden rounded-2xl bg-[#050505]">
                <SafeImage src="/images/home/home-hero-dashboard.png" alt="SocialRUSH campaign dashboard with order tracking and support" width={1448} height={1086} sizes="(max-width: 1023px) 100vw, 50vw" className="h-auto w-full object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* PLATFORM DISCOVERY */}
      <section className="content-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-orange-400/20 bg-[#111111] p-5 shadow-[0_22px_54px_-36px_rgba(255,122,0,.55)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9F00]">Supported platforms</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Find the right growth path faster</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#D1D5DB]">
                Start with the platform you want to grow, then compare packages and order with a public link only.
              </p>
            </div>
            <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/35 bg-white/[.06] px-5 py-3 text-sm font-bold text-white transition hover:border-orange-400/70 hover:bg-orange-500/10">
              Browse Services
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {supportedPlatforms.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-2xl border border-orange-400/20 bg-[#151515] p-4 transition hover:-translate-y-1 hover:border-orange-400/60 hover:bg-orange-500/10"
              >
                <IconBadge label={item.label} size="sm">
                  <PlatformIcon platform={item.platform} className="h-5 w-5" />
                </IconBadge>
                <span className="mt-3 block text-sm font-black text-white group-hover:text-orange-200">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SOCIALRUSH */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600">Why SocialRUSH</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Why Customers Choose <span className="bg-gradient-to-r from-[#FF7A00] to-[#FFB000] bg-clip-text text-transparent">SocialRUSH</span></h2>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whySocialRush.map((item) => (
              <motion.article key={item.title} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_12px_40px_-16px_rgba(15,23,42,.18)] backdrop-blur ${item.border} ${item.bg}`}>
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${item.grad}`}><SvgIcon path={item.icon} size={20} /></div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <HowToOrderSection id="how-it-works" homepage />

      {/* POPULAR SERVICES */}
      <motion.section variants={fadeUp} initial={false} whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600">Platform Services</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Choose a Platform. Pick a Service. Track Everything.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Explore social media growth services across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and Twitter/X with transparent pricing and dashboard tracking.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/services" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600">View All Services</Link>
              <Link href={startOrderHref} className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-300/40 transition hover:brightness-105">Start Order</Link>
            </div>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((svc) => (
              <motion.article key={svc.name} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className={`overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_12px_40px_-16px_rgba(15,23,42,.18)] ${svc.border} ${svc.bg}`}>
                <IconBadge label={svc.name}><PlatformIcon platform={svc.platform} className="h-6 w-6" /></IconBadge>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{svc.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{svc.text}</p>
                <div className="mt-4 flex gap-2">
                  <Link href={svc.href} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:text-orange-600">View Services</Link>
                  <Link href={startOrderHref} className={`inline-flex items-center gap-1 rounded-lg bg-gradient-to-r px-3 py-1.5 text-xs font-bold text-white shadow-sm ${svc.grad}`}>Start Order</Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* BLOG */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-orange-400/20 bg-[#111111] p-6 shadow-[0_24px_56px_-36px_rgba(255,122,0,.55)] sm:p-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-300">SocialRUSH India</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Social media growth services and packages in India</h2>
            <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
              Explore SocialRUSH service pages for creators, brands and businesses comparing social media growth services India, social media growth packages India and platform-specific campaign options.
            </p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homepageSeoLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-orange-400/20 bg-[#151515] p-4 transition hover:-translate-y-1 hover:border-orange-400/50 hover:bg-orange-500/10 active:scale-[.98]"
              >
                <h3 className="text-sm font-black text-white transition group-hover:text-[#FF9F00]">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#D1D5DB]">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* BLOG */}
      <motion.section id="blog" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600">Blog</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Tips, Trends &amp; Insights</h2>
            </div>
            <Link href="/blog" className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:text-orange-600">View All Blogs</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {homepagePosts.map((post) => (
              <motion.article key={post.href} whileHover={{ y: -6 }} className="group flex min-h-64 flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-[0_20px_50px_-22px_rgba(15,23,42,.3)]">
                <div>
                  <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600">{post.category}</span>
                  <h3 className="mt-3 text-lg font-extrabold leading-snug text-slate-900">
                    <Link href={post.href} className="transition hover:text-[#FF7A00]">{post.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                </div>
                <Link href={post.href} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[#FF7A00] transition group-hover:gap-3">Read Article <span aria-hidden="true">→</span></Link>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section id="faq" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">FAQ</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[faqItems.slice(0, 4), faqItems.slice(4)].map((col, cIdx) => (
              <div key={cIdx} className="space-y-3">
                {col.map((item) => {
                  const idx = faqItems.findIndex((e) => e.q === item.q);
                  const isOpen = activeFaq === idx;
                  return (
                    <article key={item.q} className={`overflow-hidden rounded-2xl border transition-all ${isOpen ? "border-amber-200 bg-white/90 shadow-[0_8px_30px_-8px_rgba(255, 196, 0, .22)]" : "border-white/80 bg-white/70 shadow-sm"} backdrop-blur`}>
                      <button type="button" onClick={() => setActiveFaq((prev) => (prev === idx ? null : idx))} className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left">
                        <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${isOpen ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"}`}>{isOpen ? "−" : "+"}</span>
                      </button>
                      <div
                        aria-hidden={!isOpen}
                        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="border-t border-amber-100/60 px-4 py-3 text-sm leading-7 text-slate-600">{item.a}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FINAL CTA */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="content-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/80 bg-[linear-gradient(135deg,#FFF8F1_0%,#FFF8F1_35%,#FFF8F1_65%,#f0fdf4_100%)] p-8 shadow-[0_30px_60px_-20px_rgba(255, 196, 0, .25)] sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-orange-300/25 blur-3xl" />
          <div className="relative text-center">
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600">Get Started Today</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Ready to Start Your Next <span className="bg-gradient-to-r from-[#FF7A00] via-[#FF9F00] to-[#FFC400] bg-clip-text text-transparent">Growth Campaign?</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">Choose your platform, select a service, submit your public link and track your order from your SocialRUSH dashboard.</p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href={startOrderHref} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] via-[#FF9F00] to-[#FFC400] px-8 py-3 text-sm font-bold text-white shadow-xl shadow-orange-300/50 transition hover:brightness-105 hover:shadow-orange-300/60">Start Order</Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600">View Packages</Link>
              <a href="https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20service" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-[#FF7A00]/30 bg-[#0B0B0F] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:border-[#FF9F00] hover:bg-black">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </motion.section>

      <MarketingFooter />
      </main>
    </LazyMotion>
  );
}
