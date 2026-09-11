"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
  paymentStatus: string | null;
  customerNote: string | null;
  amount: number;
};

export default function AdminPendingPaymentVerification({ orderId, paymentStatus, customerNote, amount }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (paymentStatus !== "verification_pending") return null;

  async function confirmPayment() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "processing", note: "Manual UPI receipt verified against the submitted UTR." }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to confirm payment.");
      setMessage("Payment verified. Order moved to Processing.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to confirm payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-amber-300 bg-amber-50 p-5 shadow-sm sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-700">Action required · UPI payment verification</p>
      <h2 className="mt-2 text-lg font-black text-slate-950">Verify ₹{Number(amount).toLocaleString("en-IN")} before fulfillment</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">Check the actual incoming payment in your UPI / bank app. Match the amount and submitted UTR below. Do not approve based on a screenshot alone.</p>
      <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer payment submission</p>
        <p className="mt-2 break-words font-semibold">{customerNote || "UTR details were not saved."}</p>
      </div>
      {error ? <p className="mt-3 rounded-xl bg-red-100 p-3 text-xs font-semibold text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 rounded-xl bg-emerald-100 p-3 text-xs font-semibold text-emerald-700">{message}</p> : null}
      <button type="button" disabled={busy} onClick={() => void confirmPayment()} className="mt-4 min-h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg disabled:opacity-50">
        {busy ? "Confirming…" : "Confirm Payment & Start Processing"}
      </button>
      <p className="mt-3 text-xs leading-5 text-amber-800">Click this only after you see the exact payment in your account. This action marks payment as Paid and moves the order to Processing.</p>
    </section>
  );
}
