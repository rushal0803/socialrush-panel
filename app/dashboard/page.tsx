import DashboardOverviewContent from "@/components/dashboard/DashboardOverviewContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

export default async function DashboardPage() {
  const { supabase, user, profile } = await getDashboardContext();
  const userId = user!.id;

  const [
    { data: orderRows },
    { data: transactionRows },
    { count: totalOrdersCount },
    { count: completedOrdersCount },
    { count: activeOrdersCount },
    { count: supportTicketsCount },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, service_name, quantity, status, charge, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("transactions")
      .select("id, amount, type, status, payment_method, created_at")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId!),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId!)
      .eq("status", "completed"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId!)
      .in("status", ["pending", "processing", "in_progress"]),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", userId!),
  ]);

  const orders = (orderRows ?? []).map((item) => ({
    id: item.id,
    serviceName: item.service_name || "Growth service",
    quantity: Number(item.quantity ?? 0),
    status: item.status || "pending",
    price: Number(item.charge ?? 0),
    createdAt: item.created_at,
  }));

  const transactions = (transactionRows ?? []).map((item) => ({
    id: item.id,
    amount: Number(item.amount ?? 0),
    type: item.type || "credit",
    status: item.status || "pending",
    paymentMethod: item.payment_method || "wallet",
    createdAt: item.created_at,
  }));

  const totalSpend = transactions
    .filter((item) => item.type === "debit" && item.status === "completed")
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlySpendMap = new Map<string, number>();
  for (const item of transactions.filter((entry) => entry.type === "debit")) {
    const label = new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short" });
    monthlySpendMap.set(label, (monthlySpendMap.get(label) ?? 0) + item.amount);
  }

  const monthlySpend = Array.from(monthlySpendMap.entries())
    .slice(-4)
    .map(([month, value]) => ({ month, value }));

  const serviceCounter = new Map<string, number>();
  for (const order of orders) {
    serviceCounter.set(order.serviceName, (serviceCounter.get(order.serviceName) ?? 0) + 1);
  }

  const serviceUsage = Array.from(serviceCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <DashboardOverviewContent
      userName={profile?.full_name?.split(" ")[0] || "Client"}
      stats={{
        totalOrders: totalOrdersCount ?? 0,
        activeOrders: activeOrdersCount ?? 0,
        completedOrders: completedOrdersCount ?? 0,
        walletBalance: Number(profile?.balance ?? 0),
        totalSpend,
        supportTickets: supportTicketsCount ?? 0,
      }}
      transactions={transactions}
      orders={orders}
      monthlySpend={monthlySpend.length ? monthlySpend : [{ month: "This month", value: 0 }]}
      serviceUsage={serviceUsage.length ? serviceUsage : [{ name: "No campaign data", count: 0 }]}
    />
  );
}
