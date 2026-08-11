"use client";

import Link from "next/link";
import { ArrowRight, Link2, LockKeyhole, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";
import { calculateServiceTotal, validateQuantity } from "@/lib/service-pricing";
import { getServiceById } from "@/lib/smm-service-catalog";

const service = getServiceById("instagram-likes");

export default function InstagramLikesOrderPanel() {
  const { currency } = usePreferredCurrency("INR");
  const [quantityInput, setQuantityInput] = useState(String(service?.minQuantity ?? 100));
  const [link, setLink] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const quantity = Number(quantityInput || 0);
  const quantityError = service ? validateQuantity(quantity, service) : "Service unavailable";
  const linkError = link.trim() ? validateCampaignLink(link, linkRules["instagram-likes"]) : "";
  const total = calculateServiceTotal("instagram-likes", quantity);
  const presets = useMemo(() => service ? [...new Set([service.minQuantity, 1000, 5000, 10000].filter((value) => value >= service.minQuantity && value <= service.maxQuantity))] : [], []);
  if (!service) return null;

  const setQuantity = (value: number) => {
    const step = service.quantityStep ?? 1;
    const normalized = Math.round(value / step) * step;
    setQuantityInput(String(Math.max(service.minQuantity, Math.min(service.maxQuantity, normalized))));
  };
  const cleanInput = (value: string) => {
    const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setQuantityInput(digits);
  };
  const orderHref = `/dashboard/new-order?platform=instagram&service=instagram-likes&resume=1&quantity=${quantity}&link=${encodeURIComponent(link.trim())}`;
  const canContinue = Boolean(link.trim()) && !quantityError && !linkError;

  return <section id="packages" className="relative scroll-mt-24 overflow-hidden px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[130px]" />
    <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(28,28,30,.96),rgba(12,12,13,.98))] p-5 shadow-[0_32px_80px_-45px_rgba(255,122,0,.85)] sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Live order builder</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Build Your Instagram Likes Order</h2>
        <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">Choose your quantity and see your total instantly.</p>
        <div className="mt-8 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500 text-xs font-black text-white">1</span><div><p className="text-sm font-black text-white">Choose Likes</p><p className="text-xs text-[#9CA3AF]">Select a valid amount or set a custom quantity.</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{presets.map((value) => <button key={value} type="button" onClick={() => setQuantity(value)} className={`min-h-20 rounded-2xl border px-4 text-left transition motion-reduce:transition-none ${quantity === value ? "border-orange-400 bg-orange-500/15 text-white shadow-[0_12px_28px_-16px_rgba(255,122,0,.8)]" : "border-white/10 bg-white/[.03] text-[#D1D5DB] hover:-translate-y-0.5 hover:border-orange-400/55"}`}><span className="block text-lg font-black">{value.toLocaleString("en-IN")}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-orange-200">likes</span></button>)}</div>
        <label className="mt-7 block text-sm font-black text-white">Custom quantity
          <span className="mt-2 flex overflow-hidden rounded-2xl border border-orange-400/25 bg-[#0B0B0F] focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/15">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((Number(quantityInput) || service.minQuantity) - (service.quantityStep ?? 1))} className="grid min-h-14 w-14 place-items-center text-orange-300"><Minus className="h-4 w-4" /></button>
            <input aria-describedby="likes-range" value={quantityInput} onChange={(event) => cleanInput(event.target.value)} inputMode="numeric" className="min-w-0 flex-1 bg-transparent text-center text-base font-black text-white outline-none" />
            <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((Number(quantityInput) || service.minQuantity) + (service.quantityStep ?? 1))} className="grid min-h-14 w-14 place-items-center text-orange-300"><Plus className="h-4 w-4" /></button>
          </span>
        </label>
        <p id="likes-range" role={submitted && quantityError ? "alert" : undefined} className={`mt-2 text-xs ${submitted && quantityError ? "font-bold text-red-300" : "text-[#D1D5DB]"}`}>{submitted && quantityError ? quantityError : `Available from ${service.minQuantity.toLocaleString("en-IN")} to ${service.maxQuantity.toLocaleString("en-IN")} likes.`}</p>
        <div className="mt-8 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500 text-xs font-black text-white">2</span><div><p className="text-sm font-black text-white">Your public Instagram post or reel URL</p><p className="text-xs text-[#9CA3AF]">No password is needed.</p></div></div>
        <label className="mt-4 block"><span className="sr-only">Your public Instagram post or reel URL</span><span className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0B0F] px-4 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/15"><Link2 className="h-5 w-5 shrink-0 text-orange-300" /><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://instagram.com/p/..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777]" /></span></label>
        <p role={submitted && (linkError || !link.trim()) ? "alert" : undefined} className={`mt-2 text-xs ${submitted && (linkError || !link.trim()) ? "font-bold text-red-300" : "text-[#D1D5DB]"}`}>{submitted && !link.trim() ? "Your public Instagram post or reel URL is required." : linkError || "Use the exact public post or reel link. Keep it accessible while the order is processing."}</p>
      </article>
      <aside className="h-fit rounded-[30px] border border-orange-400/25 bg-[linear-gradient(145deg,#21140b,#111)] p-5 shadow-[0_28px_62px_-36px_rgba(255,122,0,.75)] lg:sticky lg:top-24 sm:p-6">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Live order summary</p><h3 className="mt-2 text-xl font-black text-white">Instagram Likes</h3></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg text-white">♥</span></div>
        <dl className="mt-6 space-y-4 text-sm">{[["Quantity", quantity > 0 ? quantity.toLocaleString("en-IN") : "—"], ["Live rate", `${formatCurrency(service.pricePer1000, currency)} / 1K`], ["Delivery", service.deliveryTime], ["Refill", service.refillPolicy], ["Link status", link.trim() && !linkError ? "Ready" : "Add public link"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-[#9CA3AF]">{label}</dt><dd className={`max-w-[60%] text-right font-bold ${label === "Link status" && value === "Ready" ? "text-emerald-300" : "text-white"}`}>{value}</dd></div>)}</dl>
        <div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs font-bold text-[#D1D5DB]">Current Total</p><p className="mt-1 text-3xl font-black text-white">{quantityError ? "—" : formatCurrency(total, currency)}</p></div>
        {canContinue ? <Link href={orderHref} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.75)]">Continue to Secure Order <ArrowRight className="h-4 w-4" /></Link> : <button type="button" onClick={() => setSubmitted(true)} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">Continue to Secure Order <ArrowRight className="h-4 w-4" /></button>}
        <p className="mt-4 flex items-center gap-2 text-xs text-[#D1D5DB]"><LockKeyhole className="h-4 w-4 text-emerald-300" />No password required. Public link only.</p>
      </aside>
    </div>
  </section>;
}
