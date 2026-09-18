import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import ManualUpiAddFunds from "@/components/wallet/ManualUpiAddFunds";

export const dynamic = "force-dynamic";

export default async function AddFundsPage() {
  const { user } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/add-funds");

  let inrPerUsd: number | null = null;
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", { next: { revalidate: 300 } });
    const fx = await response.json() as { rates?: { INR?: number } };
    const rate = Number(fx.rates?.INR);
    if (Number.isFinite(rate) && rate > 0) inrPerUsd = rate;
  } catch {
    inrPerUsd = null;
  }

  return <ManualUpiAddFunds inrPerUsd={inrPerUsd} />;
}
