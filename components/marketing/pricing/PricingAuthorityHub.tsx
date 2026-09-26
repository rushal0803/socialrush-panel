import Link from "next/link";
import { ArrowRight, Calculator, IndianRupee, Layers3 } from "lucide-react";
import type { SmmService } from "@/lib/smm-service-catalog";
import { buildPricingAuthorityEntries } from "@/lib/seo/pricing-authority";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PricingAuthorityHub({
  serviceCatalog,
}: {
  serviceCatalog: readonly SmmService[];
}) {
  const entries = buildPricingAuthorityEntries(serviceCatalog);

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">
            India pricing by platform
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Compare social media service prices before choosing a campaign
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            These cards organize the current SocialRUSH per-1K service rate into
            practical 1K and 5K planning examples. They cover individual growth
            services, not monthly social-media-management retainers, content
            creation, ad management or agency staffing.
          </p>
        </div>
        <Link
          href="/tools/social-media-service-cost-calculator"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-300/25 bg-orange-400/[.08] px-5 text-sm font-black text-orange-100 transition hover:border-orange-300/50 hover:bg-orange-400/[.12]"
        >
          <Calculator className="h-4 w-4" />
          Service cost calculator
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <article
            key={entry.code}
            className="rounded-[1.6rem] border border-white/10 bg-[#101116] p-5 shadow-[0_24px_65px_-45px_rgba(255,122,0,.7)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-300">
                  {entry.platformLabel}
                </p>
                <h3 className="mt-2 text-xl font-black text-white">{entry.serviceName}</h3>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-300/15 bg-orange-400/[.07] text-orange-200">
                <IndianRupee className="h-5 w-5" />
              </span>
            </div>

            {entry.pricePer1000 !== null ? (
              <>
                <p className="mt-5 text-3xl font-black text-white">
                  {money(entry.pricePer1000)}{" "}
                  <span className="text-xs font-bold text-slate-400">/ 1K</span>
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {entry.planning.map((plan) => (
                    <div key={plan.quantity} className="rounded-xl border border-white/[.07] bg-black/20 p-3">
                      <span className="text-[9px] font-black uppercase tracking-[.12em] text-slate-500">
                        {plan.quantity.toLocaleString("en-IN")} units
                      </span>
                      <b className="mt-1 block text-sm text-white">{money(plan.total)}</b>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-xl border border-white/[.07] bg-black/20 p-4">
                <p className="text-sm font-bold text-slate-200">Live price available in the catalog</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Open the service page to review the current rate and valid quantity range.
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/[.07] pt-4 text-xs font-black">
              <Link href={entry.servicePath} className="inline-flex items-center gap-1.5 text-orange-200">
                Service page <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {entry.guidePath ? (
                <Link href={entry.guidePath} className="inline-flex items-center gap-1.5 text-slate-300">
                  Price guide <Layers3 className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 text-[11px] leading-5 text-slate-500">
        Planning examples use the rate supplied to this pricing page. Final
        availability, minimum/maximum quantities, delivery details and the
        checkout total remain authoritative when you place an order.
      </p>
    </section>
  );
}
