"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";
import { track } from "@/lib/analytics/events";

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
}: Props) {
  const router = useRouter();
  const [reference] = useState(paymentReference);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ public_order_id: string } | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function copyUpiId() {
    if (!upiId) return;
    await navigator.clipboard.writeText(upiId).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function submitUtr() {
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,40}$/.test(cleanUtr)) {
      setError("Enter the UTR / Transaction ID from your successful UPI payment.");
      return;
    }

    setSubmitting(true);
    setError("");
    track("utr_submitted", {
      service_code: serviceCode,
      method: "upi",
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
      window.setTimeout(() => router.push("/dashboard/orders"), 1800);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to confirm your order.");
      track("checkout_error", {
        service_code: serviceCode,
        method: "upi",
        step: "verification",
        error_category: "utr_confirmation_failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-emerald-400/20 bg-[#111318] p-6 text-center text-white shadow-2xl sm:p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-3xl">✓</div>
        <h1 className="mt-4 text-2xl font-black">Order received successfully</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Your payment has been submitted for verification. Do not pay again.</p>
        <p className="mt-3 text-sm font-black text-orange-300">Order ID: {success.public_order_id}</p>
        <button type="button" onClick={() => router.push("/dashboard/orders")} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 font-black text-black">View My Orders</button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-orange-400/20 bg-[#111318] p-5 text-white shadow-2xl sm:p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Direct UPI checkout</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Pay {amountLabel}</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-300">Pay the exact order total directly by UPI. Your wallet balance will not be used for this payment.</p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <p><span className="text-zinc-500">Service:</span> <strong>{serviceName}</strong></p>
          <p><span className="text-zinc-500">Quantity:</span> <strong>{quantity.toLocaleString("en-IN")}</strong></p>
          <p className="break-all sm:col-span-2"><span className="text-zinc-500">Public link:</span> {link}</p>
        </div>
      </div>

      {!upiId ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">UPI is not configured right now. Please contact support before paying.</div>
      ) : !paymentStarted ? (
        <>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">UPI ID</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="min-w-0 break-all text-base font-black">{upiId}</p>
              <button type="button" onClick={() => void copyUpiId()} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-orange-200"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy"}</button>
            </div>
          </div>

          <a
            href={upiHref}
            onClick={() => {
              setPaymentStarted(true);
              track("payment_started", {
                service_code: serviceCode,
                method: "upi",
                currency: "INR",
                value: total,
                step: "upi_app_opened",
              });
            }}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-base font-black text-black shadow-lg"
          >
            Pay {amountLabel} with UPI <ExternalLink className="h-4 w-4" />
          </a>
          <p className="mt-3 text-center text-xs text-zinc-500">Works with Paytm, PhonePe, Google Pay and other UPI apps. Never share your UPI PIN or OTP.</p>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <h2 className="text-lg font-black">Payment completed?</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-300">Enter the UTR / Transaction ID from your successful UPI payment to place the order.</p>
            </div>
          </div>

          <label htmlFor="direct-upi-utr" className="mt-5 block text-sm font-black">UTR / Transaction ID</label>
          <input
            id="direct-upi-utr"
            value={utr}
            onChange={(event) => setUtr(event.target.value.slice(0, 40))}
            placeholder="Enter transaction ID"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-base outline-none focus:border-orange-400"
          />
          <details className="mt-3 text-xs text-zinc-400">
            <summary className="cursor-pointer font-semibold text-orange-300">Where can I find the UTR?</summary>
            <p className="mt-2 leading-5">Open your UPI app, go to transaction history, open this successful payment, then copy the UTR / Transaction ID.</p>
          </details>
          {error ? <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}
          <button type="button" disabled={submitting} onClick={() => void submitUtr()} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 font-black text-black disabled:opacity-60">
            {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Confirming...</> : "Confirm Payment & Place Order"}
          </button>
          <button type="button" onClick={() => setPaymentStarted(false)} className="mt-3 min-h-11 w-full rounded-xl border border-white/10 px-4 text-sm font-bold text-zinc-300">Back to UPI payment</button>
        </div>
      )}
    </section>
  );
}
