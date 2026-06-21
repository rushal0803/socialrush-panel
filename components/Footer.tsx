"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const columns = [
  { title: "Platform", links: [["Instagram Growth", "/services/instagram-audience-growth"], ["YouTube Growth", "/services/youtube-channel-growth"], ["Facebook Growth", "/services/facebook-brand-engagement"], ["X Growth", "/services/x-authority-growth"], ["Dashboard", "/dashboard"]] },
  { title: "Company", links: [["About SocialRUSH", "/#why"], ["Why SocialRUSH", "/#why"], ["How It Works", "/#services"], ["Pricing", "/#services"], ["Support", "/dashboard/support"]] },
  { title: "Resources", links: [["API Docs", "/dashboard/api-docs"], ["Help Center", "/dashboard/support"], ["FAQs", "/#faq"], ["Blog", "#"], ["Contact Support", "/dashboard/support"]] },
  { title: "Legal", links: [["Terms & Conditions", "#"], ["Privacy Policy", "#"], ["Refund Policy", "#"], ["Service Policy", "#"]] },
];

function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
    youtube: <><path d="M21 12s0-4-1-5-1-1-7-1-7-1-1 0-1 1-1 5-1 5 0 4 1 5 1 1 7 1 7 1s6 0 7-1c1-1 1-5 1-5Z"/><path d="m10 9 5 3-5 3Z"/></>,
    facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z"/>,
    twitter: <path d="M4 4l16 16M20 4 4 20M9 4l11 16M4 4l11 16"/>,
  };
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  return <footer className="relative overflow-hidden bg-gradient-to-br from-[#07152f] via-[#0a1d42] to-[#06142f] text-white"><div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl"/><div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"/><div className="hero-grid absolute inset-0 opacity-[.06]"/><div className="relative mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-6 lg:px-8"><div className="rounded-3xl border border-white/10 bg-white/[.065] p-6 shadow-2xl backdrop-blur-xl sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-xl"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-400">Social growth insights</p><h2 className="mt-3 text-2xl font-bold">Get campaign strategies in your inbox.</h2><p className="mt-2 text-sm text-slate-400">Practical growth ideas, platform updates, and SocialRUSH product news.</p></div><form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }} className="flex w-full max-w-lg flex-col gap-2 sm:flex-row"><input type="email" required aria-label="Email address" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400" placeholder="you@company.com"/><button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500">{subscribed ? "Subscribed ✓" : "Join newsletter"}</button></form></div></div>
      <div className="grid gap-10 py-14 lg:grid-cols-[1.35fr_3fr]"><div><Logo light/><p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">Premium social media growth platform for creators, brands, agencies, and businesses.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"/>Platform Operational</div><div className="mt-6 flex gap-2">{["instagram","youtube","facebook","twitter"].map((name) => <Link key={name} href="#" aria-label={name} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/15 hover:text-blue-300"><SocialIcon name={name}/></Link>)}</div></div><div className="grid grid-cols-2 gap-8 sm:grid-cols-4">{columns.map((column) => <div key={column.title}><h3 className="text-[10px] font-bold uppercase tracking-[.18em] text-white">{column.title}</h3><ul className="mt-5 space-y-3.5">{column.links.map(([label,href]) => <li key={label}><Link href={href} className="text-xs text-slate-400 transition hover:text-blue-300">{label}</Link></li>)}</ul></div>)}</div></div>
      <div className="flex flex-wrap items-center justify-center gap-3 border-y border-white/10 py-5">{["Secure Payments","SSL Protected","Refill Support","Real-Time Tracking","Professional Support"].map((item) => <span key={item} className="flex items-center gap-2 text-[9px] font-semibold text-slate-400"><i className="text-emerald-400">✓</i>{item}</span>)}</div><div className="flex flex-col gap-3 pt-7 text-center text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left"><p>© 2026 SocialRUSH. All rights reserved.</p><p>Secure payments <span className="mx-2 text-slate-700">•</span> Refill support <span className="mx-2 text-slate-700">•</span> Real-time tracking</p><Link href="/dashboard/support" className="font-bold text-blue-400 hover:text-blue-300">support@socialrush.in</Link></div></div></footer>;
}
