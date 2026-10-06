import DashboardOverviewContent from "@/components/dashboard/DashboardOverviewContent";
import RetentionNextActionCard from "@/components/dashboard/RetentionNextActionCard";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { customerOrderServices } from "@/lib/order-service-experience";
import { buildFrequentRepeatPatterns, buildRepeatOrderHref } from "@/lib/cro/repeat-order";
import { buildRetentionDecision } from "@/lib/retention/engine";
import { FIRST_ORDER_NON_QUALIFYING_STATES } from "@/lib/cro/first-order-conversion";
import { redirect } from "next/navigation";
import styles from "./phase7-command-center.module.css";

const activeStatuses = ["pending", "processing", "in_progress", "partial", "awaiting_action"];
type RawOrder = { id: string; service_name: string | null; platform: string | null; link: string | null; quantity: number | null; status: string | null; charge: number | null; created_at: string; progress_percent: number | null; refill_eligible: boolean | null };
type RawTransaction = { id: string; amount: number | null; type: string | null; status: string | null; payment_method: string | null; created_at: string };
type RawTicket = { id: string; subject: string; status: string; updated_at: string; order_id: string | null };
type RawReward = { id: string; amount: number; status: string; created_at: string };
type RawProfile = { id: string; label: string; platform: string; public_url: string; last_used_at: string | null; created_at: string };
type RawDraft = { platform: string; service_code: string; quantity: number; updated_at: string };
type RawFavourite = { service_id: number; services: { code: string | null; status: string | null; name: string | null } | null };
type RawStarterService = { code: string | null; name: string | null; platform: string | null; rate: number | string | null; min: number | null; status: string | null; is_active: boolean | null; accepts_new_orders: boolean | null };
type RawCheckoutRecovery = { id: string; service_code: string; quantity: number; destination_link: string | null; total_paise: number | string; created_at: string; expires_at: string | null; };

