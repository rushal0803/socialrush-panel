import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminStatus } from "@/components/admin/AdminUI";

const statuses = [
  "all",
  "pending",
  "processing",
  "in_progress",
  "partial",
  "completed",
  "cancelled",
  "failed",
  "refill_requested",
  "refilling",
];

const money = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));

const count = (value: unknown) =>
  value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString("en-IN");

type SearchParams = {
  status?: string;
  platform?: string;
  service?: string;
  customer?: string;
  q?: string;
  from?: string;
  to?: string;
};

const filterField =
  "min-h-11 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 py-2.5 text-xs text-white outline-none placeholder:text-[#9CA3AF] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

export default async function AdminOrdersPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const supabase = await createClient();
  const filter = statuses.includes(searchParams.status || "")
    ? searchParams.status!
    : "all";
  const platform = String(searchParams.platform || "").trim().slice(0, 40);
  const serviceFilter = String(searchParams.service || "")
    .trim()
    .slice(0, 100);
  const search = String(searchParams.q || "")
    .trim()
    .toLowerCase()
    .slice(0, 120);
  const customer = String(searchParams.customer || "")
    .trim()
    .toLowerCase()
    .slice(0, 120);

  let query = supabase
    .from("orders")
    .select(
      "id,user_id,link,quantity,service_name,platform,charge,status,payment_status,provider_order_id,starting_count,current_count,delivered_count,remaining_count,progress_percent,count_detection_status,count_detection_message,refill_eligible,created_at,updated_at,profiles(email,full_name,phone),services(name,delivery_time)",
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);
  if (platform) query = query.ilike("platform", platform);
  if (serviceFilter) {
    query = query.ilike("service_name", `%${serviceFilter}%`);
  }
  if (
    searchParams.from &&
    !Number.isNaN(Date.parse(searchParams.from))
  ) {
    query = query.gte(
      "created_at",
      new Date(searchParams.from).toISOString(),
    );
  }
  if (searchParams.to && !Number.isNaN(Date.parse(searchParams.to))) {
    const end = new Date(searchParams.to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  const { data, error } = await query.limit(500);
  const orders = (data ?? []).filter((order) => {
    const profile = order.profiles as unknown as {
      full_name?: string;
      email?: string;
    } | null;
    const haystack =
      `${order.id} ${order.link} ${order.provider_order_id ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    const customerText =
      `${profile?.full_name ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    return (
      (!search || haystack.includes(search)) &&
      (!customer || customerText.includes(customer))
    );
  });

  return (
    <main className="mx-auto max-w-[1900px] p-4 sm:p-8">
      <AdminPageHeader
        title="Order operations"
        description="Manage fulfillment, count tracking, refill work, provider references, and customer-visible progress."
      />

      {error ? (
        <p className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
          Order tracking fields are unavailable. Apply the latest Supabase
          migration, then reload this page. {error.message}
        </p>
      ) : null}

      <form className="mt-6 grid gap-3 rounded-3xl border border-orange-400/25 bg-[#111111] p-4 shadow-[0_22px_54px_-38px_rgba(255,122,0,.7)] sm:grid-cols-2 xl:grid-cols-7">
        <input
          name="q"
          defaultValue={searchParams.q}
          className={`${filterField} xl:col-span-2`}
          placeholder="Order ID, email, link or provider ID"
        />
        <input
          name="customer"
          defaultValue={searchParams.customer}
          className={filterField}
          placeholder="Customer email/name"
        />
        <select
          name="status"
          defaultValue={filter}
          className={`${filterField} capitalize`}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item === "all"
                ? "All statuses"
                : item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input
          name="platform"
          defaultValue={platform}
          className={filterField}
          placeholder="Platform"
        />
        <input
          name="service"
          defaultValue={serviceFilter}
          className={filterField}
          placeholder="Service"
        />
        <div className="flex gap-2">
          <button className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-4 py-3 text-xs font-bold text-white">
            Filter
          </button>
          <Link
            href="/admin/orders"
            className="grid min-h-11 place-items-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-[#D1D5DB]"
          >
            Reset
          </Link>
        </div>
        <label className="text-[10px] font-bold uppercase text-[#9CA3AF]">
          From
          <input
            name="from"
            type="date"
            defaultValue={searchParams.from}
            className={`${filterField} mt-1`}
          />
        </label>
        <label className="text-[10px] font-bold uppercase text-[#9CA3AF]">
          To
          <input
            name="to"
            type="date"
            defaultValue={searchParams.to}
            className={`${filterField} mt-1`}
          />
        </label>
      </form>

      <section className="mt-5 grid gap-4 lg:hidden">
        {orders.map((order) => {
          const profile = order.profiles as unknown as {
            full_name?: string;
            email?: string;
          } | null;
          const service = order.services as unknown as {
            name?: string;
            delivery_time?: string;
          } | null;
          const progress =
            order.progress_percent === null
              ? null
              : Number(order.progress_percent);

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-orange-400/25 bg-[#111111] p-4 shadow-[0_18px_44px_-30px_rgba(255,122,0,.6)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-orange-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-white">
                    {profile?.full_name || "Customer"}
                  </p>
                  <p className="mt-1 break-all text-[10px] leading-4 text-[#9CA3AF]">
                    {profile?.email || "—"}
                  </p>
                </div>
                <AdminStatus value={order.status} />
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-[#0B0B0F] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Platform / service
                </p>
                <p className="mt-1 text-xs font-bold capitalize text-white">
                  {order.platform || "Other"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#D1D5DB]">
                  {order.service_name || service?.name || "Service"}
                </p>
              </div>

              <a
                href={order.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block break-all rounded-xl border border-orange-400/20 bg-orange-500/10 p-3 text-[11px] leading-5 text-orange-300 hover:underline"
              >
                {order.link}
              </a>

              <dl className="mt-3 grid grid-cols-2 gap-2.5">
                {[
                  ["Quantity", count(order.quantity)],
                  ["Amount", money(order.charge)],
                  ["Created", new Date(order.created_at).toLocaleString("en-IN")],
                  [
                    "Progress",
                    progress === null
                      ? "Not available"
                      : `${progress.toFixed(1)}%`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-xl border border-white/10 bg-[#151515] p-3"
                  >
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-xs font-bold text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex items-center justify-between gap-3">
                <AdminStatus value={order.payment_status || "paid"} />
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-4 py-2.5 text-xs font-bold text-white"
                >
                  View & manage
                </Link>
              </div>
            </article>
          );
        })}
        {!orders.length ? (
          <p className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-center text-sm text-[#9CA3AF]">
            No orders match these filters.
          </p>
        ) : null}
      </section>

      <section className="panel-card mt-5 hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1850px] text-left text-xs">
            <thead>
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Platform / Service",
                  "Link",
                  "Quantity",
                  "Price",
                  "Starting",
                  "Current",
                  "Remaining",
                  "Progress",
                  "Status",
                  "Payment",
                  "Created",
                  "Updated",
                  "Action",
                ].map((head) => (
                  <th key={head} className="px-4 py-3">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const profile = order.profiles as unknown as {
                  full_name?: string;
                  email?: string;
                } | null;
                const service = order.services as unknown as {
                  name?: string;
                  delivery_time?: string;
                } | null;
                const progress =
                  order.progress_percent === null
                    ? null
                    : Number(order.progress_percent);

                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-bold text-orange-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-[9px] text-[#9CA3AF]">
                        {order.id}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {profile?.full_name || "Customer"}
                      </p>
                      <p className="mt-1 text-[9px] text-[#9CA3AF]">
                        {profile?.email || "—"}
                      </p>
                    </td>
                    <td className="max-w-[220px] px-4 py-4">
                      <p className="font-bold capitalize text-white">
                        {order.platform || "Other"}
                      </p>
                      <p className="mt-1 truncate text-[#D1D5DB]">
                        {order.service_name || service?.name || "Service"}
                      </p>
                    </td>
                    <td className="max-w-[240px] px-4 py-4">
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-orange-300 hover:underline"
                      >
                        {order.link}
                      </a>
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {count(order.quantity)}
                    </td>
                    <td className="px-4 py-4 font-bold text-white">
                      {money(order.charge)}
                    </td>
                    <td className="px-4 py-4">
                      {count(order.starting_count)}
                      {order.count_detection_status === "failed" ? (
                        <p className="mt-1 max-w-36 text-[9px] font-semibold text-amber-300">
                          Manual count needed
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      {count(order.current_count)}
                    </td>
                    <td className="px-4 py-4">
                      {count(order.remaining_count)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                          style={{ width: `${progress ?? 0}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[9px] text-[#9CA3AF]">
                        {progress === null
                          ? "Not available"
                          : `${progress.toFixed(1)}%`}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatus value={order.status} />
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatus value={order.payment_status || "paid"} />
                    </td>
                    <td className="px-4 py-4 text-[10px] text-[#9CA3AF]">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 text-[10px] text-[#9CA3AF]">
                      {new Date(
                        order.updated_at || order.created_at,
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-4 py-2.5 text-[10px] font-bold text-white"
                      >
                        View & manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!orders.length ? (
                <tr>
                  <td
                    colSpan={15}
                    className="p-14 text-center text-[#9CA3AF]"
                  >
                    No orders match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
