"use client";

import Link from "next/link";
import { homepageFaqItems as faqItems } from "@/lib/seo/homepage-faq";
import { usePathname, useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m as motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import PlatformIcon from "@/components/PlatformIcon";
import SafeImage from "@/components/SafeImage";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";
import HowToOrderSection from "@/components/marketing/HowToOrderSection";

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
  { label: "About Us", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/contact" },
] as const;

const platforms = [
  { name: "Facebook", grad: "from-orange-500 to-orange-600" },
  { name: "Instagram", grad: "from-orange-500 to-orange-600" },
  { name: "LinkedIn", grad: "from-amber-500 to-orange-500" },
  { name: "TikTok", grad: "from-amber-500 to-orange-500" },
  { name: "YouTube", grad: "from-rose-500 to-red-600" },
  { name: "X / Twitter", grad: "from-amber-500 to-slate-600" },
] as const;

const stats = [
  {
    label: "No Password Required",
    sub: "Place an order using only the relevant public profile or content link.",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    iconBg: "from-orange-500 to-rose-500",
    glow: "shadow-orange-200",
    border: "border-orange-100",
    bg: "from-orange-50/80 to-rose-50/50",
  },
  {
    label: "Secure Checkout",
    sub: "Review your order and complete payment through the protected checkout flow.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    iconBg: "from-amber-500 to-orange-500",
    glow: "shadow-amber-200",
    border: "border-amber-100",
    bg: "from-amber-50/80 to-orange-50/50",
  },
  {
    label: "Real-time Order Tracking",
    sub: "Follow order status and available progress updates from your dashboard.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    iconBg: "from-amber-500 to-amber-600",
    glow: "shadow-amber-200",
    border: "border-amber-100",
    bg: "from-amber-50/80 to-amber-50/50",
  },
  {
    label: "WhatsApp Support",
    sub: "Ask for help choosing a service or resolving an order question.",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    iconBg: "from-amber-400 to-orange-500",
    glow: "shadow-orange-200",
    border: "border-orange-100",
    bg: "from-orange-50/80 to-amber-50/50",
  },
  {
    label: "Refill Support If Eligible",
    sub: "Eligible services clearly show their applicable refill coverage.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    iconBg: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-200",
    border: "border-emerald-100",
    bg: "from-emerald-50/80 to-teal-50/50",
  },
  {
    label: "Transparent Pricing",
    sub: "See the applicable package or quantity price before confirming an order.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    iconBg: "from-orange-500 to-amber-500",
    glow: "shadow-orange-200",
    border: "border-orange-100",
    bg: "from-orange-50/80 to-amber-50/50",
  },
] as const;

const trustBadges = [
  { label: "No Password Required", icon: "✓", color: "from-orange-500 to-rose-500" },
  { label: "Transparent Pricing", icon: "★", color: "from-amber-500 to-amber-600" },
  { label: "WhatsApp Support", icon: "◎", color: "from-amber-500 to-orange-600" },
  { label: "Secure Checkout", icon: "⬡", color: "from-emerald-500 to-teal-600" },
] as const;

const floatingStats = [
  { text: "Public Link Only", sub: "No password", pos: "top-6 -left-3", delay: 0 },
  { text: "Pricing", sub: "Shown before order", pos: "top-2 right-0", delay: 0.4 },
  { text: "Order Tracking", sub: "Dashboard updates", pos: "bottom-16 -left-2", delay: 0.8 },
  { text: "Support", sub: "WhatsApp help", pos: "bottom-6 right-0", delay: 1.2 },
] as const;

const whySocialRush = [
  {
    title: "Transparent Pricing",
    text: "Clear pricing visibility before checkout without hidden surprises.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    grad: "from-orange-500 to-rose-500",
    bg: "from-orange-50 to-rose-50",
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
    title: "Fast Delivery",
    text: "Optimized operational flow for timely campaign execution.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    grad: "from-amber-400 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    title: "Real-time Tracking",
    text: "Live status updates from order creation to completion.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    grad: "from-amber-500 to-amber-600",
    bg: "from-amber-50 to-amber-50",
    border: "border-amber-100",
  },
  {
    title: "Dedicated Support",
    text: "Human support for onboarding, planning, and campaign queries.",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    grad: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
  },
  {
    title: "Refill Support",
    text: "Coverage options on eligible services for added confidence.",
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
    href: "/buy-youtube-subscribers-india",
    text: "Compare channel and video support services with clear delivery details.",
    grad: "from-rose-500 to-red-600",
    bg: "from-rose-50 to-red-50",
    border: "border-rose-100",
  },
  {
    name: "LinkedIn Profile Support",
    platform: "linkedin",
    href: "/buy-linkedin-followers-india",
    text: "Review professional profile and company page support options.",
    grad: "from-amber-500 to-orange-600",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-100",
  },
  {
    name: "Facebook Page Support",
    platform: "facebook",
    href: "/buy-facebook-followers-india",
    text: "Find page and content campaign services with transparent pricing.",
    grad: "from-orange-500 to-orange-600",
    bg: "from-orange-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    name: "Telegram Channel Support",
    platform: "telegram",
    href: "/buy-telegram-members-india",
    text: "Compare public channel and community support services.",
    grad: "from-orange-400 to-orange-600",
    bg: "from-orange-50 to-orange-50",
    border: "border-orange-100",
  },
  {
    name: "Twitter/X Profile Support",
    platform: "twitter",
    href: "/buy-twitter-followers-india",
    text: "Explore profile campaign options with visible pricing and tracking.",
    grad: "from-amber-500 to-slate-700",
    bg: "from-amber-50 to-slate-50",
    border: "border-amber-100",
  },
] as const;

const customerSafetyPoints = [
  {
    title: "No Password Required",
    text: "We never ask for passwords.",
    grad: "from-orange-500 to-rose-500",
  },
  {
    title: "Public Links Only",
    text: "Orders use public profile, post, video, or channel links.",
    grad: "from-orange-500 to-orange-600",
  },
  {
    title: "Dashboard Tracking",
    text: "Orders can be tracked from your dashboard.",
    grad: "from-amber-500 to-amber-600",
  },
  {
    title: "WhatsApp Assistance",
    text: "Support is available on WhatsApp.",
    grad: "from-amber-500 to-orange-600",
  },
  {
    title: "Eligible Refill Support",
    text: "Refill support is available only for eligible services.",
    grad: "from-emerald-500 to-teal-500",
  },
  {
    title: "Upfront Pricing",
    text: "Pricing is shown before placing an order.",
    grad: "from-amber-400 to-orange-500",
  },
] as const;

const footerLinks = [
  { heading: "Quick Links", links: [["Home", "/"], ["Services", "/services"], ["Packages", "/packages"], ["Blog", "/blog"], ["About Us", "/about"]] },
  { heading: "Popular Growth", links: [["Instagram Followers", "/buy-instagram-followers-india"], ["Instagram Likes", "/buy-instagram-likes-india"], ["Instagram Views", "/buy-instagram-views-india"], ["YouTube Subscribers", "/buy-youtube-subscribers-india"], ["YouTube Likes", "/buy-youtube-likes-india"], ["YouTube Views", "/buy-youtube-views-india"], ["LinkedIn Followers", "/buy-linkedin-followers-india"], ["Facebook Followers", "/buy-facebook-followers-india"], ["Telegram Members", "/buy-telegram-members-india"]] },
  { heading: "Support", links: [["FAQ", "/faq"], ["Contact Us", "/contact"], ["Support Center", "/dashboard/support"], ["How It Works", "/#how-it-works"]] },
  { heading: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms-and-conditions"], ["Refund Policy", "/refund-policy"]] },
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
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const limitMotion = isMobile || Boolean(prefersReducedMotion);
  const startOrderHref = "/login?next=/dashboard/new-order";

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setIsLoggedIn(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="homepage-performance overflow-x-clip bg-[linear-gradient(165deg,#FFF8F1_0%,#FFF8F1_30%,#FFF8F1_55%,#FFF8F1_80%,#FFF8F1_100%)] text-slate-800">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 hidden overflow-hidden sm:block">
        <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-[28rem] w-[28rem] rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute -bottom-12 right-1/4 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" />
      </div>

      {/* HEADER */}
      <header id="home" className="sticky top-0 z-[9999] border-b border-white/50 bg-white/35 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-[0_8px_40px_-8px_rgba(15,23,42,.15)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Logo priority />
            <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex">
              {navLinks.map((item) => (
                <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 hover:text-orange-600">{item.label}</Link>
              ))}
            </nav>
            <div className="hidden items-center gap-2 lg:flex">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard/account" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600">Login</Link>
                  <Link href="/register" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100">Sign Up</Link>
                </>
              )}
              <Link href={startOrderHref} className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-300/50 transition hover:brightness-105 hover:shadow-orange-300/70">Start Order</Link>
            </div>
            <button type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={(event) => { event.stopPropagation(); setMenuOpen((v) => !v); }} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden">
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
          <MobileMenuLayer open={menuOpen} onClose={() => setMenuOpen(false)}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-white/90 bg-white/95 px-4 pb-4 pt-14 shadow-[0_24px_48px_-30px_rgba(15,23,42,.48)]">
                <div className="max-h-full overflow-y-auto border-t border-slate-100 pt-3">
                  <nav className="grid gap-0.5">
                    {navLinks.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-orange-600">{item.label}</Link>
                    ))}
                  </nav>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    {isLoggedIn ? (
                      <>
                        <Link href="/dashboard/account" onClick={() => setMenuOpen(false)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm font-semibold text-amber-700">
                          Profile
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700">Login</Link>
                        <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm font-semibold text-amber-700">Sign Up</Link>
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
      <motion.section variants={fadeUp} initial={false} animate="show" className="relative px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative z-10">
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
              Smart Growth · Real Results
            </motion.span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-[54px]">
              Amplify Your Brand with{" "}
              <span className="bg-gradient-to-r from-[#FF7A00] via-[#FF9F00] to-[#FFC400] bg-clip-text text-transparent">Smart Social Growth</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">SocialRUSH helps creators, brands, and agencies grow faster with trusted social media services, secure checkout, real-time tracking, and premium support.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={startOrderHref} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3 text-sm font-bold text-white shadow-xl shadow-orange-300/50 transition hover:brightness-105 hover:shadow-orange-400/60">Start Order</Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-white bg-white/80 px-7 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-200 hover:text-orange-600">View Packages</Link>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <motion.div key={badge.label} variants={cardAnim} whileHover={{ y: -4, scale: 1.04 }} className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-4 py-2.5 shadow-[0_8px_30px_-8px_rgba(15,23,42,.18)] backdrop-blur">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-md ${badge.color}`}>{badge.icon}</span>
                  <span className="text-xs font-bold text-slate-700">{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="relative">
            {floatingStats.map((stat) => (
              <motion.div key={stat.text} initial={limitMotion ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: limitMotion ? 0 : stat.delay + 0.5, duration: limitMotion ? 0 : 0.4 }} className={`absolute z-10 ${stat.pos} flex items-center gap-2 rounded-xl border border-white/90 bg-white/90 px-3 py-2 shadow-[0_8px_24px_-6px_rgba(15,23,42,.2)] backdrop-blur`}>
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-600">{stat.text}</p>
                  <p className="text-xs font-extrabold text-slate-900">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
            <motion.div animate={limitMotion ? undefined : { y: [0, -12, 0] }} transition={limitMotion ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-white/80 to-white/60 p-5 shadow-[0_40px_80px_-20px_rgba(255, 196, 0, .30)] backdrop-blur">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-orange-50 to-orange-50">
                <SafeImage src="/images/hero-3d.png" fallbackSrc="/images/hero-3d.webp" alt="SocialRUSH premium social growth" width={680} height={510} sizes="(max-width: 1023px) 100vw, 50vw" className="h-auto w-full rounded-3xl object-cover" priority />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* PLATFORM PILLS */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="px-4 py-5 sm:px-6 lg:px-8">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto flex max-w-7xl flex-wrap gap-3">
          {platforms.map((p) => (
            <motion.div key={p.name} variants={cardAnim} whileHover={{ y: -5, scale: 1.05 }} className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/85 px-4 py-2.5 shadow-[0_6px_20px_-6px_rgba(15,23,42,.15)] backdrop-blur transition">
              <span className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br text-white shadow-md ${p.grad}`}><PlatformIcon platform={p.name} className="h-4 w-4" /></span>
              <span className="text-sm font-semibold text-slate-700">{p.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* STATS */}
      <motion.section id="about" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="content-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <motion.article key={s.label} variants={cardAnim} whileHover={{ y: -8, scale: 1.02 }} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,.18)] ${s.border} ${s.bg}`}>
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${s.iconBg}`}>
                <SvgIcon path={s.icon} size={20} />
              </div>
              <p className="mt-4 text-lg font-extrabold text-slate-900">{s.label}</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">{s.sub}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      {/* WHY SOCIALRUSH */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600">Why SocialRUSH</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Why Brands Choose <span className="bg-gradient-to-r from-[#FF7A00] to-[#FFB000] bg-clip-text text-transparent">SocialRUSH</span></h2>
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
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Popular Social Media Services</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/services" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600">View All Services</Link>
              <Link href={startOrderHref} className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-300/40 transition hover:brightness-105">Start Order</Link>
            </div>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((svc) => (
              <motion.article key={svc.name} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className={`overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_12px_40px_-16px_rgba(15,23,42,.18)] ${svc.border} ${svc.bg}`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${svc.grad}`}><PlatformIcon platform={svc.platform} className="h-6 w-6" /></div>
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

      {/* CUSTOMER SAFETY */}
      <motion.section variants={fadeUp} initial={false} whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">Clear Expectations</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Customer Safety &amp; Support</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">Understand what we require, what you can track, and where to get help before placing an order.</p>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customerSafetyPoints.map((item) => (
              <motion.article key={item.title} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_14px_40px_-14px_rgba(15,23,42,.18)] backdrop-blur">
                <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-lg font-extrabold text-white shadow-md ${item.grad}`} aria-hidden="true">✓</span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
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
          <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
            <motion.article whileHover={{ y: -6 }} className="overflow-hidden rounded-3xl border border-white/90 bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6 shadow-[0_20px_50px_-18px_rgba(15,23,42,.2)]">
              <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600">Featured</span>
              <h3 className="mt-3 text-2xl font-extrabold leading-snug text-slate-900">How to Grow Fast on Instagram</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Build consistent engagement loops, improve profile conversion, and scale with clear campaign planning that delivers real results.</p>
              <Link href="/blog" className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-300/40 transition hover:brightness-105">Read Article</Link>
            </motion.article>
            <div className="grid gap-4">
              {[{ title: "Boost YouTube Views the Right Way", tag: "YouTube" }, { title: "Facebook Engagement Hacks", tag: "Facebook" }, { title: "Creator Workflow: Plan Better Campaigns", tag: "Strategy" }].map((post) => (
                <motion.article key={post.title} whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-4 shadow-sm backdrop-blur transition">
                  <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600">{post.tag}</span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">{post.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">Practical tactics and strategy notes for cleaner and safer growth.</p>
                </motion.article>
              ))}
            </div>
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
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Ready to grow your <span className="bg-gradient-to-r from-[#FF7A00] via-[#FF9F00] to-[#FFC400] bg-clip-text text-transparent">social presence?</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">Start with a guided order flow and keep full visibility over campaign delivery from one premium dashboard.</p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href={startOrderHref} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] via-[#FF9F00] to-[#FFC400] px-8 py-3 text-sm font-bold text-white shadow-xl shadow-orange-300/50 transition hover:brightness-105 hover:shadow-orange-300/60">Start Order</Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600">View Packages</Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="brand-footer px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="brand-footer-surface mx-auto max-w-7xl overflow-hidden rounded-3xl border p-7 backdrop-blur sm:p-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Logo light />
              <p className="mt-3 text-sm leading-7 text-slate-500">Premium social growth panel for creators, brands, and agencies. Trusted, fast, and transparent.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/packages" className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3.5 py-2 text-xs font-bold text-white shadow-sm">View Packages</Link>
                <Link href="/register" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm">Create Account</Link>
              </div>
            </div>
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <p className="text-sm font-bold text-slate-900">{group.heading}</p>
                <div className="mt-3 grid gap-2">
                  {group.links.map(([label, href]) => (
                    <Link key={label} href={href} className="text-sm text-slate-500 transition hover:text-orange-600">{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-100 pt-6 text-[11px] text-slate-400 sm:flex-row">
            <p>&#169; 2026 SocialRUSH. All rights reserved.</p>
            <p>Secure Checkout &#183; Real-time Tracking &#183; Multi-currency &#183; 24/7 Support</p>
          </div>
        </div>
      </footer>
      </main>
    </LazyMotion>
  );
}
