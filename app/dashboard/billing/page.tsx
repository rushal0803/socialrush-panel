import BillingDashboardContent from "@/components/dashboard/BillingDashboardContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

export default async function BillingPage() {
  const { supabase, profile } = await getDashboardContext();

  const [{ data: invoices, error }, { data: payments }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id,invoice_number,amount,status,created_at,order_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("id,amount,status,payment_method,provider_payment_id,created_at")
      .eq("type", "credit")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const normalizedInvoices = (invoices ?? []).map((item) => ({
    ...item,
    amount: Number(item.amount ?? 0),
  }));

  const normalizedPayments = (payments ?? []).map((item) => ({
    ...item,
    amount: Number(item.amount ?? 0),
  }));

  return (
    <BillingDashboardContent
      invoices={normalizedInvoices}
      payments={normalizedPayments}
      invoiceError={error ? "Invoice metadata requires the latest client portal migration." : undefined}
      walletBalance={Number(profile?.balance ?? 0)}
    />
  );
}
