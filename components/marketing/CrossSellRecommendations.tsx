"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { track } from "@/lib/analytics/events";
import { relatedLabel, relatedServices } from "@/lib/cro/related-services";

export default function CrossSellRecommendations({ serviceCode, compact = false }: { serviceCode: string; compact?: boolean }) {
  const service = activeSmmServices.find((item) => item.code === serviceCode);
  const recommendations = relatedServices(serviceCode, activeSmmServices, 3);
  const serviceCodeForEvent = service?.code;
  const platformForEvent = service?.platform;
  useEffect(() => { if (serviceCodeForEvent && platformForEvent && recommendations.length) track("cross_sell_view", { service_code: serviceCodeForEvent, platform: platformForEvent }); }, [serviceCodeForEvent, platformForEvent, recommendations.length]);
  if (!service || !recommendations.length) return null;
  return <section className={`rounded-2xl border border-orange-400/20 bg-orange-500/[.06] ${compact ? "p-4" : "p-5 sm:p-6"}`}>
    <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-200">{relatedLabel(service)}</p>
    <h2 className="mt-2 text-lg font-black text-white">Related services, when they fit your next goal</h2>
    <p className="mt-1 text-sm leading-6 text-slate-300">Each option is selected separately with its current price and details.</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{recommendations.map((item) => <Link key={item.code} href={`/order-summary?service=${item.code}`} onClick={() => track("related_service_clicked", { surface: "related_services" })} aria-label={`Explore ${item.name}`} className="group flex min-h-12 items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-bold text-white transition hover:border-orange-400/50 hover:bg-orange-500/10"><span>{item.name}</span><ArrowRight className="h-4 w-4 text-orange-300 transition group-hover:translate-x-0.5" /></Link>)}</div>
  </section>;
}
