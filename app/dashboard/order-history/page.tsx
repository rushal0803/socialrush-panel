import { redirect } from "next/navigation";
import CampaignHistoryPage from "@/components/dashboard/OrderHistoryContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import { historyColumns, mapHistoryOrders, type HistoryRow } from "@/lib/orders/history";

export default async function OrderHistoryPage() {
  const { supabase, user } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/orders");
  const { data, count, error } = await supabase.from("orders").select(historyColumns, { count: "exact" })
    .eq("user_id", user.id).order("created_at", { ascending: false }).order("id", { ascending: false }).range(0, 49);
  return <CampaignHistoryPage initialCampaigns={mapHistoryOrders((data || []) as unknown as HistoryRow[])}
    initialError={error ? "Orders could not be loaded right now." : ""} totalOrders={count ?? 0} userId={user.id} />;
}
