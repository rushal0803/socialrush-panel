"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Hash,
  Headphones,
  Link as LinkIcon,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
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
import { calculateServiceTotal } from "@/lib/service-pricing";

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
  const autoResumeStarted = useRef(false);
  const resumeRequested = searchParams.get("resume") === "1";

  const quantity = Number(quantityInput || 0);
  const quantityError = useMemo(() => {
    if (!quantityInput || !Number.isFinite(quantity) || quantity <= 0) return "Enter a valid quantity to continue.";
    if (!Number.isInteger(quantity)) return "Quantity must be a whole number.";
    if (quantity < selectedService.minQuantity) return "Enter a larger quantity for this service.";
    if (quantity > selectedService.maxQuantity) return "This quantity is higher than currently available for this service.";
    return "";
  }, [quantity, quantityInput, selectedService.maxQuantity, selectedService.minQuantity]);

  const totalPrice = calculateServiceTotal(selectedService.code, quantity);
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

  useEffect(() => {
    if (!resumeRequested || autoResumeStarted.current || !canSubmit || submitting || success) return;
    autoResumeStarted.current = true;
    void placeOrder();
    // The guarded resume should run once after the refreshed wallet balance is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeRequested, canSubmit, submitting, success]);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_4%_0%,rgba(255, 122, 0, .44),transparent_29%),radial-gradient(circle_at_96%_4%,rgba(255, 159, 0, .42),transparent_31%),radial-gradient(circle_at_48%_100%,rgba(255, 196, 0, .34),transparent_30%),linear-gradient(180deg,#FFF8F1_0%,#FFF8F1_48%,#FFF8F1_100%)] px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255, 159, 0, .055)_1px,transparent_1px),linear-gradient(90deg,rgba(255, 159, 0, .055)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <Link href={`/dashboard/new-order?service=${encodeURIComponent(selectedService.code)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-bold text-[#FF9F00] transition hover:text-[#0B0B0F]">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>

        <section aria-label="Checkout progress" className="mt-3 rounded-[28px] border border-white/90 bg-white/60 p-3 shadow-[0_24px_55px_-38px_rgba(255, 159, 0, .5)] backdrop-blur-2xl sm:p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <CheckoutStep number="1" title="Service Selected" state="complete" />
            <CheckoutStep number="2" title="Campaign Details" state={formIsValid ? "complete" : "active"} />
            <CheckoutStep number="3" title="Wallet Payment" state={formIsValid ? "active" : "upcoming"} />
          </div>
        </section>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start xl:gap-8">
          <div className="min-w-0 space-y-6">
            <section className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/68 p-5 shadow-[0_30px_70px_-40px_rgba(255, 159, 0, .55)] backdrop-blur-2xl sm:p-7">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/30 blur-2xl" />
              <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />
              <div className="relative">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br ${platformMeta[selectedService.platform].gradient} text-white shadow-[0_18px_34px_-16px_rgba(255, 196, 0, .75)] ring-4 ring-white/80`}>
                    <PlatformIcon platform={platformMeta[selectedService.platform].label} className="h-8 w-8" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#111827]">Selected growth service</p>
                    <h1 className="mt-2 break-words text-2xl font-black tracking-[-.025em] text-[#0B0B0F] sm:text-3xl">{experience.name}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#111827]">{selectedService.description}</p>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <InfoCard label="Platform" value={platformMeta[selectedService.platform].label} />
                  <InfoCard label="Delivery" value={selectedService.deliveryTime} />
                  <div className="col-span-2 sm:col-span-1">
                    <InfoCard label="Refill & support" value={selectedService.refillPolicy} />
                  </div>
                </dl>

                <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4">
                  <TrustBadge icon={ShieldCheck} label="Secure public-link ordering" />
                  <TrustBadge icon={LockKeyhole} label="No password required" />
                  <TrustBadge icon={Wallet} label="Charged after confirmation" />
                  <TrustBadge icon={Headphones} label="WhatsApp support" />
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/90 bg-white/72 p-5 shadow-[0_26px_60px_-38px_rgba(255, 159, 0, .52)] backdrop-blur-2xl sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FFF8F1] to-[#FFF8F1] text-[#FFC400] shadow-inner">
                  <LinkIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">Campaign details</p>
                  <h2 className="mt-1 text-xl font-black text-[#0B0B0F]">Quantity and public link</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6">
                <label className="block text-sm font-black text-[#0B0B0F]">
                  Quantity
                  <div className="relative mt-2">
                    <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111827]" />
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
                      className={`min-h-14 w-full rounded-2xl border bg-white/90 pl-12 pr-4 text-xl font-black text-[#0B0B0F] shadow-[0_12px_28px_-24px_rgba(255, 159, 0, .5)] outline-none transition ${
                        quantityInput && quantityError ? "border-red-300 focus:ring-4 focus:ring-red-100" : "border-[#FFF3E0] focus:border-[#FF9F00] focus:ring-4 focus:ring-[#FFF8F1]"
                      }`}
                    />
                  </div>
                  <span className="mt-2 block text-xs font-medium leading-5 text-[#111827]">
                    Enter the amount you want for this campaign. Your total updates automatically.
                  </span>
                  {quantityError ? <span className="mt-2 block text-xs font-bold text-red-600">{quantityError}</span> : null}
                </label>

                <label className="block text-sm font-black text-[#0B0B0F]">
                  {linkRule.label}
                  <div className="relative mt-2">
                    <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111827]" />
                    <input
                      value={targetLink}
                      onChange={(event) => {
                        setTargetLink(event.target.value);
                        setError("");
                      }}
                      placeholder={linkRule.placeholder}
                      className={`min-h-14 w-full rounded-2xl border bg-white/90 pl-12 pr-4 text-base text-[#0B0B0F] shadow-[0_12px_28px_-24px_rgba(255, 159, 0, .5)] outline-none transition ${
                        currentLinkError ? "border-red-300 focus:ring-4 focus:ring-red-100" : "border-[#FFF3E0] focus:border-[#FF9F00] focus:ring-4 focus:ring-[#FFF8F1]"
                      }`}
                    />
                  </div>
                  <span className="mt-2 block text-xs font-medium leading-5 text-[#111827]">
                    Enter a public profile, post, reel, video, channel, or page link.
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[#FF9F00]">{linkRule.helper} Keep it public during delivery.</span>
                  {currentLinkError ? <span className="mt-2 block text-xs font-bold text-red-600">{currentLinkError}</span> : null}
                </label>
              </div>
            </section>

            <div className="lg:hidden">
              <CheckoutCard
                selectedServiceName={experience.name}
                platform={platformMeta[selectedService.platform].label}
                rate={formatCurrency(selectedService.pricePer1000, currency)}
                quantity={quantity}
                quantityIsValid={!quantityError && quantity > 0}
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
            </div>

            <section className="rounded-[30px] border border-white/90 bg-white/68 p-5 shadow-[0_24px_55px_-38px_rgba(255, 159, 0, .5)] backdrop-blur-xl sm:p-6">
              <h2 className="text-center text-sm font-black text-[#0B0B0F]">Order with confidence</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
                <ConfidenceItem icon={Clock3} title="Fast delivery" />
                <ConfidenceItem icon={RefreshCw} title="Refill support available" />
                <ConfidenceItem icon={ShieldCheck} title="Secure wallet checkout" />
                <ConfidenceItem icon={PackageCheck} title="Order tracking" />
                <div className="col-span-2 xl:col-span-1">
                  <ConfidenceItem icon={Headphones} title="WhatsApp support" />
                </div>
              </div>
            </section>

            {walletError ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{walletError}</p> : null}
            {error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
            {success ? (
              <div className="fixed bottom-6 left-4 right-4 z-[75] flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-[0_22px_50px_-22px_rgba(5,150,105,.5)] sm:left-auto sm:right-6 sm:w-[390px]">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
                <div><p className="font-black">{resumeRequested ? "Payment successful and order placed" : "Order placed successfully"}</p><p className="mt-1 text-sm">Redirecting to your orders...</p></div>
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <CheckoutCard
              selectedServiceName={experience.name}
              platform={platformMeta[selectedService.platform].label}
              rate={formatCurrency(selectedService.pricePer1000, currency)}
              quantity={quantity}
              quantityIsValid={!quantityError && quantity > 0}
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
    <div className="h-full rounded-2xl border border-white bg-white/78 p-3.5 shadow-[0_12px_28px_-24px_rgba(255, 159, 0, .5)]">
      <dt className="text-[#111827]">{label}</dt>
      <dd className="mt-1.5 font-black leading-5 text-[#0B0B0F]">{value}</dd>
    </div>
  );
}

function CheckoutStep({
  number,
  title,
  state,
}: {
  number: string;
  title: string;
  state: "complete" | "active" | "upcoming";
}) {
  const stateClass = state === "complete"
    ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
    : state === "active"
      ? "border-orange-200 bg-orange-50/90 text-orange-700 shadow-[0_10px_24px_-18px_rgba(255, 159, 0, .55)]"
      : "border-[#FFF8F1] bg-white/75 text-[#111827]";

  return (
    <div className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-3 ${stateClass}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${
        state === "complete"
          ? "bg-emerald-600 text-white"
          : state === "active"
            ? "bg-orange-600 text-white"
            : "bg-[#FFF8F1] text-[#111827]"
      }`}>
        {state === "complete" ? <CheckCircle2 className="h-4 w-4" /> : number}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] opacity-65">Step {number}</p>
        <p className="truncate text-xs font-black">{title}</p>
      </div>
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-[#FFF8F1] bg-white/72 px-3 py-2.5 text-[10px] font-black leading-4 text-[#111827] shadow-[0_12px_24px_-22px_rgba(255, 159, 0, .45)]">
      <Icon className="h-4 w-4 shrink-0 text-[#FF9F00]" />
      {label}
    </div>
  );
}

