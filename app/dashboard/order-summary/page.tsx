"use client";

import { CheckCircle2, LoaderCircle, LockKeyhole, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";
import { platformMeta } from "@/lib/smm-service-catalog";
import {
  customerOrderServices,
  linkRules,
  serviceExperience,
  validateCampaignLink,
} from "@/lib/order-service-experience";
import { calculateServiceTotal } from "@/lib/service-pricing";

function cleanQuantity(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+(?=\d)/, "");
}

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
};

export default function DashboardOrderSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = usePreferredCurrency("INR");
  const requestedCode = searchParams.get("service") || "instagram-followers";
  const selectedService = useMemo(
    () => customerOrderServices.find((service) => service.code === requestedCode) ?? customerOrderServices[0],
    [requestedCode],
  );
  const experience = serviceExperience[selectedService.code];
  const linkRule = linkRules[selectedService.code];

  const [quantityInput, setQuantityInput] = useState(() => cleanQuantity(searchParams.get("quantity") || ""));
  const [targetLink, setTargetLink] = useState(searchParams.get("link") || "");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ApiOrderData | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef("");

  const quantity = Number(quantityInput || 0);
  const quantityError = useMemo(() => {
    if (!quantityInput || !Number.isInteger(quantity) || quantity <= 0) return "Enter a valid whole-number quantity.";
    if (quantity < selectedService.minQuantity) return `Minimum quantity is ${selectedService.minQuantity.toLocaleString("en-IN")}.`;
    if (quantity > selectedService.maxQuantity) return `Maximum quantity is ${selectedService.maxQuantity.toLocaleString("en-IN")}.`;
    return "";
  }, [quantity, quantityInput, selectedService.maxQuantity, selectedService.minQuantity]);

  const linkError = targetLink.trim() ? validateCampaignLink(targetLink, linkRule) : "";
  const formIsValid = !quantityError && !linkError && Boolean(targetLink.trim());
  const totalPrice = calculateServiceTotal(selectedService.code, quantity);
  const totalLabel = formatCurrency(totalPrice, currency);
  const walletLabel = walletBalance === null ? "Checking..." : formatCurrency(walletBalance, currency);
  const hasEnoughWallet = walletBalance !== null && totalPrice > 0 && walletBalance + 0.0001 >= totalPrice;
  const directUpiRequired = !walletLoading && walletBalance !== null && totalPrice > 0 && !hasEnoughWallet;

  const loadWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const { data } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle();
      setWalletBalance(Number(data?.balance ?? 0));
    } catch {
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadWalletBalance();
  }, [loadWalletBalance]);

  async function placeWalletOrder() {
    if (inFlight.current || submitting) return;
    setError("");
    if (!formIsValid) {
      setError(quantityError || linkError || "Complete your order details first.");
      return;
    }
    if (!hasEnoughWallet) {
      setError("Use the direct UPI checkout shown above to pay for this order.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    if (!requestId.current) requestId.current = crypto.randomUUID();

    try {
      const intentResponse = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCode: selectedService.code,
          quantity,
          link: targetLink.trim(),
          clientRequestId: requestId.current,
          packageName: "Custom",
          notes: null,
        }),
      });
      const intentResult = (await intentResponse.json()) as { data?: { id: string }; error?: string };
      if (!intentResponse.ok || !intentResult.data?.id) throw new Error(intentResult.error || "Unable to prepare checkout.");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: intentResult.data.id,
          clientRequestId: requestId.current,
          serviceCode: selectedService.code,
          quantity,
          link: targetLink.trim(),
        }),
      });
      const result = (await response.json()) as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Unable to place order.");

      setWalletBalance(Number(result.data.balance));
      setSuccess(result.data);
      requestId.current = "";
      window.setTimeout(() => router.push("/dashboard/orders"), 900);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to place your order right now.");
    } finally {
      setSubmitting(false);
      inFlight.current = false;
    }
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#FFF8F1] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/dashboard/new-order?service=${encodeURIComponent(selectedService.code)}`} className="text-sm font-bold text-[#FF8A00] hover:text-black">
          ← Back to services
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">Review order</p>
            <h1 className="mt-2 text-2xl font-black text-[#0B0B0F]">{experience.name}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selectedService.description}</p>

            <div className="mt-6 grid gap-5">
              <label className="text-sm font-bold text-slate-900">
                Quantity
                <input
                  inputMode="numeric"
                  value={quantityInput}
                  onChange={(event) => { setQuantityInput(cleanQuantity(event.target.value)); setError(""); }}
                  className="mt-2 min-h-14 w-full rounded-2xl border border-orange-100 bg-white px-4 text-lg font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                />
                {quantityError ? <span className="mt-2 block text-xs font-semibold text-red-600">{quantityError}</span> : null}
              </label>

              <label className="text-sm font-bold text-slate-900">
                {linkRule.label}
                <input
                  value={targetLink}
                  onChange={(event) => { setTargetLink(event.target.value); setError(""); }}
                  placeholder={linkRule.placeholder}
                  className="mt-2 min-h-14 w-full rounded-2xl border border-orange-100 bg-white px-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                />
                <span className="mt-2 block text-xs text-slate-500">{linkRule.helper} Keep the destination public during delivery.</span>
                {linkError ? <span className="mt-2 block text-xs font-semibold text-red-600">{linkError}</span> : null}
              </label>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info label="Platform" value={platformMeta[selectedService.platform].label} />
              <Info label="Delivery" value={selectedService.deliveryTime} />
              <Info label="Refill" value={selectedService.refillPolicy} />
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-black text-[#0B0B0F]">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <Row label="Service" value={experience.name} />
              <Row label="Quantity" value={quantity > 0 ? quantity.toLocaleString("en-IN") : "Not entered"} />
              <Row label="Wallet balance" value={walletLabel} />
              <div className="border-t border-dashed border-orange-100 pt-4">
                <Row label="Total" value={totalLabel} strong />
              </div>
            </div>

            {walletLoading ? (
              <div className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-orange-100 text-sm font-black text-orange-700">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Checking wallet...
              </div>
            ) : hasEnoughWallet ? (
              <button
                type="button"
                onClick={() => void placeWalletOrder()}
                disabled={!formIsValid || submitting}
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                {submitting ? "Processing..." : "Place Order with Wallet"}
              </button>
            ) : directUpiRequired ? (
              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="flex items-center gap-2 text-sm font-black text-orange-800"><LockKeyhole className="h-4 w-4" /> Pay directly by UPI</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-orange-700">No wallet top-up is required. Use the Direct UPI Checkout shown above this page. Your exact order amount will be prepared before your UPI app opens.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">Complete the quantity and public link to continue.</div>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Never share your UPI PIN or OTP</p>
            <p className="mt-2 text-center text-[10px] text-slate-500">{getCurrencyDisclaimer()}</p>
          </aside>
        </div>

        {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
        {success ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            <div><p className="font-black">Order placed successfully</p><p className="text-sm">Redirecting to your orders...</p></div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-orange-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-black text-slate-900">{value}</p></div>;
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-start justify-between gap-4"><span className="text-slate-500">{label}</span><span className={`${strong ? "text-lg" : "text-sm"} max-w-[62%] break-words text-right font-black text-slate-900`}>{value}</span></div>;
}
