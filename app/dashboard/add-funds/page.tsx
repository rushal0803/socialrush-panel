import WalletDashboard, { type WalletInitialData, type WalletOrder, type WalletTransaction } from "@/components/wallet/WalletDashboard";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

export default async function AddFundsPage() {
  const { supabase, user, profile } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/add-funds");
  const [{ data: transactionRows }, { data: orderRows, count: orderCount }] = await Promise.all([
    supabase.from("transactions").select("id, amount, type, status, payment_method, description, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("orders").select("id, charge, status, created_at, service_name, services(name)", { count: "exact" }).order("created_at", { ascending: false }).limit(100),
  ]);
  const transactions: WalletTransaction[] = (transactionRows ?? []).map((item) => ({ ...item, amount: Number(item.amount) }));
  const orders: WalletOrder[] = (orderRows ?? []).map((item) => ({
    id: item.id,
    charge: Number(item.charge),
    status: item.status,
    created_at: item.created_at,
    serviceName: item.service_name || (item.services as unknown as { name?: string } | null)?.name || "Growth campaign",
  }));
  const initial: WalletInitialData = {
    balance: Number(profile?.balance ?? 0),
    totalDeposits: transactions.filter((item) => item.type === "credit" && item.status === "completed").reduce((sum,item) => sum + item.amount, 0),
    totalSpent: transactions.filter((item) => item.type === "debit" && item.status === "completed").reduce((sum,item) => sum + item.amount, 0),
    totalOrders: orderCount ?? orders.length,
    pendingPayments: transactions.filter((item) => item.type === "credit" && item.status === "pending").length,
    email: user?.email || "",
    transactions,
    orders,
  };
  return <WalletDashboard initial={initial}/>;
}
