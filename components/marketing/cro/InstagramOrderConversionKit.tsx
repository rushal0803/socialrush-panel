"use client";

import { CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { track } from "@/lib/analytics/events";
import type { QuantityMerchandisingOption } from "@/lib/cro/quantity-merchandising";

const surface = "instagram_money_page";

export function OrderBuilderView({ serviceCode }: { serviceCode: string }) {
  useEffect(() => {
    track("package_viewed", {
      service_code: serviceCode,
      platform: "instagram",
      surface,
    });
  }, [serviceCode]);
  return null;
}

export function trackOrderContinue(serviceCode: string, quantity: number) {
  track("new_order_clicked", {
    service_code: serviceCode,
    platform: "instagram",
    quantity,
    surface,
  });
}

export function QuantityDecisionGrid({
  serviceCode,
  options,
  selected,
  unitLabel,
  onSelect,
  formatTotal,
}: {
  serviceCode: string;
  options: readonly QuantityMerchandisingOption[];
  selected: number;
  unitLabel: string;
  onSelect: (value: number) => void;
  formatTotal?: (value: number) => string;
}) {
  if (!options.length) return null;
  return (
    <div data-cro-quantity-grid className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            data-cro-quantity-option
            aria-pressed={active}
            onClick={() => {
              track("package_selected", {
                service_code: serviceCode,
                platform: "instagram",
                quantity: option.value,
                surface,
                merchandising_label: option.label,
              });
              onSelect(option.value);
            }}
            className={`group min-h-24 rounded-2xl border p-3 text-left transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/30 ${active ? "border-orange-400 bg-orange-500/15 text-white shadow-[0_14px_32px_-20px_rgba(255,122,0,.9)]" : "border-white/10 bg-white/[.03] text-slate-200 hover:border-orange-400/45"}`}
          >
            <span className="flex min-h-5 items-center justify-between gap-2">
              {option.label ? <span className="rounded-full border border-orange-300/25 bg-orange-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[.12em] text-orange-200">{option.label}</span> : <span />}
              {active ? <CheckCircle2 className="h-4 w-4 text-orange-300" aria-hidden="true" /> : null}
            </span>
            <span className="mt-2 block text-lg font-black">{option.value.toLocaleString("en-IN")}</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{unitLabel}</span>
            {formatTotal ? <span className="mt-2 block border-t border-white/10 pt-2 text-[11px] font-bold text-orange-100">Total {formatTotal(option.value)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function OrderReadinessChecklist({
  available,
  quantityReady,
  linkReady,
  destinationLabel,
}: {
  available: boolean;
  quantityReady: boolean;
  linkReady: boolean;
  destinationLabel: string;
}) {
  const checks = [
    { label: "Service details loaded", ready: available },
    { label: "Quantity within service limits", ready: quantityReady },
    { label: destinationLabel, ready: linkReady },
  ];
  const readyCount = checks.filter((item) => item.ready).length;

  return (
    <div data-cro-readiness aria-live="polite" className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Before secure order</p>
        <span className={`text-xs font-black ${readyCount === checks.length ? "text-emerald-300" : "text-orange-200"}`}>{readyCount}/{checks.length} ready</span>
      </div>
      <div className="mt-3 space-y-2">
        {checks.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            {item.ready ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" /> : <CircleDashed className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
            <span className={item.ready ? "font-semibold text-slate-200" : "text-slate-400"}>{item.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px] text-slate-400"><ShieldCheck className="h-4 w-4 shrink-0 text-orange-300" />Final price and current service terms remain visible before checkout.</p>
    </div>
  );
}
