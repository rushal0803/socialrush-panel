"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, X } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

type ServiceOrderStickyCtaProps = {
  href: string;
  serviceName: string;
  startingPrice?: number | null;
  available?: boolean;
};

/**
 * A compact mobile-only action that deliberately leaves room for the global
 * WhatsApp button. It only reflects server-provided catalog facts; quantity
 * and the final total continue to be selected in the existing order flow.
 */
export default function ServiceOrderStickyCta({
  href,
  serviceName,
  startingPrice,
  available = true,
}: ServiceOrderStickyCtaProps) {
  const { currency, rates } = usePreferredCurrency("INR");
  const [targetVisible, setTargetVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTargetVisible(entry.isIntersecting),
      { threshold: 0.08, rootMargin: "-72px 0px -20% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [href]);

  if (!available || targetVisible || dismissed) return null;

  const price = typeof startingPrice === "number" && Number.isFinite(startingPrice)
    ? `${formatCurrency(startingPrice, currency, rates)} / 1K`
    : "View live price";

  return (
    <div data-service-mobile-action className="fixed bottom-[calc(.75rem+env(safe-area-inset-bottom))] left-3 right-16 z-[60] flex items-center rounded-2xl border border-white/20 bg-[#101217] shadow-lg lg:hidden">
      <Link
        href={href}
        className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-l-2xl px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300"
      >
        <span className="min-w-0">
          <span className="block truncate text-xs font-black">{serviceName}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-orange-100">
            <LockKeyhole className="h-3 w-3 shrink-0 text-emerald-300" />
            {price}
          </span>
          {currency !== "INR" && typeof startingPrice === "number" ? <span className="mt-0.5 block text-[9px] text-slate-300">Checkout charged in INR</span> : null}
        </span>
        <span className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl bg-[#ff983e] px-2 text-xs font-black text-[#201309]">
          Start order <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss mobile order bar" className="grid min-h-11 w-11 shrink-0 place-items-center rounded-r-2xl text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300"><X className="h-4 w-4" aria-hidden="true" /></button>
    </div>
  );
}
