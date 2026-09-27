import Link from "next/link";
import { ArrowRight, CheckCircle2, Hash, Link2, ShieldCheck } from "lucide-react";
import { buildOrderRequirementCopy } from "@/lib/seo/order-requirements-intent";

function money(value:number){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value);
}

export default function OrderRequirementsIntentSection({
  serviceName,
  minQuantity,
  maxQuantity,
  quantityStep = 1,
  destination,
  pricePer1000,
  orderHref,
  tone = "dark",
}:{
  serviceName:string;
  minQuantity:number;
  maxQuantity:number;
  quantityStep?:number;
  destination:string;
  pricePer1000:number|null;
  orderHref:string;
  tone?:"dark"|"light";
}){
  const copy=buildOrderRequirementCopy({serviceName,minQuantity,maxQuantity,quantityStep,destination});
  const dark=tone==="dark";
  const minimumTotal=copy.validLimits && pricePer1000 && Number.isFinite(pricePer1000) && pricePer1000>0
    ? Math.round(((pricePer1000 * (copy.minQuantity || 0)) / 1000) * 100) / 100
    : null;

  return <section className={dark?"border-y border-white/10 bg-[#0d0f14] px-4 py-16 text-white sm:px-6 lg:px-8":"bg-white/70 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"}>
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
        <div>
          <p className={dark?"text-xs font-black uppercase tracking-[.16em] text-orange-300":"text-xs font-black uppercase tracking-[.16em] text-orange-600"}>Order requirements</p>
          <h2 className={dark?"mt-3 max-w-3xl text-3xl font-black tracking-tight text-white":"mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#0B0B0F]"}>{copy.heading}</h2>
          <p className={dark?"mt-4 max-w-3xl text-sm leading-7 text-slate-300":"mt-4 max-w-3xl text-sm leading-7 text-[#111827]"}>
            Check the active quantity limits and required public destination before payment. Final limits, availability and the exact total shown in the live order flow remain authoritative.
          </p>

          {copy.validLimits ? <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className={dark?"rounded-2xl border border-white/10 bg-white/[.035] p-5":"rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"}>
              <Hash className="h-5 w-5 text-orange-500"/>
              <p className={dark?"mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-200":"mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-700"}>Minimum order</p>
              <p className={dark?"mt-2 text-2xl font-black text-white":"mt-2 text-2xl font-black text-[#0B0B0F]"}>{copy.minQuantity?.toLocaleString("en-IN")}</p>
              {minimumTotal!==null?<p className={dark?"mt-2 text-xs text-slate-400":"mt-2 text-xs text-[#374151]"}>Approx. {money(minimumTotal)} at the current public per-1K rate.</p>:null}
            </article>
            <article className={dark?"rounded-2xl border border-white/10 bg-white/[.035] p-5":"rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"}>
              <Hash className="h-5 w-5 text-orange-500"/>
              <p className={dark?"mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-200":"mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-700"}>Maximum order</p>
              <p className={dark?"mt-2 text-2xl font-black text-white":"mt-2 text-2xl font-black text-[#0B0B0F]"}>{copy.maxQuantity?.toLocaleString("en-IN")}</p>
              <p className={dark?"mt-2 text-xs text-slate-400":"mt-2 text-xs text-[#374151]"}>Large orders still use the current service limits at checkout.</p>
            </article>
            <article className={dark?"rounded-2xl border border-white/10 bg-white/[.035] p-5":"rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"}>
              <CheckCircle2 className="h-5 w-5 text-emerald-500"/>
              <p className={dark?"mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-200":"mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-700"}>Quantity step</p>
              <p className={dark?"mt-2 text-2xl font-black text-white":"mt-2 text-2xl font-black text-[#0B0B0F]"}>{copy.quantityStep===1?"Any whole number":`Every ${copy.quantityStep}`}</p>
              <p className={dark?"mt-2 text-xs text-slate-400":"mt-2 text-xs text-[#374151]"}>The live order builder validates the quantity before checkout.</p>
            </article>
          </div>:<div className={dark?"mt-6 rounded-2xl border border-white/10 bg-white/[.035] p-5 text-sm text-slate-300":"mt-6 rounded-2xl border border-orange-100 bg-white p-5 text-sm text-[#111827]"}>
            This service uses protected live catalog limits. Open the order flow to review the current minimum and maximum.
          </div>}

          <Link href={orderHref} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
            Check current quantity limits <ArrowRight className="h-4 w-4"/>
          </Link>
        </div>

        <aside className={dark?"rounded-[2rem] border border-white/10 bg-black/20 p-6":"rounded-[2rem] border border-orange-100 bg-[#FFF8F1] p-6"}>
          <p className={dark?"text-[10px] font-black uppercase tracking-[.14em] text-slate-400":"text-[10px] font-black uppercase tracking-[.14em] text-orange-700"}>Eligible destination</p>
          <div className={dark?"mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-5":"mt-4 rounded-2xl border border-orange-100 bg-white p-5"}>
            <Link2 className="h-5 w-5 text-orange-500"/>
            <h3 className={dark?"mt-3 text-base font-black text-white":"mt-3 text-base font-black text-[#0B0B0F]"}>{destination}</h3>
            <p className={dark?"mt-2 text-xs leading-6 text-slate-400":"mt-2 text-xs leading-6 text-[#374151]"}>Use the exact public destination required by this service and keep it accessible while the order is processing.</p>
          </div>
          <div className={dark?"mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/[.05] p-5":"mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"}>
            <ShieldCheck className="h-5 w-5 text-emerald-500"/>
            <h3 className={dark?"mt-3 text-sm font-black text-emerald-100":"mt-3 text-sm font-black text-emerald-900"}>Public link only</h3>
            <p className={dark?"mt-2 text-xs leading-6 text-emerald-100/70":"mt-2 text-xs leading-6 text-emerald-800"}>Never submit a password, OTP, recovery code or private account login. Incorrect or inaccessible links can delay or prevent processing.</p>
          </div>
        </aside>
      </div>
    </div>
  </section>;
}
