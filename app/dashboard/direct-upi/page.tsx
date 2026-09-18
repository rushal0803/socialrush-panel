import { redirect } from "next/navigation";
import DirectUpiPaymentClient from "@/components/dashboard/DirectUpiPaymentClient";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServiceById } from "@/lib/smm-service-catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { intent?: string };
};

export default async function DirectUpiPage({ searchParams }: PageProps) {
  const intentId = String(searchParams?.intent || "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(intentId)) {
    redirect("/dashboard/new-order");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/dashboard/direct-upi?intent=${intentId}`)}`);

  const admin = createAdminClient();
  const { data: intent } = await admin
    .from("checkout_intents")
    .select("id,user_id,client_request_id,service_code,quantity,destination_link,total_paise,currency,status,expires_at")
    .eq("id", intentId)
    .maybeSingle();

  const valid =
    intent &&
    intent.user_id === user.id &&
    intent.status === "created" &&
    intent.currency === "INR" &&
    Number(intent.total_paise) > 0 &&
    new Date(intent.expires_at).getTime() > Date.now();

  if (!valid) {
    return (
      <main className="min-h-[70vh] bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-[#111318] p-6 text-center shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Checkout unavailable</p>
          <h1 className="mt-3 text-2xl font-black">This payment session is no longer available.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">Please return to New Order and review the service, quantity and link again. Do not make a payment from an expired checkout.</p>
          <a href="/dashboard/new-order" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-black text-black">Return to New Order</a>
        </section>
      </main>
    );
  }

  const service = getServiceById(intent.service_code);
  const serviceName = service?.name || intent.service_code.split("-").map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const upiId = "8860330771@pthdfc";
  const payeeName = "Rushal";
  const usdtTrc20Address = "TEu618wJ54USgsQSWhUnHbd9xFeMRUfCSz";
  let usdtAmount: number | null = null;
  try {
    const fxResponse = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", { next: { revalidate: 300 } });
    const fx = await fxResponse.json() as { rates?: { INR?: number } };
    const inrPerUsd = Number(fx.rates?.INR);
    if (Number.isFinite(inrPerUsd) && inrPerUsd > 0) usdtAmount = Math.ceil((Number(intent.total_paise) / 100 / inrPerUsd) * 100) / 100;
  } catch {
    usdtAmount = null;
  }

  const bankTransfer = {
    enabled: process.env.BANK_TRANSFER_ENABLED === "true",
    accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME?.trim() || "",
    bankName: process.env.BANK_TRANSFER_BANK_NAME?.trim() || "",
    accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER?.trim() || "",
    ifsc: process.env.BANK_TRANSFER_IFSC?.trim().toUpperCase() || "",
  };
  bankTransfer.enabled = bankTransfer.enabled && Boolean(
    bankTransfer.accountName && bankTransfer.bankName && bankTransfer.accountNumber && bankTransfer.ifsc,
  );

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#050505] px-4 pb-28 pt-7 sm:px-6 sm:pb-12 lg:px-8">
      <div className="mx-auto mb-5 max-w-2xl">
        <a href="/dashboard/new-order" className="text-xs font-bold text-zinc-400 hover:text-white">← Back to order</a>
      </div>
      <DirectUpiPaymentClient
        intentId={intent.id}
        clientRequestId={intent.client_request_id}
        serviceCode={intent.service_code}
        serviceName={serviceName}
        quantity={Number(intent.quantity)}
        link={intent.destination_link}
        total={Number(intent.total_paise) / 100}
        upiId={upiId}
        payeeName={payeeName}
        usdtTrc20Address={usdtTrc20Address}
        usdtAmount={usdtAmount}
        bankTransfer={bankTransfer}
      />
    </main>
  );
}
