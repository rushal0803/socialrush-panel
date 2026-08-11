"use client";

import Link from "next/link";
import { ArrowRight, Link2, LockKeyhole, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";
import { calculateServiceTotal, validateQuantity } from "@/lib/service-pricing";
import { getServiceById } from "@/lib/smm-service-catalog";

const service = getServiceById("youtube-subscribers");

export default function YouTubeSubscribersOrderPanel() {
  const { currency } = usePreferredCurrency("INR");
  const [quantity, setQuantity] = useState(service?.minQuantity ?? 1);
  const [link, setLink] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const choices = useMemo(() => service ? [...new Set([service.minQuantity, 500, 1000, 5000].filter(v => v >= service.minQuantity && v <= service.maxQuantity))] : [], []);
  if (!service) return null;
  const qtyError = validateQuantity(quantity, service);
  const linkError = link.trim() ? validateCampaignLink(link, linkRules[service.code]) : "";
  const total = calculateServiceTotal(service.code, quantity);
  const canContinue = !qtyError && !linkError && Boolean(link.trim());
  const update = (value: number) => setQuantity(Math.max(service.minQuantity, Math.min(service.maxQuantity, Math.round(value / (service.quantityStep ?? 1)) * (service.quantityStep ?? 1))));
  // `resume=1` reads the exact catalog code in the dashboard, so retain the
  // service identifier rather than the display shorthand.
  const orderHref = `/dashboard/new-order?platform=youtube&service=${service.code}&resume=1&quantity=${quantity}&link=${encodeURIComponent(link.trim())}`;
  return <section id="packages" className="scroll-mt-24 border-y border-white/10 bg-[#0d0e12] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <article className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_92%_5%,rgba(255,0,0,.16),transparent_25%),linear-gradient(145deg,#1b1d25,#101115)] p-5 shadow-[0_30px_75px_-45px_rgba(255,122,0,.9)] sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Quick order builder</p><h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Build Your YouTube Subscribers Order</h2><p className="mt-2 text-sm text-slate-300">Choose your subscriber quantity and see your total instantly.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{choices.map(value => <button key={value} type="button" onClick={() => update(value)} className={`min-h-20 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${quantity === value ? "border-orange-400 bg-orange-500/15 text-white" : "border-white/10 bg-white/[.035] text-slate-200 hover:border-red-400/60"}`}><span className="block text-lg font-black">{value >= 1000 ? `${value / 1000}K` : value}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-orange-200">subscribers</span></button>)}</div>
        <label className="mt-7 block text-sm font-black text-white">Custom quantity <span className="mt-2 flex overflow-hidden rounded-2xl border border-orange-400/25 bg-black/35 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/15"><button type="button" onClick={() => update(quantity - (service.quantityStep ?? 1))} aria-label="Decrease quantity" className="grid min-h-14 w-14 place-items-center text-orange-300"><Minus className="h-4 w-4" /></button><input type="number" inputMode="numeric" min={service.minQuantity} max={service.maxQuantity} step={service.quantityStep ?? 1} value={quantity || ""} onChange={e => setQuantity(e.target.value === "" ? 0 : Number(e.target.value))} className="min-w-0 flex-1 bg-transparent text-center font-black text-white outline-none" /><button type="button" onClick={() => update(quantity + (service.quantityStep ?? 1))} aria-label="Increase quantity" className="grid min-h-14 w-14 place-items-center text-orange-300"><Plus className="h-4 w-4" /></button></span></label>
        <p className={`mt-2 text-xs ${showErrors && qtyError ? "font-bold text-red-300" : "text-slate-400"}`}>{showErrors && qtyError ? qtyError : `Available from ${service.minQuantity.toLocaleString("en-IN")} to ${service.maxQuantity.toLocaleString("en-IN")} subscribers.`}</p>
        <label className="mt-8 block text-sm font-black text-white">Your public YouTube channel URL <span className="mt-2 flex rounded-2xl border border-white/10 bg-black/35 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/15"><span className="grid w-12 place-items-center text-red-400"><Link2 className="h-5 w-5" /></span><input value={link} onChange={e => setLink(e.target.value)} placeholder={linkRules[service.code].placeholder} className="min-h-14 min-w-0 flex-1 bg-transparent pr-4 text-base text-white outline-none placeholder:text-slate-600" /></span></label>
        <p className="mt-2 text-xs leading-6 text-slate-400">{linkRules[service.code].helper} No password, Google login, or channel credentials are required.</p>{showErrors && (!link.trim() || linkError) ? <p role="alert" className="mt-2 text-xs font-bold text-red-300">{linkError || "Enter your public YouTube channel URL to continue."}</p> : null}
      </article>
      <aside className="rounded-[2rem] border border-orange-400/25 bg-[linear-gradient(160deg,#23120f,#12141a_50%,#0b0c0f)] p-6 shadow-[0_32px_80px_-42px_rgba(255,122,0,.7)] lg:sticky lg:top-28 lg:h-fit"><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Live order summary</p><h3 className="mt-2 text-xl font-black text-white">YouTube Subscribers</h3><dl className="mt-6 space-y-3.5 text-sm"><Row label="Quantity" value={quantity.toLocaleString("en-IN")} /><Row label="Live rate" value={`${formatCurrency(service.pricePer1000, currency)} / 1K`} /><Row label="Delivery" value={service.deliveryTime} /><Row label="Refill/support" value={service.refillPolicy} /><Row label="Channel link" value={link.trim() && !linkError ? "Ready" : "Needed"} /></dl><div className="mt-6 rounded-2xl border border-orange-400/20 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-200">Current total</p><p className="mt-2 text-3xl font-black text-white">{formatCurrency(total, currency)}</p></div><Link href={canContinue ? orderHref : "#packages"} onClick={e => { if (!canContinue) { e.preventDefault(); setShowErrors(true); } }} aria-disabled={!canContinue} className={`mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition ${canContinue ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white hover:-translate-y-0.5" : "bg-white/10 text-slate-400"}`}>Continue to Secure Order <ArrowRight className="h-4 w-4" /></Link><p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-300"><LockKeyhole className="h-4 w-4 text-orange-300" />Secure checkout · No password required</p></aside>
    </div>
  </section>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4"><dt className="text-slate-400">{label}</dt><dd className="max-w-[58%] text-right font-bold text-slate-100">{value}</dd></div>; }
