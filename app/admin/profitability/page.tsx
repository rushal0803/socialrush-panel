"use client";

import { useEffect, useMemo, useState } from "react";
import { smmServiceCatalog } from "@/lib/smm-service-catalog";

const STORAGE_KEY = "socialrush-admin-supplier-costs-v1";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
}

export default function ProfitabilityPage() {
  const services = useMemo(
    () => smmServiceCatalog.filter((service) => service.isActive && service.pricePer1000 > 0),
    [],
  );
  const [serviceCode, setServiceCode] = useState(services[0]?.code ?? "");
  const [quantity, setQuantity] = useState(1000);
  const [supplierCost, setSupplierCost] = useState(0);
  const [paymentFeePct, setPaymentFeePct] = useState(0);
  const [riskAllowancePct, setRiskAllowancePct] = useState(5);
  const [savedCosts, setSavedCosts] = useState<Record<string, number>>({});

  const service = services.find((item) => item.code === serviceCode) ?? services[0];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedCosts(JSON.parse(raw));
    } catch {
      // Local-only convenience; calculations still work if storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!service) return;
    setSupplierCost(savedCosts[service.code] ?? 0);
    setQuantity(Math.max(service.minQuantity || 1000, 1000));
  }, [service?.code, savedCosts, service]);

  if (!service) return <main className="p-6 text-white">No active priced services are available.</main>;

  const units = Math.max(0, quantity) / 1000;
  const revenue = units * service.pricePer1000;
  const supplierTotal = units * Math.max(0, supplierCost);
  const paymentFee = revenue * (Math.max(0, paymentFeePct) / 100);
  const riskAllowance = revenue * (Math.max(0, riskAllowancePct) / 100);
  const contributionProfit = revenue - supplierTotal - paymentFee - riskAllowance;
  const marginPct = revenue > 0 ? (contributionProfit / revenue) * 100 : 0;
  const costCoverage = revenue > 0 ? (supplierTotal / revenue) * 100 : 0;
  const health = marginPct >= 35 ? "Healthy" : marginPct >= 20 ? "Watch" : "Low margin";

  function saveSupplierCost() {
    const next = { ...savedCosts, [service.code]: Math.max(0, supplierCost) };
    setSavedCosts(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the current-session value even if persistence is unavailable.
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-400">SocialRUSH $1M Project · Day 3</p>
        <h1 className="mt-2 text-3xl font-black text-white">Profit Protection</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">Check contribution profit before changing prices or scaling a service. Supplier costs stay in this browser only and are not sent to checkout.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
          <h2 className="text-lg font-bold text-white">Margin calculator</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Service</span>
              <select value={service.code} onChange={(e) => setServiceCode(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white">
                {services.map((item) => <option key={item.code} value={item.code}>{item.platform.toUpperCase()} · {item.name}</option>)}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Selling price / 1K</span>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-bold text-white">{money(service.pricePer1000)}</div>
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Supplier cost / 1K</span>
              <input type="number" min="0" step="0.01" value={supplierCost} onChange={(e) => setSupplierCost(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white" />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Quantity</span>
              <input type="number" min={service.minQuantity} max={service.maxQuantity || undefined} step={service.quantityStep ?? 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white" />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Payment fee %</span>
              <input type="number" min="0" step="0.1" value={paymentFeePct} onChange={(e) => setPaymentFeePct(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Refund / refill / support allowance %</span>
              <input type="number" min="0" step="0.1" value={riskAllowancePct} onChange={(e) => setRiskAllowancePct(Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white" />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={saveSupplierCost} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-black text-slate-950">Save supplier cost locally</button>
            <span className="text-xs text-slate-500">Saved only on this device/browser.</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Metric title="Order revenue" value={money(revenue)} />
          <Metric title="Supplier cost" value={money(supplierTotal)} />
          <Metric title="Payment fee" value={money(paymentFee)} />
          <Metric title="Risk allowance" value={money(riskAllowance)} />
          <Metric title="Contribution profit" value={money(contributionProfit)} highlight />
          <Metric title="Contribution margin" value={`${marginPct.toFixed(1)}%`} highlight />

          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Margin health</p>
                <p className="mt-1 text-2xl font-black text-white">{health}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Supplier cost uses</p>
                <p className="text-lg font-bold text-white">{costCoverage.toFixed(1)}% of revenue</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${Math.min(100, Math.max(0, marginPct))}%` }} />
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">Day 3 working target: protect roughly 35%+ contribution margin where possible. This calculator is decision support only; it does not alter public prices, supplier routing, or checkout.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-orange-400/30 bg-orange-500/10" : "border-white/10 bg-white/[.04]"}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
