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
      setMessage(payload.detection?.success === false ? payload.detection.message : "Order updated successfully.");
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
        partial_quantity_delivered: values.partial_quantity_delivered === "" ? null : Number(values.partial_quantity_delivered),
        provider_order_id: values.provider_order_id,
        admin_note: values.admin_note,
        failed_reason: values.failed_reason,
        refund_credit_note: values.refund_credit_note,
        refill_eligible: values.refill_eligible === "on",
      }),
    });
  }

  return (
    <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-black text-[#0B0B0F]">Admin controls</h2>
      <p className="mt-1 text-xs text-slate-500">Manual values are never fabricated and override unavailable automatic detection.</p>
      {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{message}</p> : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {["processing", "in_progress", "completed", "partial", "failed", "cancelled", "refill_requested", "refilling"].map((status) => (
          <button key={status} disabled={busy} onClick={() => request(`/api/admin/orders/${order.id}/status`, { method: "POST", body: JSON.stringify({ status }) })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-bold capitalize text-slate-700 transition hover:border-orange-300 disabled:opacity-50">
            {status === "refill_requested" ? "Request refill" : `Mark ${status.replaceAll("_", " ")}`}
          </button>
        ))}
      </div>

      <button disabled={busy} onClick={() => request(`/api/admin/orders/${order.id}/refresh-count`, { method: "POST", body: "{}" })} className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">
        {busy ? "Working..." : "Refresh Current Count"}
      </button>

      <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold">Status<select name="status" defaultValue={order.status} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
        <label className="text-xs font-semibold">Provider order ID<input name="provider_order_id" defaultValue={order.provider_order_id || ""} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" /></label>
        <label className="text-xs font-semibold">Starting count<input name="starting_count" type="number" min="0" defaultValue={order.starting_count ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" /></label>
        <label className="text-xs font-semibold">Current count<input name="current_count" type="number" min="0" defaultValue={order.current_count ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" /></label>
        <label className="text-xs font-semibold">Partial quantity delivered<input name="partial_quantity_delivered" type="number" min="0" defaultValue={order.partial_quantity_delivered ?? ""} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" /></label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold"><input name="refill_eligible" type="checkbox" defaultChecked={order.refill_eligible} /> Refill eligible</label>
        <label className="text-xs font-semibold sm:col-span-2">Admin note<textarea name="admin_note" defaultValue={order.admin_note || ""} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" placeholder="Private: never shown to customer" /></label>
        <label className="text-xs font-semibold">Failed reason<textarea name="failed_reason" defaultValue={order.failed_reason || ""} className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" /></label>
        <label className="text-xs font-semibold">Refund / credit note<textarea name="refund_credit_note" defaultValue={order.refund_credit_note || ""} className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-3 text-xs" /></label>
        <button disabled={busy} className="rounded-xl bg-[#0B0B0F] px-5 py-3 text-xs font-bold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Saving..." : "Save Manual Counts & Order"}</button>
      </form>
    </section>
  );
}
