"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Headphones, RefreshCcw, ShieldCheck, TimerReset } from "lucide-react";
import { useEffect } from "react";
import { track } from "@/lib/analytics/events";
import type { RetentionDecision } from "@/lib/retention/engine";

const iconByKind = {
  payment: ShieldCheck,
  support: Headphones,
  refill: RefreshCcw,
  active_order: TimerReset,
  post_completion: CheckCircle2,
  repeat: RefreshCcw,
  return: RefreshCcw,
} as const;

export default function RetentionNextActionCard({ decision }: { decision: RetentionDecision | null }) {
  useEffect(() => {
    if (!decision) return;
    track("retention_next_action_view", {
      source: "dashboard_retention_engine",
      kind: decision.kind,
      promotional: decision.promotional,
      repeat_count: decision.repeatCount ?? null,
    });
  }, [decision]);

  if (!decision) return null;
  const Icon = iconByKind[decision.kind];

  return (
    <section className="dashboard-glass mt-4 overflow-hidden p-4 sm:p-5" aria-labelledby="retention-next-action-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-300">{decision.eyebrow}</p>
            <h2 id="retention-next-action-heading" className="mt-1 text-lg font-black text-white">
              {decision.title}
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">{decision.description}</p>
          </div>
        </div>
        <Link
          href={decision.href}
          onClick={() =>
            track("retention_next_action_click", {
              source: "dashboard_retention_engine",
              kind: decision.kind,
              promotional: decision.promotional,
              repeat_count: decision.repeatCount ?? null,
            })
          }
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-black text-white"
        >
          {decision.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {decision.promotional ? (
        <p className="mt-3 text-[10px] leading-4 text-slate-500">
          This is an optional planning shortcut, not an automatic reorder. Current price, quantity limits and availability are confirmed before payment.
        </p>
      ) : null}
    </section>
  );
}
