"use client";

import Link from "next/link";
import { ArrowRight, Layers3, RotateCcw, UsersRound } from "lucide-react";
import { track } from "@/lib/analytics/events";

const paths = [
  {
    href: "/dashboard/order-history",
    source: "packages_repeat_orders",
    eyebrow: "Repeat revenue",
    title: "Repeat a successful order",
    copy: "Already ordered before? Reuse an eligible completed order with its service, quantity and public link prefilled, then review current pricing before checkout.",
    cta: "View previous orders",
    Icon: RotateCcw,
  },
  {
    href: "/dashboard/campaign-stacks",
    source: "packages_campaign_stacks",
    eyebrow: "Multi-service planning",
    title: "Build a broader campaign",
    copy: "Compare complementary services using current catalog pricing. Each service stays a separate order so you can review it before paying.",
    cta: "Explore campaign stacks",
    Icon: Layers3,
  },
  {
    href: "/for-agencies#bulk-lead-engine",
    source: "packages_agency_bulk",
    eyebrow: "Recurring requirements",
    title: "Agency, reseller or bulk need?",
    copy: "Share the platform, expected quantity, frequency and campaign scope when your requirement is larger or recurring.",
    cta: "Discuss bulk requirement",
    Icon: UsersRound,
  },
] as const;

export default function PackageRevenuePaths() {
  return (
    <section className="relative px-4 pb-8 pt-2 sm:px-6 lg:px-8" aria-labelledby="package-revenue-paths-title">
      <div className="mx-auto w-full max-w-7xl rounded-[28px] border border-orange-400/20 bg-[#111111] p-5 shadow-[0_20px_48px_rgba(255,122,0,.12)] sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Choose the right order path</p>
        <h2 id="package-revenue-paths-title" className="mt-2 text-2xl font-black text-white">Need more than a single package?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Use the path that matches your requirement. Pricing and availability are confirmed from the active service information before an order is placed.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {paths.map(({ href, source, eyebrow, title, copy, cta, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => track("package_growth_path_click", { source })}
              className="group flex min-h-[190px] flex-col rounded-2xl border border-white/10 bg-white/[.035] p-4 transition hover:-translate-y-0.5 hover:border-orange-400/35 hover:bg-orange-500/[.06]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300"><Icon className="h-5 w-5" /></span>
              <p className="mt-3 text-[9px] font-black uppercase tracking-[.13em] text-orange-300">{eyebrow}</p>
              <h3 className="mt-1 font-black text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{copy}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-black text-orange-200">{cta}<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
