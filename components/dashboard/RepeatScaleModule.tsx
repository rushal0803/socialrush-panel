"use client";

import Link from "next/link";
import { ArrowRight, Layers3, PackageOpen, RotateCcw, UsersRound } from "lucide-react";
import { track } from "@/lib/analytics/events";

const paths = [
  { href: "/dashboard/order-history", label: "Repeat a completed order", detail: "Reuse a successful service, quantity and target with current live pricing.", icon: RotateCcw, source: "dashboard_repeat" },
  { href: "/dashboard/campaign-stacks", label: "Build a campaign stack", detail: "Compare complementary services and place each order separately.", icon: Layers3, source: "dashboard_campaign_stacks" },
  { href: "/packages", label: "Compare larger packages", detail: "Review current package and quantity options for a larger requirement.", icon: PackageOpen, source: "dashboard_packages" },
  { href: "/for-agencies#bulk-lead-engine", label: "Agency or recurring requirement", detail: "Share platform, expected volume, frequency and campaign scope for bulk planning.", icon: UsersRound, source: "dashboard_agency" },
] as const;

export default function RepeatScaleModule({ completedOrders }: { completedOrders: number }) {
  if (completedOrders < 1) return null;
  return (
    <section className="dashboard-glass mt-4 overflow-hidden p-4 sm:p-5" aria-labelledby="repeat-scale-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-300">Repeat & scale</p>
          <h2 id="repeat-scale-heading" className="mt-1 text-lg font-black text-white">Continue what worked, or expand the requirement.</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">Choose the path that matches your next campaign. Pricing and availability are confirmed on the relevant order page.</p>
        </div>
        <span className="text-xs font-bold text-emerald-300">{completedOrders.toLocaleString("en-IN")} completed {completedOrders === 1 ? "order" : "orders"}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {paths.map(({ href, label, detail, icon: Icon, source }) => (
          <Link key={href} href={href} onClick={() => track("dashboard_repeat_scale_click", { source })} className="group rounded-2xl border border-white/10 bg-white/[.025] p-4 transition hover:-translate-y-0.5 hover:border-orange-400/35 hover:bg-orange-500/[.05]">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300"><Icon className="h-4 w-4" /></span>
            <h3 className="mt-3 text-sm font-black text-white">{label}</h3>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">{detail}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-orange-300">Continue <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
