"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Copy, ExternalLink, LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import { track } from "@/lib/analytics/events";

type PaymentMethod = "upi" | "bank_transfer";

type BankTransferDetails = {
  enabled: boolean;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
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
}: Props) {
  const router = useRouter();
  const [reference] = useState(paymentReference);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ public_order_id: string } | null>(null);
  const [copied, setCopied] = useState("");

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

  async function copyValue(label: string, value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  }

  function chooseMethod(nextMethod: PaymentMethod) {
    setMethod(nextMethod);
    setPaymentStarted(false);
    setUtr("");
    setError("");
  }

  function markBankTransferStarted() {
    setPaymentStarted(true);
    track("payment_started", {
      service_code: serviceCode,
      method: "bank_transfer",
      currency: "INR",
      value: total,
      step: "bank_transfer_instructions_viewed",
    });
  }

  async function submitUtr() {
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,40}$/.test(cleanUtr)) {
      setError("Enter the UTR / Transaction ID from your successful payment.");
      return;
    }

    setSubmitting(true);
    setError("");
    track("utr_submitted", {
      service_code: serviceCode,
      method,
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
          paymentMethod: method,
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
        method,
        step: "verification",
        error_category: "manual_payment_confirmation_failed",
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
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Secure manual checkout</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Pay {amountLabel}</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-300">Choose Direct UPI or Bank Transfer. Pay the exact total, then submit the UTR for verification.</p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <p><span className="text-zinc-500">Service:</span> <strong>{serviceName}</strong></p>
          <p><span className="text-zinc-500">Quantity:</span> <strong>{quantity.toLocaleString("en-IN")}</strong></p>
          <p className="break-all sm:col-span-2"><span className="text-zinc-500">Public link:</span> {link}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
        <button type="button" onClick={() => chooseMethod("upi")} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black ${method === "upi" ? "bg-white text-black" : "text-zinc-300"}`}>
          <Smartphone className="h-4 w-4" /> Direct UPI
        </button>
        <button type="button" disabled={!bankTransfer.enabled} onClick={() => chooseMethod("bank_transfer")} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40 ${method === "bank_transfer" ? "bg-white text-black" : "text-zinc-300"}`}>
          <Building2 className="h-4 w-4" /> Bank Transfer
        </button>
      </div>

      {method === "upi" ? (
        !upiId ? (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">UPI is not configured right now. Please contact support before paying.</div>
        ) : !paymentStarted ? (
          <>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">UPI ID</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="min-w-0 break-all text-base font-black">{upiId}</p>
                <button type="button" onClick={() => void copyValue("upi", upiId)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-orange-200"><Copy className="h-4 w-4" />{copied === "upi" ? "Copied" : "Copy"}</button>
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
        ) : null
      ) : !bankTransfer.enabled ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">Bank Transfer is not configured right now. Please use Direct UPI.</div>
      ) : !paymentStarted ? (
        <>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">IMPS / NEFT / Bank Transfer</p>
                <p className="mt-1 text-sm text-zinc-300">Transfer exactly <strong className="text-white">{amountLabel}</strong></p>
              </div>
              <Building2 className="h-6 w-6 text-orange-300" />
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <BankRow label="Account holder" value={bankTransfer.accountName} copyKey="account-name" copied={copied} onCopy={copyValue} />
              <BankRow label="Bank" value={bankTransfer.bankName} />
              <BankRow label="Account number" value={bankTransfer.accountNumber} copyKey="account-number" copied={copied} onCopy={copyValue} />
              <BankRow label="IFSC" value={bankTransfer.ifsc} copyKey="ifsc" copied={copied} onCopy={copyValue} />
              <BankRow label="Payment reference" value={reference} copyKey="reference" copied={copied} onCopy={copyValue} />
            </div>
          </div>
          <button type="button" onClick={markBankTransferStarted} className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-base font-black text-black shadow-lg">I&apos;ve Completed the Bank Transfer</button>
          <p className="mt-3 text-center text-xs leading-5 text-zinc-500">Use only the account details shown above. Keep the bank transaction receipt until your payment is verified.</p>
        </>
      ) : null}

      {paymentStarted ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <h2 className="text-lg font-black">Payment completed?</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-300">Enter the UTR / Transaction ID from your successful {method === "upi" ? "UPI payment" : "bank transfer"}. We will verify it before processing the order.</p>
            </div>
          </div>

          <label htmlFor="manual-payment-utr" className="mt-5 block text-sm font-black">UTR / Transaction ID</label>
          <input
            id="manual-payment-utr"
            value={utr}
            onChange={(event) => setUtr(event.target.value.slice(0, 40))}
            placeholder="Enter transaction ID"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-base outline-none focus:border-orange-400"
          />
          <details className="mt-3 text-xs text-zinc-400">
            <summary className="cursor-pointer font-semibold text-orange-300">Where can I find the UTR?</summary>
            <p className="mt-2 leading-5">Open your payment or banking app, go to transaction history, open this successful payment, then copy the UTR / Transaction ID.</p>
          </details>
          {error ? <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}
          <button type="button" disabled={submitting} onClick={() => void submitUtr()} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 font-black text-black disabled:opacity-60">
            {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Confirming...</> : "Submit Payment & Place Order"}
          </button>
          <button type="button" onClick={() => setPaymentStarted(false)} className="mt-3 min-h-11 w-full rounded-xl border border-white/10 px-4 text-sm font-bold text-zinc-300">Back to payment details</button>
          <p className="mt-3 text-center text-xs text-zinc-500">Do not submit the same UTR for more than one order.</p>
        </div>
      ) : null}
    </section>
  );
}

type BankRowProps = {
  label: string;
  value: string;
  copyKey?: string;
  copied?: string;
  onCopy?: (label: string, value: string) => Promise<void>;
};

function BankRow({ label, value, copyKey, copied, onCopy }: BankRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-1 break-all font-bold text-white">{value}</p>
      </div>
      {copyKey && onCopy ? (
        <button type="button" onClick={() => void onCopy(copyKey, value)} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 text-[11px] font-black text-orange-200">
          <Copy className="h-3.5 w-3.5" />{copied === copyKey ? "Copied" : "Copy"}
        </button>
      ) : null}
    </div>
  );
}
