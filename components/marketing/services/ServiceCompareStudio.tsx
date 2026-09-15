"use client";

import Link from "next/link";
import { ArrowRight, Check, Layers3, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const MAX_COMPARE = 3;

type Props = {
  serviceCatalog: SmmService[];
};

export default function ServiceCompareStudio({ serviceCatalog }: Props) {
  const { currency } = usePreferredCurrency("INR");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | SmmPlatformId>("all");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const selected = useMemo(
    () => selectedCodes.map((code) => serviceCatalog.find((service) => service.code === code)).filter((service): service is SmmService => Boolean(service)),
    [selectedCodes, serviceCatalog],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return serviceCatalog
      .filter((service) => platform === "all" || service.platform === platform)
      .filter((service) => !term || `${service.name} ${service.description} ${service.code} ${platformMeta[service.platform].label}`.toLowerCase().includes(term))
      .slice(0, 12);
  }, [platform, query, serviceCatalog]);

  const toggleService = (code: string) => {
    setSelectedCodes((current) => {
      if (current.includes(code)) return current.filter((item) => item !== code);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, code];
    });
  };

  const selectedCount = selectedCodes.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-4 z-[70] inline-flex min-h-12 items-center gap-2 rounded-2xl border border-orange-300/30 bg-[#111113]/95 px-4 text-sm font-black text-white shadow-[0_18px_48px_-20px_rgba(255,122,0,.75)] backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-300/60 hover:bg-[#17171b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 motion-reduce:transition-none sm:bottom-6 sm:right-6"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Layers3 className="h-4 w-4 text-orange-300" aria-hidden="true" />
        Compare services
        {selectedCount > 0 ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-orange-500 px-1.5 text-[10px]">{selectedCount}</span> : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-black/70 p-2 backdrop-blur-sm sm:p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-compare-title"
            className="mx-auto flex h-full max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0c0c0f] text-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Decision studio</p>
                <h2 id="service-compare-title" className="mt-1 text-xl font-black sm:text-2xl">Compare services side by side</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#9FA6B2] sm:text-sm">Select up to three live-catalog services and compare price, delivery, refill/support and quantity range before opening the existing order flow.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close service comparison" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-[#C8CDD5] transition hover:border-orange-300/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(19rem,.72fr)_minmax(0,1.28fr)]">
              <aside className="min-h-0 overflow-y-auto border-b border-white/10 p-4 lg:border-b-0 lg:border-r lg:p-5">
                <div className="rounded-2xl border border-white/10 bg-[#111114] p-3">
                  <label className="relative block">
                    <span className="sr-only">Search services to compare</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      type="search"
                      placeholder="Search any service..."
                      className="min-h-11 w-full rounded-xl border border-white/10 bg-[#08080a] py-2.5 pl-10 pr-10 text-sm font-semibold outline-none placeholder:text-[#737B88] focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/15"
                    />
                    {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear compare search" className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#9097A3] hover:bg-white/10 hover:text-white"><X className="h-3.5 w-3.5" /></button> : null}
                  </label>

                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#8F96A3]"><SlidersHorizontal className="h-3.5 w-3.5 text-orange-300" />Platform</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setPlatform("all")} aria-pressed={platform === "all"} className={`min-h-8 rounded-lg px-2.5 text-[11px] font-black ${platform === "all" ? "bg-orange-500 text-white" : "border border-white/10 bg-white/[.035] text-[#C8CDD5] hover:border-orange-300/35"}`}>All</button>
                    {platforms.map((id) => <button key={id} type="button" onClick={() => setPlatform(id)} aria-pressed={platform === id} className={`min-h-8 rounded-lg px-2.5 text-[11px] font-black ${platform === id ? "bg-orange-500 text-white" : "border border-white/10 bg-white/[.035] text-[#C8CDD5] hover:border-orange-300/35"}`}>{platformMeta[id].label}</button>)}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-black text-[#D7DAE0]">Choose services</p>
                  <span className="text-[10px] font-bold text-[#8F96A3]">{selectedCount}/{MAX_COMPARE} selected</span>
                </div>

                <div className="mt-2 space-y-2">
                  {results.map((service) => {
                    const isSelected = selectedCodes.includes(service.code);
                    const selectionFull = selectedCount >= MAX_COMPARE && !isSelected;
                    return (
                      <button
                        key={service.code}
                        type="button"
                        onClick={() => toggleService(service.code)}
                        disabled={selectionFull}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${isSelected ? "border-orange-400/55 bg-orange-500/[.09]" : "border-white/[.08] bg-[#111114] hover:border-white/20"}`}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/25 text-orange-200"><PlatformIcon platform={platformMeta[service.platform].icon} className="h-5 w-5" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-black">{service.name}</span>
                          <span className="mt-1 block text-[10px] font-bold text-[#8F96A3]">{formatCurrency(service.pricePer1000, currency)} / 1K · {service.deliveryTime}</span>
                        </span>
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${isSelected ? "border-orange-300/40 bg-orange-500 text-white" : "border-white/10 text-[#8F96A3]"}`}>{isSelected ? <Check className="h-3.5 w-3.5" /> : <span className="text-base leading-none">+</span>}</span>
                      </button>
                    );
                  })}
                  {!results.length ? <div className="rounded-2xl border border-white/10 bg-[#111114] p-5 text-center text-xs text-[#9FA6B2]">No services match this search.</div> : null}
                </div>
              </aside>

              <div className="min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Comparison</p>
                    <h3 className="mt-1 text-lg font-black">Your shortlist</h3>
                  </div>
                  {selectedCount ? <button type="button" onClick={() => setSelectedCodes([])} className="min-h-9 rounded-xl border border-white/10 bg-white/[.035] px-3 text-xs font-black text-[#C8CDD5] hover:border-orange-300/35 hover:text-white">Clear all</button> : null}
                </div>

                {selected.length ? (
                  <div className="mt-4 grid gap-3 xl:grid-cols-3">
                    {selected.map((service) => {
                      const orderHref = `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`;
                      return (
                        <article key={service.code} className="relative flex min-w-0 flex-col rounded-3xl border border-white/10 bg-[#111114] p-4 shadow-[0_20px_50px_-36px_rgba(255,122,0,.55)] sm:p-5">
                          <button type="button" onClick={() => toggleService(service.code)} aria-label={`Remove ${service.name} from comparison`} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/20 text-[#9097A3] hover:text-white"><X className="h-3.5 w-3.5" /></button>
                          <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-black/25 text-orange-200"><PlatformIcon platform={platformMeta[service.platform].icon} className="h-5 w-5" /></span>
                          <p className="mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-300">{platformMeta[service.platform].label}</p>
                          <h4 className="mt-1 min-h-12 pr-8 text-base font-black leading-6">{service.name}</h4>
                          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#9FA6B2]">{service.description}</p>

                          <div className="mt-4 rounded-2xl border border-orange-400/20 bg-orange-500/[.07] p-3">
                            <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#9FA6B2]">Price</span>
                            <strong className="mt-1 block text-xl">{formatCurrency(service.pricePer1000, currency)} <span className="text-[10px] text-[#9FA6B2]">/ 1K</span></strong>
                          </div>

                          <dl className="mt-3 grid gap-2 text-xs">
                            <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><dt className="font-bold text-[#8F96A3]">Delivery</dt><dd className="mt-1 font-black text-white">{service.deliveryTime}</dd></div>
                            <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><dt className="font-bold text-[#8F96A3]">Refill / support</dt><dd className="mt-1 font-black text-white">{service.refillPolicy}</dd></div>
                            <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><dt className="font-bold text-[#8F96A3]">Quantity range</dt><dd className="mt-1 font-black text-white">{service.minQuantity.toLocaleString()}–{service.maxQuantity.toLocaleString()}</dd></div>
                          </dl>

                          <Link href={orderHref} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-black text-white shadow-[0_12px_25px_-16px_rgba(255,122,0,.9)] hover:brightness-110">Choose this service <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </article>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - selected.length }).map((_, index) => <div key={`empty-${index}`} className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[.015] p-5 text-center"><div><Layers3 className="mx-auto h-5 w-5 text-[#66707E]" /><p className="mt-2 text-xs font-bold text-[#7F8794]">Add another service to compare</p></div></div>)}
                  </div>
                ) : (
                  <div className="mt-4 grid min-h-[24rem] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[.015] p-6 text-center">
                    <div className="max-w-sm">
                      <Layers3 className="mx-auto h-7 w-7 text-orange-300" />
                      <h4 className="mt-3 text-lg font-black">Build a comparison</h4>
                      <p className="mt-2 text-sm leading-6 text-[#9FA6B2]">Search the live catalog on the left and select up to three services. Nothing is ordered until you continue into the existing order flow.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
