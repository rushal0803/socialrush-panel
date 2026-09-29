"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clipboard, Clock3, Copy, ExternalLink, Layers3, RefreshCw, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { customerOrderServices } from "@/lib/order-service-experience";
import PlatformIcon from "@/components/PlatformIcon";
import { customerOrderStages, customerOrderStatus, customerStatusClass } from "@/lib/customer-order-status";
import { formatPublicOrderId, orderWhatsAppHref } from "@/lib/orders/public-reference";
import { track } from "@/lib/analytics/events";
import { postOrderRecommendations } from "@/lib/cro/revenue-bundles";
import { buildRepeatOrderVariantHref } from "@/lib/cro/repeat-order";
import { orderGuidanceClass, orderTrackingGuidance } from "@/lib/orders/customer-tracking";

type Order = {
  id: string; public_order_id: string; link: string; quantity: number; charge: number; unit_price: number | null; status: string;
  created_at: string; service_name: string | null; platform: string | null; package_name: string | null;
  starting_count: number | null; current_count: number | null; delivered_count: number | null;
  remaining_count: number | null; progress_percent: number | null; refill_eligible: boolean;
  refill_requested_at: string | null; payment_status: string | null;
  updated_at: string | null; failed_reason: string | null; refund_credit_note: string | null;
  services: { name?: string; delivery_time?: string; refill_policy?: string } | null;
};

