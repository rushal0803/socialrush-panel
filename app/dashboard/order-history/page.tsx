"use client";

import { motion } from "framer-motion";
import { Plus, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

type Campaign = {
  id: string;
  service: string;
  platform: string;
  link: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
  packageName: string | null;
  startCount: number | null;
  currentCount: number | null;
  deliveredCount: number | null;
  remains: number | null;
  progress: number | null;
};

const statuses = ["all", "pending", "processing", "in_progress", "completed", "partial", "cancelled", "refunded", "failed", "refill_requested", "refilling"];
const statusStyle: Record<string, string> = {
  pending: "border border-amber-400/25 bg-amber-500/10 text-amber-200",
  processing: "border border-orange-400/25 bg-orange-500/10 text-orange-200",
  in_progress: "border border-orange-400/25 bg-orange-500/10 text-orange-200",
  completed: "border border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  partial: "border border-amber-400/25 bg-amber-500/10 text-amber-200",
  cancelled: "border border-white/15 bg-white/5 text-[#D1D5DB]",
  refunded: "border border-orange-400/25 bg-orange-500/10 text-orange-200",
  failed: "border border-red-400/25 bg-red-500/10 text-red-200",
  refill_requested: "border border-orange-400/25 bg-orange-500/10 text-orange-200",
  refilling: "border border-orange-400/25 bg-orange-500/10 text-orange-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusStyle[status] || statusStyle.pending}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replaceAll("_", " ")}
    </span>
  );
}

function readableOrderId(id: string) {
  const compact = id.replace(/-/g, "");
  const seed = Number.parseInt(compact.slice(0, 8), 16);
  return `SR-${String(Math.abs(seed % 900000) + 1000).padStart(4, "0")}`;
}

