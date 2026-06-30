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
import SafeImage from "@/components/SafeImage";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";

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
  { name: "Facebook", grad: "from-sky-500 to-blue-600" },
  { name: "Instagram", grad: "from-pink-500 to-fuchsia-600" },
  { name: "LinkedIn", grad: "from-cyan-500 to-blue-500" },
  { name: "TikTok", grad: "from-violet-500 to-fuchsia-500" },
  { name: "YouTube", grad: "from-rose-500 to-red-600" },
  { name: "X / Twitter", grad: "from-indigo-500 to-slate-600" },
] as const;

const stats = [
  {
    value: "20M+",
    label: "Orders Completed",
    sub: "Campaigns delivered across creator and brand accounts.",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    iconBg: "from-pink-500 to-rose-500",
    glow: "shadow-pink-200",
    border: "border-pink-100",
    bg: "from-pink-50/80 to-rose-50/50",
  },
  {
    value: "4,500+",
    label: "Active Services",
    sub: "Curated options for followers, engagement, and visibility.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    iconBg: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-200",
    border: "border-cyan-100",
    bg: "from-cyan-50/80 to-blue-50/50",
  },
  {
    value: "15K+",
    label: "Active Users",
    sub: "Agencies, creators, and businesses growing with SocialRUSH.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    iconBg: "from-violet-500 to-purple-600",
    glow: "shadow-violet-200",
    border: "border-violet-100",
    bg: "from-violet-50/80 to-purple-50/50",
  },
  {
    value: "24/7",
    label: "Support",
    sub: "Friendly support with guided onboarding and campaign care.",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    iconBg: "from-amber-400 to-orange-500",
    glow: "shadow-orange-200",
    border: "border-orange-100",
    bg: "from-orange-50/80 to-amber-50/50",
  },
] as const;

const trustBadges = [
  { label: "20M+ Orders", icon: "✓", color: "from-pink-500 to-rose-500" },
  { label: "15K+ Users", icon: "★", color: "from-violet-500 to-purple-600" },
  { label: "24/7 Support", icon: "◎", color: "from-cyan-500 to-blue-600" },
  { label: "Secure Checkout", icon: "⬡", color: "from-emerald-500 to-teal-600" },
] as const;

const floatingStats = [
  { text: "Followers Growth", sub: "+180%", pos: "top-6 -left-3", delay: 0 },
  { text: "Engagement Boost", sub: "+240%", pos: "top-2 right-0", delay: 0.4 },
  { text: "Real-time Tracking", sub: "Live", pos: "bottom-16 -left-2", delay: 0.8 },
  { text: "Secure Orders", sub: "100%", pos: "bottom-6 right-0", delay: 1.2 },
] as const;

const whySocialRush = [
  {
    title: "Transparent Pricing",
    text: "Clear pricing visibility before checkout without hidden surprises.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    grad: "from-pink-500 to-rose-500",
    bg: "from-pink-50 to-rose-50",
    border: "border-pink-100",
  },
  {
    title: "Secure Checkout",
    text: "Trusted payment flow and protected account ordering process.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    grad: "from-cyan-500 to-blue-500",
    bg: "from-cyan-50 to-blue-50",
    border: "border-cyan-100",
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
    grad: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-100",
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
    grad: "from-sky-500 to-indigo-500",
    bg: "from-sky-50 to-indigo-50",
    border: "border-indigo-100",
  },
] as const;

const benefits = [
  {
    title: "Global Reach",
    text: "Expand your brand visibility across major social channels worldwide.",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    grad: "from-cyan-500 to-blue-500",
    bg: "from-cyan-50 to-blue-50",
  },
  {
    title: "Fast Delivery",
    text: "Optimized fulfillment flow for stable and timely campaign performance.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    grad: "from-pink-500 to-rose-500",
    bg: "from-pink-50 to-rose-50",
  },
  {
    title: "Premium Quality",
    text: "Consistent quality checks and clear service expectations at checkout.",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    grad: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
  },
  {
    title: "Dedicated Support",
    text: "Human-first support for onboarding, service selection, and updates.",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    grad: "from-amber-400 to-orange-500",
    bg: "from-amber-50 to-orange-50",
  },
] as const;

