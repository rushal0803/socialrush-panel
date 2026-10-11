import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import DesktopUpiQrCheckout from "@/components/wallet/DesktopUpiQrCheckout";

export const dynamic = "force-dynamic";

export default async function AddFundsPage() {
  const { user } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/add-funds");

  let inrPerUsd: number | null = null;
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", { next: { revalidate: 300 } });
    if (response.ok) {
      const data = await response.json() as { rates?: { INR?: number } };
      const rate = Number(data.rates?.INR);
      if (Number.isFinite(rate) && rate > 0) inrPerUsd = rate;
    }
  } catch { /* USDT unavailable when reference FX cannot be loaded */ }
  return <DesktopUpiQrCheckout inrPerUsd={inrPerUsd} />;
}