export default function CustomerOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { currency } = usePreferredCurrency("INR");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [refillOpen, setRefillOpen] = useState(false);
  const [refillNote, setRefillNote] = useState("");
  const [refillMessage, setRefillMessage] = useState("");
  const [submittingRefill, setSubmittingRefill] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) { setError("This order could not be loaded."); setLoading(false); return; }
      const { data, error: queryError } = await supabase.from("orders").select("id,public_order_id,link,quantity,charge,unit_price,status,created_at,updated_at,failed_reason,refund_credit_note,service_name,platform,package_name,starting_count,current_count,delivered_count,remaining_count,progress_percent,refill_eligible,refill_requested_at,payment_status,services(name,delivery_time,refill_policy)").eq("id", id).eq("user_id", auth.user.id).single();
      setOrder(data as unknown as Order | null);
      setError(queryError ? "This order could not be loaded." : "");
      setLoading(false);
    });
  }, [id]);

  const orderService = useMemo(() => {
    if (!order) return null;
    const name = order.service_name || order.services?.name || "";
    return customerOrderServices.find((item) => item.name.toLowerCase() === name.toLowerCase())
      ?? customerOrderServices.find((item) => item.platform === order.platform?.toLowerCase() && name.toLowerCase().includes(item.code.split("-").pop() || ""))
      ?? null;
  }, [order]);

  const repeatLinks = useMemo(() => {
    if (!order || !orderService) return { sameTarget: null, newTarget: null };
    const input = { serviceName: orderService.name, platform: orderService.platform, quantity: order.quantity, link: order.link };
    return {
      sameTarget: buildRepeatOrderVariantHref(input, customerOrderServices, true),
      newTarget: buildRepeatOrderVariantHref(input, customerOrderServices, false),
    };
  }, [order, orderService]);

  const complementaryServices = useMemo(
    () => orderService ? postOrderRecommendations(orderService.code, customerOrderServices, 2) : [],
    [orderService],
  );

  useEffect(() => {
    if (order?.status !== "completed") return;
    for (const recommendation of complementaryServices) {
      track("order_success_recommendation_view", {
        service_code: recommendation.service.code,
        platform: recommendation.service.platform,
        surface: "completed_order",
      });
    }
  }, [complementaryServices, order?.status]);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  };

  const requestRefill = async () => {
    if (!order) return;
    setSubmittingRefill(true); setRefillMessage("");
    try { const response = await fetch(`/api/orders/${order.id}/refill`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: refillNote }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setOrder({ ...order, refill_requested_at: new Date().toISOString() }); setRefillOpen(false); setRefillMessage("Your refill request has been received. You can follow updates here or in support."); } catch (cause) { setRefillMessage(cause instanceof Error ? cause.message : "Unable to submit your refill request."); } finally { setSubmittingRefill(false); }
  };

  if (loading) return <main className="min-h-[calc(100vh-5rem)] bg-[#050505] p-5 text-white"><div className="mx-auto max-w-6xl rounded-3xl border border-orange-400/20 bg-[#111111] p-12 text-center text-[#D1D5DB]">Loading order details…</div></main>;
  if (!order || error) return <main className="min-h-[calc(100vh-5rem)] bg-[#050505] p-5 text-white"><div className="mx-auto max-w-3xl rounded-3xl border border-red-400/25 bg-[#111111] p-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-red-300" /><p className="mt-3 font-bold">{error}</p><Link href="/dashboard/orders" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 font-bold">Back to orders</Link></div></main>;

  const orderId = formatPublicOrderId(order.public_order_id);
  const serviceName = order.service_name || order.services?.name || "Growth service";
  const platform = order.platform || "Other";
  const statusInfo = customerOrderStatus(order.status);
  const stages = customerOrderStages(order.status);
  const guidance = orderTrackingGuidance(order.status);
  const supportHref = `/dashboard/support?orderId=${order.id}&order=${encodeURIComponent(orderId)}&platform=${encodeURIComponent(platform)}&service=${encodeURIComponent(serviceName)}&status=${encodeURIComponent(order.status)}`;
  const receiptAvailable = ["paid", "completed"].includes(String(order.payment_status || "").toLowerCase()) || ["completed", "processing", "in_progress", "partial", "refilling", "refill_requested"].includes(order.status);

  return <main className="min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,.14),transparent_34%),#050505] px-4 pb-28 pt-5 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard/orders" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300"><ArrowLeft className="h-4 w-4" />Back to orders</Link>
      <section className="mt-3 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Secure customer order</p><div className="mt-2 flex items-center gap-2"><h1 className="truncate text-2xl font-black text-orange-300 sm:text-3xl">{orderId}</h1><button type="button" aria-label="Copy order ID" onClick={() => void copy(orderId, "id")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5"><Copy className="h-4 w-4" /></button></div><p className="mt-3 text-sm text-[#D1D5DB]">Created {new Date(order.created_at).toLocaleString("en-IN")}{order.updated_at ? ` · Updated ${new Date(order.updated_at).toLocaleString("en-IN")}` : ""}</p></div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${customerStatusClass(order.status)}`}><Clock3 className="h-4 w-4" />{statusInfo.label}</span>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0B0F] p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15"><PlatformIcon platform={platform} className="h-6 w-6" /></span><div className="min-w-0"><p className="text-xs font-bold capitalize text-orange-300">{platform}</p><h2 className="truncate text-lg font-black">{serviceName}</h2><p className="mt-1 text-xs text-[#9CA3AF]">Estimated delivery: {order.services?.delivery_time || "Not specified"}</p></div></div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-6"><h2 className="text-lg font-black">Order information</h2><dl className="mt-4 grid grid-cols-2 gap-3">{[["Quantity ordered", order.quantity.toLocaleString("en-IN")],["Quantity delivered", order.delivered_count === null ? "Unavailable" : order.delivered_count.toLocaleString("en-IN")],["Remaining", order.remaining_count === null ? "Unavailable" : order.remaining_count.toLocaleString("en-IN")],["Rate", order.unit_price === null ? "Unavailable" : `${formatCurrency(order.unit_price, currency)} / 1K`],["Final total", formatCurrency(order.charge, currency)],["Payment", order.payment_status || "Wallet / paid"],["Refill", order.refill_eligible ? (order.services?.refill_policy || "Eligible") : "Not eligible"],["Support", "Available"]].map(([label,value]) => <div key={String(label)} className="min-w-0 rounded-2xl bg-[#0B0B0F] p-3"><dt className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">{label}</dt><dd className="mt-1.5 break-words text-sm font-bold">{value}</dd></div>)}</dl><div className="mt-3 rounded-2xl bg-[#0B0B0F] p-3"><dt className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">Public link</dt><dd className="mt-2 flex min-w-0 items-center gap-2"><a href={order.link} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 break-all text-sm text-orange-200">{order.link}</a><button type="button" aria-label="Copy public link" onClick={() => void copy(order.link, "link")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15"><Clipboard className="h-4 w-4" /></button></dd></div>{copied ? <p className="mt-3 text-xs font-bold text-emerald-300">Copied to clipboard.</p> : null}</article>

        <article className="rounded-3xl border border-orange-400/20 bg-[#111111] p-5 sm:p-6"><h2 className="text-lg font-black">Delivery timeline</h2>{order.progress_percent !== null ? <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]" style={{width:`${Math.max(0,Math.min(100,order.progress_percent))}%`}} /></div><p className="mt-2 text-right text-xs font-bold text-orange-200">{order.progress_percent.toFixed(1)}% delivered</p></div> : null}<ol className="mt-5 space-y-3">{stages.map(({label,state},index) => <li key={label} className={`flex items-center gap-3 rounded-xl border p-3 ${state === "done" ? "border-emerald-400/25 bg-emerald-500/10" : state === "current" ? "border-orange-400/30 bg-orange-500/10" : "border-white/10 bg-white/[.03]"}`}>{state === "done" ? <Check className="h-4 w-4 text-emerald-300" /> : <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[9px]">{index+1}</span>}<span className="text-sm font-bold">{label}</span></li>)}</ol>{["cancelled","refunded","failed"].includes(order.status) ? <div className={`mt-4 rounded-xl border p-3 text-sm font-bold ${customerStatusClass(order.status)}`}>{statusInfo.label}{order.status === "failed" && order.failed_reason ? `: ${order.failed_reason}` : ""}</div> : null}<p className="mt-4 text-xs leading-5 text-[#9CA3AF]">Delivery times are estimates and may vary based on service availability.</p></article>
      </section>

      <section className={`mt-5 rounded-3xl border p-5 sm:p-6 ${orderGuidanceClass(guidance.tone)}`} aria-labelledby="what-next-title">
        <p className="text-[10px] font-black uppercase tracking-[.16em] opacity-75">What happens next</p>
        <h2 id="what-next-title" className="mt-2 text-xl font-black">{guidance.title}</h2>
        <p className="mt-3 text-sm leading-7 opacity-90">{guidance.summary}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] opacity-65">Your next step</p><p className="mt-2 text-sm font-bold leading-6">{guidance.action}</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] opacity-65">When to contact support</p><p className="mt-2 text-sm font-bold leading-6">{guidance.supportWindow}</p></div>
        </div>
        {order.starting_count !== null || order.current_count !== null ? <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Starting count",order.starting_count],["Current count",order.current_count],["Delivered",order.delivered_count],["Remaining",order.remaining_count]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-white/10 bg-black/15 p-3"><dt className="text-[9px] font-black uppercase tracking-[.12em] opacity-60">{label}</dt><dd className="mt-1 text-sm font-black">{typeof value==="number"?value.toLocaleString("en-IN"):"Updating"}</dd></div>)}</dl> : null}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="hidden" />
        <div className="hidden" />
      </section>

      <section className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 sm:grid-cols-3 sm:p-5">{repeatLinks.sameTarget && order.status === "completed" ? <Link href={repeatLinks.sameTarget} onClick={() => track("repeat_order_click", { platform: order.platform || "other", step: "order_again_same_target" })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black"><RefreshCw className="h-4 w-4" />Order Again · Same Target</Link> : null}{repeatLinks.newTarget && order.status === "completed" ? <Link href={repeatLinks.newTarget} onClick={() => track("repeat_order_click", { platform: order.platform || "other", step: "order_again_new_target" })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-200"><ArrowRight className="h-4 w-4" />Same Service · New Target</Link> : null}{receiptAvailable ? <a href={`/api/orders/${order.id}/invoice`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-200"><ReceiptText className="h-4 w-4" />View / Download Receipt</a> : null}<Link href={supportHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-200"><ExternalLink className="h-4 w-4" />Contact Support</Link><a href={orderWhatsAppHref(orderId)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-200">WhatsApp Support</a>{order.refill_eligible && order.status === "completed" && !order.refill_requested_at ? <button type="button" onClick={() => setRefillOpen(true)} className="min-h-12 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-200">Request Refill</button> : <p className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] px-4 text-center text-xs text-[#9CA3AF]">{order.refill_requested_at ? "Refill request received" : order.status === "cancelled" || order.status === "refunded" ? "Refills are not available for this order." : "This order is not currently eligible for refill."}</p>}</section>
      {order.status === "completed" && complementaryServices.length ? <section className="mt-5 rounded-3xl border border-orange-400/20 bg-[linear-gradient(135deg,rgba(255,122,0,.09),rgba(17,17,17,.98)_52%)] p-5 sm:p-6" aria-labelledby="continue-campaign-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-orange-300"><Layers3 className="h-4 w-4" />Continue this campaign</p><h2 id="continue-campaign-title" className="mt-2 text-xl font-black">Add a complementary service when it fits your goal.</h2><p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">These options come from the same platform campaign stack as your completed service. Each opens as a separate order, and you will enter the correct public target before payment.</p></div><Link href="/dashboard/campaign-stacks" onClick={() => track("campaign_stack_growth_path_click", { surface: "completed_order" })} className="inline-flex min-h-10 shrink-0 items-center gap-1 text-xs font-black text-orange-200">View campaign stacks <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{complementaryServices.map((recommendation) => {
          const href=`/dashboard/new-order?${new URLSearchParams({ platform: recommendation.service.platform, service: recommendation.service.code, quantity: String(recommendation.quantity), resume: "1" })}`;
          return <article key={recommendation.service.code} className="rounded-2xl border border-white/10 bg-black/25 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.13em] text-slate-500">{recommendation.bundleName}</p><h3 className="mt-1 truncate font-black text-white">{recommendation.service.name}</h3></div><PlatformIcon platform={recommendation.service.platform} className="h-5 w-5 shrink-0 text-orange-300" /></div><dl className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white/[.035] p-3"><dt className="text-[9px] font-black uppercase tracking-wider text-slate-500">Suggested quantity</dt><dd className="mt-1 font-black text-white">{recommendation.quantity.toLocaleString("en-IN")}</dd></div><div className="rounded-xl bg-white/[.035] p-3"><dt className="text-[9px] font-black uppercase tracking-wider text-slate-500">Current estimate</dt><dd className="mt-1 font-black text-white">{formatCurrency(recommendation.total, currency)}</dd></div></dl><p className="mt-3 text-[11px] leading-5 text-slate-400">The order builder rechecks the service, quantity, current price and target requirements before checkout.</p><Link href={href} onClick={() => track("order_success_recommendation_click", { service_code: recommendation.service.code, platform: recommendation.service.platform, surface: "completed_order" })} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-black text-orange-200 transition hover:border-orange-400/55 hover:bg-orange-500/15">Review this service <ArrowRight className="h-4 w-4" /></Link></article>;
        })}</div>
        <p className="mt-4 text-[10px] leading-4 text-slate-500">No bundle discount is assumed. The completed order’s public link is not copied because a complementary service may require a different profile, post, video, channel or page target.</p>
      </section> : null}
      {refillMessage ? <p role="status" className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-100">{refillMessage}</p> : null}
      {refillOpen ? <section role="dialog" aria-modal="true" aria-labelledby="refill-title" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-3xl border border-orange-400/30 bg-[#151515] p-5 shadow-2xl"><h2 id="refill-title" className="text-lg font-black">Review refill request</h2><p className="mt-2 text-sm text-[#D1D5DB]">{orderId} · {serviceName} · {order.quantity.toLocaleString("en-IN")}. This service is currently refill eligible. Our team will review your request; submitting does not promise a result.</p><label className="mt-4 block text-xs font-bold text-orange-200">Optional note<textarea maxLength={500} value={refillNote} onChange={(event) => setRefillNote(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm" placeholder="Describe the issue (optional)" /></label><div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => setRefillOpen(false)} className="min-h-11 rounded-xl border border-white/15">Cancel</button><button type="button" disabled={submittingRefill} onClick={() => void requestRefill()} className="min-h-11 rounded-xl bg-orange-500 font-bold disabled:opacity-60">{submittingRefill ? "Submitting…" : "Confirm request"}</button></div></section> : null}
      {order.status === "completed" ? <section className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-500/[.07] p-5"><h2 className="font-black">How did this order go?</h2><p className="mt-1 text-sm text-slate-300">Share feedback tied to this completed order. Reviews are moderated before publication.</p><Link href={`/dashboard/reviews/new?order=${order.id}`} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-amber-500 px-5 text-sm font-black text-black">Leave a verified review</Link></section> : null}
    </div>
  </main>;
}
