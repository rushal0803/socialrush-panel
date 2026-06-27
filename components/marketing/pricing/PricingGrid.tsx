"use client";

import Link from "next/link";
import { agencyServices } from "@/lib/marketing/content";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import PlatformIcon from "@/components/PlatformIcon";

const platformNames = ["Instagram", "YouTube", "Facebook", "LinkedIn", "TikTok", "Twitter/X"];

export default function PricingGrid() {
  const { currency } = usePreferredCurrency("INR");

  return (
    <>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        These public starting rates help with planning. The campaign dashboard remains the source of truth for current availability and the final checkout amount.
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{getCurrencyDisclaimer()}</p>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {platformNames.map((platform) => {
          const services = agencyServices.filter((service) => service.platform === platform);

          return (
            <article
              key={platform}
              className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_12px_45px_-25px_rgba(7,21,47,.25)]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[10px] font-black text-blue-700">
                    <PlatformIcon platform={platform} className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-bold text-[#07152f]">{platform}</h2>
                </div>
                <Link
                  href={`/services#${platform.toLowerCase().replace("/", "-")}`}
                  className="text-[10px] font-bold text-blue-600"
                >
                  View details
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {services.map((service) => (
                  <div
                    key={service.slug}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-blue-50/40"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-700">{service.name}</h3>
                      <p className="mt-1 text-[9px] text-slate-400">Tracked order · Total reviewed before checkout</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-blue-600">
                      {formatCurrency(service.pricePer1000INR, currency)} / 1000
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
