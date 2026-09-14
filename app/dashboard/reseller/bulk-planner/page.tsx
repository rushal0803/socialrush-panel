"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { calculateServiceTotal } from "@/lib/service-pricing";

type ServiceCode = typeof activeSmmServices[number]["code"];
type Row = { id: string; client: string; serviceCode: ServiceCode; quantity: string; link: string };

function newRow(): Row {
  return { id: crypto.randomUUID(), client: "", serviceCode: activeSmmServices[0].code, quantity: "", link: "" };
}

export default function BulkPlannerPage() {
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);

  const total = useMemo(() => rows.reduce((sum, row) => {
    const quantity = Number(row.quantity || 0);
    return sum + (quantity > 0 ? calculateServiceTotal(row.serviceCode, quantity) : 0);
  }, 0), [rows]);

  const update = (id: string, patch: Partial<Row>) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));

  return (
    <main className="dashboard-premium-page mx-auto w-full max-w-[1500px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
      <section className="rounded-[1.5rem] border border-orange-400/20 bg-[linear-gradient(125deg,#17150f,#101218_60%)] p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Reseller bulk operations</p>
        <h1 className="mt-2 text-3xl font-black">Bulk Planner</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Prepare several client jobs in one place, review the current catalog estimate, then open each job in the existing single-service order flow. This planner does not create or charge multiple orders automatically.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard/reseller" className="btn-dashboard-secondary px-4 text-sm">← Reseller Hub</Link><Link href="/dashboard/clients" className="btn-dashboard-secondary px-4 text-sm">Manage clients</Link></div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="dashboard-glass p-4"><p className="text-[10px] font-black uppercase tracking-[.13em] text-slate-500">Planned jobs</p><p className="mt-2 text-2xl font-black">{rows.length}</p></article>
        <article className="dashboard-glass p-4"><p className="text-[10px] font-black uppercase tracking-[.13em] text-slate-500">Current estimate</p><p className="mt-2 text-2xl font-black">₹{total.toLocaleString("en-IN")}</p></article>
        <article className="dashboard-glass p-4"><p className="text-[10px] font-black uppercase tracking-[.13em] text-slate-500">Execution model</p><p className="mt-2 text-sm font-black text-orange-200">One verified checkout per job</p></article>
      </section>

      <section className="mt-5 space-y-3">
        {rows.map((row, index) => {
          const service = activeSmmServices.find((item) => item.code === row.serviceCode);
          const quantity = Number(row.quantity || 0);
          const validQuantity = Boolean(service && Number.isInteger(quantity) && quantity >= service.minQuantity && quantity <= service.maxQuantity);
          const estimate = service && validQuantity ? calculateServiceTotal(service.code, quantity) : 0;
          const href = service && validQuantity && row.link.trim()
            ? `/dashboard/new-order?service=${encodeURIComponent(service.code)}&quantity=${quantity}&link=${encodeURIComponent(row.link.trim())}&resume=1`
            : "";
          return <article key={row.id} className="dashboard-glass p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.13em] text-orange-300">Job {index + 1}</p><p className="mt-1 text-sm font-black">{row.client || "Unlabelled client job"}</p></div>{rows.length > 1 ? <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-red-300" aria-label={`Remove job ${index + 1}`}><Trash2 className="h-4 w-4" /></button> : null}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1.2fr_.6fr_1.5fr_auto]">
              <input value={row.client} onChange={(event) => update(row.id, { client: event.target.value })} className="dashboard-input" placeholder="Client / brand label" />
              <select value={row.serviceCode} onChange={(event) => update(row.id, { serviceCode: event.target.value as ServiceCode, quantity: "" })} className="dashboard-input">{activeSmmServices.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
              <input value={row.quantity} onChange={(event) => update(row.id, { quantity: event.target.value.replace(/\D/g, "") })} inputMode="numeric" className="dashboard-input" placeholder="Quantity" />
              <input value={row.link} onChange={(event) => update(row.id, { link: event.target.value })} className="dashboard-input" placeholder="Public profile / post / video link" />
              {href ? <Link href={href} className="btn-dashboard-primary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-xs">Open order <ArrowRight className="h-3.5 w-3.5" /></Link> : <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-xs font-bold text-slate-500">Complete row</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">{service ? <><span>Min {service.minQuantity.toLocaleString("en-IN")} · Max {service.maxQuantity.toLocaleString("en-IN")}</span><span>Delivery: {service.deliveryTime}</span><span>Estimate: <b className="text-white">₹{estimate.toLocaleString("en-IN")}</b></span></> : null}</div>
          </article>;
        })}
      </section>

      <button type="button" onClick={() => setRows((current) => [...current, newRow()])} className="btn-dashboard-secondary mt-4 inline-flex min-h-11 items-center gap-2 px-4 text-sm"><Plus className="h-4 w-4" />Add another job</button>
      <p className="mt-4 max-w-3xl text-xs leading-5 text-slate-500">Estimates use the current catalog loaded by this page and can change before checkout. Live-only or temporarily unavailable services may not appear here. Each job still uses the normal SocialRUSH validation, payment and order-creation flow.</p>
    </main>
  );
}
