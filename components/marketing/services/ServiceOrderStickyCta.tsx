"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
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
  if (!available) return null;

  const price = typeof startingPrice === "number" && Number.isFinite(startingPrice)
    ? `From ${formatCurrency(startingPrice, currency, rates)}`
    : "View live price";

  return (
    <div className="fixed bottom-[calc(.75rem+env(safe-area-inset-bottom))] left-3 right-16 z-[60] lg:hidden">
      <Link
        href={href}
        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-orange-400/30 bg-[#0B0B0F]/95 px-3 py-2 text-white shadow-[0_18px_45px_rgba(0,0,0,.35)] backdrop-blur-xl"
      >
        <span className="min-w-0">
          <span className="block truncate text-xs font-black">{serviceName}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-orange-100">
            <LockKeyhole className="h-3 w-3 shrink-0 text-emerald-300" />
            {price}
          </span>
          {currency !== "INR" && typeof startingPrice === "number" ? <span className="mt-0.5 block text-[9px] text-slate-300">Checkout charged in INR</span> : null}
        </span>
        <span className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 text-xs font-black">
          Start order <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </div>
  );
}
