"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Copy, ExternalLink, LoaderCircle, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import { track } from "@/lib/analytics/events";

type BankTransferDetails = { enabled: boolean; accountName: string; bankName: string; accountType: string; accountNumber: string; ifsc: string; branch: string };
type Props = {
  intentId: string; clientRequestId: string; serviceCode: string; serviceName: string; quantity: number; link: string;
  total: number; orderTotal: number; walletApplied: number; upiId: string; payeeName: string;
  bankTransfer: BankTransferDetails; usdtTrc20Address: string; usdtAmount: number | null;
};

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
function paymentReference() { const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, ""); return `SR-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }

export default function DirectUpiPaymentClient(props: Props) {
  const { intentId, clientRequestId, serviceCode, serviceName, quantity, link, total, orderTotal, walletApplied, upiId, payeeName, bankTransfer, usdtTrc20Address, usdtAmount } = props;
  const router = useRouter();
  const [reference] = useState(paymentReference);
  const [method, setMethod] = useState<"upi" | "bank_transfer" | "usdt_trc20">("upi");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  const submissionInFlight = useRef(false);
  const confirmationRef = useRef<HTMLFormElement>(null);
  const [showPaymentDock, setShowPaymentDock] = useState(true);
  useEffect(() => {
    const form = confirmationRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) => setShowPaymentDock(!entry.isIntersecting), { rootMargin: "0px 0px -140px 0px" });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const payableLabel = money(total);
  const upiHref = useMemo(() => {
    const params = new URLSearchParams({ pa: upiId, pn: payeeName || "SocialRUSH", am: total.toFixed(2), cu: "INR", tn: `SocialRUSH ${reference}`.slice(0, 80) });
    return `upi://pay?${params.toString()}`;
  }, [upiId, payeeName, total, reference]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiHref)}`;
  const whatsappMessage = `Hi SocialRUSH, I need help completing my payment.\n\nReference: ${reference}\nService: ${serviceName}\nQuantity: ${quantity.toLocaleString("en-IN")}\nOrder total: ${money(orderTotal)}\nWallet applied: ${money(walletApplied)}\nRemaining payment: ${payableLabel}\n\nPlease help me complete this order.`;
  const whatsappHref = `https://wa.me/918860330771?text=${encodeURIComponent(whatsappMessage)}`;

  async function copy(label: string, value: string) {
    try { await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1600); }
    catch { setError("Clipboard unavailable. Select and copy the value manually."); }
  }
  async function submit() {
    if (submissionInFlight.current) return;
    const clean = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,80}$/.test(clean)) { setError(method === "usdt_trc20" ? "Enter a valid transaction hash / TxID." : "Enter a valid UTR / Transaction ID."); return; }
    submissionInFlight.current = true;
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/orders/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId, clientRequestId, paymentReference: reference, paymentMethod: method, utr: clean, expectedWalletApplied: walletApplied }) });
      const payload = await response.json() as { data?: { public_order_id: string }; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to confirm your order.");
      setSuccess(payload.data.public_order_id);
      track("utr_submitted", { service_code: serviceCode, method, value: total, wallet_applied: walletApplied, order_total: orderTotal });
      window.setTimeout(() => router.push("/dashboard/orders"), 1600);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to confirm your order."); }
    finally { submissionInFlight.current = false; setSubmitting(false); }
  }

  if (success) return <section className="mx-auto max-w-2xl rounded-[28px] border border-emerald-400/20 bg-[#0d1118] p-8 text-center text-white"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300"/><h1 className="mt-4 text-2xl font-black">Payment submitted</h1><p className="mt-2 text-zinc-300">Order {success} has been received for verification. Do not pay again.</p></section>;

  const paymentLinkClass = "flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-3 text-sm font-black text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300";
  const copyButton = "inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold text-orange-300 focus-visible:outline focus-visible:outline-orange-300";
  const startPayment = () => track("payment_started", { service_code: serviceCode, method: "upi", value: total });

  return <section className="mx-auto max-w-3xl rounded-2xl border border-orange-400/20 bg-[#0b0f15] text-white shadow-2xl sm:rounded-3xl">
    <header className="border-b border-white/10 px-3 py-3 sm:px-6 sm:py-5">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Final step · Payment</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Pay {payableLabel}</h1><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-200"><LockKeyhole className="h-3 w-3" aria-hidden="true"/>Secure checkout</span></div>
    </header>
    <div className="space-y-3 p-3 sm:space-y-4 sm:p-6">
      <div className="rounded-xl border border-white/10 bg-white/[.035] px-3 py-2 sm:p-4">
        <dl className="space-y-1 text-sm tabular-nums"><div className="flex justify-between gap-2"><dt className="text-zinc-400">Order total</dt><dd className="font-bold">{money(orderTotal)}</dd></div><div className="flex justify-between gap-2 text-emerald-300"><dt>Wallet applied</dt><dd className="font-bold">−{money(walletApplied)}</dd></div><div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2"><dt className="font-black">Pay now</dt><dd className="text-xl font-black text-orange-300">{payableLabel}</dd></div></dl>
        <details className="mt-2 border-t border-white/10 text-xs"><summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-zinc-300"><span className="min-w-0 truncate">{serviceName} · {quantity.toLocaleString("en-IN")}</span><span className="shrink-0 text-orange-300">Details +</span></summary><div className="space-y-2 pb-2"><p className="break-words">Reference: <strong>{reference}</strong></p><div className="flex min-w-0 items-center gap-1"><span className="min-w-0 flex-1 truncate" title={link}>{link}</span><button type="button" className={copyButton} onClick={()=>void copy("link",link)} aria-label="Copy order link">{copied==="link"?"Copied":"Copy link"}</button></div><details><summary className="min-h-11 cursor-pointer py-3 text-orange-300">View full link</summary><p className="break-all text-zinc-400">{link}</p></details></div></details>
      </div>
      <div role="group" aria-label="Payment method" className="grid grid-cols-3 gap-1.5">{([["upi","UPI"],["bank_transfer","Bank Transfer"],["usdt_trc20","USDT TRC20"]] as const).map(([value,label])=><button key={value} id={`tab-${value}`} aria-pressed={method===value} aria-controls="payment-method-panel" type="button" disabled={submitting||(value==="bank_transfer"&&!bankTransfer.enabled)||(value==="usdt_trc20"&&!usdtAmount)} onClick={()=>{setMethod(value);setError("");track("payment_method_selected",{service_code:serviceCode,method:value});}} className={`min-h-11 rounded-xl border px-1 text-[11px] font-black focus-visible:outline focus-visible:outline-orange-300 sm:text-sm ${method===value?"border-orange-400 bg-orange-500/15 text-orange-200":"border-white/10 text-zinc-300"} disabled:opacity-40`}>{label}</button>)}</div>
      <div id="payment-method-panel" role="region" aria-labelledby={`tab-${method}`} className="rounded-xl border border-white/10 bg-[#0e131b] p-3 sm:p-5">
        {method==="upi"&&<>
          <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-black">Scan to pay</h2><button type="button" onClick={()=>void copy("amount",total.toFixed(2))} className={copyButton} aria-label="Copy amount"><span className="text-lg tabular-nums">{payableLabel}</span>{copied==="amount"?<span className="text-[10px]">Copied</span>:<Copy className="h-3.5 w-3.5" aria-hidden="true"/>}</button></div>
          <div className="mt-1 grid items-center gap-3 sm:grid-cols-[minmax(220px,280px)_1fr] sm:gap-5">
            <div className="mx-auto aspect-square w-[220px] max-w-full rounded-xl bg-white p-2 min-[390px]:w-[240px] sm:w-full"><img src={qrUrl} width={320} height={320} alt={`UPI QR for ${payableLabel}`} className="aspect-square h-full w-full"/></div>
            <div className="min-w-0 space-y-2"><div className="flex items-center gap-2 rounded-lg border border-white/10 px-2"><div className="min-w-0 flex-1"><p className="text-[10px] text-zinc-400">UPI ID</p><p className="break-all text-xs font-bold sm:text-sm">{upiId}</p></div><button type="button" onClick={()=>void copy("upi",upiId)} className={copyButton} aria-label="Copy UPI ID"><Copy className="h-3.5 w-3.5" aria-hidden="true"/>{copied==="upi"?"Copied":"Copy"}</button></div>
              <a href={upiHref} onClick={startPayment} className={paymentLinkClass}>Pay {payableLabel} · Open UPI <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true"/></a><p className="text-center text-[11px] text-zinc-400">Use any UPI app, or scan from another device.</p>
            </div>
          </div>
        </>}
        {method==="bank_transfer"&&<><h2 className="font-black">Transfer exactly <span className="text-orange-300">{payableLabel}</span></h2><dl className="mt-3 space-y-1 text-sm">{[["Account",bankTransfer.accountName],["Bank",bankTransfer.bankName],["Account number",bankTransfer.accountNumber],["IFSC",bankTransfer.ifsc],["Branch",bankTransfer.branch]].map(([k,v])=><div key={k} className="flex justify-between gap-3 border-b border-white/5 py-2"><dt className="text-zinc-400">{k}</dt><dd className="min-w-0 break-words text-right font-bold">{v}</dd></div>)}</dl></>}
        {method==="usdt_trc20"&&<><h2 className="font-black">Send <span className="text-orange-300">{usdtAmount?.toFixed(2)} USDT</span></h2><p className="mt-2 text-xs font-bold text-red-200">TRC20 ONLY. Do not use another network.</p><p className="mt-3 break-all rounded-lg border border-white/10 p-3 font-mono text-sm">{usdtTrc20Address}</p></>}
      </div>
      <form ref={confirmationRef} onSubmit={e=>{e.preventDefault();if(!submitting)void submit();}} className="rounded-xl border border-white/10 bg-[#0e131b] p-3 sm:p-5">
        <h2 className="font-black">Already paid?</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Enter your transaction reference after payment so we can verify it.</p>
        <label htmlFor="payment-utr" className="mt-3 block text-xs font-bold text-zinc-300">{method==="usdt_trc20"?"Transaction hash / TxID":"UTR / Transaction ID"}</label>
        <div className="mt-2 flex gap-2"><input id="payment-utr" value={utr} disabled={submitting} onChange={e=>setUtr(e.target.value.slice(0,80))} aria-describedby={error?"payment-error":undefined} aria-invalid={Boolean(error)} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Enter transaction reference" className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 text-base outline-none focus:border-orange-400"/><button type="button" disabled={submitting} onClick={async()=>{try{const value=await navigator.clipboard.readText();setUtr(value.trim().replace(/\s+/g,"").slice(0,80));}catch{setError("Clipboard unavailable. Paste your reference into the field.");}}} className="min-h-12 rounded-xl border border-white/10 px-3 text-xs font-black">Paste</button></div>
        {error&&<p id="payment-error" role="alert" className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}
        <button type="submit" disabled={submitting} className={`${paymentLinkClass} mt-3 w-full disabled:opacity-60`}>{submitting?<><LoaderCircle className="h-4 w-4 animate-spin"/>Submitting...</>:<>Submit payment <ArrowRight className="h-4 w-4" aria-hidden="true"/></>}</button>
      </form>
      <section className="rounded-xl border border-orange-400/20 bg-orange-500/[.04] p-3 sm:p-5" aria-labelledby="payment-help-title"><div className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" aria-hidden="true"/><div className="min-w-0 flex-1"><h2 id="payment-help-title" className="font-black">Having trouble completing payment?</h2><p className="mt-1 text-xs leading-5 text-zinc-300">Your order details are saved. You don't need to start again. If money was deducted, don't pay twice.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><button type="button" onClick={()=>{setMethod(method==="upi"?"bank_transfer":"upi");setError("");track("payment_recovery_method_selected",{service_code:serviceCode,from_method:method});document.getElementById("payment-method-panel")?.scrollIntoView({behavior:"smooth",block:"center"});}} className="min-h-12 rounded-xl border border-white/10 px-3 text-sm font-black text-white">Try another payment method</button><a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={()=>track("payment_support_whatsapp",{service_code:serviceCode,method,value:total,wallet_applied:walletApplied})} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 text-sm font-black text-black"><MessageCircle className="h-4 w-4" aria-hidden="true"/>Get help on WhatsApp</a></div><p className="mt-2 text-[11px] leading-5 text-zinc-400">Not sure if payment went through? Check your UPI or bank app first. If you were charged, submit the transaction reference above or contact us.</p></div></div></section>
      <p role="status" aria-live="polite" className="sr-only">{copied ? "Copied to clipboard" : ""}</p>
      <div className="flex items-start gap-2 px-1 text-[11px] leading-5 text-emerald-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/>Pay only {payableLabel}. Never share your UPI PIN or OTP.</div>
    </div>
    {method==="upi"&&showPaymentDock&&!submitting&&<div data-payment-dock className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[64] border-t border-orange-400/20 bg-[#0b0f15]/95 px-3 py-2 backdrop-blur md:hidden"><a href={upiHref} onClick={startPayment} className={`${paymentLinkClass} mx-auto max-w-lg`}>Pay {payableLabel} with UPI <ExternalLink className="h-4 w-4" aria-hidden="true"/></a></div>}
  </section>;
}
