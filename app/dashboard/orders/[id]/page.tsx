"use client";

import { AlertTriangle, ArrowLeft, Check, Clipboard, Clock3, Copy, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { customerOrderServices } from "@/lib/order-service-experience";
import PlatformIcon from "@/components/PlatformIcon";

type Order = {
  id: string; link: string; quantity: number; charge: number; unit_price: number | null; status: string;
  created_at: string; service_name: string | null; platform: string | null; package_name: string | null;
  starting_count: number | null; current_count: number | null; delivered_count: number | null;
  remaining_count: number | null; progress_percent: number | null; refill_eligible: boolean;
  refill_requested_at: string | null; payment_status: string | null;
  services: { name?: string; delivery_time?: string; refill_policy?: string } | null;
};

const statusTone: Record<string, string> = {
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-200", processing: "border-orange-400/30 bg-orange-500/10 text-orange-200",
  in_progress: "border-orange-400/30 bg-orange-500/10 text-orange-200", partial: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
  completed: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200", cancelled: "border-red-400/30 bg-red-500/10 text-red-200",
  failed: "border-red-400/30 bg-red-500/10 text-red-200", refunded: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  refill_requested: "border-orange-400/30 bg-orange-500/10 text-orange-200", refilling: "border-orange-400/30 bg-orange-500/10 text-orange-200",
};

function displayId(id: string) {
  const seed = Number.parseInt(id.replace(/-/g, "").slice(0, 8), 16);
  return `SR-${String(Math.abs(seed % 900000) + 1000).padStart(4, "0")}`;
}

export default function CustomerOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { currency } = usePreferredCurrency("INR");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    void createClient().from("orders").select("id,link,quantity,charge,unit_price,status,created_at,service_name,platform,package_name,starting_count,current_count,delivered_count,remaining_count,progress_percent,refill_eligible,refill_requested_at,payment_status,services(name,delivery_time,refill_policy)").eq("id", id).single().then(({ data, error: queryError }) => {
      setOrder(data as unknown as Order | null);
      setError(queryError ? "This order could not be loaded." : "");
      setLoading(false);
    });
  }, [id]);

  const reorder = useMemo(() => {
    if (!order) return null;
    const name = order.service_name || order.services?.name || "";
    const service = customerOrderServices.find((item) => item.name.toLowerCase() === name.toLowerCase())
      ?? customerOrderServices.find((item) => item.platform === order.platform?.toLowerCase() && name.toLowerCase().includes(item.code.split("-").pop() || ""));
    if (!service) return null;
    return `/dashboard/new-order?${new URLSearchParams({ platform: service.platform, service: service.code, link: order.link, quantity: String(order.quantity), resume: "1" })}`;
  }, [order]);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  };

  if (loading) return <main className="min-h-[calc(100vh-5rem)] bg-[#050505] p-5 text-white"><div className="mx-auto max-w-6xl rounded-3xl border border-orange-400/20 bg-[#111111] p-12 text-center text-[#D1D5DB]">Loading order details…</div></main>;
  if (!order || error) return <main className="min-h-[calc(100vh-5rem)] bg-[#050505] p-5 text-white"><div className="mx-auto max-w-3xl rounded-3xl border border-red-400/25 bg-[#111111] p-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-red-300" /><p className="mt-3 font-bold">{error}</p><Link href="/dashboard/orders" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 font-bold">Back to orders</Link></div></main>;

  const orderId = displayId(order.id);
  const serviceName = order.service_name || order.services?.name || "Growth service";
  const platform = order.platform || "Other";
  const terminal = ["partial", "cancelled", "refunded", "failed"].includes(order.status);
  const stage = order.status === "completed" ? 4 : order.status === "in_progress" || order.status === "partial" ? 3 : order.status === "processing" ? 2 : 1;
  const supportHref = `/dashboard/support?order=${encodeURIComponent(orderId)}&platform=${encodeURIComponent(platform)}&service=${encodeURIComponent(serviceName)}&status=${encodeURIComponent(order.status)}`;

  return <main className="min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,.14),transparent_34%),#050505] px-4 pb-28 pt-5 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/orders" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300"><ArrowLeft className="h-4 w-4" />Back to orders</Link>
      <section className="mt-3 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Order ID</p><div className="mt-2 flex items-center gap-2"><h1 className="truncate text-2xl font-black text-orange-300 sm:text-3xl">{orderId}</h1><button type="button" aria-label="Copy order ID" onClick={() => void copy(orderId, "id")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5"><Copy className="h-4 w-4" /></button></div><p className="mt-3 text-sm text-[#D1D5DB]">Created {new Date(order.created_at).toLocaleString("en-IN")}</p></div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-black capitalize ${statusTone[order.status] || "border-white/15 bg-white/5 text-[#D1D5DB]"}`}><Clock3 className="h-4 w-4" />{order.status.replaceAll("_", " ")}</span>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0B0F] p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15"><PlatformIcon platform={platform} className="h-6 w-6" /></span><div className="min-w-0"><p className="text-xs font-bold capitalize text-orange-300">{platform}</p><h2 className="truncate text-lg font-black">{serviceName}</h2><p className="mt-1 text-xs text-[#9CA3AF]">Estimated delivery: {order.services?.delivery_time || "Not specified"}</p></div></div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-6"><h2 className="text-lg font-black">Order information</h2><dl className="mt-4 grid grid-cols-2 gap-3">{[["Quantity ordered", order.quantity.toLocaleString("en-IN")],["Quantity delivered", order.delivered_count === null ? "Unavailable" : order.delivered_count.toLocaleString("en-IN")],["Remaining", order.remaining_count === null ? "Unavailable" : order.remaining_count.toLocaleString("en-IN")],["Rate", order.unit_price === null ? "Unavailable" : `${formatCurrency(order.unit_price, currency)} / 1K`],["Final total", formatCurrency(order.charge, currency)],["Payment", order.payment_status || "Wallet / paid"],["Refill", order.refill_eligible ? (order.services?.refill_policy || "Eligible") : "Not eligible"],["Support", "Available"]].map(([label,value]) => <div key={String(label)} className="min-w-0 rounded-2xl bg-[#0B0B0F] p-3"><dt className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">{label}</dt><dd className="mt-1.5 break-words text-sm font-bold">{value}</dd></div>)}</dl><div className="mt-3 rounded-2xl bg-[#0B0B0F] p-3"><dt className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">Public link</dt><dd className="mt-2 flex min-w-0 items-center gap-2"><a href={order.link} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 break-all text-sm text-orange-200">{order.link}</a><button type="button" aria-label="Copy public link" onClick={() => void copy(order.link, "link")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15"><Clipboard className="h-4 w-4" /></button></dd></div>{copied ? <p className="mt-3 text-xs font-bold text-emerald-300">Copied to clipboard.</p> : null}</article>

        <article className="rounded-3xl border border-orange-400/20 bg-[#111111] p-5 sm:p-6"><h2 className="text-lg font-black">Delivery progress</h2>{order.progress_percent !== null ? <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]" style={{width:`${Math.max(0,Math.min(100,order.progress_percent))}%`}} /></div><p className="mt-2 text-right text-xs font-bold text-orange-200">{order.progress_percent.toFixed(1)}% delivered</p></div> : null}<ol className="mt-5 space-y-3">{["Order Confirmed","Processing","Delivery in Progress","Completed"].map((label,index) => { const done = !terminal && stage > index; const active = !terminal && stage === index + 1; return <li key={label} className={`flex items-center gap-3 rounded-xl border p-3 ${done ? "border-emerald-400/25 bg-emerald-500/10" : active ? "border-orange-400/30 bg-orange-500/10" : "border-white/10 bg-white/[.03]"}`}>{done ? <Check className="h-4 w-4 text-emerald-300" /> : <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[9px]">{index+1}</span>}<span className="text-sm font-bold">{label}</span></li>;})}</ol>{terminal ? <div className={`mt-4 rounded-xl border p-3 text-sm font-bold ${statusTone[order.status]}`}>Order status: {order.status.replaceAll("_"," ")}</div> : null}<p className="mt-4 text-xs leading-5 text-[#9CA3AF]">Delivery times are estimates and may vary based on service availability.</p></article>
      </section>

      <section className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 sm:grid-cols-3 sm:p-5">{reorder ? <Link href={reorder} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black"><RefreshCw className="h-4 w-4" />Reorder</Link> : null}<Link href={supportHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-200"><ExternalLink className="h-4 w-4" />Get Support</Link>{order.refill_eligible ? <Link href={`${supportHref}&category=Refill%20request`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-200">{order.refill_requested_at ? "View Refill Request" : "Request Refill"}</Link> : <p className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] px-4 text-center text-xs text-[#9CA3AF]">This order is not currently eligible for refill.</p>}</section>
    </div>
  </main>;
}
