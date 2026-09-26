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

export default function DirectUpiPaymentClient({
  intentId,
  clientRequestId,
  serviceCode,
  serviceName,
  quantity,
  link,
  total,
  upiId,
  payeeName,
  bankTransfer,
  usdtTrc20Address,
  usdtAmount,
}: Props) {
  const router = useRouter();
  const [reference] = useState(paymentReference);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank_transfer" | "usdt_trc20">("upi");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ public_order_id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const [copiedBankField, setCopiedBankField] = useState("");
  const utrInputRef = useRef<HTMLInputElement>(null);
  const returnTrackedRef = useRef(false);
  const paymentStateKey = `socialrush-direct-payment:${intentId}`;

  const amountLabel = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(total);

  const upiHref = useMemo(() => {
    if (!upiId) return "";
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName || "SocialRUSH",
      am: total.toFixed(2),
      cu: "INR",
      tr: reference,
      tn: `SocialRUSH ${reference}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [payeeName, reference, total, upiId]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(paymentStateKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { method?: "upi" | "bank_transfer" | "usdt_trc20"; started?: boolean };
      if (parsed.method) setPaymentMethod(parsed.method);
      if (parsed.started) setPaymentStarted(true);
    } catch {
      sessionStorage.removeItem(paymentStateKey);
    }
  }, [paymentStateKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(paymentStateKey, JSON.stringify({ method: paymentMethod, started: paymentStarted }));
    } catch {
      // Payment recovery state is best-effort only.
    }
  }, [paymentMethod, paymentStarted, paymentStateKey]);

  useEffect(() => {
    if (!paymentStarted) return;
    const handleReturn = () => {
      if (document.visibilityState !== "visible" || returnTrackedRef.current) return;
      returnTrackedRef.current = true;
      track("payment_returned", {
        service_code: serviceCode,
        method: paymentMethod,
        surface: "direct_checkout",
      });
      window.setTimeout(() => utrInputRef.current?.focus(), 250);
    };
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleReturn);
    return () => {
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleReturn);
    };
  }, [paymentMethod, paymentStarted, serviceCode]);


  async function copyUpiId() {
    if (!upiId) return;
    await navigator.clipboard.writeText(upiId).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyCryptoAddress() {
    await navigator.clipboard.writeText(usdtTrc20Address).catch(() => undefined);
    setCryptoCopied(true);
    window.setTimeout(() => setCryptoCopied(false), 1400);
  }

  async function copyBankField(label: string, value: string) {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopiedBankField(label);
    window.setTimeout(() => setCopiedBankField(""), 1400);
  }

  async function submitUtr() {
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,80}$/.test(cleanUtr)) {
      setError(
        paymentMethod === "usdt_trc20"
          ? "Enter the transaction hash / TxID from your successful USDT transfer."
          : paymentMethod === "bank_transfer"
            ? "Enter the UTR / Transaction ID from your successful bank transfer."
            : "Enter the UTR / Transaction ID from your successful UPI payment.",
      );
      return;
    }

    setSubmitting(true);
    setError("");
    track("utr_submitted", {
      service_code: serviceCode,
      method: paymentMethod,
      step: "verification",
    });

    try {
      const response = await fetch("/api/orders/manual-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId,
          clientRequestId,
          paymentReference: reference,
          paymentMethod,
          utr: cleanUtr,
        }),
      });
      const payload = (await response.json()) as {
        data?: { id: string; public_order_id: string };
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || "Unable to confirm your order.");
      }

      setSuccess({ public_order_id: payload.data.public_order_id });
      try { sessionStorage.removeItem(paymentStateKey); } catch {}
      window.setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to confirm your order.");
      track("checkout_error", {
        service_code: serviceCode,
        method: paymentMethod,
        step: "verification",
        error_category: "manual_payment_confirmation_failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[#0d1118] text-white shadow-[0_24px_80px_rgba(0,0,0,.45)]">
        <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-orange-500/10 p-6 text-center sm:p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">Payment submitted</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Your order has been received</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-300">We will verify the payment before processing. Please do not make another payment for this order.</p>
          <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
            <span className="text-zinc-500">Order ID</span>
            <p className="mt-1 font-black text-orange-300">{success.public_order_id}</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard/orders")} className="mt-6 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 font-black text-black shadow-[0_12px_34px_rgba(249,115,22,.22)]">
            View My Orders <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-orange-400/20 bg-[#0b0f15] text-white shadow-[0_24px_80px_rgba(0,0,0,.48)]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,.16),transparent_36%)] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">Final step · Payment</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pay {amountLabel}</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200">
            <LockKeyhole className="h-4 w-4" /> Secure checkout
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Choose UPI, Bank Transfer, or USDT (TRC20), pay the exact amount shown, then submit the transaction reference. We verify every manual payment before processing your order.</p>
      </div>

      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Order summary</p>
              <h2 className="mt-1 text-lg font-black">{serviceName}</h2>
            </div>
            <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-200">{amountLabel}</span>
          </div>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quantity</p>
              <p className="mt-1 font-black text-zinc-100">{quantity.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Payment reference</p>
              <p className="mt-1 font-black text-zinc-100">{reference}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Public link</p>
              <p className="mt-1 break-all leading-6 text-zinc-300">{link}</p>
            </div>
          </div>
        </div>

        <FirstOrderBonusBanner compact currentTotal={total} />

        <div>
          <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Payment method</p><h2 className="mt-1 text-lg font-black">How would you like to pay?</h2></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">UPI recommended</span></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => { setPaymentMethod("upi"); setPaymentStarted(false); setUtr(""); setError(""); track("payment_method_selected", { service_code: serviceCode, method: "upi", surface: "direct_checkout" }); }} className={`relative rounded-2xl border p-4 text-left shadow-[inset_0_0_0_1px_rgba(249,115,22,.08)] transition ${paymentMethod === "upi" ? "border-orange-400/50 bg-gradient-to-br from-orange-500/15 to-amber-400/5" : "border-white/10 bg-white/[0.025]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 text-orange-300"><Smartphone className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-black">UPI</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">Google Pay · PhonePe · Paytm</p>
              </div>
            </div>
            {paymentMethod === "upi" ? <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.65)]" /> : null}
          </button>

          <button type="button" disabled={!bankTransfer.enabled} onClick={() => { setPaymentMethod("bank_transfer"); setPaymentStarted(false); setUtr(""); setError(""); track("payment_method_selected", { service_code: serviceCode, method: "bank_transfer", surface: "direct_checkout" }); }} className={`relative rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${paymentMethod === "bank_transfer" ? "border-orange-400/50 bg-gradient-to-br from-orange-500/15 to-amber-400/5" : "border-white/10 bg-white/[0.025]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-300"><WalletCards className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-black">Bank Transfer</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">IMPS · NEFT · bank app</p>
              </div>
            </div>
            {paymentMethod === "bank_transfer" ? <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.65)]" /> : null}
          </button>

          <button type="button" disabled={!usdtAmount} onClick={() => { setPaymentMethod("usdt_trc20"); setPaymentStarted(false); setUtr(""); setError(""); track("payment_method_selected", { service_code: serviceCode, method: "usdt_trc20", surface: "direct_checkout" }); }} className={`relative rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${paymentMethod === "usdt_trc20" ? "border-orange-400/50 bg-gradient-to-br from-orange-500/15 to-amber-400/5" : "border-white/10 bg-white/[0.025]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300"><Coins className="h-5 w-5" /></div>
              <div className="min-w-0"><p className="text-sm font-black">USDT</p><p className="mt-0.5 text-[11px] text-zinc-400">TRON · TRC20</p></div>
            </div>
            {usdtAmount ? <span className="absolute right-3 top-3 rounded-full bg-sky-500/10 px-2 py-1 text-[9px] font-black uppercase text-sky-300">International</span> : null}
          </button>
        </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs leading-5 text-zinc-500"><WalletCards className="mt-0.5 h-4 w-4 shrink-0" /><span>More payment methods will appear here only when they are available and approved for SocialRUSH.</span></div>
        </div>

        {paymentMethod === "bank_transfer" ? (
          <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-black">{paymentStarted ? "2" : "1"}</div>
              <div className="min-w-0 flex-1">
                {!paymentStarted ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black">Bank Transfer</h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">Secure manual bank payment to SocialRUSH. Transfer the exact amount shown.</p>
                      </div>
                      <span className="rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-200">Exact amount: {amountLabel}</span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-orange-400/20 bg-black/25 p-4">
                      <p className="text-base font-black text-white">{bankTransfer.bankName}</p>
                      <div className="mt-4 space-y-3 text-sm">
                        {[
                          ["Account Holder", bankTransfer.accountName],
                          ["Account Type", bankTransfer.accountType],
                          ["Account Number", bankTransfer.accountNumber],
                          ["IFSC", bankTransfer.ifsc],
                          ["Branch", bankTransfer.branch],
                        ].map(([label, value]) => (
                          <div key={label} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <div><p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-1 break-all font-black text-zinc-100">{value}</p></div>
                            {["Account Holder", "Account Number", "IFSC"].includes(label) ? <button type="button" onClick={() => void copyBankField(label, value)} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-orange-200"><Copy className="h-3.5 w-3.5" />{copiedBankField === label ? "Copied" : "Copy"}</button> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-500/10 p-4 text-xs leading-6 text-amber-100">
                      Transfer the exact amount shown above. After completing the payment, enter your UTR/Transaction ID below. Your order will start only after payment verification.
                      <strong className="mt-2 block text-white">No need to pay again after submitting your transaction for verification.</strong>
                    </div>
                    <button type="button" onClick={() => { setPaymentStarted(true); track("payment_started", { service_code: serviceCode, method: "bank_transfer", currency: "INR", value: total, step: "bank_details_shown" }); }} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 font-black text-black">I’ve made the transfer</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-black">Enter UTR / Transaction ID</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">Enter the reference from your successful bank transfer. We will verify it before the order starts.</p>
                    <input value={utr} onChange={(e) => setUtr(e.target.value.slice(0,80))} placeholder="UTR / Transaction ID" autoComplete="off" className="mt-4 w-full rounded-2xl border border-white/10 bg-[#080b10] px-4 py-4 text-base font-semibold outline-none focus:border-orange-400/70" />
                    {error ? <p className="mt-3 rounded-xl border border-red-400/15 bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}
                    <button type="button" disabled={submitting} onClick={() => void submitUtr()} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 font-black text-black disabled:opacity-60">{submitting ? "Submitting..." : "Submit for Verification"}</button>
                    <p className="mt-3 text-center text-xs leading-5 text-zinc-500">No need to pay again after submitting your transaction for verification.</p>
                    <button type="button" onClick={() => setPaymentStarted(false)} className="mt-3 min-h-11 w-full rounded-xl border border-white/10 text-sm font-bold text-zinc-300">Back to bank details</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : paymentMethod === "usdt_trc20" ? (
          <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6">
            <div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-black">{paymentStarted ? "2" : "1"}</div><div className="min-w-0 flex-1">
              {!paymentStarted ? <><h2 className="text-xl font-black">Send {usdtAmount?.toFixed(2)} USDT</h2><p className="mt-1 text-sm leading-6 text-zinc-400">International payment via TRON (TRC20). The USDT amount is calculated from the current USD/INR reference rate.</p>
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-xs font-bold leading-5 text-red-100">TRC20 ONLY. Do not send USDT using ERC20, BEP20, Solana or another network.</div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">USDT · TRC20 deposit address</p><p className="mt-2 break-all font-black text-white">{usdtTrc20Address}</p><button type="button" onClick={() => void copyCryptoAddress()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-orange-200"><Copy className="h-4 w-4" />{cryptoCopied ? "Copied" : "Copy address"}</button></div>
              <button type="button" onClick={() => { setPaymentStarted(true); track("payment_started", { service_code: serviceCode, method: "usdt_trc20", currency: "INR", value: total, step: "crypto_instructions_shown" }); }} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 font-black text-black">I’ve sent the USDT</button></> :
              <><h2 className="text-xl font-black">Enter transaction hash / TxID</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Paste the TxID from your successful TRC20 transfer. We verify it before processing your order.</p>
              <input value={utr} onChange={(e) => setUtr(e.target.value.slice(0,80))} placeholder="TRC20 transaction hash / TxID" autoComplete="off" className="mt-4 w-full rounded-2xl border border-white/10 bg-[#080b10] px-4 py-4 text-base font-semibold outline-none focus:border-orange-400/70" />
              {error ? <p className="mt-3 rounded-xl border border-red-400/15 bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}
              <button type="button" disabled={submitting} onClick={() => void submitUtr()} className="mt-4 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 font-black text-black disabled:opacity-60">{submitting ? "Submitting..." : "Submit TxID & Place Order"}</button>
              <button type="button" onClick={() => setPaymentStarted(false)} className="mt-3 min-h-11 w-full rounded-xl border border-white/10 text-sm font-bold text-zinc-300">Back to USDT details</button></>}
            </div></div>
          </div>
        ) : !upiId ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">UPI is not configured right now. Please contact support before paying.</div>
        ) : !paymentStarted ? (
          <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-black">1</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Pay with any UPI app</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">Tap the button below to open your UPI app with the exact amount pre-filled.</p>
                  </div>
                  <span className="rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-200">Exact amount: {amountLabel}</span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Pay to UPI ID</p>
                      <p className="mt-1 break-all text-base font-black text-white">{upiId}</p>
                    </div>
                    <button type="button" onClick={() => void copyUpiId()} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-black text-orange-200">
                      <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <a
                  href={upiHref}
                  onClick={() => {
                    setPaymentStarted(true);
                    returnTrackedRef.current = false;
                    try { sessionStorage.setItem(paymentStateKey, JSON.stringify({ method: "upi", started: true })); } catch {}
                    track("payment_started", {
                      service_code: serviceCode,
                      method: "upi",
                      currency: "INR",
                      value: total,
                      step: "upi_app_opened",
                    });
                  }}
                  className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-5 py-4 text-base font-black text-black shadow-[0_14px_38px_rgba(249,115,22,.24)] transition hover:brightness-105"
                >
                  Pay {amountLabel} with UPI <ExternalLink className="h-4 w-4" />
                </a>

                <button type="button" onClick={() => { setPaymentStarted(true); returnTrackedRef.current = false; track("payment_returned", { service_code: serviceCode, method: "upi", surface: "already_paid_cta" }); window.setTimeout(() => utrInputRef.current?.focus(), 150); }} className="mt-3 min-h-11 w-full rounded-xl border border-orange-400/25 bg-orange-500/[0.06] px-4 text-sm font-black text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/[0.1]">I already paid · Enter UTR</button>

                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.06] p-3 text-xs leading-5 text-emerald-100/80">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  Pay only the amount shown above. Never share your UPI PIN, OTP or banking password with anyone.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-black">2</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Payment done? Enter your UTR</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">Copy the UTR / Transaction ID from your successful payment and paste it below. Do not pay again.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200">
                    <Clock3 className="h-3.5 w-3.5" /> Verification pending
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-zinc-500">Amount paid</span>
                    <strong className="text-orange-300">{amountLabel}</strong>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-zinc-500">Reference</span>
                    <strong className="text-xs text-zinc-200">{reference}</strong>
                  </div>
                </div>

                <label htmlFor="manual-payment-utr" className="mt-5 block text-sm font-black">UTR / Transaction ID</label>
                <input
                  ref={utrInputRef}
                  id="manual-payment-utr"
                  value={utr}
                  onChange={(event) => setUtr(event.target.value.slice(0, 40))}
                  placeholder="Enter transaction ID"
                  autoComplete="off"
                  inputMode="text"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#080b10] px-4 py-4 text-base font-semibold outline-none transition placeholder:text-zinc-600 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/10"
                />

                <details className="mt-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-xs text-zinc-400">
                  <summary className="cursor-pointer font-bold text-orange-300">Where can I find the UTR?</summary>
                  <p className="mt-2 leading-5">Open your UPI app, go to transaction history, open this successful payment, then copy the UTR / Transaction ID.</p>
                </details>

                {error ? <p className="mt-3 rounded-xl border border-red-400/15 bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}

                <button type="button" disabled={submitting} onClick={() => void submitUtr()} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-5 py-4 font-black text-black shadow-[0_14px_38px_rgba(249,115,22,.24)] disabled:opacity-60">
                  {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Confirming...</> : <>Submit Payment & Place Order <ArrowRight className="h-4 w-4" /></>}
                </button>
                <button type="button" onClick={() => setPaymentStarted(false)} className="mt-3 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.05]">Back to payment details</button>
                <p className="mt-3 text-center text-xs leading-5 text-zinc-500">Do not submit the same UTR for more than one order. Incorrect details may delay verification.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <TrustItem icon={<ShieldCheck className="h-4 w-4" />} title="Secure payment" subtitle="Protected flow" />
          <TrustItem icon={<Clock3 className="h-4 w-4" />} title="Manual verification" subtitle="Before processing" />
          <TrustItem icon={<Smartphone className="h-4 w-4" />} title="Direct UPI" subtitle="No gateway" />
          <TrustItem icon={<LockKeyhole className="h-4 w-4" />} title="Privacy first" subtitle="No PIN or OTP" />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <div className="text-orange-300">{icon}</div>
      <p className="mt-2 text-xs font-black text-zinc-200">{title}</p>
      <p className="mt-0.5 text-[10px] text-zinc-500">{subtitle}</p>
    </div>
  );
}