function ConfidenceItem({
  icon: Icon,
  title,
}: {
  icon: typeof ShieldCheck;
  title: string;
}) {
  return (
    <div className="flex h-full min-w-0 items-center gap-2.5 rounded-2xl border border-[#FFF8F1] bg-white/80 p-3 text-xs font-black text-[#0B0B0F]">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
        <Icon className="h-4 w-4" />
      </span>
      <span className="leading-5">{title}</span>
    </div>
  );
}

function CheckoutCard({
  selectedServiceName,
  platform,
  rate,
  quantity,
  quantityIsValid,
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
  platform: string;
  rate: string;
  quantity: number;
  quantityIsValid: boolean;
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
    <div className="overflow-hidden rounded-[30px] border border-white/90 bg-white/88 shadow-[0_32px_75px_-40px_rgba(255, 159, 0, .6)] backdrop-blur-2xl">
      <div className="border-b border-[#FFF8F1] bg-[linear-gradient(145deg,#FFF8F1,#FFF8F1)] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_14px_28px_-14px_rgba(255, 196, 0, .7)]">
            <PlatformIcon platform={platform} className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#111827]">Premium invoice</p>
            <h2 className="mt-0.5 text-lg font-black text-[#0B0B0F]">Order summary</h2>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="break-words text-base font-black text-[#0B0B0F]">{selectedServiceName}</p>
        <dl className="mt-5 space-y-3.5 text-sm">
          <SummaryRow label="Service" value={selectedServiceName} />
          <SummaryRow label="Platform" value={platform} />
          <SummaryRow label="Rate" value={`${rate} / 1K`} />
          <SummaryRow label="Quantity" value={quantityIsValid ? quantity.toLocaleString("en-IN") : "Not entered"} />
          <SummaryRow label="Public link" value={targetLink.trim() || "Not entered"} />
          <SummaryRow label="Delivery" value={delivery} />
          <SummaryRow label="Refill support" value={support} />
        </dl>

        <div className="mt-5 rounded-2xl border border-[#FFF8F1] bg-[linear-gradient(145deg,#FFF8F1,#FFF8F1)] p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-[#111827]"><Wallet className="h-4 w-4" />Wallet balance</span>
            {walletLoading ? (
              <span className="h-5 w-24 animate-pulse rounded-lg bg-[#FFF8F1]" />
            ) : (
              <b className="text-[#0B0B0F]">{wallet}</b>
            )}
          </div>
          <div className="mt-4 border-t border-dashed border-[#FFF3E0] pt-4">
            <div className="flex items-end justify-between gap-3">
              <span className="text-sm font-bold text-[#111827]">Total payable</span>
              {quantityIsValid ? (
                <b className="text-2xl font-black text-[#0B0B0F]">{total}</b>
              ) : (
                <span className="max-w-[62%] text-right text-xs font-bold leading-5 text-[#111827]">
                  Enter quantity to calculate total
                </span>
              )}
            </div>
            {!walletLoading && quantityIsValid && !hasEnoughWallet ? (
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#FFF8F1] pt-3 text-sm">
                <span className="text-[#111827]">Amount needed</span>
                <b className="text-[#0B0B0F]">{amountToPay}</b>
              </div>
            ) : null}
          </div>
        </div>

        {walletLoading ? (
          <button type="button" disabled className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white opacity-60">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Checking wallet...
          </button>
        ) : quantityIsValid && !hasEnoughWallet ? (
          <>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
                <Wallet className="h-4 w-4" /> Wallet balance required
              </p>
              <p className="mt-2 text-xs font-semibold leading-6 text-amber-800">{shortfallMessage}</p>
            </div>
            {canAddFunds ? (
              <Link
                href={addFundsHref}
                className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(255, 196, 0, .7)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <Wallet className="h-4 w-4" /> Add {amountToPay} &amp; Place Order
              </Link>
            ) : (
              <button type="button" disabled className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white opacity-50">
                <Wallet className="h-4 w-4" /> Add Funds
              </button>
            )}
          </>
        ) : (
          <button type="button" disabled={!canSubmit || submitting} onClick={onSubmit} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(255, 196, 0, .7)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            {submitting ? "Processing..." : "Place Order Securely"}
          </button>
        )}

        <a
          href={whatsappSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/85 px-4 py-2.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <FaWhatsapp className="h-4 w-4" /> Need help? WhatsApp Support
        </a>
        <p className="mt-4 text-center text-[10px] font-semibold leading-5 text-[#111827]">{getCurrencyDisclaimer()}</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#111827]"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Wallet charged only after confirmation</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[#111827]">{label}</dt>
      <dd className="max-w-[62%] break-words text-right font-bold text-[#0B0B0F]">{value}</dd>
    </div>
  );
}
