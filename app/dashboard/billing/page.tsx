import BillingDashboardContent from "@/components/dashboard/BillingDashboardContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ invoicePage?: string }> }) {
  const { supabase, user, profile } = await getDashboardContext();
  if (!user) redirect("/login?next=/dashboard/billing");
  const params = await searchParams;
  const requestedPage = Number(params.invoicePage || 1);
  const invoicePage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 1000000) : 1;
  const pageSize = 24;

  const [{ data: invoices, count: invoiceCount, error: invoiceQueryError }, { data: payments, error: paymentQueryError }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id,invoice_number,amount,status,created_at,order_id", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }).order("id", { ascending: false })
      .range((invoicePage - 1) * pageSize, invoicePage * pageSize - 1),
    supabase
      .from("transactions")
      .select("id,amount,type,status,payment_method,provider_order_id,provider_payment_id,provider_refund_id,description,metadata,created_at")
      .eq("user_id", user.id)
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
    <><BillingDashboardContent
      invoices={normalizedInvoices}
      payments={normalizedPayments}
      invoiceError={invoiceQueryError ? "Invoice records could not be loaded right now." : undefined}
      paymentError={paymentQueryError ? "Payment activity could not be loaded right now." : undefined}
      walletBalance={Number(profile?.balance ?? 0)}
    />{!invoiceQueryError && (invoicePage > 1 || Number(invoiceCount) > pageSize) ? <nav aria-label="Invoice pages" className="mx-auto mb-8 flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-300 sm:px-6 lg:px-8">
      <p>Invoice page {invoicePage} · {invoiceCount ?? 0} records</p>
      <div className="flex gap-2">
        {invoicePage > 1 ? <Link prefetch={false} href={`/dashboard/billing?invoicePage=${invoicePage - 1}`} className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4">Previous invoices</Link> : null}
        {invoicePage * pageSize < Number(invoiceCount) ? <Link prefetch={false} href={`/dashboard/billing?invoicePage=${invoicePage + 1}`} className="inline-flex min-h-11 items-center rounded-xl border border-orange-400/30 px-4 text-orange-200">Next invoices</Link> : null}
      </div>
    </nav> : null}</>
  );
}
