"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { calculateServiceTotal, validateQuantity } from "@/lib/service-pricing";
import { activeSmmServices, platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

const platformOrder: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "tiktok", "x", "telegram"];

function presetsFor(service: SmmService) {
  return [1000, 2000, 5000, 10000].filter((value) =>
    value >= service.minQuantity && value <= service.maxQuantity && (value - service.minQuantity) % (service.quantityStep ?? 1) === 0,
  );
}

export default function PricingGrid() {
  const { currency } = usePreferredCurrency("INR");
  const configuratorRef = useRef<HTMLElement>(null);
  const [platform, setPlatform] = useState<SmmPlatformId>("instagram");
  const [selectedCode, setSelectedCode] = useState(activeSmmServices.find((service) => service.platform === "instagram")?.code ?? "instagram-followers");
  const [query, setQuery] = useState("");
  const [quantityInput, setQuantityInput] = useState("1000");

  const platformServices = useMemo(() => activeSmmServices.filter((service) => service.platform === platform), [platform]);
  const visibleServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return platformServices.filter((service) => !needle || `${service.name} ${service.description}`.toLowerCase().includes(needle));
  }, [platformServices, query]);
  const selectedService = platformServices.find((service) => service.code === selectedCode) ?? platformServices[0];
  const quantity = Number(quantityInput.replace(/[^\d]/g, ""));
  const quantityError = selectedService && quantityInput ? validateQuantity(quantity, selectedService) : "Enter a quantity to calculate your total.";
  const total = selectedService && !quantityError ? calculateServiceTotal(selectedService.code, quantity) : 0;
  const orderHref = selectedService && !quantityError
    ? `/dashboard/new-order?platform=${encodeURIComponent(selectedService.platform)}&service=${encodeURIComponent(selectedService.code)}&quantity=${quantity}&resume=1`
    : "/dashboard/new-order";

  const selectPlatform = (value: SmmPlatformId) => {
    const firstService = activeSmmServices.find((service) => service.platform === value);
    if (!firstService) return;
    setPlatform(value);
    setSelectedCode(firstService.code);
    setQuery("");
    setQuantityInput(String(Math.max(1000, firstService.minQuantity)));
  };
  const selectService = (service: SmmService) => {
    setSelectedCode(service.code);
    const current = Number(quantityInput);
    if (validateQuantity(current, service)) setQuantityInput(String(Math.max(1000, service.minQuantity)));
  };
  const scrollToConfigurator = () => configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="mt-8">
      <section ref={configuratorRef} id="price-calculator" className="scroll-mt-28 rounded-[28px] border border-orange-400/25 bg-[#101014] p-4 shadow-[0_30px_80px_-45px_rgba(255,122,0,.8)] sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Live campaign price estimator</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">Configure your order.</h2></div>
          <p className="text-xs font-semibold text-[#AEB5C0]">{getCurrencyDisclaimer()}</p>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.8fr)]">
          <div className="min-w-0 space-y-5">
            <div><p className="text-xs font-black uppercase tracking-[.14em] text-[#9DA4B0]">1. Choose platform</p><div className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-7">{platformOrder.map((id) => { const active = id === platform; return <button key={id} type="button" onClick={() => selectPlatform(id)} aria-pressed={active} className={`flex min-h-[78px] min-w-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 sm:min-w-0 ${active ? "border-orange-400/70 bg-orange-500/15 text-white shadow-[0_12px_28px_-18px_rgba(255,122,0,.85)]" : "border-white/10 bg-[#17171c] text-[#CDD1D8] hover:border-orange-400/45"}`}><PlatformIcon platform={platformMeta[id].label} className="h-5 w-5" /><span className="text-[11px] font-black">{platformMeta[id].short}</span>{active && <span className="sr-only">Selected</span>}</button>; })}</div></div>
            <div><div className="flex flex-wrap items-end justify-between gap-3"><p className="text-xs font-black uppercase tracking-[.14em] text-[#9DA4B0]">2. Choose service</p><label className="relative block"><span className="sr-only">Search services</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services…" className="min-h-10 w-full rounded-xl border border-white/10 bg-[#09090c] px-3 text-sm text-white outline-none placeholder:text-[#737986] focus:border-orange-400 sm:w-56" /></label></div><div className="mt-3 grid gap-3 sm:grid-cols-2">{visibleServices.map((service) => { const active = service.code === selectedService?.code; return <button key={service.code} type="button" onClick={() => selectService(service)} aria-pressed={active} className={`rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${active ? "border-orange-400/75 bg-orange-500/10" : "border-white/10 bg-[#17171c] hover:border-orange-400/45"}`}><div className="flex items-start justify-between gap-3"><span className="text-sm font-black text-white">{service.name}</span>{active && <span className="rounded-full bg-orange-400/15 px-2 py-1 text-[9px] font-black uppercase text-orange-200">Selected</span>}</div><p className="mt-3 text-lg font-black text-orange-200">{formatCurrency(service.pricePer1000, currency)} <span className="text-[10px] text-[#AEB5C0]">/ 1K</span></p><dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]"><div className="rounded-xl bg-black/20 p-2"><dt className="text-[#8E96A3]">Delivery</dt><dd className="mt-1 font-bold text-white">{service.deliveryTime}</dd></div><div className="rounded-xl bg-black/20 p-2"><dt className="text-[#8E96A3]">Refill</dt><dd className="mt-1 font-bold text-emerald-200">{service.refillPolicy}</dd></div></dl></button>; })}</div>{!visibleServices.length && <p className="mt-3 rounded-xl border border-dashed border-white/15 p-4 text-sm text-[#AEB5C0]">No matching services. Try a different search.</p>}</div>
            {selectedService && <div><label htmlFor="pricing-quantity" className="text-xs font-black uppercase tracking-[.14em] text-[#9DA4B0]">3. Quantity</label><input id="pricing-quantity" inputMode="numeric" value={quantityInput} onChange={(event) => setQuantityInput(event.target.value.replace(/[^\d]/g, ""))} className={`mt-3 min-h-14 w-full rounded-xl border bg-[#09090c] px-4 text-lg font-black text-white outline-none transition focus:ring-4 focus:ring-orange-500/10 ${quantityError ? "border-red-400/50" : "border-orange-400/35 focus:border-orange-400"}`} /><p aria-live="polite" className={`mt-2 text-xs ${quantityError ? "text-red-300" : "text-[#AEB5C0]"}`}>{quantityError || `Min ${selectedService.minQuantity.toLocaleString("en-IN")} · Max ${selectedService.maxQuantity.toLocaleString("en-IN")} · Whole numbers`}</p><div className="mt-3 flex flex-wrap gap-2">{presetsFor(selectedService).map((value) => <button key={value} type="button" onClick={() => setQuantityInput(String(value))} className={`min-h-10 rounded-full border px-3 text-xs font-black transition ${quantity === value ? "border-orange-400 bg-orange-500/20 text-orange-100" : "border-white/10 bg-white/[.04] text-[#D4D7DD] hover:border-orange-400/45"}`}>{value / 1000}K</button>)}</div></div>}
          </div>
          <aside className="h-fit rounded-3xl border border-orange-400/30 bg-[linear-gradient(145deg,#221407,#111116_48%,#111116)] p-5 shadow-[0_24px_52px_-32px_rgba(255,122,0,.6)] lg:sticky lg:top-24">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Price estimate</p>
            {selectedService ? <><div className="mt-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 text-orange-200"><PlatformIcon platform={platformMeta[selectedService.platform].label} className="h-5 w-5" /></span><div><p className="text-xs text-[#AEB5C0]">{platformMeta[selectedService.platform].label}</p><h3 className="font-black text-white">{selectedService.name}</h3></div></div><dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-[#AEB5C0]">Rate</dt><dd className="font-bold text-white">{formatCurrency(selectedService.pricePer1000, currency)} / 1K</dd></div><div className="flex justify-between gap-4"><dt className="text-[#AEB5C0]">Quantity</dt><dd className="font-bold text-white">{quantity ? quantity.toLocaleString("en-IN") : "—"}</dd></div><div className="border-t border-white/10 pt-4"><dt className="text-[10px] font-black uppercase tracking-[.15em] text-orange-200">Estimated total</dt><dd aria-live="polite" className="mt-2 text-3xl font-black tracking-tight text-white">{total ? formatCurrency(total, currency) : "—"}</dd></div></dl><div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-[#C9CDD4]"><strong className="text-white">How it&apos;s calculated</strong><br />{quantity ? `${quantity / 1000} × ${formatCurrency(selectedService.pricePer1000, currency)}` : "Choose a valid quantity to calculate."}</div><Link href={orderHref} className={`mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${quantityError ? "pointer-events-none bg-white/10 text-white/40" : "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white shadow-[0_16px_32px_-16px_rgba(255,122,0,.9)] hover:brightness-110"}`}>Start Order <span className="ml-2">→</span></Link><p className="mt-3 text-center text-[10px] text-[#AEB5C0]">Public link only · Review before confirming</p></> : null}
          </aside>
        </div>
      </section>
      <div className="mt-10 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Compare live rates</p><h2 className="mt-2 text-2xl font-black text-white">Browse services at a glance.</h2></div><button type="button" onClick={scrollToConfigurator} className="min-h-10 rounded-xl border border-orange-400/35 bg-orange-500/10 px-4 text-xs font-black text-orange-100">Calculate price</button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{activeSmmServices.map((service) => <article key={service.code} className="rounded-2xl border border-white/10 bg-[#121216] p-4 transition hover:border-orange-400/45"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><PlatformIcon platform={platformMeta[service.platform].label} className="h-4 w-4 text-orange-200" /><p className="text-xs font-bold text-[#AEB5C0]">{platformMeta[service.platform].label}</p></div><span className="text-[9px] font-black uppercase text-emerald-300">Live rate</span></div><h3 className="mt-3 font-black text-white">{service.name}</h3><p className="mt-2 text-xl font-black text-orange-200">{formatCurrency(service.pricePer1000, currency)} <span className="text-[10px] text-[#AEB5C0]">/ 1K</span></p><p className="mt-3 text-xs text-[#AEB5C0]">Delivery: <strong className="text-white">{service.deliveryTime}</strong> · <span className="text-emerald-200">{service.refillPolicy}</span></p><button type="button" onClick={() => { selectPlatform(service.platform); setSelectedCode(service.code); scrollToConfigurator(); }} className="mt-4 text-xs font-black text-orange-200 hover:text-orange-100">Calculate price →</button></article>)}</div>
    </div>
  );
}
