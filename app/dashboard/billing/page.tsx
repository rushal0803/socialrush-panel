import BillingDashboardContent from "@/components/dashboard/BillingDashboardContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

export default async function BillingPage() {
  const { supabase, profile } = await getDashboardContext();

  const [{ data: invoices, error: invoiceQueryError }, { data: payments, error: paymentQueryError }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id,invoice_number,amount,status,created_at,order_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("id,amount,type,status,payment_method,provider_order_id,provider_payment_id,provider_refund_id,description,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
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
      invoiceError={invoiceQueryError ? "Invoice records could not be loaded right now." : undefined}
      paymentError={paymentQueryError ? "Payment activity could not be loaded right now." : undefined}
      walletBalance={Number(profile?.balance ?? 0)}
    />
  );
}
