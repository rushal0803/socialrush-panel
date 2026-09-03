"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { validateQuantity } from "@/lib/service-pricing";
import { activeSmmServices, platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const serviceType = (service: SmmService) => service.name.replace(/^(Instagram|YouTube|Facebook|LinkedIn(?: Profile)?|Telegram Premium|TikTok|X)\s+/i, "") || service.name;
const quantityText = (value: number) => value.toLocaleString("en-IN");

export default function PricingGrid({ serviceCatalog = activeSmmServices }: { serviceCatalog?: readonly SmmService[] }) {
  const { currency } = usePreferredCurrency("INR");
  const calculatorRef = useRef<HTMLElement>(null);
  const [platform, setPlatform] = useState<SmmPlatformId>("instagram");
  const [type, setType] = useState("All");
  const [selectedCode, setSelectedCode] = useState(serviceCatalog.find((s) => s.platform === "instagram")?.code ?? "instagram-followers");
  const [quantityInput, setQuantityInput] = useState("1000");
  const platformServices = useMemo(() => serviceCatalog.filter((s) => s.platform === platform), [platform, serviceCatalog]);
  const types = useMemo(() => ["All", ...Array.from(new Set(platformServices.map(serviceType)))], [platformServices]);
  const visible = useMemo(() => type === "All" ? platformServices : platformServices.filter((s) => serviceType(s) === type), [platformServices, type]);
  const selected = platformServices.find((s) => s.code === selectedCode) ?? platformServices[0];
  const quantity = /^\d+$/.test(quantityInput) ? Number(quantityInput) : 0;
  const error = selected && quantityInput ? validateQuantity(quantity, selected) : "Enter a whole-number quantity.";
  const total = selected && !error ? Math.round((quantity * selected.pricePer1000 * 100) / 1000) / 100 : 0;
  const orderHref = selected && !error ? `/dashboard/new-order?platform=${encodeURIComponent(selected.platform)}&service=${encodeURIComponent(selected.code)}&quantity=${quantity}&resume=1` : "/dashboard/new-order";

  function choosePlatform(next: SmmPlatformId) {
    const first = serviceCatalog.find((s) => s.platform === next);
    if (!first) return;
    setPlatform(next); setType("All"); setSelectedCode(first.code); setQuantityInput(String(Math.max(1000, first.minQuantity)));
  }
  function chooseService(service: SmmService) {
    setSelectedCode(service.code);
    if (validateQuantity(quantity, service)) setQuantityInput(String(Math.max(1000, service.minQuantity)));
  }
  function focusCalculator(service?: SmmService) {
    if (service) { choosePlatform(service.platform); setSelectedCode(service.code); }
    calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <div className="mt-8 space-y-12">
    <section aria-label="Platform pricing catalog" className="rounded-[30px] border border-white/10 bg-[#101116] p-4 shadow-[0_32px_90px_-50px_rgba(255,122,0,.75)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">Live service catalog</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">{platformMeta[platform].label} pricing</h2><p className="mt-1 text-sm text-slate-400">Compare live rates, delivery and refill/support details for available services.</p></div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200">{platformServices.length} {platformServices.length === 1 ? "service" : "services"} available</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {platforms.map((id) => { const active = id === platform; const count = serviceCatalog.filter((s) => s.platform === id).length; return <button key={id} type="button" onClick={() => choosePlatform(id)} aria-pressed={active} className={`min-h-[84px] rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${active ? "border-orange-400/70 bg-orange-500/15 text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.8)]" : "border-white/10 bg-white/[.025] text-slate-300 hover:border-orange-400/40"}`}><PlatformIcon platform={platformMeta[id].label} className="h-5 w-5 text-orange-200" /><span className="mt-3 block text-xs font-black">{platformMeta[id].label.replace("Twitter / ", "")}</span><span className="mt-1 block text-[10px] text-slate-500">{count} live</span></button>; })}
      </div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Service type filters">{types.map((item) => <button key={item} type="button" onClick={() => setType(item)} aria-pressed={type === item} className={`min-h-10 rounded-full border px-4 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 ${type === item ? "border-orange-400/60 bg-orange-500/15 text-orange-100" : "border-white/10 bg-white/[.03] text-slate-300 hover:border-white/25"}`}>{item}</button>)}</div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((service) => <article key={service.code} className={`relative overflow-hidden rounded-2xl border p-5 transition ${selected?.code === service.code ? "border-orange-400/60 bg-orange-500/[.08]" : "border-white/10 bg-[#15161c] hover:border-orange-400/35"}`}>
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 text-xs text-slate-400"><PlatformIcon platform={platformMeta[service.platform].label} className="h-4 w-4 text-orange-200" />{platformMeta[service.platform].label}</div><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-200">Available</span></div>
          <h3 className="mt-4 text-base font-black text-white">{service.name}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-orange-200">{serviceType(service)} · {service.qualityType}</p>
          <p className="mt-5 text-3xl font-black tracking-tight text-white">{formatCurrency(service.pricePer1000, currency)} <span className="text-xs font-bold text-slate-400">/ 1K</span></p><p className="mt-1 text-[11px] text-slate-500">Rate for every 1,000 units</p>
          <dl className="mt-5 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl bg-black/20 p-3"><dt className="text-slate-500">Min order</dt><dd className="mt-1 font-bold text-white">{quantityText(service.minQuantity)}</dd></div><div className="rounded-xl bg-black/20 p-3"><dt className="text-slate-500">Max order</dt><dd className="mt-1 font-bold text-white">{quantityText(service.maxQuantity)}</dd></div><div className="rounded-xl bg-black/20 p-3"><dt className="text-slate-500">Delivery</dt><dd className="mt-1 font-bold text-white">{service.deliveryTime}</dd></div></dl><p className="mt-3 text-xs font-semibold text-emerald-200">{service.refillPolicy}</p>
          <button type="button" onClick={() => focusCalculator(service)} className="mt-5 inline-flex min-h-10 items-center text-xs font-black text-orange-200 hover:text-orange-100">View service <span className="ml-2">→</span></button>
        </article>)}
      </div>
    </section>

    <section ref={calculatorRef} id="price-calculator" className="scroll-mt-24 rounded-[30px] border border-orange-400/25 bg-[linear-gradient(135deg,#1d1208,#101116_55%,#101116)] p-5 shadow-[0_32px_90px_-52px_rgba(255,122,0,.8)] sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">Quick price calculator</p><h2 className="mt-2 text-2xl font-black text-white">Estimate your order</h2><p className="mt-2 text-sm text-slate-400">Uses the current catalog rate before you continue into the existing order flow.</p></div><p className="max-w-xs text-xs text-slate-500">{getCurrencyDisclaimer()}</p></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.72fr]"><div className="space-y-5"><label className="block text-xs font-black uppercase tracking-[.15em] text-slate-400">1. Choose service<select value={selected?.code ?? ""} onChange={(e) => chooseService(platformServices.find((s) => s.code === e.target.value) ?? platformServices[0])} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#0a0b0f] px-3 text-sm font-bold text-white outline-none focus:border-orange-400">{platformServices.map((s) => <option key={s.code} value={s.code}>{s.name} — {formatCurrency(s.pricePer1000, currency)} / 1K</option>)}</select></label>{selected && <label htmlFor="pricing-quantity" className="block text-xs font-black uppercase tracking-[.15em] text-slate-400">2. Set quantity<input id="pricing-quantity" inputMode="numeric" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value.replace(/[^\d]/g, ""))} className={`mt-2 min-h-14 w-full rounded-xl border bg-[#0a0b0f] px-4 text-lg font-black text-white outline-none focus:ring-4 focus:ring-orange-500/10 ${error ? "border-red-400/55" : "border-orange-400/35 focus:border-orange-400"}`} /><span aria-live="polite" className={`mt-2 block normal-case tracking-normal ${error ? "text-red-300" : "text-slate-500"}`}>{error || `Min ${quantityText(selected.minQuantity)} · Max ${quantityText(selected.maxQuantity)} · Whole numbers only`}</span></label>}</div>
        {selected && <aside className="rounded-2xl border border-white/10 bg-black/25 p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 text-orange-200"><PlatformIcon platform={platformMeta[selected.platform].label} className="h-5 w-5" /></span><div><p className="text-xs text-slate-400">{platformMeta[selected.platform].label}</p><h3 className="font-black text-white">{selected.name}</h3></div></div><dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-400">Live rate</dt><dd className="font-bold text-white">{formatCurrency(selected.pricePer1000, currency)} / 1K</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">Quantity</dt><dd className="font-bold text-white">{quantity ? quantityText(quantity) : "—"}</dd></div><div className="border-t border-white/10 pt-4"><dt className="text-[10px] font-black uppercase tracking-[.15em] text-orange-200">Estimated total</dt><dd aria-live="polite" className="mt-2 text-3xl font-black text-white">{total ? formatCurrency(total, currency) : "—"}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/[.06] px-3 py-2 text-slate-300">Delivery: {selected.deliveryTime}</span><span className="rounded-full bg-emerald-400/10 px-3 py-2 text-emerald-200">{selected.refillPolicy}</span></div><Link href={orderHref} aria-disabled={Boolean(error)} className={`mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-black transition ${error ? "pointer-events-none bg-white/10 text-white/35" : "bg-gradient-to-r from-[#FF6200] to-[#FF9A00] text-white hover:brightness-110"}`}>Start This Order <span className="ml-2">→</span></Link></aside>}
      </div>
    </section>
  </div>;
}
