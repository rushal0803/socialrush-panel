import Link from "next/link";
import { ArrowRight, Building2, MapPinned, ShieldCheck } from "lucide-react";
import { indiaExpansionPolicy, indiaRegionalClusters } from "@/lib/seo/india-expansion";

export default function IndiaRegionalExpansion() {
  return (
    <section id="india-regional-growth" className="border-b border-white/10 bg-[#08090c] px-4 py-12 text-white sm:px-6 lg:px-8" aria-labelledby="india-regional-growth-title">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">India regional discovery</p>
            <h2 id="india-regional-growth-title" className="mt-2 max-w-3xl text-2xl font-black tracking-tight sm:text-3xl">
              Explore SocialRUSH&apos;s India service paths by major regional market.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              SocialRUSH orders are handled online through the same national service catalog. City or state does not change the live service price,
              quantity rules, delivery estimate or refill terms shown before checkout.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-400/15 bg-orange-500/[.05] p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
              <p className="text-xs leading-5 text-slate-300">
                Regional names below describe online discovery and campaign planning, not physical SocialRUSH office locations or separate local teams.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {indiaRegionalClusters.map((cluster) => (
            <article key={cluster.id} className="rounded-2xl border border-white/10 bg-[#111216] p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300">
                <MapPinned className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-black">{cluster.label}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{cluster.locations.join(" • ")}</p>
              <Link href={cluster.primaryPath} className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">
                Use India growth hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link href="/services" className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-orange-400/30">
            <Building2 className="h-5 w-5 text-orange-300" />
            <h3 className="mt-3 text-sm font-black">Compare current services</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">Use the live catalog for active platforms, quantities and current order requirements.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-orange-300">Browse services <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
          <Link href="/packages" className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-orange-400/30">
            <MapPinned className="h-5 w-5 text-orange-300" />
            <h3 className="mt-3 text-sm font-black">Plan larger quantities</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">Compare available packages before placing a larger or multi-platform requirement.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-orange-300">Compare packages <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
          <Link href="/for-agencies" className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-orange-400/30">
            <Building2 className="h-5 w-5 text-orange-300" />
            <h3 className="mt-3 text-sm font-black">Agency or repeat requirements</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">Use the agency workflow for recurring client campaigns or multi-account planning.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-orange-300">Agency workflow <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
        </div>

        <p className="mt-6 text-[11px] leading-5 text-slate-500">
          Dedicated city or state pages are intentionally deferred until they meet the Phase 39 evidence standard: {indiaExpansionPolicy.dedicatedPageRequirements[0].toLowerCase()}
        </p>
      </div>
    </section>
  );
}
