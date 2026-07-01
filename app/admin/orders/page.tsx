import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminStatus } from "@/components/admin/AdminUI";

const statuses = [
  "all", "pending", "processing", "in_progress", "partial", "completed",
  "cancelled", "failed", "refill_requested", "refilling",
];
const money = (value: number | string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));
const count = (value: unknown) => value === null || value === undefined ? "—" : Number(value).toLocaleString("en-IN");

type SearchParams = {
  status?: string;
  platform?: string;
  service?: string;
  customer?: string;
  q?: string;
  from?: string;
  to?: string;
};

export default async function AdminOrdersPage({ searchParams = {} }: { searchParams?: SearchParams }) {
  const supabase = await createClient();
  const filter = statuses.includes(searchParams.status || "") ? searchParams.status! : "all";
  const platform = String(searchParams.platform || "").trim().slice(0, 40);
  const serviceFilter = String(searchParams.service || "").trim().slice(0, 100);
  const search = String(searchParams.q || "").trim().toLowerCase().slice(0, 120);
  const customer = String(searchParams.customer || "").trim().toLowerCase().slice(0, 120);

  let query = supabase
    .from("orders")
    .select("id,user_id,link,quantity,service_name,platform,charge,status,payment_status,provider_order_id,starting_count,current_count,delivered_count,remaining_count,progress_percent,count_detection_status,count_detection_message,refill_eligible,created_at,updated_at,profiles(email,full_name,phone),services(name,delivery_time)")
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);
  if (platform) query = query.ilike("platform", platform);
  if (serviceFilter) query = query.ilike("service_name", `%${serviceFilter}%`);
  if (searchParams.from && !Number.isNaN(Date.parse(searchParams.from))) query = query.gte("created_at", new Date(searchParams.from).toISOString());
  if (searchParams.to && !Number.isNaN(Date.parse(searchParams.to))) {
    const end = new Date(searchParams.to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  const { data, error } = await query.limit(500);
  const orders = (data ?? []).filter((order) => {
    const profile = order.profiles as unknown as { full_name?: string; email?: string } | null;
    const haystack = `${order.id} ${order.link} ${order.provider_order_id ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    const customerText = `${profile?.full_name ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!customer || customerText.includes(customer));
  });

  return (
    <main className="mx-auto max-w-[1900px] p-4 sm:p-8">
      <AdminPageHeader title="Order operations" description="Manage fulfillment, count tracking, refill work, provider references, and customer-visible progress." />

      {error ? (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Order tracking fields are unavailable. Apply the latest Supabase migration, then reload this page. {error.message}
        </p>
      ) : null}

      <form className="mt-6 grid gap-3 rounded-3xl border border-white bg-white/85 p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-7">
        <input name="q" defaultValue={searchParams.q} className="rounded-xl border border-slate-200 px-3 py-3 text-xs outline-none focus:border-blue-500 xl:col-span-2" placeholder="Order ID, email, link or provider ID" />
        <input name="customer" defaultValue={searchParams.customer} className="rounded-xl border border-slate-200 px-3 py-3 text-xs outline-none focus:border-blue-500" placeholder="Customer email/name" />
        <select name="status" defaultValue={filter} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs capitalize">
          {statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item.replaceAll("_", " ")}</option>)}
        </select>
        <input name="platform" defaultValue={platform} className="rounded-xl border border-slate-200 px-3 py-3 text-xs" placeholder="Platform" />
        <input name="service" defaultValue={serviceFilter} className="rounded-xl border border-slate-200 px-3 py-3 text-xs" placeholder="Service" />
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white">Filter</button>
          <Link href="/admin/orders" className="grid place-items-center rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-600">Reset</Link>
        </div>
        <label className="text-[10px] font-bold uppercase text-slate-400">From<input name="from" type="date" defaultValue={searchParams.from} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600" /></label>
        <label className="text-[10px] font-bold uppercase text-slate-400">To<input name="to" type="date" defaultValue={searchParams.to} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600" /></label>
      </form>

      <section className="panel-card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1850px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
              <tr>
                {["Order","Customer","Platform / Service","Link","Quantity","Price","Starting","Current","Remaining","Progress","Status","Payment","Created","Updated","Action"].map((head) => (
                  <th key={head} className="px-4 py-3">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const profile = order.profiles as unknown as { full_name?: string; email?: string } | null;
                const service = order.services as unknown as { name?: string; delivery_time?: string } | null;
                const progress = order.progress_percent === null ? null : Number(order.progress_percent);
                return (
                  <tr key={order.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-4"><p className="font-bold text-blue-600">#{order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-[9px] text-slate-400">{order.id}</p></td>
                    <td className="px-4 py-4"><p className="font-semibold">{profile?.full_name || "Customer"}</p><p className="mt-1 text-[9px] text-slate-400">{profile?.email || "—"}</p></td>
                    <td className="max-w-[220px] px-4 py-4"><p className="font-bold capitalize">{order.platform || "Other"}</p><p className="mt-1 truncate text-slate-500">{order.service_name || service?.name || "Service"}</p></td>
                    <td className="max-w-[240px] px-4 py-4"><a href={order.link} target="_blank" rel="noopener noreferrer" className="block truncate text-blue-600 hover:underline">{order.link}</a></td>
                    <td className="px-4 py-4 font-semibold">{count(order.quantity)}</td>
                    <td className="px-4 py-4 font-bold">{money(order.charge)}</td>
                    <td className="px-4 py-4">{count(order.starting_count)}{order.count_detection_status === "failed" ? <p className="mt-1 max-w-36 text-[9px] font-semibold text-amber-600">Manual count needed</p> : null}</td>
                    <td className="px-4 py-4">{count(order.current_count)}</td>
                    <td className="px-4 py-4">{count(order.remaining_count)}</td>
                    <td className="px-4 py-4">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${progress ?? 0}%` }} /></div>
                      <p className="mt-1 text-[9px] text-slate-500">{progress === null ? "Not available" : `${progress.toFixed(1)}%`}</p>
                    </td>
                    <td className="px-4 py-4"><AdminStatus value={order.status} /></td>
                    <td className="px-4 py-4"><AdminStatus value={order.payment_status || "paid"} /></td>
                    <td className="px-4 py-4 text-[10px] text-slate-500">{new Date(order.created_at).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4 text-[10px] text-slate-500">{new Date(order.updated_at || order.created_at).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4"><Link href={`/admin/orders/${order.id}`} className="inline-flex rounded-xl bg-[#0a1b3d] px-4 py-2.5 text-[10px] font-bold text-white">View & manage</Link></td>
                  </tr>
                );
              })}
              {!orders.length ? <tr><td colSpan={15} className="p-14 text-center text-slate-400">No orders match these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
