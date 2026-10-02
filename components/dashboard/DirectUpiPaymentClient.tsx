"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  WalletCards,
  Coins,
} from "lucide-react";
import { track } from "@/lib/analytics/events";
import FirstOrderBonusBanner from "@/components/dashboard/FirstOrderBonusBanner";
import ExactAmountUpiQr from "@/components/dashboard/ExactAmountUpiQr";

type BankTransferDetails = {
  enabled: boolean;
  accountName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
};

type Props = {
  intentId: string;
  clientRequestId: string;
  serviceCode: string;
  serviceName: string;
  quantity: number;
  link: string;
  total: number;
  upiId: string;
  payeeName: string;
  bankTransfer: BankTransferDetails;
  usdtTrc20Address: string;
  usdtAmount: number | null;
};

function paymentReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SR-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function DirectUpiPaymentClient({ intentId, clientRequestId, serviceCode, serviceName, quantity, link, total, upiId, payeeName, bankTransfer, usdtTrc20Address, usdtAmount }: Props) {
  const router = useRouter();
  const [reference] = useState(paymentReference);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank_transfer" | "usdt_trc20">("upi");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ public_order_id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const [copiedBankField, setCopiedBankField] = useState("");
  const utrInputRef = useRef<HTMLInputElement>(null);
  const returnTrackedRef = useRef(false);
  const paymentStateKey = `socialrush-direct-payment:${intentId}`;
  const amountLabel = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(total);
  const upiHref = useMemo(() => {
    if (!upiId) return "";
    const params = new URLSearchParams({ pa: upiId, pn: payeeName || "SocialRUSH", am: total.toFixed(2), cu: "INR", tn: `SocialRUSH ${reference}`.slice(0, 80) });
    return `upi://pay?${params.toString()}`;
  }, [payeeName, reference, total, upiId]);

  useEffect(() => { try { const saved = sessionStorage.getItem(paymentStateKey); if (!saved) return; const parsed = JSON.parse(saved) as { method?: "upi" | "bank_transfer" | "usdt_trc20"; started?: boolean }; if (parsed.method) setPaymentMethod(parsed.method); if (parsed.started) setPaymentStarted(true); } catch { sessionStorage.removeItem(paymentStateKey); } }, [paymentStateKey]);
  useEffect(() => { try { sessionStorage.setItem(paymentStateKey, JSON.stringify({ method: paymentMethod, started: paymentStarted, savedAt: Date.now(), total, serviceCode })); } catch {} }, [paymentMethod, paymentStarted, paymentStateKey, serviceCode, total]);
  useEffect(() => { if (!paymentStarted) return; const handleReturn = () => { if (document.visibilityState !== "visible" || returnTrackedRef.current) return; returnTrackedRef.current = true; track("payment_returned", { service_code: serviceCode, method: paymentMethod, surface: "direct_checkout" }); window.setTimeout(() => utrInputRef.current?.focus(), 250); }; window.addEventListener("focus", handleReturn); document.addEventListener("visibilitychange", handleReturn); return () => { window.removeEventListener("focus", handleReturn); document.removeEventListener("visibilitychange", handleReturn); }; }, [paymentMethod, paymentStarted, serviceCode]);

  async function copyUpiId() { if (!upiId) return; await navigator.clipboard.writeText(upiId).catch(() => undefined); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }
  async function copyAmount() { await navigator.clipboard.writeText(total.toFixed(2)).catch(() => undefined); setCopiedAmount(true); window.setTimeout(() => setCopiedAmount(false), 1400); }
  async function copyCryptoAddress() { await navigator.clipboard.writeText(usdtTrc20Address).catch(() => undefined); setCryptoCopied(true); window.setTimeout(() => setCryptoCopied(false), 1400); }
  async function copyBankField(label: string, value: string) { await navigator.clipboard.writeText(value).catch(() => undefined); setCopiedBankField(label); window.setTimeout(() => setCopiedBankField(""), 1400); }
  async function pasteTransactionId() { const value = await navigator.clipboard.readText().catch(() => ""); const clean = value.trim().replace(/\s+/g, "").slice(0, 80); if (!clean) return; setUtr(clean); setError(""); }
  async function submitUtr() {
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,80}$/.test(cleanUtr)) { setError(paymentMethod === "usdt_trc20" ? "Enter the transaction hash / TxID from your successful USDT transfer." : paymentMethod === "bank_transfer" ? "Enter the UTR / Transaction ID from your successful bank transfer." : "Enter the UTR / Transaction ID from your successful UPI payment."); return; }
    setSubmitting(true); setError(""); track("utr_submitted", { service_code: serviceCode, method: paymentMethod, step: "verification" });
    try {
      const response = await fetch("/api/orders/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId, clientRequestId, paymentReference: reference, paymentMethod, utr: cleanUtr }) });
      const payload = (await response.json()) as { data?: { id: string; public_order_id: string }; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to confirm your order.");
      setSuccess({ public_order_id: payload.data.public_order_id }); try { sessionStorage.removeItem(paymentStateKey); } catch {} window.setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to confirm your order."); track("checkout_error", { service_code: serviceCode, method: paymentMethod, step: "verification", error_category: "manual_payment_confirmation_failed" }); } finally { setSubmitting(false); }
  }

  if (success) return <section className="mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[#0d1118] text-white shadow-[0_24px_80px_rgba(0,0,0,.45)]"><div className="p-6 text-center sm:p-8"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" /><p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">Payment submitted</p><h1 className="mt-2 text-2xl font-black">Your order has been received</h1><p className="mt-3 text-sm text-zinc-300">We will verify the payment before processing. Please do not make another payment.</p><p className="mt-4 font-black text-orange-300">{success.public_order_id}</p><button type="button" onClick={() => router.push("/dashboard/orders")} className="mt-6 min-h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black">View My Orders</button></div></section>;

  return <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-orange-400/20 bg-[#0b0f15] text-white shadow-[0_24px_80px_rgba(0,0,0,.48)]">
    <div className="border-b border-white/10 p-5 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">Final step · Payment</p><h1 className="mt-2 text-3xl font-black">Pay {amountLabel}</h1><p className="mt-3 text-sm text-zinc-300">Choose a payment method, pay the exact amount, then submit the transaction reference.</p></div>
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-[10px] font-black uppercase text-zinc-500">Order summary</p><h2 className="mt-1 text-lg font-black">{serviceName}</h2><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p>Quantity: <strong>{quantity.toLocaleString("en-IN")}</strong></p><p>Reference: <strong>{reference}</strong></p><p className="break-all sm:col-span-2">{link}</p></div></div>
      <FirstOrderBonusBanner compact currentTotal={total} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => { setPaymentMethod("upi"); setPaymentStarted(false); setUtr(""); setError(""); }} className={`rounded-2xl border p-4 text-left sm:col-span-2 ${paymentMethod === "upi" ? "border-orange-400/50 bg-orange-500/10" : "border-white/10"}`}><p className="font-black">UPI · All Apps</p><p className="text-xs text-zinc-400">UPI app or exact-amount QR</p></button>
        <button type="button" disabled={!bankTransfer.enabled} onClick={() => { setPaymentMethod("bank_transfer"); setPaymentStarted(false); }} className={`rounded-2xl border p-4 text-left ${paymentMethod === "bank_transfer" ? "border-orange-400/50 bg-orange-500/10" : "border-white/10"}`}><p className="font-black">Bank Transfer</p><p className="text-xs text-zinc-400">IMPS · NEFT · bank app</p></button>
        <button type="button" disabled={!usdtAmount} onClick={() => { setPaymentMethod("usdt_trc20"); setPaymentStarted(false); }} className={`rounded-2xl border p-4 text-left ${paymentMethod === "usdt_trc20" ? "border-orange-400/50 bg-orange-500/10" : "border-white/10"}`}><p className="font-black">USDT</p><p className="text-xs text-zinc-400">TRON · TRC20</p></button>
      </div>

      {paymentMethod === "bank_transfer" ? <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6">{!paymentStarted ? <><h2 className="text-xl font-black">Bank Transfer · {amountLabel}</h2><div className="mt-4 space-y-2 text-sm"><p>{bankTransfer.bankName}</p><p>{bankTransfer.accountName}</p><p>{bankTransfer.accountNumber}</p><p>{bankTransfer.ifsc}</p></div><button type="button" onClick={() => setPaymentStarted(true)} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black">I’ve made the transfer</button></> : <TransactionStep utr={utr} setUtr={setUtr} paste={pasteTransactionId} submit={submitUtr} submitting={submitting} error={error} back={() => setPaymentStarted(false)} label="UTR / Transaction ID" />}</div>
      : paymentMethod === "usdt_trc20" ? <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6">{!paymentStarted ? <><h2 className="text-xl font-black">Send {usdtAmount?.toFixed(2)} USDT</h2><p className="mt-2 text-sm text-zinc-400">TRC20 ONLY</p><p className="mt-4 break-all font-black">{usdtTrc20Address}</p><button type="button" onClick={() => void copyCryptoAddress()} className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs">{cryptoCopied ? "Copied" : "Copy address"}</button><button type="button" onClick={() => setPaymentStarted(true)} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black">I’ve sent the USDT</button></> : <TransactionStep utr={utr} setUtr={setUtr} paste={pasteTransactionId} submit={submitUtr} submitting={submitting} error={error} back={() => setPaymentStarted(false)} label="Transaction hash / TxID" />}</div>
      : !upiId ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">UPI is not configured right now.</div>
      : !paymentStarted ? <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6"><h2 className="text-xl font-black">Choose how you want to pay</h2><p className="mt-1 text-sm text-zinc-400">The exact amount {amountLabel} is included automatically.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] uppercase text-zinc-500">UPI ID</p><p className="mt-1 break-all font-black">{upiId}</p><button type="button" onClick={() => void copyUpiId()} className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs"><Copy className="mr-1 inline h-3 w-3" />{copied ? "Copied" : "Copy UPI ID"}</button></div><div className="rounded-2xl border border-orange-400/20 bg-orange-500/[0.06] p-4"><p className="text-[10px] uppercase text-zinc-500">Exact amount</p><p className="mt-1 text-lg font-black text-orange-200">{amountLabel}</p><button type="button" onClick={() => void copyAmount()} className="mt-3 rounded-xl border border-orange-400/20 px-3 py-2 text-xs">{copiedAmount ? "Copied" : "Copy Amount"}</button></div></div><a href={upiHref} onClick={() => { setPaymentStarted(true); returnTrackedRef.current = false; track("payment_started", { service_code: serviceCode, method: "upi", currency: "INR", value: total, step: "upi_app_opened" }); }} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black">Pay {amountLabel} with UPI App <ExternalLink className="h-4 w-4" /></a><div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-white/10"/><span className="text-xs font-black uppercase tracking-wider text-zinc-500">or scan on another device</span><div className="h-px flex-1 bg-white/10"/></div><ExactAmountUpiQr upiHref={upiHref} amountLabel={amountLabel} /><button type="button" onClick={() => { setPaymentStarted(true); window.setTimeout(() => utrInputRef.current?.focus(), 150); }} className="mt-4 min-h-11 w-full rounded-xl border border-orange-400/25 bg-orange-500/[0.06] text-sm font-black text-orange-200">I’ve paid · Enter UTR</button><div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.06] p-3 text-xs text-emerald-100/80"><ShieldCheck className="h-4 w-4 shrink-0"/>Use either UPI App or QR. Pay only once. Never share your UPI PIN or OTP.</div></div>
      : <TransactionStep utr={utr} setUtr={setUtr} paste={pasteTransactionId} submit={submitUtr} submitting={submitting} error={error} back={() => setPaymentStarted(false)} label="UTR / Transaction ID" inputRef={utrInputRef} />}
    </div>
  </section>;
}

