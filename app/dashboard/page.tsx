import DashboardOverviewContent from "@/components/dashboard/DashboardOverviewContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { customerOrderServices } from "@/lib/order-service-experience";

const activeStatuses = ["pending", "processing", "in_progress", "partial", "awaiting_action"];
type RawOrder = { id: string; service_name: string | null; platform: string | null; quantity: number | null; status: string | null; charge: number | null; created_at: string; progress_percent: number | null; refill_eligible: boolean | null };
type RawTransaction = { id: string; amount: number | null; type: string | null; status: string | null; payment_method: string | null; created_at: string };
type RawTicket = { id: string; subject: string; status: string; updated_at: string; order_id: string | null };
type RawReward = { id: string; amount: number; status: string; created_at: string };
type RawProfile = { id: string; label: string; platform: string; public_url: string; last_used_at: string | null; created_at: string };
type RawDraft = { platform: string; service_code: string; quantity: number; updated_at: string };

export default async function DashboardPage() {
  const { supabase, user, profile } = await getDashboardContext();
  const userId = user!.id;
  const results = await Promise.allSettled([
    supabase.from("orders").select("id, service_name, platform, quantity, status, charge, created_at, progress_percent, refill_eligible").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", activeStatuses),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
    supabase.from("transactions").select("id, amount, type, status, payment_method, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(4),
    supabase.from("support_tickets").select("id, subject, status, updated_at, order_id").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["open", "waiting_for_support", "waiting_for_customer", "answered"]),
    supabase.from("customer_reward_events").select("id, amount, status, created_at").eq("user_id", userId).eq("status", "credited").order("created_at", { ascending: false }).limit(1),
    supabase.from("saved_social_profiles").select("id, label, platform, public_url, last_used_at, created_at").eq("user_id", userId).order("last_used_at", { ascending: false, nullsFirst: false }).limit(3),
    supabase.from("order_drafts").select("platform, service_code, quantity, updated_at").eq("user_id", userId).maybeSingle(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("orders").select("id, service_name, platform, quantity, status, charge, created_at, progress_percent, refill_eligible").eq("user_id", userId).in("status", activeStatuses).order("created_at", { ascending: false }).limit(4),
  ]);
  const value = <T,>(index: number, fallback: T) => results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<{ data: T }>).value.data ?? fallback : fallback;
  const count = (index: number) => results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<{ count: number | null }>).value.count ?? 0 : 0;
  const failed = (index: number) => {
    const result = results[index];
    return result.status === "rejected" || Boolean((result.value as { error?: unknown }).error);
  };

  const orders = value<RawOrder[]>(0, []).map((row) => ({ id: row.id, serviceName: row.service_name || "Growth service", platform: row.platform || "other", quantity: Number(row.quantity || 0), status: row.status || "pending", price: Number(row.charge || 0), createdAt: row.created_at, progress: row.progress_percent == null ? null : Number(row.progress_percent), refillEligible: Boolean(row.refill_eligible) }));
  const transactions = value<RawTransaction[]>(3, []).map((row) => ({ id: row.id, amount: Number(row.amount || 0), type: row.type || "credit", status: row.status || "pending", paymentMethod: row.payment_method || "wallet", createdAt: row.created_at }));
  const ticket = value<RawTicket[]>(4, [])[0] ?? null;
  const reward = value<RawReward[]>(6, [])[0];
  const savedProfiles = value<RawProfile[]>(7, []).map((row) => ({ ...row, lastUsedAt: row.last_used_at || row.created_at }));
  const rawDraft = value<RawDraft | null>(8, null);
  const activeCampaigns = value<RawOrder[]>(10, []).map((row) => ({ id: row.id, serviceName: row.service_name || "Growth service", platform: row.platform || "other", quantity: Number(row.quantity || 0), status: row.status || "pending", price: Number(row.charge || 0), createdAt: row.created_at, progress: row.progress_percent == null ? null : Number(row.progress_percent), refillEligible: Boolean(row.refill_eligible) }));
  const draftService = rawDraft ? customerOrderServices.find((service) => service.code === rawDraft.service_code && service.platform === rawDraft.platform) : null;
  const draft = rawDraft && draftService ? { platform: rawDraft.platform, serviceCode: rawDraft.service_code, serviceName: draftService.name, quantity: Number(rawDraft.quantity), updatedAt: rawDraft.updated_at } : null;
  const shortcuts = ["instagram-followers", "instagram-likes", "youtube-subscribers"].map((code) => customerOrderServices.find((service) => service.code === code)).filter((service): service is NonNullable<typeof service> => Boolean(service)).map((service) => ({ code: service.code, platform: service.platform, name: service.name, price: service.pricePer1000 }));

  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return <DashboardOverviewContent greeting={greeting} userName={profile?.full_name?.split(" ")[0] || ""} walletBalance={Number(profile?.balance || 0)} orders={orders} activeCampaigns={activeCampaigns} totalOrders={count(9)} activeOrders={count(1)} completedOrders={count(2)} transactions={transactions} ticket={ticket} openTickets={count(5)} rewardBalance={Number(reward?.amount || 0)} savedProfiles={savedProfiles} firstOrder={orders.length === 0} draft={draft} shortcuts={shortcuts} errors={{ orders: failed(0) || failed(1) || failed(2) || failed(9) || failed(10), payments: failed(3), support: failed(4) || failed(5), rewards: failed(6), profiles: failed(7) }} />;
}
