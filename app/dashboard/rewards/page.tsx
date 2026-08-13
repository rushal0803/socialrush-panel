import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Gift, Landmark, Link2, Sparkles, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import PlatformIcon from "@/components/PlatformIcon";
import { formatPublicOrderId } from "@/lib/orders/public-reference";
import { createClient } from "@/lib/supabase/server";
import CopyReferral from "./CopyReferral";

type RewardEvent = {
  id: string;
  event_type: string;
  amount: number;
  status: string;
  created_at: string;
  orders: { id: string; public_order_id: string | null; service_name: string | null; platform: string | null } | { id: string; public_order_id: string | null; service_name: string | null; platform: string | null }[] | null;
};

const money = (value: number) => value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
const date = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const title = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function RewardStatus({ status }: { status: string }) {
  const isCredited = status === "credited";
  const isPending = status === "pending" || status === "approved";
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${isCredited ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : isPending ? "border-amber-300/20 bg-amber-300/10 text-amber-100" : "border-white/10 bg-white/[.045] text-slate-300"}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function ActivityRow({ event, desktop = false }: { event: RewardEvent; desktop?: boolean }) {
  const credited = event.status === "credited";
  const order = Array.isArray(event.orders) ? event.orders[0] : event.orders;
  const orderId = order ? formatPublicOrderId(order.public_order_id) : null;
  const details = <><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-300/15 bg-orange-400/[.075] text-orange-200"><Gift className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{title(event.event_type)}</p><p className="mt-1 truncate text-[11px] text-slate-400">{order?.service_name || (orderId ? `Order ${orderId}` : "Reward activity")}</p></div></div></>;
  const orderInfo = order ? <Link href={`/dashboard/orders/${order.id}`} className="group flex min-w-0 items-center gap-2 text-xs text-slate-300 transition hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400/40"><PlatformIcon platform={order.platform || "Other"} className="h-4 w-4 shrink-0 text-orange-200" /><span className="truncate font-mono text-orange-200/90">{orderId}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></Link> : <span className="text-xs text-slate-500">—</span>;
  const amount = <p className={`text-right text-sm font-black ${credited ? "text-emerald-300" : "text-orange-100"}`}>{credited ? "+" : ""}{money(Number(event.amount))}</p>;

  if (desktop) return <article className="grid grid-cols-[minmax(15rem,1.45fr)_minmax(10rem,.85fr)_minmax(8rem,.6fr)_minmax(8rem,.65fr)_minmax(6rem,.55fr)] items-center gap-4 px-5 py-4 transition hover:bg-white/[.035]">{details}<p className="text-xs text-slate-400">{date(event.created_at)}</p>{orderInfo}{amount}<RewardStatus status={event.status} /></article>;
  return <article className="min-w-0 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-4 shadow-[0_18px_42px_-32px_rgba(0,0,0,.9)]"><div className="flex min-w-0 items-start justify-between gap-3">{details}<div className="shrink-0">{amount}</div></div><div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-white/[.07] pt-3"><div className="min-w-0">{orderInfo}</div><RewardStatus status={event.status} /></div><p className="mt-2 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-500">{date(event.created_at)}</p></article>;
}

function ErrorState() {
  return <section role="alert" className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-5 text-center"><AlertTriangle className="mx-auto h-5 w-5 text-amber-200" /><p className="mt-2 text-sm font-bold text-white">Some reward details could not be loaded</p><p className="mt-1 text-xs text-slate-400">Please refresh the page to try again.</p></section>;
}

export default async function Page() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: code, error: codeError }, { data: refs = [], error: refsError }, { data: events = [], error: eventsError }, { data: rules, error: rulesError }] = await Promise.all([
    db.rpc("ensure_my_referral_code"),
    db.from("referral_attributions").select("id,status,created_at").eq("referrer_id", user.id),
    db.from("customer_reward_events").select("id,event_type,amount,status,created_at,orders(id,public_order_id,service_name,platform)").eq("user_id", user.id).order("created_at", { ascending: false }),
    db.from("reward_programme_rules").select("enabled,minimum_order_amount,referral_expiry_days").eq("id", true).maybeSingle(),
  ]);

  const rewardEvents = (events ?? []) as unknown as RewardEvent[];
  const creditedTotal = rewardEvents.filter((event) => event.status === "credited").reduce((total, event) => total + Number(event.amount), 0);
  const pendingCount = refs.filter((ref) => ref.status === "pending").length;
  const successfulCount = refs.filter((ref) => ["qualified", "rewarded"].includes(ref.status)).length;
  const referralLink = code ? `https://www.getsocialrush.com/register?ref=${code}` : "";
  const hasLoadError = Boolean(codeError || refsError || eventsError || rulesError);

  return <main className="dashboard-premium-page min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_12%_0%,rgba(255,122,0,.16),transparent_26%),radial-gradient(circle_at_85%_12%,rgba(255,188,76,.08),transparent_20%),#050505] p-4 text-white sm:p-6 lg:p-8"><div className="mx-auto max-w-[1320px]">
    <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">Rewards</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] text-white sm:text-4xl">Your SocialRUSH rewards</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Promotional reward credits are added to your wallet when approved. They are not withdrawable cash and are never guaranteed.</p></div><Link href="/dashboard/wallet" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-300/25 bg-orange-400/10 px-4 text-sm font-bold text-orange-100 transition hover:border-orange-300/50 hover:bg-orange-400/15 focus:outline-none focus:ring-4 focus:ring-orange-400/15"><Wallet className="h-4 w-4" />View Wallet</Link></header>

    {hasLoadError ? <ErrorState /> : null}

    <section aria-label="Reward balance" className="relative mt-5 overflow-hidden rounded-3xl border border-orange-300/20 bg-[linear-gradient(125deg,#17100a_0%,#111217_48%,#101116_100%)] p-5 shadow-[0_28px_60px_-35px_rgba(0,0,0,.95)] sm:p-7"><div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" /><div className="pointer-events-none absolute right-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-orange-200/20 to-transparent" /><div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-orange-200"><span className="grid h-7 w-7 place-items-center rounded-lg border border-orange-300/25 bg-orange-300/10"><Gift className="h-4 w-4" /></span>Available Rewards</div><p className="mt-4 break-words text-4xl font-black tracking-[-.05em] text-white sm:text-5xl">{money(creditedTotal)}</p><p className="mt-2 text-sm text-slate-300">Total promotional rewards credited to your wallet.</p></div><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /><span>Credited rewards are reflected in your wallet balance.</span></div></div></section>

    <section aria-label="Rewards overview" className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Available Rewards", money(creditedTotal), Gift, "text-orange-200"], ["Total Earned", money(creditedTotal), Sparkles, "text-emerald-300"], ["Pending Referrals", pendingCount, Clock3, "text-amber-200"], ["Successful Referrals", successfulCount, CheckCircle2, "text-emerald-300"]].map(([label, value, Icon, tone]) => { const MetricIcon = Icon as typeof Gift; return <article key={String(label)} className="min-w-0 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-4 shadow-[0_18px_36px_-30px_rgba(0,0,0,.9)]"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.13em] text-slate-400"><MetricIcon className={`h-4 w-4 ${tone}`} />{String(label)}</div><p className="mt-2 truncate text-xl font-black text-white sm:text-2xl">{String(value)}</p></article>; })}</section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.8fr)]"><div className="min-w-0"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Activity</p><h2 className="mt-1 text-xl font-black text-white">Reward history</h2></div><p className="text-xs text-slate-500">{rewardEvents.length} {rewardEvents.length === 1 ? "entry" : "entries"}</p></div>{rewardEvents.length ? <><div className="mt-3 hidden overflow-hidden rounded-2xl border border-white/10 bg-[#101116] lg:block"><div className="grid grid-cols-[minmax(15rem,1.45fr)_minmax(10rem,.85fr)_minmax(8rem,.6fr)_minmax(8rem,.65fr)_minmax(6rem,.55fr)] gap-4 border-b border-white/10 px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-slate-500"><span>Reward</span><span>Date</span><span>Related order</span><span className="text-right">Amount</span><span>Status</span></div><div className="divide-y divide-white/[.07]">{rewardEvents.map((event) => <ActivityRow key={event.id} event={event} desktop />)}</div></div><div className="mt-3 grid gap-3 lg:hidden">{rewardEvents.map((event) => <ActivityRow key={event.id} event={event} />)}</div></> : <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-7 text-center sm:p-10"><Gift className="mx-auto h-7 w-7 text-orange-300" /><h3 className="mt-3 text-base font-black text-white">No reward activity yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">Your eligible SocialRUSH rewards will appear here when available.</p><Link href="/dashboard/new-order" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black text-white focus:outline-none focus:ring-4 focus:ring-orange-400/25"><ArrowRight className="h-4 w-4" />Place New Order</Link></div>}</div>

      <aside className="space-y-5"><section className="rounded-2xl border border-white/10 bg-[#101116] p-5 shadow-[0_20px_48px_-36px_rgba(0,0,0,.9)]"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Invite</p><h2 className="mt-1 text-lg font-black text-white">Your referral link</h2></div><Link2 className="h-5 w-5 text-orange-200" /></div>{code ? <><p className="mt-4 break-all rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 font-mono text-xs font-bold text-orange-100">{code}</p><p className="mt-3 break-all text-xs leading-5 text-slate-400">{referralLink}</p><CopyReferral value={referralLink} /></> : <p className="mt-4 text-sm leading-6 text-slate-400">Your referral link is unavailable right now. Refresh to try again.</p>}</section>
      <section className="rounded-2xl border border-white/10 bg-[#101116] p-5"><div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-orange-200" /><h2 className="text-base font-black text-white">How rewards work</h2></div>{rules?.enabled ? <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><p>A referred customer must complete a qualifying paid order of at least <span className="font-bold text-orange-100">{money(Number(rules.minimum_order_amount))}</span> within <span className="font-bold text-orange-100">{rules.referral_expiry_days} days</span>.</p><p className="border-t border-white/[.07] pt-3 text-xs leading-5 text-slate-400">Cancelled, failed, refunded, duplicate, or self-referred activity does not qualify. Reward credits are subject to approval.</p></div> : <p className="mt-4 text-sm leading-6 text-slate-300">The rewards programme is currently not active. Your referral code remains available, but no reward is promised until programme rules are enabled.</p>}</section></aside></section>
  </div></main>;
}
