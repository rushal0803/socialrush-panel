"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Link2, LockKeyhole, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";
import { calculateServiceTotal, validateQuantity } from "@/lib/service-pricing";
import { getServiceById } from "@/lib/smm-service-catalog";

const service = getServiceById("instagram-followers");

export default function InstagramFollowersOrderPanel() {
  const { currency } = usePreferredCurrency("INR");
  const [quantity, setQuantity] = useState(service?.minQuantity ?? 100);
  const [link, setLink] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const qtyError = service ? validateQuantity(quantity, service) : "Service unavailable";
  const linkError = link.trim() ? validateCampaignLink(link, linkRules["instagram-followers"]) : "";
  const total = calculateServiceTotal("instagram-followers", quantity);
  const choices = useMemo(() => {
    if (!service) return [];
    return [...new Set([service.minQuantity, 1000, 5000, 10000].filter((value) => value >= service.minQuantity && value <= service.maxQuantity))];
  }, []);
  const orderHref = `/dashboard/new-order?platform=instagram&service=followers&resume=1&quantity=${quantity}&link=${encodeURIComponent(link.trim())}`;
  const canContinue = !qtyError && !linkError && Boolean(link.trim());

  if (!service) return null;
  const updateQuantity = (value: number) => {
    const step = service.quantityStep ?? 1;
    setQuantity(Math.max(service.minQuantity, Math.min(service.maxQuantity, Math.round(value / step) * step)));
  };

  return (
    <section id="packages" className="relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[130px]" />
      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <article className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(28,28,30,.96),rgba(12,12,13,.98))] p-5 shadow-[0_32px_80px_-45px_rgba(255,122,0,.85)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Build your order</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Build Your Instagram Growth Order</h2>
          <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">Choose your quantity and see your total instantly.</p>
          <div className="mt-8 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500 text-xs font-black text-white">1</span><div><p className="text-sm font-black text-white">Choose Followers</p><p className="text-xs text-[#9CA3AF]">Select a quick amount or set a custom quantity.</p></div></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {choices.map((value) => <button key={value} type="button" onClick={() => updateQuantity(value)} className={`group min-h-20 rounded-2xl border px-4 text-left transition duration-200 motion-reduce:transition-none ${quantity === value ? "border-orange-400 bg-[linear-gradient(145deg,rgba(255,122,0,.26),rgba(255,176,0,.08))] text-white shadow-[0_12px_28px_-16px_rgba(255,122,0,.8)]" : "border-white/10 bg-white/[.03] text-[#D1D5DB] hover:-translate-y-0.5 hover:border-orange-400/55"}`}><span className="block text-lg font-black">{value.toLocaleString("en-IN")}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-orange-200">followers</span></button>)}
          </div>
          <label className="mt-7 block text-sm font-black text-white">Custom quantity
            <span className="mt-2 flex overflow-hidden rounded-2xl border border-orange-400/25 bg-[#0B0B0F] focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/15">
              <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(quantity - (service.quantityStep ?? 1))} className="grid min-h-14 w-14 place-items-center text-orange-300"><Minus className="h-4 w-4" /></button>
              <input type="number" inputMode="numeric" min={service.minQuantity} max={service.maxQuantity} step={service.quantityStep ?? 1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 0)} className="min-w-0 flex-1 bg-transparent text-center text-base font-black text-white outline-none" />
              <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(quantity + (service.quantityStep ?? 1))} className="grid min-h-14 w-14 place-items-center text-orange-300"><Plus className="h-4 w-4" /></button>
            </span>
          </label>
          {showErrors && qtyError ? <p role="alert" className="mt-2 text-xs font-bold text-red-300">{qtyError}</p> : <p className="mt-2 text-xs text-[#D1D5DB]">Available from {service.minQuantity.toLocaleString("en-IN")} to {service.maxQuantity.toLocaleString("en-IN")} followers.</p>}
          <div className="mt-8 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500 text-xs font-black text-white">2</span><div><p className="text-sm font-black text-white">Instagram Profile</p><p className="text-xs text-[#9CA3AF]">Provide the public profile for delivery.</p></div></div>
          <label className="mt-5 block text-sm font-black text-white">Your public Instagram profile URL
            <span className="mt-2 flex rounded-2xl border border-white/10 bg-[#0B0B0F] focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/15"><span className="grid w-12 place-items-center text-orange-300"><Link2 className="h-5 w-5" /></span><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://instagram.com/yourprofile" className="min-h-14 min-w-0 flex-1 bg-transparent pr-4 text-base text-white outline-none placeholder:text-[#6B7280]" /></span>
          </label>
          <p className="mt-2 text-xs leading-6 text-[#D1D5DB]">Use a public profile URL. No password is required and the profile must remain public during delivery.</p>
          {showErrors && (!link.trim() || linkError) ? <p role="alert" className="mt-2 text-xs font-bold text-red-300">{linkError || "Enter your public Instagram profile URL to continue."}</p> : null}
        </article>
        <aside className="rounded-[32px] border border-orange-400/30 bg-[linear-gradient(160deg,#20150d_0%,#151515_42%,#101010_100%)] p-6 shadow-[0_32px_80px_-42px_rgba(255,122,0,.65)] lg:sticky lg:top-28 lg:h-fit">
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Order summary</p><h3 className="mt-2 text-xl font-black text-white">Instagram Followers</h3></div><CheckCircle2 className="h-6 w-6 text-orange-300" /></div>
          <dl className="mt-6 space-y-3.5 text-sm"><Row label="Quantity" value={quantity.toLocaleString("en-IN")} /><Row label="Live rate" value={`${formatCurrency(service.pricePer1000, currency)} / 1K`} /><Row label="Delivery" value={service.deliveryTime} /><Row label="Refill" value={service.refillPolicy} /><Row label="Profile status" value={link.trim() && !linkError ? "Ready" : "Needed"} /></dl>
          <div className="mt-6 rounded-2xl border border-orange-400/20 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-200">Your total</p><p className="mt-2 text-3xl font-black tracking-tight text-white">{formatCurrency(total, currency)}</p></div>
          <Link href={canContinue ? orderHref : "#packages"} onClick={(event) => { if (!canContinue) { event.preventDefault(); setShowErrors(true); } }} aria-disabled={!canContinue} className={`mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition ${canContinue ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white hover:-translate-y-0.5" : "bg-white/10 text-[#9CA3AF]"}`}>Continue to Secure Order <ArrowRight className="h-4 w-4" /></Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#D1D5DB]"><LockKeyhole className="h-4 w-4 text-orange-300" />Secure checkout · No password required</p>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className="flex items-start justify-between gap-4"><dt className="text-[#9CA3AF]">{label}</dt><dd className={`max-w-[58%] break-words text-right ${strong ? "text-base font-black text-white" : "font-bold text-[#F3F4F6]"}`}>{value}</dd></div>; }