export default function CampaignHistoryPage() {
  const { currency } = usePreferredCurrency("INR");
  const money = (value: number) => formatCurrency(value, currency);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    const loadOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, service_name, platform, link, quantity, charge, status, created_at, package_name, starting_count, current_count, delivered_count, remaining_count, progress_percent, services(name, categories(name))")
        .order("created_at", { ascending: false });
        setCampaigns(
          (data ?? []).map((row) => {
            const service = row.services as unknown as { name?: string; categories?: { name?: string } | null } | null;
            const quantity = Number(row.quantity ?? 0);
            return {
              id: row.id,
              service: row.service_name || service?.name || "Growth service",
              platform: row.platform || service?.categories?.name?.split(" ")[0] || "Other",
              link: row.link,
              quantity,
              amount: Number(row.charge),
              status: row.status,
              createdAt: row.created_at,
              packageName: row.package_name,
              startCount: row.starting_count === null ? null : Number(row.starting_count),
              currentCount: row.current_count === null ? null : Number(row.current_count),
              deliveredCount: row.delivered_count === null ? null : Number(row.delivered_count),
              remains: row.remaining_count === null ? null : Number(row.remaining_count),
              progress: row.progress_percent === null ? null : Number(row.progress_percent),
            };
          }),
        );
        setLoading(false);
    };
    void loadOrders();
    const channel = supabase.channel("customer-order-tracking").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadOrders()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const platforms = useMemo(() => Array.from(new Set(campaigns.map((item) => item.platform))).sort(), [campaigns]);

  const filtered = useMemo(
    () =>
      campaigns.filter((item) => {
        const matchesSearch = `${item.id} ${item.service} ${item.link}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "all" || item.status === status;
        const matchesPlatform = platform === "all" || item.platform === platform;
        return matchesSearch && matchesStatus && matchesPlatform;
      }),
    [campaigns, search, status, platform],
  );

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,.12),transparent_34%),#050505] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.18em] text-orange-400">Campaign operations</span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Order History</h1>
            <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">Track campaign status, delivery progress, and order details in one place.</p>
          </div>
          <Link href="/dashboard/new-order" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_-18px_rgba(255,122,0,.75)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98] sm:w-auto">
            <Plus className="h-4 w-4" /> New Order
          </Link>
        </div>

        <section className="mt-7 rounded-3xl border border-orange-400/20 bg-[#111111] p-4 shadow-[0_24px_55px_-36px_rgba(255,122,0,.7)] sm:p-5">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#6B7280] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                placeholder="Search order ID, service, link"
              />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3 text-sm capitalize text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15">
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="min-h-12 rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15">
              <option value="all">All platforms</option>
              {platforms.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button type="button" onClick={() => { setSearch(""); setStatus("all"); setPlatform("all"); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-200 transition-all duration-200 ease-out hover:border-orange-400 hover:bg-orange-500/15 active:scale-[.98]">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 hidden overflow-hidden rounded-3xl border border-orange-400/20 bg-[#111111] shadow-[0_26px_60px_-40px_rgba(255,122,0,.7)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-left text-xs">
              <thead className="border-b border-orange-400/20 bg-[#0B0B0F] text-[9px] uppercase tracking-wider text-orange-200">
                <tr>
                  {[
                    "Order ID",
                    "Date",
                    "Service",
                    "Link",
                    "Quantity",
                    "Amount",
                    "Status",
                    "Start Count",
                    "Current",
                    "Remains",
                    "Progress",
                    "Action",
                  ].map((head) => (
                    <th key={head} className="px-5 py-3">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading && (
                  <tr>
                    <td colSpan={12} className="p-14 text-center text-[#9CA3AF]">Loading orders...</td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id} className="text-[#D1D5DB] transition hover:bg-orange-500/[.04]">
                      <td className="px-5 py-4 font-bold text-orange-300">{readableOrderId(item.id)}</td>
                      <td className="px-5 py-4 text-[#9CA3AF]">{new Date(item.createdAt).toLocaleString("en-IN")}</td>
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate font-semibold text-white">{item.service}</p>
                        <p className="mt-1 text-[10px] capitalize text-[#9CA3AF]">{item.platform} · {item.packageName || "Standard"}</p>
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-4 text-[#9CA3AF]">{item.link}</td>
                      <td className="px-5 py-4 font-semibold text-white">{item.quantity.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 font-bold text-orange-200">{money(item.amount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-4 text-[#D1D5DB]">{item.startCount === null ? "Pending detection" : item.startCount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-[#D1D5DB]">{item.currentCount === null ? "—" : item.currentCount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-[#D1D5DB]">{item.remains === null ? "—" : item.remains.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4"><div className="h-2 w-24 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]" style={{ width: `${item.progress ?? 0}%` }} /></div><p className="mt-1 text-[9px] text-[#9CA3AF]">{item.progress === null ? "Awaiting count" : `${item.progress.toFixed(1)}%`}</p></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link href="/dashboard/support" className="rounded-lg border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold text-orange-200">
                            Raise Ticket
                          </Link>
                          <a
                            href={`https://wa.me/918860330771?text=${encodeURIComponent(`Hi SocialRUSH, I need help with order ${readableOrderId(item.id)}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-200"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && !filtered.length && (
                  <tr>
                    <td colSpan={12} className="p-14 text-center text-[#9CA3AF]">No orders match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid gap-4 lg:hidden">
          {loading ? (
            <div className="rounded-3xl border border-orange-400/20 bg-[#111111] p-8 text-center text-sm text-[#9CA3AF]">
              Loading orders...
            </div>
          ) : null}

          {!loading && filtered.map((item) => (
            <article key={item.id} className="min-w-0 rounded-3xl border border-orange-400/25 bg-[#111111] p-5 shadow-[0_22px_48px_-34px_rgba(255,122,0,.7)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#9CA3AF]">Order ID</p>
                  <p className="mt-1 text-base font-black text-orange-300">{readableOrderId(item.id)}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#151515] p-4">
                <p className="text-sm font-bold leading-6 text-white">{item.service}</p>
                <p className="mt-1 text-xs capitalize text-[#9CA3AF]">{item.platform} · {item.packageName || "Standard"}</p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Date", new Date(item.createdAt).toLocaleDateString("en-IN")],
                  ["Quantity", item.quantity.toLocaleString("en-IN")],
                  ["Amount", money(item.amount)],
                  ["Start count", item.startCount === null ? "Pending" : item.startCount.toLocaleString("en-IN")],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-[#0B0B0F] p-3">
                    <dt className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">{label}</dt>
                    <dd className={`mt-1.5 break-words text-sm font-bold ${label === "Amount" ? "text-orange-200" : "text-white"}`}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 rounded-2xl border border-white/10 bg-[#0B0B0F] p-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">Campaign link</p>
                <p className="mt-1.5 break-all text-sm leading-6 text-[#D1D5DB]">{item.link}</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#9CA3AF]">
                  <span>Delivery progress</span>
                  <span>{item.progress === null ? "Awaiting count" : `${item.progress.toFixed(1)}%`}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]" style={{ width: `${item.progress ?? 0}%` }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/dashboard/support" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 py-2.5 text-xs font-bold text-orange-200 transition-all duration-200 ease-out active:scale-[.98]">
                  Raise Ticket
                </Link>
                <a
                  href={`https://wa.me/918860330771?text=${encodeURIComponent(`Hi SocialRUSH, I need help with order ${readableOrderId(item.id)}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-200 transition-all duration-200 ease-out active:scale-[.98]"
                >
                  WhatsApp
                </a>
              </div>
            </article>
          ))}

          {!loading && !filtered.length ? (
            <div className="rounded-3xl border border-orange-400/20 bg-[#111111] p-8 text-center">
              <p className="text-sm font-bold text-white">No orders match this filter.</p>
              <p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Try changing the search or filter options above.</p>
            </div>
          ) : null}
        </motion.section>
      </div>
    </main>
  );
}
