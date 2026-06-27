import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateOrder } from "@/app/admin/actions";
import { AdminPageHeader, AdminStatus, inputClass, primaryButton } from "@/components/admin/AdminUI";

const statuses = ["all", "pending", "processing", "in_progress", "completed", "partial", "cancelled", "refunded", "failed"];
const money = (value: number | string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));

export default async function AdminOrdersPage({ searchParams }: { searchParams?: { status?: string; q?: string } }) {
  const supabase = await createClient();
  const filter = statuses.includes(searchParams?.status || "") ? searchParams!.status! : "all";

  let query = supabase
    .from("orders")
    .select("id, user_id, link, quantity, package_name, charge, status, provider_order_id, admin_notes, start_count, remains, created_at, updated_at, profiles(email, full_name), services(name, delivery_time)")
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);
  const search = String(searchParams?.q || "").trim().replace(/[^\p{L}\p{N}:/?&=._+\-\s]/gu, "").slice(0, 120);
  if (search) query = query.or(`link.ilike.%${search}%,provider_order_id.ilike.%${search}%,admin_notes.ilike.%${search}%`);
  const { data: orders } = await query.limit(200);

  return (
    <main className="mx-auto max-w-[1850px] p-5 sm:p-8">
      <AdminPageHeader
        title="Order operations"
        description="Manage fulfillment status, provider references, start count, remains, and refund-safe cancellation workflow."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {statuses.map((item) => (
          <Link
            key={item}
            href={item === "all" ? "/admin/orders" : `/admin/orders?status=${item}`}
            className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold capitalize ${
              filter === item ? "bg-blue-600 text-white" : "border bg-white text-slate-500"
            }`}
          >
            {item.replaceAll("_", " ")}
          </Link>
        ))}
      </div>
      <form className="mt-4 flex max-w-xl gap-2"><input type="hidden" name="status" value={filter === "all" ? "" : filter}/><input name="q" defaultValue={search} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" placeholder="Search link, provider ID, or admin notes"/><button className="rounded-xl bg-[#0a1b3d] px-5 py-3 text-xs font-bold text-white">Search</button></form>

      <section className="panel-card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Service",
                  "Quantity",
                  "Amount",
                  "Status",
                  "Start Count",
                  "Remains",
                  "Provider ID",
                  "Updated",
                  "Manage",
                ].map((head) => (
                  <th key={head} className="px-5 py-3">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(orders ?? []).map((order) => {
                const profile = order.profiles as unknown as { full_name?: string; email?: string } | null;
                const service = order.services as unknown as { name?: string; delivery_time?: string } | null;
                return (
                  <tr key={order.id} className="align-top hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-blue-600">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="mt-1 text-[9px] text-slate-400">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{profile?.full_name || "Customer"}</p>
                      <p className="mt-1 text-[9px] text-slate-400">{profile?.email}</p>
                    </td>

                    <td className="max-w-[250px] px-5 py-4">
                      <p className="truncate font-semibold">{service?.name || "Service"}</p>
                      <p className="mt-1 text-[9px] text-slate-400">{service?.delivery_time || "1-7 days"} delivery</p>
                      <p className="mt-1 truncate text-[9px] text-slate-400">{order.link}</p>
                    </td>

                    <td className="px-5 py-4">{Number(order.quantity).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 font-bold">{money(order.charge)}</td>
                    <td className="px-5 py-4">
                      <AdminStatus value={order.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-600">{Number(order.start_count ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-slate-600">{Number(order.remains ?? order.quantity).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-slate-500">{order.provider_order_id || "-"}</td>
                    <td className="px-5 py-4 text-[10px] text-slate-400">
                      {new Date(order.updated_at || order.created_at).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <details>
                        <summary className="cursor-pointer list-none rounded-lg bg-blue-50 px-3 py-2 text-center text-[10px] font-bold text-blue-600">
                          Update
                        </summary>

                        <form action={updateOrder} className="mt-3 w-80 space-y-3 rounded-xl border bg-white p-3 shadow-xl">
                          <input type="hidden" name="id" value={order.id} />

                          <label className="block text-[9px] font-bold uppercase text-slate-400">
                            Status
                            <select name="status" defaultValue={order.status} className={inputClass}>
                              {statuses.slice(1).map((item) => (
                                <option key={item} value={item}>
                                  {item.replaceAll("_", " ")}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block text-[9px] font-bold uppercase text-slate-400">
                            Provider order ID
                            <input name="provider_order_id" defaultValue={order.provider_order_id || ""} className={inputClass} placeholder="Provider reference" />
                          </label>

                          <div className="grid grid-cols-2 gap-2">
                            <label className="block text-[9px] font-bold uppercase text-slate-400">
                              Start count
                              <input
                                name="start_count"
                                type="number"
                                min="0"
                                defaultValue={Number(order.start_count ?? 0)}
                                className={inputClass}
                              />
                            </label>

                            <label className="block text-[9px] font-bold uppercase text-slate-400">
                              Remains
                              <input
                                name="remains"
                                type="number"
                                min="0"
                                defaultValue={Number(order.remains ?? order.quantity)}
                                className={inputClass}
                              />
                            </label>
                          </div>

                          <label className="block text-[9px] font-bold uppercase text-slate-400">
                            Admin notes
                            <textarea
                              name="admin_notes"
                              defaultValue={order.admin_notes || ""}
                              className={`${inputClass} min-h-20 resize-none`}
                              placeholder="Internal notes only"
                            />
                          </label>

                          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">
                            Changing status to Cancelled/Refunded automatically credits the customer wallet once.
                          </p>

                          <button className={`${primaryButton} w-full`}>Save order update</button>
                        </form>
                      </details>
                    </td>
                  </tr>
                );
              })}

              {!orders?.length && (
                <tr>
                  <td colSpan={11} className="p-14 text-center text-slate-400">
                    No orders match this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