function TransactionStep({ utr, setUtr, paste, submit, submitting, error, back, label, inputRef }: { utr: string; setUtr: (v: string) => void; paste: () => Promise<void>; submit: () => Promise<void>; submitting: boolean; error: string; back: () => void; label: string; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  return <><h2 className="text-xl font-black">Final step · enter {label}</h2><p className="mt-1 text-sm text-zinc-400">After payment succeeds, enter the transaction reference below. Do not pay again.</p><div className="mt-4 flex gap-2"><input ref={inputRef} value={utr} onChange={(e) => setUtr(e.target.value.slice(0,80))} placeholder={label} className="min-h-14 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#080b10] px-4"/><button type="button" onClick={() => void paste()} className="min-h-14 rounded-2xl border border-orange-400/25 px-4 text-xs font-black text-orange-200">Paste</button></div>{error ? <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-200">{error}</p> : null}<button type="button" disabled={submitting} onClick={() => void submit()} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 font-black text-black disabled:opacity-60">{submitting ? <><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin"/>Submitting...</> : <>Submit & Place Order <ArrowRight className="ml-1 inline h-4 w-4"/></>}</button><button type="button" onClick={back} className="mt-3 min-h-11 w-full rounded-xl border border-white/10 text-sm text-zinc-300">Back to payment details</button></>;
}
