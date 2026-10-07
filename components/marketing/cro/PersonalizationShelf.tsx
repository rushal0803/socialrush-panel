"use client";
import Link from "next/link";
import { Clock3, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics/events";
import { CONTINUE_ORDER_KEY, parseContinueOrder, parseRecentServices, RECENT_SERVICES_KEY, type RecentService } from "@/lib/cro/personalization";
import type { SmmService } from "@/lib/smm-service-catalog";

export default function PersonalizationShelf({ catalog, compact = false }: { catalog: readonly SmmService[]; compact?: boolean }) {
  const [recent, setRecent] = useState<RecentService[]>([]);
  const [draft, setDraft] = useState<ReturnType<typeof parseContinueOrder>>(null);
  const allowed = useMemo(() => new Set(catalog.filter(item => item.isActive).map(item => item.code)), [catalog]);
  useEffect(() => {
    try {
      setRecent(parseRecentServices(localStorage.getItem(RECENT_SERVICES_KEY), allowed));
      setDraft(parseContinueOrder(localStorage.getItem(CONTINUE_ORDER_KEY), allowed));
    } catch { /* Optional activity shelf stays hidden when storage is unavailable. */ }
  }, [allowed]);
  const recentServices = recent.map(item => catalog.find(service => service.code === item.code)).filter((service): service is SmmService => Boolean(service));
  const draftService = draft ? catalog.find(service => service.code === draft.serviceCode) : null;
  if (!recentServices.length && !draftService) return null;
  const orderHref = (service: SmmService, quantity?: number) => `/dashboard/new-order?${new URLSearchParams({ platform: service.platform, service: service.code, ...(quantity ? { quantity: String(quantity), prefill: "1" } : {}) })}`;
  return <section aria-label="Your recent SocialRUSH activity" className={compact ? "relative py-4" : "relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8"}>
    <div className="grid min-w-0 gap-3 lg:grid-cols-2">
      {draftService && <article className={compact ? "min-w-0 rounded-xl border border-white/10 bg-[#101010] p-3" : "rounded-2xl border border-orange-400/30 bg-orange-500/[.08] p-5"}>
        <p className="text-xs font-bold text-orange-200">Continue your order</p><h2 className="mt-2 text-base font-bold text-white">{draftService.name}</h2><p className="mt-1 text-sm text-slate-300">{draft?.quantity.toLocaleString()} selected. Review current availability and price before checkout.</p>
        <Link onClick={() => track("continue_order_clicked", { reorder: false })} href={orderHref(draftService, draft?.quantity)} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-400 px-4 text-xs font-black text-black"><RotateCcw className="h-4 w-4" />Continue Order</Link>
      </article>}
      {recentServices.length > 0 && <article className={compact ? "min-w-0 rounded-xl border border-white/10 bg-[#101010] p-3" : "rounded-2xl border border-white/10 bg-white/[.035] p-5"}>
        <p className="text-xs font-bold text-orange-200">Recently viewed</p><div className={compact ? "mt-3 flex gap-2 overflow-x-auto p-1" : "mt-3 flex flex-wrap gap-2"}>{recentServices.map(service => <Link key={service.code} onClick={() => track("recent_service_opened", {})} href={orderHref(service)} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-200 hover:border-orange-300/50"><Clock3 className="h-3.5 w-3.5 text-orange-300" />{service.name}</Link>)}</div>
      </article>}
    </div>
  </section>;
}
