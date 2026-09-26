"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, IndianRupee, RotateCcw, ShieldCheck } from "lucide-react";
import { calculateServiceCost, getServiceCostOption, serviceCostOptions } from "@/lib/tools/service-cost-calculator";

const field = "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ServiceCostCalculatorWorkspace() {
  const [serviceId, setServiceId] = useState("instagram-followers");
  const [quantity, setQuantity] = useState("1000");
  const [manualRate, setManualRate] = useState("");
  const service = getServiceCostOption(serviceId);
  const rate = service.pricePer1000 ?? Number(manualRate.replace(/,/g, ""));
  const parsedQuantity = Number(quantity.replace(/,/g, ""));
  const result = useMemo(() => calculateServiceCost(rate, parsedQuantity), [rate, parsedQuantity]);

  const reset = () => {
    setServiceId("instagram-followers");
    setQuantity("1000");
    setManualRate("");
  };

  return <div className="rounded-[1.5rem] border border-orange-400/30 bg-[linear-gradient(145deg,#171b26,#0c0f16)] p-5 shadow-[0_24px_65px_rgba(0,0,0,.28)] sm:p-6">
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-400/10 text-orange-300"><Calculator className="h-5 w-5"/></span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-200">INR cost calculator</p>
        <h2 className="mt-1 text-xl font-black text-white">Estimate a service quantity total</h2>
      </div>
    </div>

    <label className="mt-6 block text-sm font-bold text-slate-200">Service
      <select className={field} value={serviceId} onChange={(event) => { setServiceId(event.target.value); setManualRate(""); }}>
        {serviceCostOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </label>

    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-bold text-slate-200">Quantity
        <input className={field} type="number" min="1" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="1000"/>
      </label>
      <label className="block text-sm font-bold text-slate-200">Rate per 1,000
        <div className="relative">
          <IndianRupee className="pointer-events-none absolute left-3 top-[1.22rem] h-4 w-4 text-slate-500"/>
          <input
            className={`${field} pl-9`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={service.pricePer1000 ?? manualRate}
            readOnly={service.pricePer1000 !== null}
            onChange={(event) => setManualRate(event.target.value)}
            placeholder={service.pricingMode === "live" ? "Enter current live rate" : undefined}
          />
        </div>
      </label>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      {[500,1000,2500,5000,10000].map((amount) => <button key={amount} type="button" onClick={() => setQuantity(String(amount))} className="min-h-9 rounded-full border border-white/10 bg-white/[.04] px-3 text-xs font-bold text-slate-200 hover:border-orange-400/40">{amount.toLocaleString("en-IN")} {service.unit}</button>)}
    </div>

    {service.pricingMode === "confirmed" ? <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>Using SocialRUSH&apos;s confirmed public per-1K rate for this service. Final checkout remains authoritative.</p> : <p className="mt-4 text-xs leading-5 text-amber-200">This service uses live pricing. Open the service page, copy the current per-1K rate, and enter it above to calculate a planning total.</p>}

    <div className="mt-6 rounded-2xl border border-orange-400/25 bg-orange-400/[.07] p-5">
      <p className="text-xs font-black uppercase tracking-[.13em] text-orange-200">Estimated planning total</p>
      <p className="mt-2 text-4xl font-black tracking-tight text-white">{result ? money(result.total) : "—"}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-black/20 p-3"><span className="text-slate-400">Quantity</span><b className="mt-1 block text-sm text-white">{Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity.toLocaleString("en-IN") : "—"} {service.unit}</b></div>
        <div className="rounded-xl bg-black/20 p-3"><span className="text-slate-400">Cost per {service.unit.replace(/s$/,"")}</span><b className="mt-1 block text-sm text-white">{result ? money(result.perUnit) : "—"}</b></div>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-3">
      <Link href={service.href} className="btn-primary min-h-12 gap-2">Check current service <ArrowRight className="h-4 w-4"/></Link>
      <button type="button" onClick={reset} className="btn-secondary min-h-12 gap-2"><RotateCcw className="h-4 w-4"/>Reset</button>
    </div>

    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"/>This calculator is for planning only. It does not place an order, lock a price, or guarantee availability, delivery, retention, engagement, ranking, revenue, or other platform outcomes.</p>
  </div>;
}
