"use client";

import Link from "next/link";
import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Order = { id: string; public_order_id: string | null; service_name: string | null; platform: string | null; status: string | null; created_at: string };
type Ticket = { id: string; subject: string; status: string; updated_at: string };

export default function DashboardSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!open || orders.length || loading) return;
    setLoading(true); setError("");
    void Promise.all([fetch("/api/orders?limit=30", { cache: "no-store" }), fetch("/api/support/tickets", { cache: "no-store" })]).then(async ([orderResponse, ticketResponse]) => {
      const orderPayload = await orderResponse.json(); const ticketPayload = await ticketResponse.json();
      if (!orderResponse.ok || !ticketResponse.ok) throw new Error("Search is unavailable right now.");
      setOrders(orderPayload.data || []); setTickets(ticketPayload.data || []);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Search is unavailable right now.")).finally(() => setLoading(false));
  }, [loading, open, orders.length]);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase(); if (!term) return [];
    return [
      ...orders.filter((item) => `${item.id} ${item.public_order_id || ""} ${item.service_name || ""} ${item.platform || ""}`.toLowerCase().includes(term)).slice(0, 6).map((item) => ({ id: `order:${item.id}`, title: item.service_name || "Growth service", detail: `Order #${(item.public_order_id || item.id).slice(0, 8).toUpperCase()} · ${item.status || "pending"}`, href: `/dashboard/orders/${item.id}` })),
      ...tickets.filter((item) => `${item.id} ${item.subject}`.toLowerCase().includes(term)).slice(0, 6).map((item) => ({ id: `ticket:${item.id}`, title: item.subject, detail: `Support ticket #${item.id.slice(0, 8).toUpperCase()} · ${item.status}`, href: "/dashboard/support" })),
    ];
  }, [orders, query, tickets]);
  return <div><button type="button" onClick={() => setOpen(true)} aria-label="Search orders and support tickets" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-slate-100 transition hover:border-orange-400/35 hover:bg-orange-500/[.08] sm:w-auto sm:px-3"><Search className="h-4 w-4" /><span className="ml-2 hidden text-xs font-bold sm:inline">Search</span></button>{open ? <div role="dialog" aria-modal="true" aria-label="Dashboard search" className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"><section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-orange-400/25 bg-[#111111] shadow-2xl"><div className="flex items-center gap-3 border-b border-white/10 p-3"><Search className="h-5 w-5 shrink-0 text-orange-300" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an order ID, service, or support ticket" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /><button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10"><X className="h-4 w-4" /></button></div><div className="max-h-[55vh] overflow-y-auto p-3">{loading ? <div className="grid min-h-40 place-items-center"><LoaderCircle className="h-5 w-5 animate-spin text-orange-300" /></div> : error ? <p className="p-4 text-sm text-red-200">{error}</p> : !query.trim() ? <p className="p-4 text-sm text-slate-400">Type to search your own orders and support tickets. Press Esc to close.</p> : results.length ? <div className="space-y-1">{results.map((item) => <Link key={item.id} href={item.href} onClick={() => setOpen(false)} className="block rounded-xl p-3 transition hover:bg-orange-500/[.08]"><p className="text-sm font-bold text-white">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.detail}</p></Link>)}</div> : <p className="p-4 text-sm text-slate-400">No matching orders or tickets.</p>}</div><p className="border-t border-white/10 px-4 py-3 text-[10px] text-slate-500">Ctrl/Cmd + K to search</p></section></div> : null}</div>;
}