export default async function DashboardPage() {
  const { supabase, user, profile } = await getDashboardContext();
  if (!user) redirect("/login?next=%2Fdashboard");
  const userId = user.id;
  const results = await Promise.allSettled([
    supabase.from("orders").select("id, service_name, platform, link, quantity, status, charge, created_at, progress_percent, refill_eligible").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", activeStatuses),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
    supabase.from("transactions").select("id, amount, type, status, payment_method, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(4),
    supabase.from("support_tickets").select("id, subject, status, updated_at, order_id").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["open", "waiting_for_support", "waiting_for_customer", "answered"]),
    supabase.from("customer_reward_events").select("id, amount, status, created_at").eq("user_id", userId).eq("status", "credited").order("created_at", { ascending: false }).limit(1),
    supabase.from("saved_social_profiles").select("id, label, platform, public_url, last_used_at, created_at").eq("user_id", userId).order("last_used_at", { ascending: false, nullsFirst: false }).limit(3),
    supabase.from("order_drafts").select("platform, service_code, quantity, updated_at").eq("user_id", userId).maybeSingle(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("orders").select("id, service_name, platform, link, quantity, status, charge, created_at, progress_percent, refill_eligible").eq("user_id", userId).in("status", activeStatuses).order("created_at", { ascending: false }).limit(4),
    supabase.from("customer_favourites").select("service_id, services(code,status,name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("payment_status", "verification_pending"),
    supabase.from("services").select("code,name,platform,rate,min,status,is_active,accepts_new_orders").in("code", ["instagram-likes", "facebook-followers", "instagram-followers"]),
    supabase.from("checkout_intents").select("id,service_code,quantity,destination_link,total_paise,created_at,expires_at").eq("user_id", userId).eq("status", "created").is("order_id", null).gte("created_at", new Date(Date.now()-7*864e5).toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("orders").select("id, service_name, platform, link, quantity, status, charge, created_at, progress_percent, refill_eligible").eq("user_id", userId).eq("status", "completed").order("created_at", { ascending: false }).limit(10),
    supabase.from("reward_programme_rules").select("enabled,manual_approval,minimum_order_amount,new_customer_reward").eq("id", true).maybeSingle(),
    supabase.from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("status", "in", `(${FIRST_ORDER_NON_QUALIFYING_STATES.join(",")})`)
      .or(`payment_status.is.null,payment_status.not.in.(${FIRST_ORDER_NON_QUALIFYING_STATES.join(",")})`),
    supabase.from("order_refill_requests").select("id", { count: "exact", head: true }).eq("customer_id", userId).not("status", "in", "(completed,rejected,cancelled)"),
  ]);
  const value = <T,>(index: number, fallback: T) => results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<{ data: T }>).value.data ?? fallback : fallback;
  const count = (index: number) => results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<{ count: number | null }>).value.count ?? 0 : 0;
  const failed = (index: number) => { const result = results[index]; return result.status === "rejected" || Boolean((result.value as { error?: unknown }).error); };

  const mapOrder = (row: RawOrder) => { const serviceName = row.service_name || "Growth service"; const platform = row.platform || "other"; const quantity = Number(row.quantity || 0); return { id: row.id, serviceName, platform, quantity, status: row.status || "pending", price: Number(row.charge || 0), createdAt: row.created_at, progress: row.progress_percent == null ? null : Number(row.progress_percent), refillEligible: Boolean(row.refill_eligible), repeatHref: buildRepeatOrderHref({ serviceName, platform, quantity, link: row.link || "" }, customerOrderServices) }; };
  const orders = value<RawOrder[]>(0, []).map(mapOrder);
  const transactions = value<RawTransaction[]>(3, []).map((row) => ({ id: row.id, amount: Number(row.amount || 0), type: row.type || "credit", status: row.status || "pending", paymentMethod: row.payment_method || "wallet", createdAt: row.created_at }));
  const ticket = value<RawTicket[]>(4, [])[0] ?? null;
  const reward = value<RawReward[]>(6, [])[0];
  const savedProfiles = value<RawProfile[]>(7, []).map((row) => ({ ...row, lastUsedAt: row.last_used_at || row.created_at }));
  const rawDraft = value<RawDraft | null>(8, null);
  const activeCampaigns = value<RawOrder[]>(10, []).map(mapOrder);
  const favourites = value<RawFavourite[]>(11, []).flatMap((row) => { const code = row.services?.code; const service = code ? customerOrderServices.find((item) => item.code === code) : null; return service ? [{ code: service.code, name: service.name, platform: service.platform, available: row.services?.status === "active" }] : []; });
  const draftService = rawDraft ? customerOrderServices.find((service) => service.code === rawDraft.service_code && service.platform === rawDraft.platform) : null;
  const draft = rawDraft && draftService ? { platform: rawDraft.platform, serviceCode: rawDraft.service_code, serviceName: draftService.name, quantity: Number(rawDraft.quantity), updatedAt: rawDraft.updated_at } : null;
  const starterCodes = ["instagram-likes", "facebook-followers", "instagram-followers"] as const;
  const liveStarterRows = value<RawStarterService[]>(14, []).filter((row) => row.code && row.status === "active" && row.is_active !== false && row.accepts_new_orders !== false);
  const shortcuts = starterCodes.flatMap((code) => {
    const live = liveStarterRows.find((row) => row.code === code);
    const fallback = customerOrderServices.find((service) => service.code === code);
    if (!live && !fallback) return [];
    const rate = Number(live?.rate ?? fallback?.pricePer1000 ?? 0);
    const minQuantity = Number(live?.min ?? fallback?.minQuantity ?? 0);
    const platform = String(live?.platform ?? fallback?.platform ?? "").toLowerCase() === "twitter" ? "x" : String(live?.platform ?? fallback?.platform ?? "");
    if (!rate || !minQuantity || !platform) return [];
    return [{
      code,
      platform,
      name: live?.name || fallback?.name || code,
      pricePer1000: rate,
      minQuantity,
      minimumTotal: Math.round((rate * minQuantity * 100) / 1000) / 100,
    }];
  });
  const rawCheckoutRecovery = value<RawCheckoutRecovery | null>(15, null);
  const latestOrderCreatedAt = orders[0]?.createdAt ? Date.parse(orders[0].createdAt) : Number.NEGATIVE_INFINITY;
  const checkoutIsStillUnfinished = Boolean(
    rawCheckoutRecovery &&
    Date.parse(rawCheckoutRecovery.created_at) > latestOrderCreatedAt
  );
  const checkoutService = checkoutIsStillUnfinished && rawCheckoutRecovery ? customerOrderServices.find((service) => service.code === rawCheckoutRecovery.service_code) : null;
  const checkoutRecovery = checkoutIsStillUnfinished && rawCheckoutRecovery ? {
    id: rawCheckoutRecovery.id,
    serviceCode: rawCheckoutRecovery.service_code,
    serviceName: checkoutService?.name || rawCheckoutRecovery.service_code.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    quantity: Number(rawCheckoutRecovery.quantity || 0),
    target: rawCheckoutRecovery.destination_link,
    total: Number(rawCheckoutRecovery.total_paise || 0) / 100,
    createdAt: rawCheckoutRecovery.created_at,
    expiresAt: rawCheckoutRecovery.expires_at,
  } : null;
  const completedOrders = count(2);
  const totalOrders = count(9);
  const qualifyingOrders = count(18);
  const firstOrder = !failed(18) && qualifyingOrders === 0;
  const pendingOrders = count(12);
  const paymentChecks = count(13);
  const completedOrderHistory = value<RawOrder[]>(16, []);
  const latestCompletedOrder = completedOrderHistory[0];
  const frequentRepeat = buildFrequentRepeatPatterns(
    completedOrderHistory.map((row) => ({
      serviceName: row.service_name || "Growth service",
      platform: row.platform || "other",
      quantity: Number(row.quantity || 0),
      link: row.link || "",
      createdAt: row.created_at,
    })),
    customerOrderServices,
    2,
    1,
  )[0] ?? null;
  const rewardRules = value<{ enabled: boolean; manual_approval: boolean; minimum_order_amount: number | string | null; new_customer_reward: number | string | null } | null>(17, null);
  const rewardAmount = Number(rewardRules?.new_customer_reward || 0);
  const rewardMinimum = Number(rewardRules?.minimum_order_amount || 0);
  const firstOrderOffer = firstOrder && rewardRules?.enabled && !rewardRules.manual_approval && rewardAmount > 0 && rewardMinimum > 0
    ? { reward: rewardAmount, minimum: rewardMinimum }
    : null;
  const latestRepeatOrder = latestCompletedOrder ? mapOrder(latestCompletedOrder) : null;
  const activeRefills = count(19);
  const preferredRepeat = frequentRepeat ?? (latestRepeatOrder?.repeatHref ? {
    href: latestRepeatOrder.repeatHref,
    serviceName: latestRepeatOrder.serviceName,
    quantity: latestRepeatOrder.quantity,
    count: 1,
  } : null);
  const retentionDecision = buildRetentionDecision({
    completedOrders,
    activeOrders: count(1),
    pendingOrders,
    paymentChecks,
    openTickets: count(5),
    activeRefills,
    hasCheckoutRecovery: Boolean(checkoutRecovery),
    hasDraft: Boolean(draft),
    latestCompletedAt: latestCompletedOrder?.created_at ?? null,
    repeatHref: preferredRepeat?.href ?? null,
    repeatServiceName: preferredRepeat?.serviceName ?? null,
    repeatQuantity: preferredRepeat?.quantity ?? null,
    repeatCount: preferredRepeat?.count ?? 0,
    signalsReliable: ![1, 2, 5, 8, 12, 13, 15, 16, 19].some(failed),
  });

  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  const greeting = hour < 5 ? "Welcome back" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return <div className={styles.commandCenter}><DashboardOverviewContent greeting={greeting} userName={profile?.full_name?.split(" ")[0] || ""} walletBalance={Number(profile?.balance || 0)} orders={orders} activeCampaigns={activeCampaigns} totalOrders={totalOrders} activeOrders={count(1)} completedOrders={completedOrders} pendingOrders={pendingOrders} paymentChecks={paymentChecks} transactions={transactions} ticket={ticket} openTickets={count(5)} rewardBalance={Number(reward?.amount || 0)} savedProfiles={savedProfiles} favourites={favourites} firstOrder={firstOrder} draft={draft} shortcuts={shortcuts} checkoutRecovery={checkoutRecovery} firstOrderOffer={firstOrderOffer} errors={{ orders: failed(0) || failed(1) || failed(2) || failed(9) || failed(10) || failed(18), payments: failed(3) || failed(13), support: failed(4) || failed(5), rewards: failed(6), profiles: failed(7) }} /><div className="mx-auto w-full max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"><RetentionNextActionCard decision={retentionDecision} /></div></div>;
}