const steps = [
  {
    num: "01",
    title: "Create Account",
    text: "Sign up free and set up your dashboard in under 2 minutes.",
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    grad: "from-pink-500 to-rose-500",
  },
  {
    num: "02",
    title: "Choose Service",
    text: "Browse 4,500+ services across all major platforms.",
    icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
    grad: "from-violet-500 to-purple-600",
  },
  {
    num: "03",
    title: "Add Funds & Checkout",
    text: "Secure wallet top-up with multi-currency and Razorpay support.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    grad: "from-cyan-500 to-blue-500",
  },
  {
    num: "04",
    title: "Track & Grow",
    text: "Monitor live order progress from your personal dashboard.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    grad: "from-emerald-500 to-teal-500",
  },
] as const;

const featuredServices = [
  {
    name: "Instagram Growth",
    text: "Improve profile momentum with follower, view, and engagement campaigns.",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z",
    grad: "from-pink-500 to-fuchsia-600",
    bg: "from-pink-50 to-fuchsia-50",
    border: "border-pink-100",
  },
  {
    name: "YouTube Promotion",
    text: "Support channel traction with trusted delivery across key growth actions.",
    icon: "M10 9.333L15.333 12 10 14.667V9.333zM21.543 6.498C21 4.228 19.772 3 17.5 2.957 15.227 2.914 13 2.914 12 2.914s-3.227 0-5.5.043C4.228 3 3 4.228 2.457 6.498 2 8.772 2 12 2 12s0 3.228.457 5.502C3 19.772 4.228 21 6.5 21.043 8.773 21.086 11 21.086 12 21.086s3.227 0 5.5-.043C19.772 21 21 19.772 21.543 17.502 22 15.228 22 12 22 12s0-3.228-.457-5.502z",
    grad: "from-rose-500 to-red-600",
    bg: "from-rose-50 to-red-50",
    border: "border-rose-100",
  },
  {
    name: "LinkedIn Visibility",
    text: "Build professional social proof and profile visibility for business goals.",
    icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
    grad: "from-cyan-500 to-blue-600",
    bg: "from-cyan-50 to-blue-50",
    border: "border-cyan-100",
  },
  {
    name: "Facebook Engagement",
    text: "Increase page interaction and post visibility with cleaner delivery flow.",
    icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
    grad: "from-sky-500 to-blue-600",
    bg: "from-sky-50 to-blue-50",
    border: "border-sky-100",
  },
  {
    name: "TikTok Reach",
    text: "Scale short-form reach and profile traction with consistent campaign setup.",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    grad: "from-violet-500 to-fuchsia-600",
    bg: "from-violet-50 to-fuchsia-50",
    border: "border-violet-100",
  },
  {
    name: "X / Twitter Growth",
    text: "Expand audience exposure using focused campaign structures.",
    icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
    grad: "from-indigo-500 to-slate-700",
    bg: "from-indigo-50 to-slate-50",
    border: "border-indigo-100",
  },
] as const;

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Content Creator",
    avatar: "AM",
    text: "The delivery speed and dashboard clarity helped me scale campaigns without stress. Tracking is genuinely real-time.",
    stars: 5,
    grad: "from-pink-500 to-rose-500",
  },
  {
    name: "Naina Rao",
    role: "Brand Manager",
    avatar: "NR",
    text: "SocialRUSH made growth planning easy and gave our team confidence in every launch. Premium support made all the difference.",
    stars: 5,
    grad: "from-violet-500 to-purple-600",
  },
  {
    name: "Ritika Jain",
    role: "Agency Lead",
    avatar: "RJ",
    text: "Clean process, responsive support, and premium campaign tracking from day one. Best panel I have worked with.",
    stars: 5,
    grad: "from-cyan-500 to-blue-600",
  },
] as const;

