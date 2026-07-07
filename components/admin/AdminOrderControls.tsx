"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = ["pending","processing","in_progress","partial","completed","cancelled","failed","refill_requested","refilling"];

type Props = {
  order: {
    id: string;
    status: string;
    starting_count: number | null;
    current_count: number | null;
    partial_quantity_delivered: number | null;
    provider_order_id: string | null;
    admin_note: string | null;
    failed_reason: string | null;
    refund_credit_note: string | null;
    refill_eligible: boolean;
    delivered_count?: number | null;
    remaining_count?: number | null;
    walletRefunded?: boolean;
    refundedAmount?: number | null;
  };
};

export default function AdminOrderControls({ order }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function request(path: string, options: RequestInit) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update order");
      if (payload.refund?.refunded) {
        setMessage(`Order updated and ₹${Number(payload.refund.amount).toLocaleString("en-IN")} refunded to wallet.`);
      } else if (payload.refund?.alreadyRefunded) {
        setMessage("Order updated. Wallet refund was already completed earlier.");
      } else {
        setMessage(payload.detection?.success === false ? payload.detection.message : "Order updated successfully.");
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update order");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await request(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: values.status,
        starting_count: values.starting_count === "" ? null : Number(values.starting_count),
        current_count: values.current_count === "" ? null : Number(values.current_count),
        delivered_count: values.delivered_count === "" ? null : Number(values.delivered_count),
        remaining_count: values.remaining_count === "" ? null : Number(values.remaining_count),
        provider_order_id: values.provider_order_id,
        admin_note: values.admin_note,
        failed_reason: values.failed_reason,
        refund_credit_note: values.refund_credit_note,
        refill_eligible: values.refill_eligible === "on",
      }),
    });
  }

  return (
    <section className="rounded-3xl border border-orange-400/25 bg-[#111111] p-5 shadow-[0_22px_54px_rgba(0,0,0,.34)] sm:p-7">
      <h2 className="text-lg font-black text-white">Admin controls</h2>
      <p className="mt-1 text-xs text-[#D1D5DB]">Manual values are never fabricated and override unavailable automatic detection.</p>
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{message}</p> : null}

      <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#FF9F00]">Wallet Refund</p>
            <p className="mt-1 text-sm font-bold text-white">
              {order.walletRefunded
                ? `Refunded${order.refundedAmount ? ` · ₹${Number(order.refundedAmount).toLocaleString("en-IN")}` : ""}`
                : "Not refunded"}
            </p>
            <p className="mt-1 text-xs text-[#D1D5DB]">Refund actions are server-side and protected for admins only.</p>
          </div>
          <button
            type="button"
            disabled={busy || order.walletRefunded}
            onClick={() => request(`/api/admin/orders/${order.id}/status`, { method: "POST", body: JSON.stringify({ status: "refunded" }) })}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-3 text-xs font-bold text-white shadow-[0_14px_30px_rgba(255,122,0,.24)] transition hover:-translate-y-0.5 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {order.walletRefunded ? "Refunded" : "Refund to wallet"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {["processing", "in_progress", "completed", "partial", "failed", "cancelled", "refill_requested", "refilling"].map((status) => (
          <button key={status} disabled={busy} onClick={() => request(`/api/admin/orders/${order.id}/status`, { method: "POST", body: JSON.stringify({ status }) })} className="rounded-xl border border-orange-400/20 bg-white/[.06] px-3 py-2.5 text-[10px] font-bold capitalize text-[#D1D5DB] transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-orange-500/10 hover:text-white active:scale-[.98] disabled:opacity-50">
            {status === "refill_requested" ? "Request refill" : `Mark ${status.replaceAll("_", " ")}`}
          </button>
        ))}
      </div>

      <button disabled={busy} onClick={() => request(`/api/admin/orders/${order.id}/refresh-count`, { method: "POST", body: "{}" })} className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">
        {busy ? "Working..." : "Refresh Current Count"}
      </button>

      <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[#D1D5DB]">Status<select name="status" defaultValue={order.status} className="mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Provider order ID<input name="provider_order_id" defaultValue={order.provider_order_id || ""} className="mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" /></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Starting count<input name="starting_count" type="number" min="0" defaultValue={order.starting_count ?? ""} className="mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" /></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Current count<input name="current_count" type="number" min="0" defaultValue={order.current_count ?? ""} className="mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" /></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Delivered count<input name="delivered_count" type="number" min="0" defaultValue={order.delivered_count ?? order.partial_quantity_delivered ?? ""} className="mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" /></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Remaining count<input name="remaining_count" type="number" min="0" defaultValue={order.remaining_count ?? ""} className="mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" /></label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold"><input name="refill_eligible" type="checkbox" defaultChecked={order.refill_eligible} /> Refill eligible</label>
        <label className="text-xs font-semibold text-[#D1D5DB] sm:col-span-2">Admin note<textarea name="admin_note" defaultValue={order.admin_note || ""} className="mt-2 min-h-24 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" placeholder="Private: never shown to customer" /></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Failed reason<textarea name="failed_reason" defaultValue={order.failed_reason || ""} className="mt-2 min-h-20 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" placeholder="Reason shown internally" /></label>
        <label className="text-xs font-semibold text-[#D1D5DB]">Refund / credit note<textarea name="refund_credit_note" defaultValue={order.refund_credit_note || ""} className="mt-2 min-h-20 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-3 text-xs text-white placeholder:text-[#9CA3AF]" placeholder="Refund audit note" /></label>
        <button disabled={busy} className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-xs font-bold text-white shadow-[0_14px_30px_rgba(255,122,0,.24)] transition hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-50 sm:col-span-2">{busy ? "Saving..." : "Save Progress & Order"}</button>
      </form>
    </section>
  );
}
