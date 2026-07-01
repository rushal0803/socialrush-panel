"use client";

import { motion } from "framer-motion";
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
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  in_progress: "bg-cyan-50 text-cyan-700",
  completed: "bg-emerald-50 text-emerald-700",
  partial: "bg-violet-50 text-violet-700",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-indigo-50 text-indigo-700",
  failed: "bg-rose-50 text-rose-700",
  refill_requested: "bg-orange-50 text-orange-700",
  refilling: "bg-sky-50 text-sky-700",
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
    <main className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,#f8faff,#f3f6fb)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Campaign operations</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#07152f]">Order History</h1>
            <p className="mt-2 text-sm text-slate-500">Track all campaign records with delivery-level operational columns.</p>
          </div>
          <Link href="/dashboard/new-order" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
            + New Order
          </Link>
        </div>

        <section className="mt-7 rounded-3xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-xl">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Search order ID, service, link"
            />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs capitalize outline-none">
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none">
              <option value="all">All platforms</option>
              {platforms.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button onClick={() => { setSearch(""); setStatus("all"); setPlatform("all"); }} className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600">Reset</button>
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-left text-xs">
              <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400">
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
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={12} className="p-14 text-center text-slate-400">Loading orders...</td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-blue-600">{readableOrderId(item.id)}</td>
                      <td className="px-5 py-4 text-slate-500">{new Date(item.createdAt).toLocaleString("en-IN")}</td>
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate font-semibold">{item.service}</p>
                        <p className="mt-1 text-[10px] text-slate-400 capitalize">{item.platform} · {item.packageName || "Standard"}</p>
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-4 text-slate-500">{item.link}</td>
                      <td className="px-5 py-4 font-semibold">{item.quantity.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 font-bold">{money(item.amount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-4 text-slate-600">{item.startCount === null ? "Pending detection" : item.startCount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-slate-600">{item.currentCount === null ? "—" : item.currentCount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-slate-600">{item.remains === null ? "—" : item.remains.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${item.progress ?? 0}%` }} /></div><p className="mt-1 text-[9px] text-slate-500">{item.progress === null ? "Awaiting count" : `${item.progress.toFixed(1)}%`}</p></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link href="/dashboard/support" className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">
                            Raise Ticket
                          </Link>
                          <a
                            href={`https://wa.me/918860330771?text=${encodeURIComponent(`Hi SocialRUSH, I need help with order ${readableOrderId(item.id)}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && !filtered.length && (
                  <tr>
                    <td colSpan={12} className="p-14 text-center text-slate-400">No orders match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
