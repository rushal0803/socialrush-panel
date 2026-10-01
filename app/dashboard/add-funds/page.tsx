import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import DesktopUpiQrCheckout from "@/components/wallet/DesktopUpiQrCheckout";

export const dynamic = "force-dynamic";

export default async function AddFundsPage() {
  const { user } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/add-funds");

  return <DesktopUpiQrCheckout />;
}
