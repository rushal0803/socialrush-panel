import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import ManualUpiAddFunds from "@/components/wallet/ManualUpiAddFunds";

export default async function AddFundsPage() {
  const { user } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/add-funds");
  return <ManualUpiAddFunds />;
}
