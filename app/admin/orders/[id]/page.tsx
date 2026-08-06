import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminStatus } from "@/components/admin/AdminUI";
import AdminOrderControls from "@/components/admin/AdminOrderControls";
import { formatPublicOrderId } from "@/lib/orders/public-reference";

const money = (value: unknown) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value ?? 0));
const count = (value: unknown) => value === null || value === undefined ? "Not available" : Number(value).toLocaleString("en-IN");

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*,profiles(full_name,email,phone),services(name,delivery_time,refill_policy)")
    .eq("id", params.id)
    .maybeSingle();
  if (error || !order) notFound();

  const [{ data: history }, { data: transactions }, { data: refillRequests }] = await Promise.all([
    supabase.from("order_status_history").select("*").eq("order_id", params.id).order("created_at"),
    supabase.from("transactions").select("id,amount,type,status,payment_method,description,created_at,metadata").contains("metadata", { order_id: params.id }).order("created_at"),
    supabase.from("order_refill_requests").select("id,status,customer_note,requested_at").eq("order_id", params.id).order("requested_at", { ascending: false }),
  ]);
  const profile = order.profiles as unknown as { full_name?: string; email?: string; phone?: string } | null;
  const service = order.services as unknown as { name?: string; delivery_time?: string; refill_policy?: string } | null;
  const progress = order.progress_percent === null ? 0 : Number(order.progress_percent);
  const refundTransaction = (transactions ?? []).find((item) => item.type === "refund");
  const walletRefunded = Boolean(refundTransaction);

  return (
    <main className="mx-auto max-w-[1500px] p-4 sm:p-8">
      <AdminPageHeader title={`Order ${formatPublicOrderId(order.public_order_id)}`} description="Customer, fulfillment, wallet, count, refill, and status history in one operational view." action={<Link href="/admin/orders" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600">Back to orders</Link>} />

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-600">{order.platform || "Platform"}</p><h2 className="mt-2 text-2xl font-black text-[#0B0B0F]">{order.service_name || service?.name || "Growth service"}</h2></div><AdminStatus value={order.status} /></div>
            <a href={order.link} target="_blank" rel="noopener noreferrer" className="mt-5 block break-all rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-orange-700 hover:underline">{order.link}</a>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Quantity",count(order.quantity)],["Price",money(order.charge)],["Delivery",service?.delivery_time || "Not specified"],["Refill",order.refill_eligible ? "Eligible" : "Not eligible"]].map(([label,value]) => <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[9px] font-bold uppercase text-slate-400">{label}</p><p className="mt-2 text-sm font-black text-slate-800">{value}</p></div>)}</div>
          </section>

          <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-black text-[#0B0B0F]">Fulfillment progress</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Starting",count(order.starting_count)],["Current",count(order.current_count)],["Delivered",count(order.delivered_count)],["Remaining",count(order.remaining_count)]].map(([label,value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-bold uppercase text-slate-400">{label}</p><p className="mt-2 text-lg font-black">{value}</p></div>)}</div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 text-right text-xs font-bold text-orange-700">{order.progress_percent === null ? "Progress unavailable" : `${progress.toFixed(2)}% delivered`}</p>
            {order.count_detection_status === "failed" ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">Automatic count unavailable. Please update manually. {order.count_detection_message}</p> : null}
            {order.count_detection_status === "manual" ? <p className="mt-4 rounded-xl border border-orange-400/25 bg-orange-500/10 p-3 text-xs font-semibold text-orange-200">Counts are currently maintained manually by an administrator.</p> : null}
            <p className="mt-4 text-xs text-slate-500">Detection: <strong>{order.count_detection_status || "not attempted"}</strong> · Source: {order.count_detection_source || "—"} · Last checked: {order.last_count_checked_at ? new Date(order.last_count_checked_at).toLocaleString("en-IN") : "Never"}</p>
          </section>

          <AdminOrderControls
            order={{
              ...order,
              walletRefunded,
              refundedAmount: refundTransaction ? Number(refundTransaction.amount ?? 0) : null,
              refillRequest: refillRequests?.[0] || null,
            }}
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
            <h2 className="text-base font-black text-[#0B0B0F]">Customer</h2>
            <p className="mt-4 font-bold">{profile?.full_name || "Customer"}</p><p className="mt-1 text-xs text-slate-500">{profile?.email || "—"}</p><p className="mt-1 text-xs text-slate-500">{profile?.phone || "WhatsApp not provided"}</p>
          </section>
          <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
            <h2 className="text-base font-black text-[#0B0B0F]">Payment & wallet deduction</h2>
            <p className="mt-4 text-xs text-slate-500">Payment status <AdminStatus value={order.payment_status || "paid"} /></p>
            <p className="mt-3 text-xs text-slate-500">
              Wallet Refund{" "}
              <AdminStatus value={walletRefunded ? "refunded" : "pending"} />
            </p>
            <div className="mt-4 space-y-3">{(transactions ?? []).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between gap-3 text-xs"><strong className="capitalize">{item.type}</strong><strong>{money(item.amount)}</strong></div><p className="mt-1 text-[10px] text-slate-500">{item.description || item.payment_method} · {new Date(item.created_at).toLocaleString("en-IN")}</p></div>)}{!transactions?.length ? <p className="text-xs text-slate-400">No linked ledger entry found.</p> : null}</div>
          </section>
          <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
            <h2 className="text-base font-black text-[#0B0B0F]">Status timeline</h2>
            <div className="mt-5 space-y-4">{(history ?? []).map((item) => <div key={item.id} className="relative border-l-2 border-orange-100 pl-4"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-orange-500" /><AdminStatus value={item.status} /><p className="mt-1 text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString("en-IN")}</p>{item.note ? <p className="mt-1 text-xs text-slate-600">{item.note}</p> : null}</div>)}{!history?.length ? <p className="text-xs text-slate-400">Timeline begins after the tracking migration is applied.</p> : null}</div>
          </section>
          <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
            <h2 className="text-base font-black text-[#0B0B0F]">Operational details</h2>
            <dl className="mt-4 space-y-3 text-xs">{[["Provider order ID",order.provider_order_id || "—"],["Customer note",order.customer_note || "—"],["Refill requested",order.refill_requested_at ? new Date(order.refill_requested_at).toLocaleString("en-IN") : "No"],["Completed",order.completed_at ? new Date(order.completed_at).toLocaleString("en-IN") : "—"],["Created",new Date(order.created_at).toLocaleString("en-IN")],["Last updated",new Date(order.updated_at || order.created_at).toLocaleString("en-IN")]].map(([label,value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-slate-400">{label}</dt><dd className="text-right font-semibold text-slate-700">{value}</dd></div>)}</dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
