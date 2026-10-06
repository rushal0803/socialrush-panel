"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarClock, FolderKanban, Layers3, RefreshCw, Users } from "lucide-react";
import { useEffect } from "react";
import { track } from "@/lib/analytics/events";
import type { AgencyGrowthDecision } from "@/lib/reseller/growth-engine";

const iconByKind = {
  first_client: Users,
  attribution: BriefcaseBusiness,
  first_plan: Layers3,
  renewal: CalendarClock,
  retainer: RefreshCw,
  campaign: FolderKanban,
  scale: Layers3,
} as const;

export default function AgencyGrowthNextActionCard({
  decision,
}: {
  decision: AgencyGrowthDecision | null;
}) {
  useEffect(() => {
    if (!decision) return;
    track("agency_growth_next_action_view", {
      source: "reseller_growth_engine",
      kind: decision.kind,
      stage: decision.stage,
      stage_number: decision.stageNumber,
      promotional: decision.promotional,
    });
  }, [decision]);

  if (!decision) return null;
  const Icon = iconByKind[decision.kind];
  const progress = `${(decision.stageNumber / decision.totalStages) * 100}%`;

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-orange-400/20 bg-[linear-gradient(130deg,rgba(255,122,0,.09),rgba(255,255,255,.02))] p-5 sm:p-6" aria-labelledby="agency-growth-next-action">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-300">{decision.eyebrow}</p>
              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black text-slate-300">
                Stage {decision.stageNumber}/{decision.totalStages} · {decision.stage}
              </span>
            </div>
            <h2 id="agency-growth-next-action" className="mt-2 text-xl font-black text-white">{decision.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{decision.description}</p>
            <div className="mt-4 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-white/[.06]" aria-label={`Agency growth stage ${decision.stageNumber} of ${decision.totalStages}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: progress }} />
            </div>
          </div>
        </div>
        <Link
          href={decision.href}
          onClick={() =>
            track("agency_growth_next_action_click", {
              source: "reseller_growth_engine",
              kind: decision.kind,
              stage: decision.stage,
              stage_number: decision.stageNumber,
              promotional: decision.promotional,
            })
          }
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-black text-white"
        >
          {decision.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {decision.promotional ? (
        <p className="mt-4 text-[10px] leading-4 text-slate-500">
          This is a planning recommendation only. Current service pricing, availability, quantity limits, delivery and refill terms remain authoritative before any real order or payment.
        </p>
      ) : null}
    </section>
  );
}
