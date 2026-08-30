"use client";

import { AlertTriangle, ArrowUpRight, CheckCircle2, CircleDashed, Clock3, Eye, Plus, RefreshCw, RotateCcw, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { customerOrderServices } from "@/lib/order-service-experience";
import { customerOrderStatus, customerStatusClass } from "@/lib/customer-order-status";
import { formatPublicOrderId } from "@/lib/orders/public-reference";
import { createClient } from "@/lib/supabase/client";

type Campaign = {
  id: string; publicOrderId: string; service: string; platform: string; link: string; quantity: number; amount: number; status: string; createdAt: string;
  packageName: string | null; deliveredCount: number | null; remains: number | null; progress: number | null; deliveryTime: string | null; refillPolicy: string | null; refillEligible: boolean; refillRequestedAt: string | null;
};

const activeStatuses = ["pending", "processing", "in_progress", "partial", "refill_requested", "refilling"];
const statusIcons: Record<string, typeof Clock3> = { completed: CheckCircle2, cancelled: XCircle, failed: AlertTriangle, processing: RefreshCw, in_progress: RefreshCw, refilling: RefreshCw };

function StatusBadge({ status }: { status: string }) {
  const Icon = statusIcons[status] || Clock3;
  return <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${customerStatusClass(status)}`}><Icon aria-hidden="true" className="h-3 w-3 shrink-0" /><span className="truncate">{customerOrderStatus(status).label}</span></span>;
}

function reorderHref(item: Campaign) {
  const service = customerOrderServices.find((candidate) => candidate.name.toLowerCase() === item.service.toLowerCase()) ?? customerOrderServices.find((candidate) => candidate.platform === item.platform.toLowerCase() && item.service.toLowerCase().includes(candidate.code.split("-").pop() || ""));
  return service ? `/dashboard/new-order?${new URLSearchParams({ platform: service.platform, service: service.code, quantity: String(item.quantity), link: item.link, resume: "1" })}` : null;
}

function LoadingCards() {
  return <>{[0, 1, 2].map((item) => <div key={item} className="animate-pulse rounded-2xl border border-white/10 bg-[#111217] p-4"><div className="h-4 w-28 rounded bg-white/10" /><div className="mt-4 h-6 w-3/4 rounded bg-white/10" /><div className="mt-5 h-12 rounded-xl bg-white/5" /></div>)}</>;
}

export default function CampaignHistoryPage() {
  const { currency, rates } = usePreferredCurrency("INR");
  const money = (value: number) => formatCurrency(value, currency, rates);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true); setLoadError("");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadError("Orders could not be loaded right now."); setLoading(false); return; }
      const { data, error } = await supabase.from("orders").select("id, public_order_id, service_name, platform, link, quantity, charge, status, created_at, package_name, delivered_count, remaining_count, progress_percent, refill_eligible, refill_requested_at, services(name, delivery_time, refill_policy, categories(name))").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) { setLoadError("Orders could not be loaded right now."); setLoading(false); return; }
      setCampaigns((data ?? []).map((row) => {
        const service = row.services as unknown as { name?: string; delivery_time?: string; refill_policy?: string; categories?: { name?: string } | null } | null;
        return { id: row.id, publicOrderId: formatPublicOrderId(row.public_order_id), service: row.service_name || service?.name || "Growth service", platform: row.platform || service?.categories?.name?.split(" ")[0] || "Other", link: row.link || "", quantity: Number(row.quantity ?? 0), amount: Number(row.charge ?? 0), status: row.status || "pending", createdAt: row.created_at, packageName: row.package_name, deliveredCount: row.delivered_count === null ? null : Number(row.delivered_count), remains: row.remaining_count === null ? null : Number(row.remaining_count), progress: row.progress_percent === null ? null : Number(row.progress_percent), deliveryTime: service?.delivery_time || null, refillPolicy: service?.refill_policy || null, refillEligible: Boolean(row.refill_eligible), refillRequestedAt: row.refill_requested_at || null };
      }));
      setLoading(false);
    };
    void loadOrders();
  }, [reloadKey]);

  const platforms = useMemo(() => Array.from(new Set(campaigns.map((item) => item.platform))).sort(), [campaigns]);
  const availableStatuses = useMemo(() => Array.from(new Set(campaigns.map((item) => item.status))).sort(), [campaigns]);
  const filtered = useMemo(() => campaigns.filter((item) => `${item.publicOrderId} ${item.platform} ${item.service}`.toLowerCase().includes(search.toLowerCase()) && (status === "all" || item.status === status) && (platform === "all" || item.platform === platform)), [campaigns, platform, search, status]);
  const summary = useMemo(() => ({ total: campaigns.length, active: campaigns.filter((item) => activeStatuses.includes(item.status)).length, completed: campaigns.filter((item) => item.status === "completed").length, pending: campaigns.filter((item) => item.status === "pending").length }), [campaigns]);
  const resetFilters = () => { setSearch(""); setStatus("all"); setPlatform("all"); };
  const hasFilters = Boolean(search || status !== "all" || platform !== "all");

  return <main className="dashboard-premium-page dashboard-orders-page min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,.13),transparent_30%),#050505] p-4 text-white sm:p-6 lg:p-8">
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">Orders</p><h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-white sm:text-4xl">Your campaigns</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Track and manage your SocialRUSH orders from one place.</p></div>
        <Link href="/dashboard/new-order" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white shadow-[0_16px_35px_-18px_rgba(255,122,0,.9)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-400/25 active:translate-y-0 active:scale-[.98] sm:w-auto"><Plus className="h-4 w-4" />Place New Order</Link>
      </header>

      <section aria-label="Order summary" className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Total Orders", summary.total, CircleDashed, "text-white"], ["Active / Processing", summary.active, RefreshCw, "text-amber-200"], ["Completed", summary.completed, CheckCircle2, "text-emerald-300"], ["Pending", summary.pending, Clock3, "text-slate-200"]].map(([label, value, Icon, tone]) => { const SummaryIcon = Icon as typeof CircleDashed; return <article key={String(label)} className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-4 shadow-[0_18px_36px_-30px_rgba(0,0,0,.9)]"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.13em] text-slate-400"><SummaryIcon className={`h-4 w-4 ${tone}`} />{String(label)}</div><p className="mt-2 text-2xl font-black text-white sm:text-3xl">{String(value)}</p></article>; })}
      </section>

      <section aria-label="Order filters" className="mt-5 rounded-2xl border border-white/10 bg-[#101116]/95 p-3 shadow-[0_20px_50px_-35px_rgba(0,0,0,.9)] sm:p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(11rem,.7fr)_minmax(11rem,.7fr)_auto]">
          <label className="relative min-w-0"><span className="sr-only">Search orders</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/10" placeholder="Search order ID, service or platform" /></label>
          <label><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/10"><option value="all">All statuses</option>{availableStatuses.map((item) => <option key={item} value={item}>{customerOrderStatus(item).label}</option>)}</select></label>
          <label><span className="sr-only">Filter by platform</span><select value={platform} onChange={(event) => setPlatform(event.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-orange-400/60 focus:ring-4 focus:ring-orange-400/10"><option value="all">All platforms</option>{platforms.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="button" disabled={!hasFilters} onClick={resetFilters} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-slate-300 transition hover:border-orange-400/35 hover:bg-orange-500/10 hover:text-orange-100 focus:outline-none focus:ring-4 focus:ring-orange-400/10 disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw className="h-4 w-4" />Reset</button>
        </div>
      </section>

      <section className="mt-5 hidden overflow-hidden rounded-2xl border border-white/10 bg-[#101116] shadow-[0_28px_60px_-42px_rgba(0,0,0,.95)] lg:block">
        <div className="grid grid-cols-[minmax(18rem,1.65fr)_minmax(10rem,.7fr)_minmax(9rem,.65fr)_minmax(8rem,.6fr)_minmax(10rem,.8fr)_8rem] gap-4 border-b border-white/10 px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-slate-500"><span>Campaign</span><span>Order</span><span>Delivery</span><span>Amount</span><span>Status</span><span className="text-right">Action</span></div>
        <div className="divide-y divide-white/[.07]">{loading ? <LoadingCards /> : null}{!loading && loadError ? <ErrorState retry={() => setReloadKey((value) => value + 1)} /> : null}{!loading && !loadError && filtered.map((item) => <DesktopRow key={item.id} item={item} money={money} />)}{!loading && !loadError && !filtered.length ? <EmptyState filtered={campaigns.length > 0} reset={resetFilters} /> : null}</div>
      </section>

      <section className="mt-5 grid gap-3 lg:hidden">{loading ? <LoadingCards /> : null}{!loading && loadError ? <ErrorState retry={() => setReloadKey((value) => value + 1)} /> : null}{!loading && !loadError && filtered.map((item) => <MobileCard key={item.id} item={item} money={money} />)}{!loading && !loadError && !filtered.length ? <EmptyState filtered={campaigns.length > 0} reset={resetFilters} /> : null}</section>
    </div>
  </main>;
}

function DesktopRow({ item, money }: { item: Campaign; money: (value: number) => string }) {
  return <article className="grid grid-cols-[minmax(18rem,1.65fr)_minmax(10rem,.7fr)_minmax(9rem,.65fr)_minmax(8rem,.6fr)_minmax(10rem,.8fr)_8rem] items-center gap-4 px-5 py-4 transition duration-200 hover:bg-white/[.035]">
    <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.045] text-lg"><PlatformIcon platform={item.platform} className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{item.service}</p><p className="mt-1 truncate text-[11px] capitalize text-slate-400">{item.platform}{item.packageName ? ` · ${item.packageName}` : ""}</p>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-[10px] text-orange-200/85 hover:text-orange-100"><span className="truncate">{item.link}</span><ArrowUpRight className="h-3 w-3 shrink-0" /></a> : null}</div></div>
    <div className="min-w-0"><p className="truncate font-mono text-xs font-bold text-orange-300">{item.publicOrderId}</p><p className="mt-1 text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
    <div><p className="text-sm font-bold text-white">{item.quantity.toLocaleString("en-IN")}</p><p className="mt-1 text-[10px] text-slate-500">{item.deliveredCount === null ? (item.deliveryTime || "Awaiting delivery") : `${item.deliveredCount.toLocaleString("en-IN")} delivered`}</p></div>
    <p className="text-sm font-black text-orange-100">{money(item.amount)}</p>
    <div><StatusBadge status={item.status} />{item.refillEligible ? <p className="mt-1.5 text-[10px] font-semibold text-emerald-300">{item.refillRequestedAt ? "Refill requested" : "Refill eligible"}</p> : null}</div>
    <Link href={`/dashboard/orders/${item.id}`} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-orange-400/25 bg-orange-500/10 px-3 text-[11px] font-bold text-orange-100 transition hover:border-orange-400/60 hover:bg-orange-500/20 focus:outline-none focus:ring-4 focus:ring-orange-400/10">Details <Eye className="h-3.5 w-3.5" /></Link>
  </article>;
}

function MobileCard({ item, money }: { item: Campaign; money: (value: number) => string }) {
  const reorder = reorderHref(item);
  return <article className="min-w-0 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-4 shadow-[0_18px_42px_-32px_rgba(0,0,0,.9)]"><div className="flex min-w-0 items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.05]"><PlatformIcon platform={item.platform} className="h-5 w-5" /></span><div className="min-w-0"><h2 className="truncate text-sm font-black text-white">{item.service}</h2><p className="mt-1 truncate text-[11px] capitalize text-slate-400">{item.platform}{item.packageName ? ` · ${item.packageName}` : ""}</p></div></div><StatusBadge status={item.status} /></div>
    <dl className="mt-4 grid grid-cols-2 gap-2"><Metric label="Order ID" value={item.publicOrderId} accent /><Metric label="Date" value={new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} /><Metric label="Quantity" value={item.quantity.toLocaleString("en-IN")} /><Metric label="Amount" value={money(item.amount)} accent /></dl>
    {item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-2 flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-slate-300 transition hover:border-orange-400/35"><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-orange-300" /><span className="truncate">{item.link}</span></a> : null}
    {(item.deliveryTime || item.refillEligible) ? <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400"><span>{item.deliveryTime || "Delivery details available in order"}</span>{item.refillEligible ? <span className="text-emerald-300">{item.refillRequestedAt ? "Refill requested" : "Refill eligible"}</span> : null}</div> : null}
    {item.progress !== null ? <div className="mt-3"><div className="flex justify-between text-[10px] font-semibold text-slate-400"><span>Delivery progress</span><span>{Math.max(0, Math.min(100, item.progress)).toFixed(1)}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }} /></div></div> : null}
    <div className="mt-4 grid gap-2 min-[390px]:grid-cols-2"><Link href={`/dashboard/orders/${item.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 text-sm font-black text-white focus:outline-none focus:ring-4 focus:ring-orange-400/25"><Eye className="h-4 w-4" />View Details</Link>{reorder && item.status === "completed" ? <Link href={reorder} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-300">Order Again</Link> : null}</div>
  </article>;
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) { return <div className="min-w-0 rounded-xl border border-white/[.08] bg-black/20 p-2.5"><dt className="text-[9px] font-black uppercase tracking-[.12em] text-slate-500">{label}</dt><dd className={`mt-1 truncate text-xs font-bold ${accent ? "text-orange-200" : "text-white"}`}>{value}</dd></div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="p-8 text-center"><AlertTriangle className="mx-auto h-6 w-6 text-red-300" /><p className="mt-3 text-sm font-bold text-white">Orders could not be loaded right now.</p><p className="mt-1 text-xs text-slate-400">Please try again in a moment.</p><button type="button" onClick={retry} className="mt-4 min-h-11 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white">Try again</button></div>; }
function EmptyState({ filtered, reset }: { filtered: boolean; reset: () => void }) { return <div className="p-8 text-center sm:p-12"><CircleDashed className="mx-auto h-7 w-7 text-orange-300" /><p className="mt-3 text-base font-black text-white">{filtered ? "No orders match these filters" : "No campaigns yet"}</p><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">{filtered ? "Try changing your search or filters to see more campaigns." : "Your SocialRUSH orders will appear here after you place your first campaign."}</p>{filtered ? <button type="button" onClick={reset} className="mt-4 min-h-11 rounded-xl border border-white/15 px-5 text-sm font-bold text-slate-200">Clear filters</button> : <Link href="/dashboard/new-order" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black">Place Your First Order</Link>}</div>; }
