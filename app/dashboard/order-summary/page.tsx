"use client";

import { ArrowLeft, CheckCircle2, Clock3, Hash, Link as LinkIcon, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
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
import PlatformIcon from "@/components/PlatformIcon";

const whatsappSupportUrl = "https://wa.me/918860330771";

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
};

function cleanQuantity(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+(?=\d)/, "");
}

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
  const [walletError, setWalletError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ApiOrderData | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef("");

  const quantity = Number(quantityInput || 0);
  const quantityError = useMemo(() => {
    if (!quantityInput || !Number.isFinite(quantity) || quantity <= 0) return "Enter a valid quantity to continue.";
    if (!Number.isInteger(quantity)) return "Quantity must be a whole number.";
    if (quantity < selectedService.minQuantity) return "Enter a larger quantity for this service.";
    if (quantity > selectedService.maxQuantity) return "This quantity is higher than currently available for this service.";
    return "";
  }, [quantity, quantityInput, selectedService.maxQuantity, selectedService.minQuantity]);

  const totalPrice = Math.round(((quantity / 1000) * selectedService.pricePer1000) * 100) / 100;
  const totalLabel = formatCurrency(totalPrice, currency);
  const walletLabel = walletBalance === null ? "Checking..." : formatCurrency(walletBalance, currency);
  const hasEnoughWallet = walletBalance !== null && totalPrice > 0 && walletBalance + 0.0001 >= totalPrice;
  const amountToPay = walletBalance === null ? 0 : Math.max(0, Math.round((totalPrice - walletBalance) * 100) / 100);
  const amountToPayLabel = formatCurrency(amountToPay, currency);
  const amountToPayInrLabel = formatCurrency(amountToPay, "INR");
  const walletInrLabel = formatCurrency(walletBalance ?? 0, "INR");
  const requiresPayment = walletBalance !== null && totalPrice > 0 && !hasEnoughWallet;
  const currentLinkError = targetLink.trim() ? validateCampaignLink(targetLink, linkRule) : "";
  const formIsValid = !quantityError && !currentLinkError && Boolean(targetLink.trim());
  const canSubmit = formIsValid && hasEnoughWallet && !walletLoading;
  const canAddFunds = formIsValid && requiresPayment && !walletLoading;
  const shortfallMessage = `Your wallet balance is ${walletInrLabel}. Please add ${amountToPayInrLabel} to place this order.`;
  const returnParams = new URLSearchParams({ service: selectedService.code });
  if (quantityInput) returnParams.set("quantity", quantityInput);
  if (targetLink.trim()) returnParams.set("link", targetLink.trim());
  const returnTo = `/dashboard/order-summary?${returnParams.toString()}`;
  const addFundsHref = `/dashboard/wallet?amount=${encodeURIComponent(String(amountToPay))}&returnTo=${encodeURIComponent(returnTo)}`;

  const loadWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();
      if (profileError) {
        setWalletBalance(0);
        setWalletError("Wallet balance could not be loaded. Showing ₹0 for now.");
        return;
      }
      setWalletBalance(Number(profile?.balance ?? 0));
    } catch {
      setWalletBalance(0);
      setWalletError("Wallet balance is unavailable right now. Showing ₹0 for now.");
    } finally {
      setWalletLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadWalletBalance();
    const updateBalance = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) setWalletBalance(value);
    };
    window.addEventListener("wallet-balance-updated", updateBalance);
    return () => window.removeEventListener("wallet-balance-updated", updateBalance);
  }, [loadWalletBalance]);

  async function placeOrder() {
    if (inFlight.current || submitting) return;
    setError("");

    if (quantityError) {
      setError(quantityError);
      return;
    }
    const linkError = validateCampaignLink(targetLink, linkRule);
    if (linkError) {
      setError(linkError);
      return;
    }
    if (walletLoading || walletBalance === null) {
      setError("Your wallet balance is still being checked. Please try again.");
      return;
    }
    if (walletBalance + 0.0001 < totalPrice) {
      setError("Your wallet balance is lower than this order total.");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    if (!requestId.current) requestId.current = crypto.randomUUID();

    const payload = {
      serviceCode: selectedService.code,
      serviceId: 0,
      quantity,
      link: targetLink.trim(),
      requestId: requestId.current,
      notes: null,
      fallbackPrice: selectedService.pricePer1000,
      fallbackName: experience.name,
      fallbackPlatform: selectedService.platform,
      fallbackMin: selectedService.minQuantity,
      fallbackMax: selectedService.maxQuantity,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) {
        setError(result.error || "Unable to place your order right now.");
        setSubmitting(false);
        inFlight.current = false;
        return;
      }

      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      setSuccess(result.data);
      requestId.current = "";
      inFlight.current = false;
      setSubmitting(false);
      window.setTimeout(() => router.push("/dashboard/orders"), 900);
    } catch {
      setError("Unable to place your order right now.");
      setSubmitting(false);
      inFlight.current = false;
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_0%_0%,#dbe8ff_0%,transparent_34%),radial-gradient(circle_at_100%_0%,#e5f8ff_0%,transparent_36%),radial-gradient(circle_at_50%_100%,#ffe9e2_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Link href={`/dashboard/new-order?service=${encodeURIComponent(selectedService.code)}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#2f56a0] transition hover:text-[#1e3c78]">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>

        <div className="mt-3 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          <div className="min-w-0 space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/72 p-5 shadow-[0_28px_64px_-34px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-7">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-200/35 blur-2xl" />
              <div className="relative">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${platformMeta[selectedService.platform].gradient} text-xs font-black text-white shadow-lg`}>
                  <PlatformIcon platform={platformMeta[selectedService.platform].label} className="h-6 w-6" />
                </span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#5270aa]">Service details</p>
                <h1 className="mt-2 text-2xl font-black text-[#14316a] sm:text-3xl">{experience.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#526d9f]">{selectedService.description}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <InfoCard label="Platform" value={platformMeta[selectedService.platform].label} />
                  <InfoCard label="Delivery" value={selectedService.deliveryTime} />
                  <div className="col-span-2 sm:col-span-1"><InfoCard label="Refill & support" value={selectedService.refillPolicy} /></div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/85 bg-white/72 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5270aa]">Campaign details</p>
              <h2 className="mt-2 text-xl font-black text-[#14316a]">Quantity and public link</h2>

              <div className="mt-5 grid gap-5">
                <label className="block text-sm font-black text-[#294981]">
                  Quantity
                  <div className="relative mt-2">
                    <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7690bd]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={quantityInput}
                      onChange={(event) => {
                        setQuantityInput(cleanQuantity(event.target.value));
                        setError("");
                      }}
                      placeholder="Enter quantity"
                      className={`min-h-14 w-full rounded-2xl border bg-white/95 pl-12 pr-4 text-xl font-black text-[#17366f] outline-none transition ${
                        quantityInput && quantityError ? "border-rose-300 focus:ring-4 focus:ring-rose-100" : "border-[#d4e1ff] focus:border-[#8faeff] focus:ring-4 focus:ring-[#dce7ff]"
                      }`}
                    />
                  </div>
                  {quantityError ? <span className="mt-2 block text-xs font-bold text-rose-600">{quantityError}</span> : null}
                </label>

                <label className="block text-sm font-black text-[#294981]">
                  {linkRule.label}
                  <div className="relative mt-2">
                    <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7690bd]" />
                    <input
                      value={targetLink}
                      onChange={(event) => {
                        setTargetLink(event.target.value);
                        setError("");
                      }}
                      placeholder={linkRule.placeholder}
                      className={`min-h-14 w-full rounded-2xl border bg-white/95 pl-12 pr-4 text-base text-[#17366f] outline-none transition ${
                        currentLinkError ? "border-rose-300 focus:ring-4 focus:ring-rose-100" : "border-[#d4e1ff] focus:border-[#8faeff] focus:ring-4 focus:ring-[#dce7ff]"
                      }`}
                    />
                  </div>
                  <span className="mt-2 block text-xs font-medium leading-5 text-[#6079a7]">{linkRule.helper}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[#36578f]">Keep the account, post, video, page, or channel public during delivery.</span>
                  {currentLinkError ? <span className="mt-2 block text-xs font-bold text-rose-600">{currentLinkError}</span> : null}
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/85 bg-white/82 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6079aa]">Order summary</p>
                  <h2 className="mt-1 truncate text-base font-black text-[#14316a]">{experience.name}</h2>
                </div>
                <Wallet className="h-5 w-5 shrink-0 text-[#5270aa]" />
              </div>
              <dl className="mt-4 grid gap-2 text-xs min-[400px]:grid-cols-2">
                <SummaryRow label="Quantity" value={quantity > 0 ? quantity.toLocaleString("en-IN") : "Not entered"} />
                <SummaryRow label="Delivery" value={selectedService.deliveryTime} />
                <div className="min-[400px]:col-span-2">
                  <SummaryRow label="Refill support" value={selectedService.refillPolicy} />
                </div>
                <div className="min-[400px]:col-span-2">
                  <SummaryRow label="Link" value={targetLink.trim() || "Not entered"} />
                </div>
                <SummaryRow label="Wallet balance" value={walletLabel} />
                {requiresPayment ? <SummaryRow label="Amount needed" value={amountToPayLabel} /> : null}
              </dl>
              <div className="mt-3 flex items-end justify-between gap-3 rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-4">
                <span className="text-xs font-semibold text-[#6079a7]">Total price</span>
                <b className="text-2xl text-[#17366f]">{totalLabel}</b>
              </div>
            </section>

            <section className="rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl lg:hidden">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-4">
                <span className="text-xs font-semibold text-[#6079a7]">Wallet balance</span>
                <b className="text-base text-[#17366f]">{walletLabel}</b>
              </div>
              {requiresPayment ? (
                <>
                  <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold leading-5 text-[#36578f]">
                    {shortfallMessage}
                  </p>
                  {canAddFunds ? (
                    <Link
                      href={addFundsHref}
                      className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.65)]"
                    >
                      Add Funds
                    </Link>
                  ) : (
                    <button type="button" disabled className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white opacity-50">
                      Add Funds
                    </button>
                  )}
                </>
              ) : (
                <button type="button" disabled={!canSubmit || submitting} onClick={() => void placeOrder()} className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.65)] disabled:opacity-50">
                  {submitting ? "Placing order..." : "Place Order"}
                </button>
              )}
              <a
                href={whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-700"
              >
                <FaWhatsapp className="h-4 w-4" /> Need help? WhatsApp Support
              </a>
            </section>

            <section className="rounded-3xl border border-white/85 bg-white/72 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-black text-[#14316a]">Secure public-link ordering</h2>
                  <p className="mt-2 text-sm leading-7 text-[#526d9f]">No password is required. Your wallet is charged only after the order is accepted, and progress remains available in your dashboard.</p>
                </div>
              </div>
            </section>

            {walletError ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{walletError}</p> : null}
            {error ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p> : null}
            {success ? (
              <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
                <div><p className="font-black">Order placed successfully.</p><p className="mt-1 text-sm">Redirecting to your orders...</p></div>
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <CheckoutCard
              selectedServiceName={experience.name}
              rate={formatCurrency(selectedService.pricePer1000, currency)}
              quantity={quantity}
              targetLink={targetLink}
              delivery={selectedService.deliveryTime}
              support={selectedService.refillPolicy}
              total={totalLabel}
              wallet={walletLabel}
              amountToPay={requiresPayment ? amountToPayLabel : formatCurrency(0, currency)}
              shortfallMessage={shortfallMessage}
              addFundsHref={addFundsHref}
              hasEnoughWallet={hasEnoughWallet}
              walletLoading={walletLoading}
              canSubmit={canSubmit}
              canAddFunds={canAddFunds}
              submitting={submitting}
              onSubmit={() => void placeOrder()}
            />
          </aside>
        </div>
      </div>

    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-xl border border-[#e1eaff] bg-[#f8fbff] p-3">
      <p className="text-[#7890bb]">{label}</p>
      <p className="mt-1 font-black leading-5 text-[#24457f]">{value}</p>
    </div>
  );
}

function CheckoutCard({
  selectedServiceName,
  rate,
  quantity,
  targetLink,
  delivery,
  support,
  total,
  wallet,
  amountToPay,
  shortfallMessage,
  addFundsHref,
  hasEnoughWallet,
  walletLoading,
  canSubmit,
  canAddFunds,
  submitting,
  onSubmit,
}: {
  selectedServiceName: string;
  rate: string;
  quantity: number;
  targetLink: string;
  delivery: string;
  support: string;
  total: string;
  wallet: string;
  amountToPay: string;
  shortfallMessage: string;
  addFundsHref: string;
  hasEnoughWallet: boolean;
  walletLoading: boolean;
  canSubmit: boolean;
  canAddFunds: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/85 bg-white/90 p-6 shadow-[0_30px_70px_-38px_rgba(15,23,42,.55)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6079aa]">Order total</p><h2 className="mt-2 text-xl font-black text-[#14316a]">{selectedServiceName}</h2></div>
        <Wallet className="h-6 w-6 text-[#5270aa]" />
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <SummaryRow label="Service price" value={`${rate} for 1,000`} />
        <SummaryRow label="Quantity" value={quantity > 0 ? quantity.toLocaleString("en-IN") : "Not entered"} />
        <SummaryRow label="Link" value={targetLink.trim() || "Not entered"} />
        <SummaryRow label="Delivery" value={delivery} />
        <SummaryRow label="Refill & support" value={support} />
      </dl>
      <div className="mt-4 rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-4">
        <div className="flex justify-between gap-3 text-sm"><span className="text-[#6079a7]">Wallet balance</span><b className="text-[#17366f]">{wallet}</b></div>
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#e1eaff] pt-3"><span className="text-sm font-semibold text-[#6079a7]">Total price</span><b className="text-2xl text-[#17366f]">{total}</b></div>
        {!hasEnoughWallet ? <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#e1eaff] pt-3 text-sm"><span className="text-[#6079a7]">Amount needed</span><b className="text-[#17366f]">{amountToPay}</b></div> : null}
      </div>
      {!walletLoading && quantity > 0 && !hasEnoughWallet ? (
        <>
          <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold leading-5 text-[#36578f]">
            {shortfallMessage}
          </p>
          {canAddFunds ? (
            <Link
              href={addFundsHref}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.65)]"
            >
              Add Funds
            </Link>
          ) : (
            <button type="button" disabled className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white opacity-50">
              Add Funds
            </button>
          )}
        </>
      ) : (
        <button type="button" disabled={!canSubmit || submitting} onClick={onSubmit} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.65)] disabled:opacity-50">
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      )}
      <p className="mt-4 text-center text-[10px] font-semibold leading-5 text-[#7890ba]">{getCurrencyDisclaimer()}</p>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#6079a7]"><Clock3 className="h-3.5 w-3.5" /> Live order tracking included</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[#e1eaff] bg-[#f8fbff] px-3 py-2.5">
      <dt className="text-[#6079a7]">{label}</dt>
      <dd className="max-w-[62%] break-words text-right font-black text-[#294981]">{value}</dd>
    </div>
  );
}
