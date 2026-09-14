"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { track } from "@/lib/analytics/events";
import { relatedLabel, relatedServices } from "@/lib/cro/related-services";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

export default function CrossSellRecommendations({ serviceCode, compact = false, source = "related_services" }: { serviceCode: string; compact?: boolean; source?: string }) {
  const { currency } = usePreferredCurrency();
  const service = activeSmmServices.find((item) => item.code === serviceCode);
  const recommendations = relatedServices(serviceCode, activeSmmServices, 3);
  const serviceCodeForEvent = service?.code;
  const platformForEvent = service?.platform;

  useEffect(() => {
    if (serviceCodeForEvent && platformForEvent && recommendations.length) {
      track("cross_sell_view", { service_code: serviceCodeForEvent, platform: platformForEvent, source });
    }
  }, [serviceCodeForEvent, platformForEvent, recommendations.length, source]);

  if (!service || !recommendations.length) return null;

  return (
    <section className={`rounded-2xl border border-orange-400/20 bg-orange-500/[.06] ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-orange-200">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-200">{relatedLabel(service)}</p>
          <h2 className="mt-1 text-lg font-black text-white">Complete the campaign with a related service</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">Compare complementary options with their current rate and delivery estimate before ordering separately.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => (
          <Link
            key={item.code}
            href={`/dashboard/order-summary?service=${encodeURIComponent(item.code)}`}
            onClick={() => track("related_service_clicked", { surface: source, service_code: item.code, platform: item.platform })}
            aria-label={`Explore ${item.name}`}
            className="group flex min-h-[138px] flex-col rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:bg-orange-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.description}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-300 transition group-hover:translate-x-0.5" />
            </div>

            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current rate</p>
                <p className="mt-1 text-sm font-black text-orange-100">{formatCurrency(item.pricePer1000, currency)} / 1K</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                {item.deliveryTime}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-4 text-slate-500">Related services are optional and ordered separately. Prices shown are the current catalog rates.</p>
    </section>
  );
}
