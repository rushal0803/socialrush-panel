"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Hash,
  Info,
  Link as LinkIcon,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";
import {
  customerOrderServices,
  growthMethod,
  linkRules,
  serviceExperience,
  validateCampaignLink,
} from "@/lib/order-service-experience";
import { calculateServiceTotal } from "@/lib/service-pricing";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";

type PlatformId = SmmPlatformId;
type ApiOrderData = { id: string; charge: number; balance: number; duplicate?: boolean };

const platformOrder: PlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const platformLinkPlaceholders: Record<PlatformId, string> = {
  instagram: "https://instagram.com/yourprofile",
  youtube: "https://youtube.com/@channel",
  facebook: "https://facebook.com/page",
  linkedin: "https://linkedin.com/in/profile",
  telegram: "https://t.me/channel",
  tiktok: "https://tiktok.com/@profile",
  x: "https://x.com/profile",
};

function cleanQuantity(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function normalizeQuery(value: string | null) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function platformFromQuery(value: string | null): PlatformId | null {
  const normalized = normalizeQuery(value).replace(/-\/-/g, "/").replace(/\/+/g, "/");
  if (normalized === "twitter" || normalized === "twitter-x" || normalized === "x-twitter" || normalized === "twitter/x" || normalized === "x/twitter") return "x";
  return platformOrder.includes(normalized as PlatformId) ? (normalized as PlatformId) : null;
}

function serviceFromQuery(value: string | null, requestedPlatform: PlatformId | null) {
  const normalized = normalizeQuery(value);
  const service =
    customerOrderServices.find((candidate) => candidate.code === normalized) ??
    customerOrderServices.find((candidate) => {
      const type = candidate.code.split("-").pop();
      return type === normalized && (!requestedPlatform || candidate.platform === requestedPlatform);
    });

  if (!service) return null;
  if (requestedPlatform && service.platform !== requestedPlatform) return null;
  return service;
}

function progressState(step: number, current: number) {
  if (step < current) return "complete";
  if (step === current) return "active";
  return "upcoming";
}

function ProgressItem({ number, title, state }: { number: number; title: string; state: "complete" | "active" | "upcoming" }) {
  return (
    <div
      aria-current={state === "active" ? "step" : undefined}
      className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
        state === "active"
          ? "border-orange-400/70 bg-orange-500/15 text-white shadow-[0_0_0_3px_rgba(255,122,0,.08)]"
          : state === "complete"
            ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
            : "border-white/10 bg-[#111111] text-[#9CA3AF]"
      }`}
    >
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black ${state === "active" ? "bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white" : state === "complete" ? "bg-emerald-500 text-white" : "bg-white/10 text-[#9CA3AF]"}`}>
        {state === "complete" ? <Check className="h-4 w-4" /> : number}
      </span>
      <span className="truncate text-[10px] font-black uppercase tracking-[0.08em] sm:text-xs">{title}</span>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = usePreferredCurrency("INR");
  const resumeRequested = searchParams.get("resume") === "1";
  const requestedPlatform = platformFromQuery(searchParams.get("platform"));
  const requestedService = serviceFromQuery(searchParams.get("service"), requestedPlatform);
  const resumedService = resumeRequested
    ? customerOrderServices.find((service) => service.code === searchParams.get("service")) ?? null
    : null;
  const initialService = resumedService ?? requestedService;

  const [platform, setPlatform] = useState<PlatformId | null>(initialService?.platform ?? requestedPlatform ?? null);
  const [selectedService, setSelectedService] = useState<SmmService | null>(initialService);
  const [targetLink, setTargetLink] = useState(resumeRequested ? searchParams.get("link") || "" : "");
  const [quantityInput, setQuantityInput] = useState(resumeRequested ? cleanQuantity(searchParams.get("quantity") || "") : "");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ApiOrderData | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef("");
  const platformRef = useRef<HTMLElement>(null);
  const serviceRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  const services = useMemo(
    () => (platform ? customerOrderServices.filter((service) => service.platform === platform) : []),
    [platform],
  );
  const quantity = Number(quantityInput || 0);
  const quantityError = useMemo(() => {
    if (!selectedService || !quantityInput) return "";
    if (!Number.isInteger(quantity) || quantity <= 0) return "Enter a valid whole-number quantity.";
    if (quantity < selectedService.minQuantity) return `The minimum available quantity is ${selectedService.minQuantity.toLocaleString("en-IN")}.`;
    if (quantity > selectedService.maxQuantity) return "This quantity is currently unavailable for the selected service.";
    return "";
  }, [quantity, quantityInput, selectedService]);
  const linkRule = selectedService ? linkRules[selectedService.code] : null;
  const linkError = selectedService && linkRule && targetLink.trim() ? validateCampaignLink(targetLink, linkRule) : "";
  const formIsValid = Boolean(selectedService && quantityInput && targetLink.trim() && !quantityError && !linkError);
  const totalPrice = selectedService ? calculateServiceTotal(selectedService.code, quantity) : 0;
  const hasEnoughWallet = walletBalance !== null && totalPrice > 0 && walletBalance + 0.0001 >= totalPrice;
  const amountRequired = walletBalance === null ? 0 : Math.max(0, Math.round((totalPrice - walletBalance) * 100) / 100);
  const currentStep = !platform ? 1 : !selectedService ? 2 : !formIsValid ? 3 : 4;

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    window.setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const resetOrderDetails = () => {
    setTargetLink("");
    setQuantityInput("");
    setError("");
    setSuccess(null);
    requestId.current = "";
  };

  const choosePlatform = (nextPlatform: PlatformId) => {
    setPlatform(nextPlatform);
    setSelectedService(null);
    resetOrderDetails();
    scrollTo(serviceRef);
  };

  const chooseService = (service: SmmService) => {
    setSelectedService(service);
    resetOrderDetails();
    scrollTo(detailsRef);
  };

  const loadWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent("/dashboard/new-order")}`);
        return;
      }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
      if (profileError) {
        setWalletBalance(0);
        setWalletError("Wallet balance could not be loaded. Please refresh before ordering.");
        return;
      }
      setWalletBalance(Number(profile?.balance ?? 0));
    } catch {
      setWalletBalance(0);
      setWalletError("Wallet balance is unavailable right now.");
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
    if (!selectedService || !linkRule || inFlight.current || submitting) return;
    setError("");
    if (!quantityInput || quantityError) {
      setError(quantityError || "Enter a quantity to continue.");
      scrollTo(detailsRef);
      return;
    }
    const validationError = validateCampaignLink(targetLink, linkRule);
    if (validationError) {
      setError(validationError);
      scrollTo(detailsRef);
      return;
    }
    if (walletLoading || walletBalance === null) {
      setError("Your wallet balance is still being checked.");
      return;
    }
    if (!hasEnoughWallet) {
      setError("Your wallet balance is lower than this order total.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const experience = serviceExperience[selectedService.code];

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });
      const result = (await response.json()) as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Unable to place your order right now.");

      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      setSuccess(result.data);
      requestId.current = "";
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      window.setTimeout(() => router.push("/dashboard/orders"), 900);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to place your order right now.");
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  const returnParams = new URLSearchParams();
  if (selectedService) returnParams.set("service", selectedService.code);
  if (quantityInput) returnParams.set("quantity", quantityInput);
  if (targetLink.trim()) returnParams.set("link", targetLink.trim());
  returnParams.set("resume", "1");
  const returnTo = `/dashboard/new-order?${returnParams.toString()}`;
  const addFundsHref = `/dashboard/wallet?amount=${encodeURIComponent(String(amountRequired))}&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[#050505] px-4 pb-36 pt-5 text-white sm:px-6 sm:pb-24 sm:pt-7 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1450px]">
        <section className="relative overflow-hidden rounded-[1.6rem] border border-orange-400/25 bg-[#111111] p-5 shadow-[0_30px_80px_-42px_rgba(255,122,0,.65)] sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
            <Sparkles className="h-3.5 w-3.5" /> Guided order flow
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl">Start a Growth Campaign</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#D1D5DB] sm:text-base">Choose your platform and service, add campaign details, then review everything before confirming.</p>
        </section>

        <section aria-label="Order progress" className="sticky top-20 z-20 mt-4 rounded-2xl border border-orange-400/20 bg-[#0B0B0F]/95 p-2 shadow-[0_16px_36px_-24px_rgba(0,0,0,.8)] backdrop-blur-xl sm:p-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <ProgressItem number={1} title="Platform" state={progressState(1, currentStep)} />
            <ProgressItem number={2} title="Service" state={progressState(2, currentStep)} />
            <ProgressItem number={3} title="Details" state={progressState(3, currentStep)} />
            <ProgressItem number={4} title="Summary" state={progressState(4, currentStep)} />
          </div>
        </section>

        <section ref={platformRef} className="scroll-mt-40 mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_24px_54px_-36px_rgba(255,122,0,.55)] sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">Step 1</p>
          <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Choose your platform</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {platformOrder.map((platformId) => {
              const meta = platformMeta[platformId];
              const active = platform === platformId;
              return (
                <motion.button
                  key={platformId}
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => choosePlatform(platformId)}
                  aria-pressed={active}
                  className={`relative min-w-0 rounded-2xl border p-3 text-left transition sm:p-4 ${active ? "border-orange-400/80 bg-orange-500/15 ring-2 ring-orange-500/15" : "border-white/10 bg-[#0B0B0F] hover:border-orange-400/45"}`}
                >
                  {active ? <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-emerald-600" /> : null}
                      <IconBadge label={meta.label}><PlatformIcon platform={meta.label} className="h-6 w-6" /></IconBadge>
                  <span className="mt-3 block break-words text-xs font-black text-white">{meta.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section ref={serviceRef} className="scroll-mt-40 mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_24px_54px_-36px_rgba(255,122,0,.55)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">Step 2</p><h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Choose your service</h2></div>
            {platform ? <button type="button" onClick={() => scrollTo(platformRef)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-3.5 py-2.5 text-xs font-bold text-orange-300">Change platform</button> : null}
          </div>
          {!platform ? (
            <div className="mt-5 rounded-2xl border border-dashed border-orange-400/25 bg-[#0B0B0F] p-8 text-center text-sm font-semibold text-[#D1D5DB]">Choose a platform to see available services.</div>
          ) : services.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-semibold text-amber-800">No services available for this platform right now. Please contact support.</div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {services.map((service) => {
                const active = selectedService?.code === service.code;
                const experience = serviceExperience[service.code];
                return (
                  <motion.article key={service.code} whileHover={{ y: -4 }} className={`flex min-w-0 flex-col rounded-3xl border p-5 transition ${active ? "border-orange-400/80 bg-orange-500/10 ring-2 ring-orange-500/10" : "border-white/10 bg-[#0B0B0F]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <IconBadge label={platformMeta[service.platform].label}><PlatformIcon platform={platformMeta[service.platform].label} className="h-6 w-6" /></IconBadge>
                      {active ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700"><Check className="h-3 w-3" /> Selected</span> : null}
                    </div>
                    <h3 className="mt-4 text-lg font-black text-white">{experience.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">{service.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/10 bg-[#151515] p-3"><span className="text-[#9CA3AF]">Rate</span><strong className="mt-1 block text-white">{formatCurrency(service.pricePer1000, currency)} / 1K</strong></div><div className="rounded-xl border border-white/10 bg-[#151515] p-3"><span className="text-[#9CA3AF]">Delivery</span><strong className="mt-1 block text-white">{service.deliveryTime}</strong></div></div>
                    <details className="mt-4 rounded-xl border border-white/10 bg-[#151515]"><summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-orange-300"><Info className="mr-2 inline h-4 w-4" />How it works</summary><p className="border-t border-white/10 px-3 py-3 text-xs leading-6 text-[#D1D5DB]">{growthMethod(service)}</p></details>
                    <button type="button" onClick={() => chooseService(service)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(255, 196, 0, .65)]">
                      {active ? "Service Selected" : "Choose Service"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>

        {selectedService && linkRule ? (
          <>
            <section ref={detailsRef} className="scroll-mt-40 mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_24px_54px_-36px_rgba(255,122,0,.55)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">Step 3</p><h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Enter campaign details</h2></div>
                <button type="button" onClick={() => scrollTo(serviceRef)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-3.5 py-2.5 text-xs font-bold text-orange-300">Change service</button>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <label className="block text-xs font-black text-white">
                  <span className="inline-flex items-center gap-2"><LinkIcon className="h-4 w-4 text-orange-400" />Public Link / Username</span>
                  <input
                    value={targetLink}
                    onChange={(event) => { setTargetLink(event.target.value); setError(""); }}
                    placeholder={platform ? platformLinkPlaceholders[platform] : linkRule.placeholder}
                    className="mt-2 min-h-14 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3.5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-[#6B7280] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  />
                  <span className={`mt-2 block text-[11px] leading-5 ${linkError ? "font-semibold text-red-300" : "text-[#D1D5DB]"}`}>
                    {linkError || "Use the public URL where you want the service delivered."}
                  </span>
                </label>
                <label className="block text-xs font-black text-white">
                  <span className="inline-flex items-center gap-2"><Hash className="h-4 w-4 text-orange-400" />Quantity</span>
                  <input
                    value={quantityInput}
                    onChange={(event) => { setQuantityInput(cleanQuantity(event.target.value)); setError(""); }}
                    inputMode="numeric"
                    placeholder="Enter quantity"
                    className="mt-2 min-h-14 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3.5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-[#6B7280] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  />
                  <span className={`mt-2 block text-[11px] leading-5 ${quantityError ? "font-semibold text-red-300" : "text-[#D1D5DB]"}`}>
                    {quantityError || "Enter the quantity you want for this campaign."}
                  </span>
                </label>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl border bg-[linear-gradient(135deg,#19120B,#0B0B0F)] p-4 shadow-[0_18px_45px_-28px_rgba(255,122,0,.75)] ${quantityError ? "border-red-400/40" : "border-orange-400/35"}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-300">Price preview</p>
                  <p className={`mt-2 text-xl font-black sm:text-2xl ${quantityError ? "text-red-200" : "text-white"}`}>
                    {!quantityInput ? "Enter quantity to calculate" : quantityError || formatCurrency(totalPrice, currency)}
                  </p>
                </div>
                <div className="safety-note flex items-center gap-3 rounded-2xl border border-emerald-400/45 bg-[#0B1F18] p-4 shadow-[0_16px_38px_rgba(0,0,0,0.22)]"><LockKeyhole className="h-5 w-5 shrink-0 text-emerald-300" /><p className="text-sm font-bold leading-6 text-white">No password required. Only your public link is needed.</p></div>
              </div>
              {formIsValid ? <button type="button" onClick={() => scrollTo(summaryRef)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 sm:w-auto">Review order summary <ArrowRight className="h-4 w-4" /></button> : null}
            </section>

            <section ref={summaryRef} className="scroll-mt-40 mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_30px_65px_-40px_rgba(255,122,0,.6)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">Step 4</p><h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Review order summary</h2></div>
                <button type="button" onClick={() => scrollTo(detailsRef)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-3.5 py-2.5 text-xs font-bold text-orange-300">Change details</button>
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[["Platform", platform ? platformMeta[platform].label : "—"],["Service", serviceExperience[selectedService.code].name],["Public link", targetLink.trim() || "Not entered"],["Quantity", quantity > 0 ? quantity.toLocaleString("en-IN") : "Not entered"],["Delivery", selectedService.deliveryTime],["Refill support", selectedService.refillPolicy]].map(([label, value]) => <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-[#151515] p-4"><dt className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">{label}</dt><dd className="mt-2 text-sm font-bold text-white [overflow-wrap:anywhere]">{value}</dd></div>)}
                </dl>
                <aside className="rounded-3xl bg-[#0B0B0F] p-5 text-white shadow-xl">
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold text-orange-100"><Wallet className="h-4 w-4" />Wallet balance</span>{walletLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}</div>
                  <p className="mt-2 text-2xl font-black">{walletBalance === null ? "Checking..." : formatCurrency(walletBalance, currency)}</p>
                  <div className="my-5 border-t border-white/15" />
                  <div className="flex items-end justify-between gap-3"><span className="text-xs text-orange-100">Order total</span><strong className="text-2xl">{formIsValid ? formatCurrency(totalPrice, currency) : "—"}</strong></div>
                  {formIsValid && walletBalance !== null && !hasEnoughWallet ? <div className="mt-4 rounded-xl bg-amber-400/15 p-3 text-xs leading-6 text-amber-100">Amount required: <strong>{formatCurrency(amountRequired, currency)}</strong></div> : null}
                  {walletError ? <p className="mt-4 text-xs leading-5 text-amber-200">{walletError}</p> : null}
                  {error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-xs font-semibold text-red-100">{error}</p> : null}
                  {success ? <p className="mt-4 rounded-xl bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-100">Order placed successfully. Opening Order History…</p> : null}
                  {hasEnoughWallet ? (
                    <button type="button" onClick={() => void placeOrder()} disabled={!formIsValid || walletLoading || submitting || Boolean(success)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Placing order…</> : <><ShieldCheck className="h-4 w-4" /> Place Order</>}
                    </button>
                  ) : formIsValid && !walletLoading ? (
                    <Link href={addFundsHref} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg"><Wallet className="h-4 w-4" /> Add Funds</Link>
                  ) : (
                    <button type="button" disabled className="mt-5 min-h-12 w-full rounded-xl bg-white/15 px-5 py-3 text-sm font-black text-white/60">Complete details to continue</button>
                  )}
                  <p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-orange-100"><RefreshCw className="h-3.5 w-3.5" /> Wallet charged only after confirmation</p>
                </aside>
              </div>
            </section>
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[#D1D5DB]">
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure wallet checkout</span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-2"><Clock3 className="h-4 w-4 text-orange-300" /> Track from dashboard</span>
        </div>
      </div>
    </main>
  );
}
