"use client";

import Link from "next/link";
import { LoaderCircle, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardDialog from "./DashboardDialog";

type Order = { id: string; public_order_id: string | null; service_name: string | null; platform: string | null; status: string | null; created_at: string };
type Ticket = { id: string; subject: string; status: string; updated_at: string };

export default function DashboardSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!document.querySelector('[role="dialog"][aria-modal="true"]')) setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true); setError("");
    void Promise.all([fetch("/api/orders?limit=30", { cache: "no-store", signal: controller.signal }), fetch("/api/support/tickets", { cache: "no-store", signal: controller.signal })]).then(async ([orderResponse, ticketResponse]) => {
      const orderPayload = await orderResponse.json(); const ticketPayload = await ticketResponse.json();
      if (!orderResponse.ok || !ticketResponse.ok) throw new Error("Search is unavailable right now.");
      if (!controller.signal.aborted) { setOrders(orderPayload.data || []); setTickets(ticketPayload.data || []); }
    }).catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Search is unavailable right now."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, attempt]);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase(); if (!term) return [];
    return [
      ...orders.filter((item) => `${item.id} ${item.public_order_id || ""} ${item.service_name || ""} ${item.platform || ""}`.toLowerCase().includes(term)).slice(0, 6).map((item) => ({ id: `order:${item.id}`, title: item.service_name || "Growth service", detail: `Order #${(item.public_order_id || item.id).slice(0, 8).toUpperCase()} · ${item.status || "pending"}`, href: `/dashboard/orders/${item.id}` })),
      ...tickets.filter((item) => `${item.id} ${item.subject}`.toLowerCase().includes(term)).slice(0, 6).map((item) => ({ id: `ticket:${item.id}`, title: item.subject, detail: `Support ticket #${item.id.slice(0, 8).toUpperCase()} · ${item.status}`, href: "/dashboard/support" })),
    ];
  }, [orders, query, tickets]);
  return <div>
    <button type="button" onClick={event => { event.currentTarget.focus(); setOpen(true); }} aria-label="Search orders and support tickets" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-slate-100 transition hover:border-orange-400/35 hover:bg-orange-500/[.08] sm:w-auto sm:px-3"><Search className="h-4 w-4" /><span className="ml-2 hidden text-xs font-bold sm:inline">Search</span></button>
    <DashboardDialog open={open} label="Dashboard search" onClose={close} initialFocusRef={searchRef}>
      <div className="flex items-center gap-3 border-b border-white/10 p-3">
        <Search className="h-5 w-5 shrink-0 text-orange-300" aria-hidden="true" />
        <input ref={searchRef} aria-label="Search your orders and support tickets" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search an order ID, service, or support ticket" className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500" />
        <button type="button" onClick={close} aria-label="Close search" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-3" aria-busy={loading}>
        {loading ? <div role="status" className="grid min-h-40 place-items-center"><LoaderCircle className="h-5 w-5 animate-spin text-orange-300" aria-label="Loading search" /></div>
          : error ? <div role="alert" className="p-4 text-sm text-red-200"><p>{error}</p><button type="button" onClick={() => { searchRef.current?.focus(); setAttempt(value => value + 1); }} className="mt-3 min-h-11 rounded-lg border border-white/15 px-4 font-semibold text-orange-200">Try again</button></div>
          : !query.trim() ? <p className="p-4 text-sm text-slate-400">Type to search your own orders and support tickets. Press Esc to close.</p>
          : results.length ? <div className="space-y-1">{results.map(item => <Link key={item.id} href={item.href} onClick={close} className="block rounded-xl p-3 transition hover:bg-orange-500/[.08]"><p className="text-sm font-bold text-white">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.detail}</p></Link>)}</div>
          : <p role="status" className="p-4 text-sm text-slate-400">No matching orders or tickets.</p>}
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-[10px] text-slate-500">Ctrl/Cmd + K to search</p>
    </DashboardDialog>
  </div>;
}
