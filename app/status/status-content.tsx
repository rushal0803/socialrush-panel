"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { smmServiceCatalog } from "@/lib/smm-service-catalog";
import { serviceHealthLabels, serviceHealthTone, type ServiceHealth } from "@/lib/service-health";

type HealthPayload = { data?: Record<string, ServiceHealth>; error?: string };

export default function StatusContent() {
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/service-health", { cache: "no-store" });
      const payload = await response.json() as HealthPayload;
      if (!response.ok) throw new Error(payload.error || "Service health is unavailable.");
      setHealth(payload.data || {});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Service health is unavailable.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const services = useMemo(() => smmServiceCatalog.filter((service) => !service.requiresLiveCatalogFacts), []);
  const lastUpdated = useMemo(() => Object.values(health).map((item) => item.updatedAt).filter(Boolean).sort().at(-1), [health]);

  return <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_85%_0%,rgba(255,137,20,.16),transparent_35%),#111111] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">SocialRUSH status</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Service availability</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">This page reflects the current service-health notices maintained by SocialRUSH. It does not make assumptions about service availability or delivery.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400"><span>{lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleString("en-IN")}` : "No current status timestamp available."}</span><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 font-bold text-orange-200 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button></div>
      </header>
      {loading ? <div className="mt-5 grid min-h-64 place-items-center rounded-3xl border border-white/10 bg-[#111111]"><LoaderCircle className="h-6 w-6 animate-spin text-orange-300" /></div> : error ? <section className="mt-5 rounded-3xl border border-red-400/25 bg-red-500/[.08] p-6 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-red-200" /><h2 className="mt-3 font-black">Status is temporarily unavailable</h2><p className="mt-2 text-sm text-red-100">{error}</p><button type="button" onClick={() => void load()} className="mt-4 min-h-11 rounded-xl bg-orange-500 px-4 text-sm font-bold">Try again</button></section> : <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => { const item = health[service.code]; return <article key={service.code} className="rounded-2xl border border-white/10 bg-[#111111] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{service.name}</p><p className="mt-1 text-xs capitalize text-slate-400">{service.platform}</p></div>{item ? <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${serviceHealthTone[item.status]}`}>{item.acceptsNewOrders ? serviceHealthLabels[item.status] : "New orders paused"}</span> : <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[10px] font-black text-slate-400">No notice published</span>}</div>{item?.message ? <p className="mt-4 text-xs leading-5 text-slate-300">{item.message}</p> : <p className="mt-4 text-xs leading-5 text-slate-500">No customer-facing status notice is currently published for this service.</p>}{item?.updatedAt ? <p className="mt-3 text-[10px] text-slate-500">Updated {new Date(item.updatedAt).toLocaleString("en-IN")}</p> : null}</article>; })}</section>}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-5 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-emerald-300" /><p className="mt-2 text-sm font-bold">Need help with an existing order?</p><Link href="/dashboard/support" className="mt-2 inline-flex text-xs font-bold text-orange-300">Contact support</Link></section>
    </div>
  </main>;
}
