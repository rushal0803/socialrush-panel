"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

const UPI_ID = "8860330771@pthdfc";
const PAYEE = "Rushal";
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

function makeReference() {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()
    : `${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  return `SRW-${token}`;
}

export default function DesktopUpiQrCheckout() {
  const [amountText, setAmountText] = useState("1000");
  const [reference] = useState(makeReference);
  const [showMobileQr, setShowMobileQr] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string; amount: number } | null>(null);
  const utrRef = useRef<HTMLInputElement>(null);
  const amount = Number(amountText || 0);
  const validAmount = Number.isFinite(amount) && amount >= 100 && amount <= 500000;

  const upiHref = useMemo(() => {
    if (!validAmount) return "#";
    const params = new URLSearchParams({ pa: UPI_ID, pn: PAYEE, am: amount.toFixed(2), cu: "INR", tn: `SocialRUSH ${reference}`.slice(0, 80) });
    return `upi://pay?${params.toString()}`;
  }, [amount, reference, validAmount]);

  const qrUrl = useMemo(() => validAmount ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiHref)}` : "", [upiHref, validAmount]);

  async function copyUpi() {
    await navigator.clipboard.writeText(UPI_ID).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function pasteUtr() {
    const value = await navigator.clipboard.readText().catch(() => "");
    if (value.trim()) setUtr(value.trim().replace(/\s+/g, "").slice(0, 80));
  }

  function confirmPaid() {
    if (!validAmount) return setError("Enter an amount between ₹100 and ₹5,00,000.");
    setPaymentStarted(true);
    setError("");
    window.setTimeout(() => utrRef.current?.focus(), 100);
  }

  async function submitPayment() {
    setError("");
    const paymentId = utr.trim().replace(/\s+/g, "");
    if (!validAmount) return setError("Enter an amount between ₹100 and ₹5,00,000.");
    if (!/^[A-Za-z0-9-]{8,80}$/.test(paymentId)) return setError("Enter a valid UTR / Transaction ID.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/wallet/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, utr: paymentId, paymentReference: reference, paymentMethod: "upi" }) });
      const payload = await response.json().catch(() => null) as { data?: { id: string; amount?: number }; error?: string } | null;
      if (!response.ok || !payload?.data) throw new Error(payload?.error || "Unable to submit payment for verification.");
      setSuccess({ id: payload.data.id, amount: Number(payload.data.amount ?? amount) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit payment for verification.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) return <section className="mx-auto max-w-2xl px-4 py-10"><div className="rounded-3xl border border-emerald-500/25 bg-[#101510] p-7 text-center shadow-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-300">✓</div><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Payment submitted</p><h1 className="mt-2 text-2xl font-black text-white">₹{success.amount.toLocaleString("en-IN")} is being verified</h1><p className="mt-3 text-sm text-slate-400">Do not pay again. Your wallet will be credited after verification.</p><div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-left"><p className="text-[10px] font-bold uppercase text-slate-500">Reference</p><p className="mt-1 font-mono text-sm text-white">{reference}</p></div><Link href="/dashboard/wallet" className="mt-6 inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-sm font-black text-black">Back to Wallet</Link></div></section>;

  return <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:py-10">
    <header className="mb-6"><p className="text-xs font-black uppercase tracking-[.2em] text-orange-400">SocialRUSH Wallet</p><h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Complete your payment</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Choose an amount. SocialRUSH creates a UPI payment request with that exact amount already filled in.</p></header>
    <div className="mb-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wider sm:text-xs"><div className={`rounded-xl border px-2 py-3 ${!paymentStarted ? "border-orange-400 bg-orange-500/10 text-orange-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>1 · Amount</div><div className={`rounded-xl border px-2 py-3 ${paymentStarted ? "border-orange-400 bg-orange-500/10 text-orange-300" : "border-white/10 text-slate-500"}`}>2 · Pay</div><div className="rounded-xl border border-white/10 px-2 py-3 text-slate-500">3 · Verify</div></div>
    <section className="rounded-3xl border border-orange-400/20 bg-[#11141c] p-5 shadow-2xl sm:p-7">
      {!paymentStarted ? <>
        <label className="text-[11px] font-black uppercase tracking-[.18em] text-slate-400">Amount in INR</label>
        <div className="mt-3 flex items-center rounded-2xl border border-orange-400/30 bg-black/20 px-4"><span className="text-xl font-black text-orange-300">₹</span><input inputMode="decimal" value={amountText} onChange={(e) => { setAmountText(e.target.value.replace(/[^0-9.]/g, "")); setShowMobileQr(false); }} className="w-full bg-transparent px-3 py-4 text-2xl font-black text-white outline-none" aria-label="Amount" /></div>
        <p className="mt-2 text-xs text-slate-500">Minimum ₹100 · Maximum ₹5,00,000</p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">{QUICK_AMOUNTS.map((value) => <button key={value} type="button" onClick={() => { setAmountText(String(value)); setShowMobileQr(false); }} className="rounded-xl border border-white/10 bg-white/[.03] px-2 py-3 text-xs font-bold text-slate-300 hover:border-orange-400/40">₹{value.toLocaleString("en-IN")}</button>)}</div>
        <div className="mt-6 rounded-3xl border border-orange-400/20 bg-black/20 p-4 lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 lg:p-6">
          <div className="hidden rounded-2xl bg-white p-4 text-center lg:block">{qrUrl ? <img src={qrUrl} alt={`UPI QR to pay exactly ₹${amount.toFixed(2)}`} width={268} height={268} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="mx-auto h-auto w-full max-w-[268px]" /> : <div className="flex aspect-square items-center justify-center text-sm text-slate-500">Enter a valid amount</div>}<p className="mt-2 text-xs font-bold text-slate-800">Scan to pay exactly ₹{validAmount ? amount.toLocaleString("en-IN") : "0"}</p></div>
          <div className="flex flex-col justify-center"><div className="flex items-center gap-2"><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">UPI Payment</p><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-300">Exact amount</span></div><h2 className="mt-2 text-2xl font-black text-white">Pay ₹{validAmount ? amount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</h2><p className="mt-2 text-sm leading-6 text-slate-400">No need to type the amount again. Choose direct UPI on this phone, or show the QR to scan from another device.</p>
            <a href={upiHref} onClick={(e) => { if (!validAmount) { e.preventDefault(); setError("Enter a valid amount."); } }} className={`mt-5 flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-black ${validAmount ? "bg-gradient-to-r from-orange-500 to-amber-400 text-black" : "pointer-events-none bg-white/10 text-slate-500"}`}>Pay ₹{validAmount ? amount.toLocaleString("en-IN") : "0"} with UPI App</a><p className="mt-2 text-center text-[11px] text-slate-500 lg:hidden">Recommended when paying on this phone</p>
            <button type="button" disabled={!validAmount} onClick={() => setShowMobileQr((value) => !value)} className="mt-3 w-full rounded-xl border border-white/15 bg-white/[.03] px-5 py-3.5 text-sm font-black text-white lg:hidden">{showMobileQr ? "Hide QR Code" : "Show QR Code"}</button>
            {showMobileQr && <div className="mt-4 rounded-2xl bg-white p-4 text-center lg:hidden">{qrUrl && <img src={qrUrl} alt={`UPI QR to pay exactly ₹${amount.toFixed(2)}`} width={280} height={280} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="mx-auto h-auto w-full max-w-[280px]" />}<p className="mt-2 text-sm font-black text-slate-900">Pay exactly ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p><p className="mt-1 text-xs text-slate-600">Scan this QR from another phone or UPI-enabled device. The amount is already included.</p></div>}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[.025] p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">UPI ID</p><div className="mt-1 flex items-center justify-between gap-3"><p className="break-all text-sm font-black text-white">{UPI_ID}</p><button type="button" onClick={() => void copyUpi()} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-orange-300">{copied ? "Copied" : "Copy"}</button></div></div><div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black text-slate-300">{["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay", "WhatsApp Pay"].map((app) => <span key={app} className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1.5">{app}</span>)}</div><button type="button" disabled={!validAmount} onClick={confirmPaid} className="mt-4 w-full rounded-xl border border-emerald-500/25 bg-emerald-500/[.07] px-5 py-3.5 text-sm font-black text-emerald-300">I’ve completed the payment</button></div>
        </div>{error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      </> : <div className="mx-auto max-w-xl"><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.06] p-4"><p className="text-xs font-black uppercase tracking-wider text-emerald-300">Confirm your payment</p><p className="mt-2 text-sm text-slate-300">Amount: <strong className="text-white">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></p></div><label className="mt-6 block text-[11px] font-black uppercase tracking-[.18em] text-slate-400">UTR / Transaction ID</label><div className="mt-3 flex rounded-xl border border-white/10 bg-black/20 p-1"><input ref={utrRef} value={utr} onChange={(e) => { setUtr(e.target.value); setError(""); }} placeholder="Enter UTR / Transaction ID" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none" /><button type="button" onClick={() => void pasteUtr()} className="rounded-lg border border-white/10 px-3 text-xs font-bold text-orange-300">Paste</button></div><p className="mt-2 text-xs leading-5 text-slate-500">Submit the UTR only after payment. Never submit the same transaction twice.</p>{error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}<button type="button" disabled={submitting} onClick={() => void submitPayment()} className="mt-5 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-sm font-black text-black disabled:opacity-50">{submitting ? "Submitting…" : "Submit payment for verification"}</button><button type="button" disabled={submitting} onClick={() => { setPaymentStarted(false); setUtr(""); setError(""); }} className="mt-2 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-400">Back to payment options</button></div>}
    </section>
    <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><strong className="block text-white">Exact amount</strong><span className="mt-1 block">Embedded in both UPI and QR payment requests.</span></div><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><strong className="block text-white">Two ways to pay</strong><span className="mt-1 block">UPI app on this phone or QR from another device.</span></div><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><strong className="block text-white">Pay only once</strong><span className="mt-1 block">Submit the UTR and wait for verification.</span></div></div>
  </main>;
}
