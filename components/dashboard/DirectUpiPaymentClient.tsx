"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Copy, ExternalLink, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
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

  const payableLabel = money(total);
  const upiHref = useMemo(() => {
    const params = new URLSearchParams({ pa: upiId, pn: payeeName || "SocialRUSH", am: total.toFixed(2), cu: "INR", tn: `SocialRUSH ${reference}`.slice(0, 80) });
    return `upi://pay?${params.toString()}`;
  }, [upiId, payeeName, total, reference]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiHref)}`;

  async function copy(label: string, value: string) { await navigator.clipboard.writeText(value).catch(() => undefined); setCopied(label); window.setTimeout(() => setCopied(""), 1200); }
  async function submit() {
    const clean = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,80}$/.test(clean)) { setError(method === "usdt_trc20" ? "Enter a valid transaction hash / TxID." : "Enter a valid UTR / Transaction ID."); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/orders/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId, clientRequestId, paymentReference: reference, paymentMethod: method, utr: clean, expectedWalletApplied: walletApplied }) });
      const payload = await response.json() as { data?: { public_order_id: string }; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to confirm your order.");
      setSuccess(payload.data.public_order_id);
      track("utr_submitted", { service_code: serviceCode, method, value: total, wallet_applied: walletApplied, order_total: orderTotal });
      window.setTimeout(() => router.push("/dashboard/orders"), 1600);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to confirm your order."); }
    finally { setSubmitting(false); }
  }

  if (success) return <section className="mx-auto max-w-2xl rounded-[28px] border border-emerald-400/20 bg-[#0d1118] p-8 text-center text-white"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300"/><h1 className="mt-4 text-2xl font-black">Payment submitted</h1><p className="mt-2 text-zinc-300">Order {success} has been received for verification. Do not pay again.</p></section>;

  return <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-orange-400/20 bg-[#0b0f15] text-white shadow-2xl">
    <div className="border-b border-white/10 p-5 sm:p-8"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-300">Final step · Payment</p><h1 className="mt-2 text-3xl font-black">Pay {payableLabel}</h1></div><span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200"><LockKeyhole className="h-4 w-4"/>Secure checkout</span></div></div>
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs font-black uppercase tracking-wider text-zinc-500">Order summary</p><h2 className="mt-1 text-lg font-black">{serviceName}</h2><div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm"><div className="flex justify-between"><span className="text-zinc-400">Order total</span><strong>{money(orderTotal)}</strong></div><div className="flex justify-between text-emerald-300"><span>Wallet balance applied</span><strong>− {money(walletApplied)}</strong></div><div className="flex justify-between border-t border-white/10 pt-3 text-base"><span className="font-black">Pay now</span><strong className="text-orange-300">{payableLabel}</strong></div></div><div className="mt-4 grid gap-3 text-xs text-zinc-400 sm:grid-cols-2"><p>Quantity: <strong className="text-white">{quantity.toLocaleString("en-IN")}</strong></p><p>Reference: <strong className="text-white">{reference}</strong></p><p className="break-all sm:col-span-2">Link: {link}</p></div></div>

      <div className="grid grid-cols-3 gap-2">{([['upi','UPI'],['bank_transfer','Bank Transfer'],['usdt_trc20','USDT TRC20']] as const).map(([value,label]) => <button key={value} type="button" disabled={(value==='bank_transfer'&&!bankTransfer.enabled)||(value==='usdt_trc20'&&!usdtAmount)} onClick={()=>{setMethod(value);setError('');track('payment_method_selected',{service_code:serviceCode,method:value});}} className={`min-h-12 rounded-xl border px-2 text-xs font-black ${method===value?'border-orange-400 bg-orange-500/10 text-orange-200':'border-white/10 text-zinc-300'} disabled:opacity-40`}>{label}</button>)}</div>

      {method === "upi" && <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-5"><h3 className="text-lg font-black">Pay exactly {payableLabel}</h3><p className="mt-1 text-sm text-zinc-400">Your ₹{walletApplied.toLocaleString('en-IN')} wallet credit is already deducted from the amount below.</p><div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]"><div className="rounded-xl bg-white p-3"><img src={qrUrl} alt={`UPI QR for ${payableLabel}`} className="w-full"/></div><div className="space-y-3"><div className="rounded-xl border border-white/10 p-4"><p className="text-xs text-zinc-500">UPI ID</p><p className="mt-1 break-all font-black">{upiId}</p><button onClick={()=>void copy('upi',upiId)} className="mt-2 text-xs font-bold text-orange-300"><Copy className="mr-1 inline h-3 w-3"/>{copied==='upi'?'Copied':'Copy UPI ID'}</button></div><div className="rounded-xl border border-orange-400/20 p-4"><p className="text-xs text-zinc-500">Exact amount</p><p className="mt-1 text-xl font-black text-orange-300">{payableLabel}</p><button onClick={()=>void copy('amount',total.toFixed(2))} className="mt-2 text-xs font-bold text-orange-300"><Copy className="mr-1 inline h-3 w-3"/>{copied==='amount'?'Copied':'Copy amount'}</button></div></div></div><a href={upiHref} onClick={()=>track('payment_started',{service_code:serviceCode,method:'upi',value:total})} className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black">Pay {payableLabel} · Open UPI <ExternalLink className="h-4 w-4"/></a></div>}

      {method === "bank_transfer" && <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-5"><h3 className="text-lg font-black">Transfer exactly {payableLabel}</h3><div className="mt-4 space-y-2 text-sm">{[["Account",bankTransfer.accountName],["Bank",bankTransfer.bankName],["Account number",bankTransfer.accountNumber],["IFSC",bankTransfer.ifsc],["Branch",bankTransfer.branch]].map(([k,v])=><div key={k} className="flex justify-between gap-3 border-b border-white/5 py-2"><span className="text-zinc-500">{k}</span><strong className="text-right">{v}</strong></div>)}</div></div>}

      {method === "usdt_trc20" && <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-5"><h3 className="text-lg font-black">Send {usdtAmount?.toFixed(2)} USDT</h3><p className="mt-2 text-xs font-bold text-red-200">TRC20 ONLY. Do not use ERC20, BEP20 or another network.</p><p className="mt-4 break-all rounded-xl border border-white/10 p-4 font-mono text-sm">{usdtTrc20Address}</p></div>}

      <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-5"><h3 className="font-black">After payment, enter your transaction reference</h3><p className="mt-1 text-sm text-zinc-400">We verify the external payment before processing. Your wallet portion will be applied once only.</p><div className="mt-4 flex gap-2"><input value={utr} onChange={e=>setUtr(e.target.value.slice(0,80))} placeholder={method==='usdt_trc20'?'Transaction hash / TxID':'UTR / Transaction ID'} className="min-h-14 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 outline-none focus:border-orange-400"/><button type="button" onClick={async()=>{const value=await navigator.clipboard.readText().catch(()=>"");setUtr(value.trim().replace(/\s+/g,'').slice(0,80));}} className="rounded-xl border border-white/10 px-4 text-xs font-black">Paste</button></div>{error&&<p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}<button disabled={submitting} onClick={()=>void submit()} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black disabled:opacity-60">{submitting?<><LoaderCircle className="h-4 w-4 animate-spin"/>Submitting...</>:<>Submit & Place Order <ArrowRight className="h-4 w-4"/></>}</button></div>
      <div className="flex items-start gap-2 rounded-xl bg-emerald-500/[.06] p-3 text-xs text-emerald-100"><ShieldCheck className="h-4 w-4 shrink-0"/>Pay only {payableLabel}. Never share your UPI PIN, OTP or banking password.</div>
    </div>
  </section>;
}
