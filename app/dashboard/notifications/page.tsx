"use client";

import Link from "next/link";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Notice = { id: string; title: string; message: string; href: string | null; read_at: string | null; created_at: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { const response = await fetch("/api/notifications", { cache: "no-store" }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setItems(payload.data || []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Notifications could not be loaded."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const markAll = async () => { const response = await fetch("/api/notifications/read-all", { method: "POST" }); if (response.ok) setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))); else setError("Notifications could not be updated."); };
  const mark = async (id: string) => { const response = await fetch(`/api/notifications/${id}`, { method: "PATCH" }); if (response.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item)); };
  const unread = items.filter((item) => !item.read_at).length;
  return <main className="mx-auto max-w-4xl px-4 py-6 pb-28 sm:px-6 lg:px-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-400">Account updates</p><h1 className="mt-2 text-3xl font-black text-white">Notifications</h1><p className="mt-2 text-sm text-slate-300">Real order, refund, and support activity for your account.</p></div><button type="button" disabled={!unread} onClick={() => void markAll()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-100 disabled:opacity-40"><CheckCheck className="h-4 w-4" />Mark all as read</button></div>{loading ? <div className="grid min-h-60 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-orange-300" /></div> : error ? <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-100">{error}</div> : items.length ? <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">{items.map((item) => <Link key={item.id} href={item.href || "/dashboard"} onClick={() => { if (!item.read_at) void mark(item.id); }} className={`block border-b border-white/[.07] p-5 last:border-0 hover:bg-orange-500/[.06] ${item.read_at ? "" : "bg-orange-500/[.05]"}`}><div className="flex gap-3"><span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.read_at ? "bg-slate-600" : "bg-orange-400"}`} /><div><h2 className="font-bold text-white">{item.title}</h2><p className="mt-1 text-sm leading-6 text-slate-300">{item.message}</p><time className="mt-2 block text-xs text-slate-500">{new Date(item.created_at).toLocaleString("en-IN")}</time></div></div></Link>)}</section> : <section className="mt-6 grid min-h-64 place-items-center rounded-3xl border border-white/10 bg-[#111111] p-8 text-center"><div><Bell className="mx-auto h-8 w-8 text-orange-300" /><h2 className="mt-4 font-bold text-white">No notifications yet</h2><p className="mt-2 text-sm text-slate-400">Order and support updates will appear here.</p></div></section>}</main>;
}