const footerLinks = [
  { heading: "Quick Links", links: [["Home", "/"], ["Services", "/services"], ["Packages", "/packages"], ["Blog", "/blog"], ["About Us", "/about"]] },
  { heading: "Popular Growth", links: [["Instagram Followers", "/instagram-followers"], ["YouTube Subscribers", "/youtube-subscribers"], ["LinkedIn Followers", "/linkedin-followers"], ["Twitter/X Followers", "/twitter-followers"]] },
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
  const startOrderHref = "/login?next=/dashboard/new-order";

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
      <main className="overflow-x-clip bg-[linear-gradient(165deg,#f0f9ff_0%,#fdf4ff_30%,#fff1f8_55%,#f5f3ff_80%,#ecfeff_100%)] text-slate-800">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-[28rem] w-[28rem] rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute -bottom-12 right-1/4 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      {/* HEADER */}
      <header id="home" className="sticky top-0 z-[9999] border-b border-white/50 bg-white/35 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-[0_8px_40px_-8px_rgba(15,23,42,.15)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Logo priority />
            <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex">
              {navLinks.map((item) => (
                <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 hover:text-sky-600">{item.label}</Link>
              ))}
            </nav>
            <div className="hidden items-center gap-2 lg:flex">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard/account" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600">Login</Link>
                  <Link href="/register" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100">Sign Up</Link>
                </>
              )}
              <Link href={startOrderHref} className="rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-pink-300/50 transition hover:brightness-105 hover:shadow-pink-300/70">Start Order</Link>
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
                      <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-600">{item.label}</Link>
                    ))}
                  </nav>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    {isLoggedIn ? (
                      <>
                        <Link href="/dashboard/account" onClick={() => setMenuOpen(false)} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-center text-sm font-semibold text-violet-700">
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
                        <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-center text-sm font-semibold text-violet-700">Sign Up</Link>
                      </>
                    )}
                    <Link href={startOrderHref} onClick={() => setMenuOpen(false)} className="col-span-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-3 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-pink-300/40">Start Order</Link>
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
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
              Smart Growth · Real Results
            </motion.span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-[54px]">
              Amplify Your Brand with{" "}
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">Smart Social Growth</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">SocialRUSH helps creators, brands, and agencies grow faster with trusted social media services, secure checkout, real-time tracking, and premium support.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={startOrderHref} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-pink-300/50 transition hover:brightness-105 hover:shadow-pink-400/60">Start Order</Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-white bg-white/80 px-7 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-sky-200 hover:text-sky-600">View Packages</Link>
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
              <motion.div key={stat.text} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: stat.delay + 0.5, duration: 0.4 }} className={`absolute z-10 ${stat.pos} flex items-center gap-2 rounded-xl border border-white/90 bg-white/90 px-3 py-2 shadow-[0_8px_24px_-6px_rgba(15,23,42,.2)] backdrop-blur`}>
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-sky-500" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-600">{stat.text}</p>
                  <p className="text-xs font-extrabold text-slate-900">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-white/80 to-white/60 p-5 shadow-[0_40px_80px_-20px_rgba(99,102,241,.30)] backdrop-blur">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-50 via-sky-50 to-pink-50">
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
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <motion.article key={s.label} variants={cardAnim} whileHover={{ y: -8, scale: 1.02 }} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,.18)] ${s.border} ${s.bg}`}>
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${s.iconBg}`}>
                <SvgIcon path={s.icon} size={20} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm font-bold text-slate-700">{s.label}</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">{s.sub}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      {/* WHY SOCIALRUSH */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-600">Why SocialRUSH</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Why Brands Choose <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">SocialRUSH</span></h2>
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

      {/* SERVICES / BENEFITS */}
      <motion.section variants={fadeUp} initial={false} whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-600">Services</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Discover Services for <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">Social Media Success</span></h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-cyan-50 via-blue-50 to-fuchsia-50 p-5 shadow-[0_30px_60px_-20px_rgba(99,102,241,.25)]">
              <SafeImage src="/images/services-3d.png" fallbackSrc="/images/services-3d.webp" alt="SocialRUSH services visual" width={640} height={480} sizes="(max-width: 1023px) 100vw, 50vw" className="h-auto w-full rounded-2xl object-cover" />
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2">
              {benefits.map((b) => (
                <motion.article key={b.title} variants={cardAnim} whileHover={{ y: -7, scale: 1.03 }} className={`overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br p-5 shadow-[0_12px_35px_-14px_rgba(15,23,42,.18)] ${b.bg}`}>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${b.grad}`}><SvgIcon path={b.icon} size={18} /></div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{b.text}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section id="how-it-works" variants={fadeUp} initial={false} whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-600">How It Works</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Get Started in <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">4 Simple Steps</span></h2>
          </div>
          <div className="mx-auto mb-10 max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-4 shadow-[0_30px_60px_-20px_rgba(139,92,246,.25)]">
            <SafeImage src="/images/process-3d.png" fallbackSrc="/images/process-3d.webp" alt="How it works process visual" width={1000} height={750} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full rounded-2xl object-cover" />
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-5 md:grid-cols-4">
            {steps.map((step, idx) => (
              <motion.article key={step.title} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className="relative rounded-2xl border border-white/90 bg-white/80 p-5 text-center shadow-[0_12px_35px_-14px_rgba(15,23,42,.18)] backdrop-blur">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${step.grad}`}><SvgIcon path={step.icon} size={22} /></div>
                <span className={`mt-3 inline-block rounded-lg bg-gradient-to-r px-2 py-0.5 text-[10px] font-extrabold text-white ${step.grad}`}>STEP {step.num}</span>
                <h3 className="mt-2 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-600">{step.text}</p>
                {idx < 3 && <span className="absolute right-[-18px] top-[26px] hidden h-[2px] w-9 border-t-2 border-dashed border-violet-300 md:block" />}
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURED SERVICES */}
      <motion.section variants={fadeUp} initial={false} whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-600">Platform Services</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Featured Services</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/services" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600">View All Services</Link>
              <Link href={startOrderHref} className="rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-300/40 transition hover:brightness-105">Start Order</Link>
            </div>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((svc) => (
              <motion.article key={svc.name} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className={`overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_12px_40px_-16px_rgba(15,23,42,.18)] ${svc.border} ${svc.bg}`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${svc.grad}`}><SvgIcon path={svc.icon} size={22} /></div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{svc.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{svc.text}</p>
                <div className="mt-4 flex gap-2">
                  <Link href="/services" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:text-sky-600">View Services</Link>
                  <Link href={startOrderHref} className={`inline-flex items-center gap-1 rounded-lg bg-gradient-to-r px-3 py-1.5 text-xs font-bold text-white shadow-sm ${svc.grad}`}>Start Order</Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* TESTIMONIALS */}
      <motion.section variants={fadeUp} initial={false} whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">Testimonials</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Satisfied Clients Share Their <span className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">Success Stories</span></h2>
          </div>
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-amber-50 via-pink-50 to-violet-50 p-4 shadow-[0_30px_60px_-20px_rgba(245,158,11,.22)]">
            <SafeImage src="/images/testimonal-visual.png" fallbackSrc="/images/testimonal-visual.webp" alt="SocialRUSH trusted growth platform" width={1200} height={900} sizes="(max-width: 1280px) 100vw, 1200px" className="h-auto w-full rounded-2xl object-cover" />
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.article key={t.name} variants={cardAnim} whileHover={{ y: -7, scale: 1.02 }} className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_14px_40px_-14px_rgba(15,23,42,.18)] backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-sm font-extrabold text-white shadow-md ${t.grad}`}>{t.avatar}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (<span key={i} className="text-amber-400">&#9733;</span>))}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">&#8220;{t.text}&#8221;</p>
              </motion.article>
            ))}
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8 flex flex-wrap justify-center gap-4">
            {[{ val: "4.9/5", label: "Rating", icon: "&#9733;" }, { val: "15K+", label: "Happy Users", icon: "&#9829;" }, { val: "SSL", label: "Secure Checkout", icon: "&#8982;" }, { val: "24/7", label: "Support Available", icon: "&#9737;" }].map((p) => (
              <motion.div key={p.label} variants={cardAnim} whileHover={{ y: -4 }} className="flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
                <span className="text-lg text-pink-500" dangerouslySetInnerHTML={{ __html: p.icon }} />
                <div><p className="text-sm font-extrabold text-slate-900">{p.val}</p><p className="text-[10px] text-slate-500">{p.label}</p></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* BLOG */}
      <motion.section id="blog" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="content-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky-600">Blog</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Tips, Trends &amp; Insights</h2>
            </div>
            <Link href="/blog" className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:text-sky-600">View All Blogs</Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
            <motion.article whileHover={{ y: -6 }} className="overflow-hidden rounded-3xl border border-white/90 bg-gradient-to-br from-pink-50 via-white to-sky-50 p-6 shadow-[0_20px_50px_-18px_rgba(15,23,42,.2)]">
              <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-pink-600">Featured</span>
              <h3 className="mt-3 text-2xl font-extrabold leading-snug text-slate-900">How to Grow Fast on Instagram</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Build consistent engagement loops, improve profile conversion, and scale with clear campaign planning that delivers real results.</p>
              <Link href="/blog" className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-300/40 transition hover:brightness-105">Read Article</Link>
            </motion.article>
            <div className="grid gap-4">
              {[{ title: "Boost YouTube Views the Right Way", tag: "YouTube" }, { title: "Facebook Engagement Hacks", tag: "Facebook" }, { title: "Creator Workflow: Plan Better Campaigns", tag: "Strategy" }].map((post) => (
                <motion.article key={post.title} whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-4 shadow-sm backdrop-blur transition">
                  <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-600">{post.tag}</span>
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
            <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-600">FAQ</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[faqItems.slice(0, 4), faqItems.slice(4)].map((col, cIdx) => (
              <div key={cIdx} className="space-y-3">
                {col.map((item) => {
                  const idx = faqItems.findIndex((e) => e.q === item.q);
                  const isOpen = activeFaq === idx;
                  return (
                    <article key={item.q} className={`overflow-hidden rounded-2xl border transition-all ${isOpen ? "border-violet-200 bg-white/90 shadow-[0_8px_30px_-8px_rgba(139,92,246,.22)]" : "border-white/80 bg-white/70 shadow-sm"} backdrop-blur`}>
                      <button type="button" onClick={() => setActiveFaq((prev) => (prev === idx ? null : idx))} className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left">
                        <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${isOpen ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600"}`}>{isOpen ? "−" : "+"}</span>
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
                          <p className="border-t border-violet-100/60 px-4 py-3 text-sm leading-7 text-slate-600">{item.a}</p>
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
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/80 bg-[linear-gradient(135deg,#fdf2ff_0%,#eff6ff_35%,#fce7f3_65%,#f0fdf4_100%)] p-8 shadow-[0_30px_60px_-20px_rgba(139,92,246,.25)] sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="relative text-center">
            <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-600">Get Started Today</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Ready to grow your <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">social presence?</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">Start with a guided order flow and keep full visibility over campaign delivery from one premium dashboard.</p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href={startOrderHref} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-pink-300/50 transition hover:brightness-105 hover:shadow-fuchsia-300/60">Start Order</Link>
              <Link href="/packages" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600">View Packages</Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-7 shadow-sm backdrop-blur sm:p-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Logo />
              <p className="mt-3 text-sm leading-7 text-slate-500">Premium social growth panel for creators, brands, and agencies. Trusted, fast, and transparent.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/packages" className="rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm">View Packages</Link>
                <Link href="/register" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm">Create Account</Link>
              </div>
            </div>
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <p className="text-sm font-bold text-slate-900">{group.heading}</p>
                <div className="mt-3 grid gap-2">
                  {group.links.map(([label, href]) => (
                    <Link key={label} href={href} className="text-sm text-slate-500 transition hover:text-sky-600">{label}</Link>
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
