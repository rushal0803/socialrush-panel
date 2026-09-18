"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const UPI_ID = "8860330771@pthdfc";
const PAYEE = "Rushal";
const USDT_TRC20_ADDRESS = "TEu618wJ54USgsQSWhUnHbd9xFeMRUfCSz";
const quickAmounts = [100, 500, 1000, 2000, 5000];

function makeReference() {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()
    : `${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  return `SRW-${token}`;
}

export default function ManualUpiAddFunds({ inrPerUsd }: { inrPerUsd: number | null }) {
  const [amountText, setAmountText] = useState("1000");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "usdt_trc20">("upi");
  const [copied, setCopied] = useState(false);
  const [reference] = useState(makeReference);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string; amount: number } | null>(null);
  const amount = Number(amountText || 0);
  const validAmount = Number.isFinite(amount) && amount >= 100 && amount <= 500000;
  const upiConfigured = Boolean(UPI_ID);
  const usdtAmount = validAmount && inrPerUsd ? Math.ceil((amount / inrPerUsd) * 100) / 100 : null;

  const upiHref = useMemo(() => {
    if (!validAmount || !upiConfigured) return "#";
    const params = new URLSearchParams({ pa: UPI_ID, pn: PAYEE, am: amount.toFixed(2), cu: "INR", tr: reference, tn: `SocialRUSH wallet ${reference}` });
    return `upi://pay?${params.toString()}`;
  }, [amount, reference, upiConfigured, validAmount]);

  async function copyCryptoAddress() { await navigator.clipboard.writeText(USDT_TRC20_ADDRESS); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  async function submitPayment() {
    setError("");
    if (!validAmount) return setError("Enter an amount between ₹100 and ₹5,00,000.");
    const paymentId = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,80}$/.test(paymentId)) return setError(paymentMethod === "upi" ? "Enter a valid UTR / Transaction ID from your payment app." : "Enter a valid TRC20 transaction hash / TxID.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/wallet/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, utr: paymentId, paymentReference: reference, paymentMethod, usdtAmount }) });
      const payload = await response.json().catch(() => null) as { data?: { id: string; amount?: number }; error?: string } | null;
      if (!response.ok || !payload?.data) throw new Error(payload?.error || "Unable to submit payment for verification.");
      setSuccess({ id: payload.data.id, amount: Number(payload.data.amount ?? amount) });
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit payment for verification."); }
    finally { setSubmitting(false); }
  }

  if (success) return <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
    <div className="rounded-3xl border border-emerald-500/25 bg-[#101510] p-6 text-center shadow-2xl sm:p-9">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-300">✓</div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Payment submitted</p>
      <h1 className="mt-2 text-2xl font-black text-white">₹{success.amount.toLocaleString("en-IN")} is being verified</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">You do not need to pay again. Your wallet will be credited after the payment is verified.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-xs text-slate-400"><span className="block text-[10px] font-bold uppercase tracking-wider">Payment reference</span><span className="mt-1 block font-mono text-white">{reference}</span></div>
      <Link href="/dashboard/wallet" className="mt-6 inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3.5 text-sm font-black text-black">Back to Wallet</Link>
    </div>
  </section>;

  return <main className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:py-10">
    <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.2em] text-orange-400">Wallet</p><h1 className="mt-2 text-3xl font-black text-white">Add funds</h1><p className="mt-2 text-sm text-slate-400">Choose UPI for India or USDT (TRC20) for international payments. Your wallet is credited only after verification.</p></div>
    <div className="mb-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wider sm:text-xs">
      <div className={`rounded-xl border px-2 py-3 ${!paymentStarted ? "border-orange-400 bg-orange-500/10 text-orange-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>1 · Amount</div>
      <div className={`rounded-xl border px-2 py-3 ${paymentStarted ? "border-orange-400 bg-orange-500/10 text-orange-300" : "border-white/10 text-slate-500"}`}>2 · Pay</div>
      <div className="rounded-xl border border-white/10 px-2 py-3 text-slate-500">3 · Confirm</div>
    </div>
    <section className="rounded-3xl border border-orange-400/20 bg-[#11141c] p-5 shadow-2xl sm:p-7">
      <label className="text-[11px] font-black uppercase tracking-[.18em] text-slate-400">Amount in INR</label>
      <div className="mt-3 flex items-center rounded-2xl border border-orange-400/30 bg-black/20 px-4"><span className="text-xl font-black text-orange-300">₹</span><input inputMode="decimal" value={amountText} onChange={(e)=>setAmountText(e.target.value.replace(/[^0-9.]/g,""))} className="w-full bg-transparent px-3 py-4 text-2xl font-black text-white outline-none" aria-label="Amount" /></div>
      <p className="mt-2 text-xs text-slate-500">Minimum ₹100 · Maximum ₹5,00,000</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">{quickAmounts.map((value)=><button key={value} onClick={()=>setAmountText(String(value))} className="rounded-xl border border-white/10 bg-white/[.03] px-2 py-3 text-xs font-bold text-slate-300 hover:border-orange-400/40">₹{value.toLocaleString("en-IN")}</button>)}</div>
      {!paymentStarted ? <>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={()=>{setPaymentMethod("upi");setError("");}} className={`rounded-2xl border p-4 text-left ${paymentMethod==="upi"?"border-orange-400 bg-orange-500/10":"border-white/10 bg-black/20"}`}><div className="flex items-center justify-between"><strong className="text-sm text-white">UPI</strong><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-300">India</span></div><p className="mt-2 text-xs text-slate-400">Google Pay · PhonePe · Paytm · BHIM</p></button>
          <button type="button" disabled={!usdtAmount} onClick={()=>{if(usdtAmount){setPaymentMethod("usdt_trc20");setError("");}}} className={`rounded-2xl border p-4 text-left disabled:opacity-50 ${paymentMethod==="usdt_trc20"?"border-orange-400 bg-orange-500/10":"border-white/10 bg-black/20"}`}><div className="flex items-center justify-between"><strong className="text-sm text-white">USDT · TRC20</strong><span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-black text-blue-300">International</span></div><p className="mt-2 text-xs text-slate-400">{usdtAmount ? `Pay ≈ ${usdtAmount.toFixed(2)} USDT` : "Rate temporarily unavailable"}</p></button>
        </div>
        {paymentMethod==="upi" ? <>
          {!upiConfigured && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">UPI is temporarily unavailable. Please contact support.</p>}
          <a href={upiHref} onClick={(e)=>{if(!validAmount||!upiConfigured){e.preventDefault();setError(!upiConfigured?"UPI is temporarily unavailable.":"Enter a valid amount.");return;} setError("");setPaymentStarted(true);}} className={`mt-5 flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-black ${validAmount&&upiConfigured?"bg-gradient-to-r from-orange-500 to-amber-400 text-black":"cursor-not-allowed bg-white/10 text-slate-500"}`}>Pay ₹{validAmount ? amount.toLocaleString("en-IN",{minimumFractionDigits:2}) : "0.00"} with UPI</a>
        </> : <div className="mt-5">
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs font-bold text-red-200">TRC20 ONLY. Do not send USDT using ERC20, BEP20, Solana or another network.</div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">USDT TRC20 address</p><p className="mt-2 break-all text-sm font-black text-white">{USDT_TRC20_ADDRESS}</p><button type="button" onClick={()=>void copyCryptoAddress()} className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-orange-300">{copied?"Copied":"Copy address"}</button></div>
          <button type="button" disabled={!usdtAmount} onClick={()=>{setError("");setPaymentStarted(true);}} className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-sm font-black text-black disabled:opacity-50">I’ve sent {usdtAmount?.toFixed(2)} USDT</button>
        </div>}
        <p className="mt-3 text-center text-[11px] text-slate-500">Exact amount and payment reference are prepared for you.</p>
      </> : <div className="mt-6 border-t border-white/10 pt-6">
        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Payment completed?</p><h2 className="mt-2 text-xl font-black text-white">Confirm your payment</h2><p className="mt-2 text-xs leading-5 text-slate-400">{paymentMethod === "upi" ? "Enter the UTR / Transaction ID shown in your UPI app." : "Paste the TRC20 transaction hash / TxID from your successful USDT transfer."} This helps us match your payment safely.</p>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs"><span className="text-slate-500">Reference</span><span className="ml-2 font-mono font-bold text-white">{reference}</span></div>
        <label className="mt-4 block text-[11px] font-black uppercase tracking-wider text-slate-400">{paymentMethod === "upi" ? "UTR / Transaction ID" : "TRC20 TxID"}</label><input value={utr} onChange={(e)=>setUtr(e.target.value)} placeholder={paymentMethod === "upi" ? "Example: 423456789012" : "Paste TRC20 transaction hash"} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none focus:border-orange-400" />
        {error && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
        <button disabled={submitting} onClick={submitPayment} className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-sm font-black text-black disabled:opacity-60">{submitting?"Submitting…":"Confirm & Add Funds"}</button>
        <button onClick={()=>{setPaymentStarted(false);setError("");}} className="mt-3 w-full py-2 text-xs font-bold text-slate-400">Need to pay? Go back</button>
      </div>}
      {error && !paymentStarted && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
    </section>
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.02] p-4 text-xs leading-5 text-slate-400"><strong className="text-white">Safe payment process:</strong> submitting a UTR does not automatically credit funds. We verify the received payment first, which protects your wallet from incorrect or duplicate credits.</div>
  </main>;
}
