import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { internationalAuthorityMarkets } from "@/lib/seo/international-authority";

export default function InternationalMarketAuthorityLinks() {
  return (
    <section aria-labelledby="international-market-authority" className="border-y border-white/[.06] bg-[#0A0C11]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            International service discovery
          </p>
          <h2 id="international-market-authority" className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Explore SocialRUSH services by market
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#A8AFBD]">
            Country hubs help visitors compare market-specific service pages, local-currency display estimates and public-link requirements before the final INR checkout.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {internationalAuthorityMarkets.map((market) => (
            <article key={market.slug} className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">
                    {market.currency} planning
                  </p>
                  <h3 className="mt-2 text-lg font-black text-white">{market.name}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#A8AFBD]">
                    {market.services.length} focused service {market.services.length === 1 ? "page" : "pages"} for {market.searchLabel}.
                  </p>
                </div>
                <Link
                  href={market.hubHref}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-orange-200 hover:text-orange-100"
                >
                  Hub <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {market.services.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-bold text-[#D8DCE4] transition hover:border-orange-400/40 hover:text-white"
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
