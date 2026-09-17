import Link from "next/link";
import { ArrowRight, Layers3, PackageOpen, UsersRound } from "lucide-react";

export default function InternationalRevenuePaths() {
  return (
    <section className="border-y border-white/10 bg-[#0d1017] px-5 py-14 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Larger campaign paths</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Move beyond a small single-service order when the requirement is larger.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Use the path that matches your campaign. Current service availability, pricing, delivery information and final INR checkout amount remain authoritative in the active order flow.</p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <Link href="/packages" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-orange-400/40"><PackageOpen className="h-5 w-5 text-orange-300"/><h3 className="mt-3 font-black">Larger single-service requirement</h3><p className="mt-2 text-xs leading-5 text-slate-400">Compare current package and quantity options without assuming a bundle discount.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-200">Compare packages <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1"/></span></Link>
          <Link href="/dashboard/campaign-stacks" className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-orange-400/40"><Layers3 className="h-5 w-5 text-orange-300"/><h3 className="mt-3 font-black">Multi-service campaign</h3><p className="mt-2 text-xs leading-5 text-slate-400">Compare complementary services using the current catalog and review each order separately.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-200">Build campaign stack <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1"/></span></Link>
          <Link href="/for-agencies#bulk-lead-engine" className="group rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-5 transition hover:border-orange-400/45"><UsersRound className="h-5 w-5 text-orange-300"/><h3 className="mt-3 font-black">Agency or recurring requirement</h3><p className="mt-2 text-xs leading-5 text-slate-400">Share platform, approximate volume, frequency and campaign scope for bulk planning.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-200">Discuss requirement <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1"/></span></Link>
        </div>
      </div>
    </section>
  );
}
