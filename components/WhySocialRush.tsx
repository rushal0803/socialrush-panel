"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type IconName = "campaign" | "tracking" | "wallet" | "quality" | "support" | "enterprise";

function FeatureIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    campaign: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M14 18h7M17.5 14.5v7"/></>,
    tracking: <><path d="M3 19V9M9 19V5M15 19v-7M21 19V3"/><path d="m3 8 6-4 6 7 6-9"/></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M15 12h5"/></>,
    quality: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    support: <><path d="M4 13a8 8 0 0 1 16 0v6h-4v-7h4M4 12v7h4v-7H4Z"/><path d="M16 19c0 2-2 3-4 3"/></>,
    enterprise: <><path d="M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M2 21h20"/></>,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Counter({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = 1400;
    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible]);
  return <span ref={ref}>{display.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

const features: { icon: IconName; title: string; text: string; tone: string }[] = [
  { icon: "campaign", title: "Smart Campaign Management", text: "Launch and manage social growth campaigns from a single professional dashboard.", tone: "bg-orange-500/15 text-orange-300" },
  { icon: "tracking", title: "Real-Time Order Tracking", text: "Track campaign progress, delivery status, and performance updates instantly.", tone: "bg-amber-500/15 text-amber-300" },
  { icon: "wallet", title: "Secure Wallet System", text: "Add funds securely and manage all transactions from your account dashboard.", tone: "bg-emerald-500/15 text-emerald-300" },
  { icon: "quality", title: "Premium Quality Delivery", text: "Professionally managed campaigns focused on consistency and reliability.", tone: "bg-amber-500/15 text-amber-300" },
  { icon: "support", title: "Dedicated Expert Support", text: "Fast response support team available whenever assistance is required.", tone: "bg-amber-500/15 text-amber-300" },
  { icon: "enterprise", title: "Enterprise Ready Platform", text: "Designed for creators, brands, agencies, and businesses scaling online presence.", tone: "bg-red-500/15 text-red-300" },
];

export default function WhySocialRush() {
  return <section id="why" className="relative overflow-hidden bg-[#0B0B0F] px-5 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
    <motion.div aria-hidden className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl" animate={{ x: [0, 35, 0], y: [0, -24, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}/>
    <motion.div aria-hidden className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}/>
    <div className="hero-grid absolute inset-0 opacity-[.08]"/>
    <div className="relative mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[.22em] text-orange-400">A complete growth operating system</p><h2 className="mt-5 text-3xl font-bold tracking-[-.04em] sm:text-4xl lg:text-5xl">Why 10,000+ Businesses Choose SocialRUSH</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">SocialRUSH combines growth technology, campaign management, analytics, and professional support into one powerful platform.</p></motion.div>

      <div className="mt-14 grid items-center gap-10 xl:grid-cols-[1.05fr_.95fr]">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .65 }} className="relative"><motion.div className="absolute -left-5 top-20 z-20 hidden rounded-2xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:flex sm:items-center sm:gap-3" animate={{ y: [0, -9, 0] }} transition={{ duration: 5, repeat: Infinity }}><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">↗</span><div><p className="text-[9px] text-slate-400">Campaign velocity</p><p className="text-xs font-bold">+31.8% this month</p></div></motion.div><div className="rounded-[30px] border border-white/10 bg-white/[.065] p-3 shadow-[0_35px_90px_-30px_rgba(0,0,0,.65)] backdrop-blur-xl"><div className="overflow-hidden rounded-[23px] border border-white/10 bg-[#0B0B0F]"><div className="flex h-13 items-center justify-between border-b border-white/10 bg-white/[.04] px-5 py-3"><div><p className="text-[8px] font-bold uppercase tracking-[.18em] text-orange-400">Growth intelligence</p><p className="mt-1 text-xs font-bold">Live campaign dashboard</p></div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"/><span className="text-[8px] font-bold text-emerald-300">Live</span></div></div><div className="p-4 sm:p-6"><div className="grid grid-cols-3 gap-3">{[["Instagram","+28.4%","Audience growth"],["YouTube","+19.7%","Video performance"],["Facebook","+34.2%","Engagement rate"]].map(([platform,value,label],index) => <motion.div key={platform} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/[.055] p-3 sm:p-4"><div className="flex items-center justify-between"><span className={`h-2 w-2 rounded-full ${["bg-orange-400","bg-red-400","bg-orange-400"][index]}`}/><span className="text-[8px] font-bold text-emerald-300">{value}</span></div><p className="mt-4 text-[9px] text-slate-400">{platform}</p><p className="mt-1 text-[9px] font-bold sm:text-xs">{label}</p></motion.div>)}</div><div className="mt-4 rounded-2xl border border-white/10 bg-white/[.045] p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold">Multi-platform performance</p><p className="mt-1 text-[8px] text-slate-500">Last 30 days</p></div><span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[8px] font-bold text-orange-300">+26.9% overall</span></div><div className="mt-6 flex h-32 items-end gap-2">{[34,48,40,62,54,76,68,85,72,94,82,100,88,96].map((height,index) => <motion.span key={index} initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration: .7, delay: index * .035 }} className="flex-1 rounded-t bg-gradient-to-t from-orange-600 to-amber-400"/>)}</div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{[["Instagram Authority Campaign","Processing","72%"],["YouTube Video Promotion","Completed","100%"],["Facebook Brand Reach","Delivering","48%"],["X Profile Growth","Scheduled","12%"]].map(([name,status,progress]) => <div key={name} className="rounded-xl border border-white/10 bg-white/[.035] p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-[8px] font-semibold">{name}</p><span className={`h-2 w-2 rounded-full ${status === "Completed" ? "bg-emerald-400" : status === "Scheduled" ? "bg-amber-400" : "bg-orange-400"}`}/></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} whileInView={{ width: progress }} viewport={{ once: true }} transition={{ duration: 1, delay: .3 }} className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"/></div><div className="mt-2 flex justify-between text-[7px] text-slate-500"><span>{status}</span><span>{progress}</span></div></div>)}</div></div></div></div></motion.div>

        <div className="grid gap-3 sm:grid-cols-2">{features.map((feature,index) => <motion.article key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .07 }} whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,.085)" }} className="group rounded-2xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-sm"><div className="flex items-start gap-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${feature.tone}`}><FeatureIcon name={feature.icon}/></span><div><h3 className="text-sm font-bold">{feature.title}</h3><p className="mt-2 text-xs leading-6 text-slate-400">{feature.text}</p></div></div></motion.article>)}</div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[.055] backdrop-blur-xl"><div className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0">{[
        { value: 50000, suffix: "+", label: "Campaigns Delivered" }, { value: 15000, suffix: "+", label: "Active Customers" }, { value: 98.7, decimals: 1, suffix: "%", label: "Client Satisfaction" }, { value: 24, suffix: "/7", label: "Support Availability" },
      ].map((stat) => <div key={stat.label} className="p-6 text-center sm:p-8"><p className="text-2xl font-bold tracking-tight sm:text-3xl"><Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix}/></p><p className="mt-2 text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">{stat.label}</p></div>)}</div><div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t border-white/10 bg-white/[.025] px-5 py-4">{["Secure Payments","Live Tracking","Refill Coverage","Professional Support","Fast Delivery"].map((item) => <span key={item} className="flex items-center gap-2 text-[10px] font-semibold text-slate-300"><i className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/10 text-emerald-400">✓</i>{item}</span>)}</div></motion.div>
    </div>
  </section>;
}
