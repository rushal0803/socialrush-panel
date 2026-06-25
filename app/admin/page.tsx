import { createClient } from "@/lib/supabase/server";
import AdminOverviewContent from "@/components/admin/AdminOverviewContent";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: pendingOrders },
    { count: completedOrders },
    { count: paymentRequests },
    { data: completedCharges },
    { data: users },
    { data: transactions },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "processing", "in_progress"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("type", "credit").eq("status", "pending"),
    supabase.from("orders").select("charge").eq("status", "completed"),
    supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false }).limit(6),
    supabase
      .from("transactions")
      .select("id, amount, type, status, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const totalRevenue = (completedCharges ?? []).reduce((sum, item) => sum + Number(item.charge ?? 0), 0);

  const recentUsers = (users ?? []).map((item) => ({
    id: item.id,
    fullName: item.full_name || "New user",
    email: item.email || "",
    role: item.role || "user",
    createdAt: item.created_at,
  }));

  const recentTransactions = (transactions ?? []).map((item) => {
    const profile = item.profiles as unknown as { full_name?: string; email?: string } | null;
    return {
      id: item.id,
      amount: Number(item.amount ?? 0),
      type: item.type || "credit",
      status: item.status || "pending",
      userName: profile?.full_name || profile?.email || "Unknown user",
      createdAt: item.created_at,
    };
  });

  return (
    <AdminOverviewContent
      stats={{
        totalUsers: totalUsers ?? 0,
        totalRevenue,
        pendingOrders: pendingOrders ?? 0,
        completedOrders: completedOrders ?? 0,
        paymentRequests: paymentRequests ?? 0,
      }}
      recentUsers={recentUsers}
      recentTransactions={recentTransactions}
    />
  );
}
