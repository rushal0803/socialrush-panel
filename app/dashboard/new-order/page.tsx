"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Clock3,
  Eye,
  Hash,
  Heart,
  Info,
  Link as LinkIcon,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Users,
  Wallet,
} from "lucide-react";
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
  mergeCustomerOrderServices,
  serviceExperience,
  validateCampaignLink,
} from "@/lib/order-service-experience";
import { validateQuantity } from "@/lib/service-pricing";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import ServiceHealthBadge from "@/components/ServiceHealthBadge";
import { useServiceHealth } from "@/lib/use-service-health";
import { track } from "@/lib/analytics/events";
import { isSocialRushAndroidApp } from "@/lib/is-socialrush-android-app";

type PlatformId = SmmPlatformId;
type ApiOrderData = { id: string; charge: number; balance: number; duplicate?: boolean };
type SavedProfile = { id: string; label: string; platform: string; public_url: string; last_used_at: string | null };
type ServiceRecord = { id: number; code: string | null };
type CashfreeCheckout = { checkout: (input: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<unknown> };
declare global { interface Window { Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeCheckout; } }

const platformOrder: PlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const protectedLiveServiceDefinitions = [
  { code: "youtube-comments", name: "YouTube Comments", platform: "youtube", description: "Build visible conversation and engagement around your YouTube videos with comment activity." },
  { code: "youtube-watch-hours", name: "YouTube Watch Hours", platform: "youtube", description: "Build extended viewing activity around your public YouTube content with transparent watch-hour packages and dashboard tracking." },
  { code: "facebook-group-members", name: "Facebook Group Members", platform: "facebook", description: "Grow your Facebook community with group member packages, transparent pricing, and dashboard order tracking." },
] as const satisfies ReadonlyArray<Pick<SmmService, "code" | "name" | "platform" | "description">>;
const clientLiveServiceDefinitions = [
  { code: "instagram-saves", name: "Instagram Saves", platform: "instagram", description: "Strengthen post and Reel engagement signals with Instagram save activity.", fallbackInstruction: "Use a public Instagram post or reel URL." },
  { code: "instagram-shares", name: "Instagram Shares", platform: "instagram", description: "Expand post and Reel engagement with Instagram share activity.", fallbackInstruction: "Use a public Instagram post or reel URL." },
] as const satisfies ReadonlyArray<Pick<SmmService, "code" | "name" | "platform" | "description"> & { fallbackInstruction: string }>;
function cleanQuantity(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function loadCashfree() {
  return new Promise<boolean>((resolve) => {
    if (window.Cashfree) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(true), { once: true }); existing.addEventListener("error", () => resolve(false), { once: true }); return; }
    const script = document.createElement("script"); script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script);
  });
}

function validQuickQuantities(service: SmmService) {
  const min = service.minQuantity;
  const max = service.maxQuantity;
  // Derive useful choices from the configured limits instead of assuming every
  // service supports the same 1K/5K/10K quantities.
  const sensible = [min, 500, 1000, 5000, 10000, 25000, 50000, 100000, max];
  return [...new Set(sensible.filter((value) => value >= min && value <= max && (value - min) % (service.quantityStep ?? 1) === 0))].slice(0, 5);
}

function compactQuantity(value: number) {
  return value >= 1000 ? `${value / 1000}K` : value.toLocaleString("en-IN");
}

function platformAccent(platform: PlatformId) {
  return {
    instagram: "from-fuchsia-500 via-rose-500 to-amber-400 text-white",
    youtube: "from-red-600 to-red-500 text-white",
    facebook: "from-blue-600 to-blue-500 text-white",
    linkedin: "from-sky-700 to-sky-500 text-white",
    telegram: "from-sky-500 to-cyan-400 text-white",
    tiktok: "from-cyan-400 via-slate-900 to-rose-500 text-white",
    x: "from-slate-100 to-slate-400 text-slate-950",
  }[platform];
}

function normalizeQuery(value: string | null) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function platformFromQuery(value: string | null): PlatformId | null {
  const normalized = normalizeQuery(value).replace(/-\/-/g, "/").replace(/\/+/g, "/");
  if (normalized === "twitter" || normalized === "twitter-x" || normalized === "x-twitter" || normalized === "twitter/x" || normalized === "x/twitter") return "x";
  return platformOrder.includes(normalized as PlatformId) ? (normalized as PlatformId) : null;
}

function serviceFromQuery(value: string | null, requestedPlatform: PlatformId | null, liveServices: SmmService[] = []) {
  const normalized = normalizeQuery(value);
  const selectableServices = mergeCustomerOrderServices(liveServices);
  const service =
    selectableServices.find((candidate) => candidate.code === normalized) ??
    selectableServices.find((candidate) => {
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
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-1.5 transition sm:flex-row sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5 ${
        state === "active"
          ? "border-orange-400/70 bg-orange-500/15 text-white shadow-[0_0_0_3px_rgba(255,122,0,.08)]"
          : state === "complete"
            ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
            : "border-white/10 bg-[#111111] text-[#9CA3AF]"
      }`}
    >
        <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[10px] font-black sm:h-7 sm:w-7 sm:rounded-lg ${state === "active" ? "bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white" : state === "complete" ? "bg-emerald-500 text-white" : "bg-white/10 text-[#9CA3AF]"}`}>
        {state === "complete" ? <Check className="h-4 w-4" /> : number}
      </span>
      <span className="max-w-full truncate text-[9px] font-black uppercase tracking-[0.04em] sm:text-xs sm:tracking-[0.08em]">{title}</span>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const queryString = useSearchParams().toString();
  const searchParams = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const { currency } = usePreferredCurrency("INR");
  const healthByService = useServiceHealth();
  const resumeRequested = searchParams.get("resume") === "1";
  const requestedPlatform = platformFromQuery(searchParams.get("platform"));
  const requestedService = serviceFromQuery(searchParams.get("service"), requestedPlatform);
  const resumedService = resumeRequested
    ? mergeCustomerOrderServices().find((service) => service.code === searchParams.get("service")) ?? null
    : null;
  const initialService = resumedService ?? requestedService;

  const [platform, setPlatform] = useState<PlatformId | null>(initialService?.platform ?? requestedPlatform ?? null);
  const [selectedService, setSelectedService] = useState<SmmService | null>(initialService);
  const prefillRequested = resumeRequested || searchParams.get("prefill") === "1";
  const [targetLink, setTargetLink] = useState(prefillRequested ? searchParams.get("link") || "" : "");
  // Every live-only service enters the same canonical merge path. This keeps
  // identity and de-duplication consistent as additional services are added.
  const [liveServices, setLiveServices] = useState<SmmService[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [serviceIds, setServiceIds] = useState<Record<string, number>>({});
  const [favouriteServiceIds, setFavouriteServiceIds] = useState<Set<number>>(new Set());
  const [favouriteUpdatingServiceIds, setFavouriteUpdatingServiceIds] = useState<Set<number>>(new Set());
  const [favouriteNotice, setFavouriteNotice] = useState("");
  const [favouriteError, setFavouriteError] = useState("");
  const [quantityInput, setQuantityInput] = useState(prefillRequested ? cleanQuantity(searchParams.get("quantity") || "") : "");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ApiOrderData | null>(null);
  const [checkoutStage, setCheckoutStage] = useState("");
  const [resumeNotice, setResumeNotice] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(initialService ? 3 : requestedPlatform ? 2 : 1);
  const inFlight = useRef(false);
  const requestId = useRef("");
  const directCheckoutIntentId = useRef<string | null>(searchParams.get("checkout_intent"));
  const checkoutConfiguration = useRef<string | null>(null);
  const funnelSignals = useRef(new Set<string>());
  const advanceTimer = useRef<number | null>(null);
  const platformRef = useRef<HTMLElement>(null);
  const serviceRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!queryString) {
      setPlatform(null);
      setSelectedService(null);
      setTargetLink("");
      setQuantityInput("");
      return;
    }
    const platformFromUrl = platformFromQuery(searchParams.get("platform"));
    const serviceFromUrl = serviceFromQuery(searchParams.get("service"), platformFromUrl, liveServices);
    const resumedFromUrl = searchParams.get("resume") === "1"
      ? mergeCustomerOrderServices().find((service) => service.code === searchParams.get("service")) ?? null
      : null;
    const service = resumedFromUrl ?? serviceFromUrl;

    if (service) {
      setPlatform(service.platform);
      setSelectedService(service);
    } else if (platformFromUrl) {
      setPlatform(platformFromUrl);
      setSelectedService(null);
    }
    if (searchParams.get("resume") === "1" || searchParams.get("prefill") === "1") {
      setTargetLink(searchParams.get("link") || "");
      setQuantityInput(cleanQuantity(searchParams.get("quantity") || ""));
    }
  }, [queryString, searchParams, liveServices]);

  useEffect(() => {
    if (searchParams.get("draft") !== "1") return;
    let active = true;
    void fetch("/api/order-draft", { credentials: "same-origin" }).then(async (response) => response.ok ? response.json() as Promise<{ data?: { platform: string; service_code: string; quantity: number; target: string | null } | null }> : { data: null }).then(({ data }) => {
      if (!active || !data) return;
      const draftPlatform = platformFromQuery(data.platform);
      const service = serviceFromQuery(data.service_code, draftPlatform, liveServices);
      if (!service) { setResumeNotice("This exact service is currently unavailable. Please choose another option from the same platform."); if (draftPlatform) setPlatform(draftPlatform); return; }
      setPlatform(service.platform); setSelectedService(service); setQuantityInput(cleanQuantity(String(data.quantity))); setTargetLink(data.target || ""); setCheckoutStep(3); setResumeNotice("Your saved configuration is restored. Please review the current price before continuing.");
      track("order_started", { step: "draft_resumed", service_code: service.code, platform: service.platform });
    }).catch(() => undefined);
    return () => { active = false; };
  }, [liveServices, searchParams]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const services = useMemo(
    () => (platform ? mergeCustomerOrderServices(liveServices).filter((service) => service.platform === platform) : []),
    [liveServices, platform],
  );
  const favouriteServices = useMemo(
    () => mergeCustomerOrderServices(liveServices).filter((service) => {
      const serviceId = serviceIds[service.code];
      return Boolean(serviceId && favouriteServiceIds.has(serviceId));
    }),
    [favouriteServiceIds, liveServices, serviceIds],
  );
  const quantity = Number(quantityInput || 0);
  const quantityError = useMemo(() => {
    if (!selectedService || !quantityInput) return "";
    return validateQuantity(quantity, selectedService) || "";
  }, [quantity, quantityInput, selectedService]);
  const linkRule = selectedService ? linkRules[selectedService.code] : null;
  const linkError = selectedService && linkRule && targetLink.trim() ? validateCampaignLink(targetLink, linkRule) : "";
  const formIsValid = Boolean(selectedService && quantityInput && targetLink.trim() && !quantityError && !linkError);
  const totalPrice = selectedService ? Math.round((quantity * selectedService.pricePer1000 * 100) / 1000) / 100 : 0;
  const hasEnoughWallet = walletBalance !== null && totalPrice > 0 && walletBalance + 0.0001 >= totalPrice;
  const amountRequired = walletBalance === null ? 0 : Math.max(0, Math.round((totalPrice - walletBalance) * 100) / 100);
  const remainingBalance = walletBalance === null ? null : Math.max(0, walletBalance - totalPrice);
  const currentStep = checkoutStep;
  const quickQuantities = selectedService ? validQuickQuantities(selectedService) : [];

  // Cashfree can retain a prior payment sheet in the Android WebView. Browser
  // checkout intentionally keeps its existing URL-intent behaviour; only the
  // official app clears an inherited intent when its order changes.
  useEffect(() => {
    if (!isSocialRushAndroidApp()) return;

    const currentConfiguration = JSON.stringify({
      platform,
      service: selectedService?.code ?? null,
      quantity,
      link: targetLink.trim(),
      total: totalPrice,
    });
    const previousConfiguration = checkoutConfiguration.current;
    checkoutConfiguration.current = currentConfiguration;

    const clearStaleCheckoutUrl = (clearRecoveryParams: boolean) => {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout_intent");
      if (clearRecoveryParams) url.searchParams.delete("cashfree_order_id");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    };

    // An intent supplied by WebView history has no client-side proof that it
    // belongs to this configuration, so never use it for a new Android visit.
    if (previousConfiguration === null && directCheckoutIntentId.current) {
      directCheckoutIntentId.current = null;
      requestId.current = "";
      clearStaleCheckoutUrl(false);
      return;
    }

    if (previousConfiguration !== null && previousConfiguration !== currentConfiguration) {
      directCheckoutIntentId.current = null;
      requestId.current = "";
      clearStaleCheckoutUrl(true);
    }
  }, [platform, quantity, selectedService?.code, targetLink, totalPrice]);

  useEffect(() => {
    if (!selectedService || !quantityInput || quantityError || linkError || success) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/order-draft", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: selectedService.platform, serviceCode: selectedService.code, quantity, target: targetLink.trim() }) }).then((response) => { if (response.ok) track("order_started", { step: "draft_saved", service_code: selectedService.code, platform: selectedService.platform }); }).catch(() => undefined);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [linkError, quantity, quantityError, quantityInput, selectedService, success, targetLink]);

  const clearDraft = () => void fetch("/api/order-draft", { method: "DELETE" }).catch(() => undefined);

  useEffect(() => {
    const emitOnce = (key: string, event: Parameters<typeof track>[0], metadata: Record<string, string | number | boolean | null>) => {
      if (funnelSignals.current.has(key)) return;
      funnelSignals.current.add(key);
      track(event, metadata);
    };
    if (selectedService) emitOnce(`view:${selectedService.code}`, "service_viewed", { service_code: selectedService.code, platform: selectedService.platform });
  }, [formIsValid, linkError, quantityError, quantityInput, selectedService, targetLink]);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => ref.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }), 80);
  };

  const resetOrderDetails = () => {
    setTargetLink("");
    setQuantityInput("");
    setError("");
    setSuccess(null);
    requestId.current = "";
  };

  const choosePlatform = (nextPlatform: PlatformId) => {
    if (advanceTimer.current || platform === nextPlatform && checkoutStep === 2) return;
    setPlatform(nextPlatform);
    setSelectedService(null);
    resetOrderDetails();
    setCheckoutStep(1);
    const params = new URLSearchParams();
    params.set("platform", nextPlatform);
    window.history.replaceState(null, "", `/dashboard/new-order?${params.toString()}`);
    advanceTimer.current = window.setTimeout(() => {
      setCheckoutStep(2);
      scrollTo(serviceRef);
      advanceTimer.current = null;
    }, 380);
  };

  const chooseService = (service: SmmService) => {
    const health = healthByService[service.code];
    if (advanceTimer.current || health && (!health.acceptsNewOrders || health.status === "paused")) return;
    if (selectedService?.code === service.code) return;
    track("service_selected", { service_code: service.code, platform: service.platform });
    track("order_started", { service_code: service.code, platform: service.platform });
    setSelectedService(service);
    resetOrderDetails();
    setCheckoutStep(2);
    const params = new URLSearchParams();
    params.set("platform", service.platform);
    params.set("service", service.code);
    window.history.replaceState(null, "", `/dashboard/new-order?${params.toString()}`);
    advanceTimer.current = window.setTimeout(() => {
      setCheckoutStep(3);
      scrollTo(detailsRef);
      advanceTimer.current = null;
    }, 380);
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
    const db = createClient();
    void db.from("saved_social_profiles").select("id,label,platform,public_url,last_used_at").order("last_used_at", { ascending: false, nullsFirst: false }).then(({data}) => setSavedProfiles((data || []) as SavedProfile[]));
    void Promise.all([
      db.from("services").select("id,code").eq("status", "active"),
      db.from("customer_favourites").select("service_id"),
    ]).then(([servicesResult, favouritesResult]) => {
      const byCode: Record<string, number> = {};
      const records = (servicesResult.data || []) as ServiceRecord[];
      for (const record of records) {
        if (record.code) byCode[record.code] = record.id;
      }
      setServiceIds(byCode);
      setFavouriteServiceIds(new Set((favouritesResult.data || []).map((item) => Number(item.service_id))));
    });
    const updateBalance = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) setWalletBalance(value);
    };
    window.addEventListener("wallet-balance-updated", updateBalance);
    return () => window.removeEventListener("wallet-balance-updated", updateBalance);
  }, [loadWalletBalance]);

  const toggleFavourite = async (service: SmmService) => {
    const serviceId = serviceIds[service.code];
    if (!serviceId || favouriteUpdatingServiceIds.has(serviceId)) return;
    setFavouriteError("");
    setFavouriteNotice("");
    const isFavourite = favouriteServiceIds.has(serviceId);
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) { router.replace("/login?next=/dashboard/new-order"); return; }
    setFavouriteUpdatingServiceIds((current) => new Set(current).add(serviceId));
    const result = isFavourite
      ? await db.from("customer_favourites").delete().eq("user_id", user.id).eq("service_id", serviceId)
      : await db.from("customer_favourites").upsert(
        { user_id: user.id, service_id: serviceId },
        { onConflict: "user_id,service_id", ignoreDuplicates: true },
      );
    setFavouriteUpdatingServiceIds((current) => {
      const next = new Set(current);
      next.delete(serviceId);
      return next;
    });
    if (result.error) {
      setFavouriteError(`Could not ${isFavourite ? "remove" : "save"} this favourite: ${result.error.message}`);
      return;
    }
    setFavouriteServiceIds((current) => {
      const next = new Set(current);
      if (isFavourite) next.delete(serviceId); else next.add(serviceId);
      return next;
    });
    setFavouriteNotice(isFavourite ? "Removed from favourites" : "Saved to favourites");
  };

  // Live-catalog services are configured in Supabase. They stay absent from
  // New Order until an active, orderable row supplies their facts.
  useEffect(() => {
    const isValidLiveService = (service: SmmService) => Number.isFinite(service.pricePer1000) && service.pricePer1000 > 0 && service.minQuantity > 0 && service.maxQuantity >= service.minQuantity;
    const storeLiveService = (service: SmmService) => {
      if (!isValidLiveService(service)) return;
      setLiveServices((current) => [...current.filter((item) => item.code !== service.code), service]);
      setSelectedService((current) => current?.code === service.code ? service : current);
    };
    const db = createClient();
    for (const definition of clientLiveServiceDefinitions) void db
      .from("services")
      .select("rate,min,max,delivery_time,refill_policy,quality_type,important_instruction")
      .eq("name", definition.name)
      .eq("platform", definition.platform)
      .eq("status", "active")
      .eq("is_active", true)
      .eq("accepts_new_orders", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const liveService: SmmService = {
          platform: definition.platform,
          code: definition.code,
          name: definition.name,
          description: definition.description,
          pricePer1000: Number(data.rate),
          minQuantity: Number(data.min),
          maxQuantity: Number(data.max),
          deliveryTime: data.delivery_time || "Estimate shown before checkout",
          refillPolicy: data.refill_policy || "Check current service terms",
          qualityType: data.quality_type || "Premium",
          importantInstruction: data.important_instruction || definition.fallbackInstruction,
          isActive: true,
        };
        storeLiveService(liveService);
      });
    for (const definition of protectedLiveServiceDefinitions) void fetch(`/api/services/live-catalog?code=${definition.code}`, { credentials: "same-origin" })
      .then(async (response) => response.ok ? response.json() as Promise<{ data?: { rate: number; min: number; max: number; deliveryTime: string; refillPolicy: string; qualityType: string; importantInstruction: string } | null }> : { data: null })
      .then(({ data }) => {
        if (!data) return;
        const liveService: SmmService = {
          platform: definition.platform, code: definition.code, name: definition.name,
          description: definition.description,
          pricePer1000: Number(data.rate), minQuantity: Number(data.min), maxQuantity: Number(data.max),
          deliveryTime: data.deliveryTime, refillPolicy: data.refillPolicy,
          qualityType: data.qualityType, importantInstruction: data.importantInstruction,
          isActive: true,
        };
        storeLiveService(liveService);
      });
  }, []);

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
      if (!intentResponse.ok || !intentResult.data?.id) {
        throw new Error(intentResult.error || "Unable to prepare your checkout right now.");
      }
      track("checkout_started", { service_code: selectedService.code, platform: selectedService.platform, checkout_intent_id: intentResult.data.id });

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
      if (!response.ok || !result.data) throw new Error(result.error || "Unable to place your order right now.");

      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      setSuccess(result.data);
      clearDraft();
      requestId.current = "";
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      window.setTimeout(() => router.push("/dashboard/orders"), 900);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to place your order right now.");
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  async function payAndPlaceOrder() {
    if (!selectedService || !linkRule || inFlight.current || submitting || !formIsValid) return;
    inFlight.current = true;
    setSubmitting(true);
    setCheckoutStage("Preparing secure payment...");
    setError("");
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      let intentId = directCheckoutIntentId.current;
      if (!intentId) {
        const intentResponse = await fetch("/api/checkout/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceCode: selectedService.code, quantity, link: targetLink.trim(), clientRequestId: requestId.current, packageName: "Custom", notes: null }) });
        const intent = await intentResponse.json() as { data?: { id?: string }; error?: string };
        if (!intentResponse.ok || !intent.data?.id) throw new Error(intent.error || "Unable to prepare your checkout.");
        intentId = intent.data.id;
        directCheckoutIntentId.current = intentId;
      }
      const returnPath = `/dashboard/new-order?${returnParams.toString()}`;
      const paymentResponse = await fetch("/api/checkout/cashfree/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId, returnPath }) });
      const payment = await paymentResponse.json() as { data?: { paymentSessionId?: string; returnUrl?: string; environment?: "sandbox" | "production" }; error?: string; code?: string };
      if (payment.code === "WALLET_SUFFICIENT") {
        const walletOrderResponse = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId, clientRequestId: requestId.current, serviceCode: selectedService.code, quantity, link: targetLink.trim() }) });
        const walletOrder = await walletOrderResponse.json() as { data?: ApiOrderData; error?: string };
        if (!walletOrderResponse.ok || !walletOrder.data) throw new Error(walletOrder.error || "Unable to place your order.");
        setWalletBalance(Number(walletOrder.data.balance)); setSuccess(walletOrder.data); clearDraft(); requestId.current = "";
        window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: Number(walletOrder.data.balance) }));
        window.setTimeout(() => router.push("/dashboard/orders"), 900);
        return;
      }
      if (!paymentResponse.ok || !payment.data?.paymentSessionId || !payment.data.returnUrl || !payment.data.environment) throw new Error(payment.error || "Unable to initialize secure payment.");
      setCheckoutStage("Opening secure payment...");
      const loaded = await loadCashfree();
      if (!loaded || !window.Cashfree) throw new Error("Secure Cashfree checkout could not be loaded. Please try again.");
      const checkout = window.Cashfree({ mode: payment.data.environment }) as unknown as { checkout: (input: { paymentSessionId: string; returnUrl: string; redirectTarget: "_self" }) => Promise<unknown> };
      await checkout.checkout({ paymentSessionId: payment.data.paymentSessionId, returnUrl: payment.data.returnUrl, redirectTarget: "_self" });
      if (isSocialRushAndroidApp()) {
        // A returned Cashfree sheet is an abandoned/cancelled attempt unless
        // its return URL navigated away for verification. Do not reuse it.
        directCheckoutIntentId.current = null;
        requestId.current = "";
        setCheckoutStage("");
        setSubmitting(false);
        inFlight.current = false;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to open secure payment.");
      setCheckoutStage(""); setSubmitting(false); inFlight.current = false;
    }
  }

  const returnParams = new URLSearchParams();
  if (selectedService) returnParams.set("service", selectedService.code);
  if (quantityInput) returnParams.set("quantity", quantityInput);
  if (targetLink.trim()) returnParams.set("link", targetLink.trim());
  returnParams.set("resume", "1");
  useEffect(() => {
    const orderId = searchParams.get("cashfree_order_id");
    if (!orderId || !/^src_[a-f0-9]{32}$/i.test(orderId)) return;
    let active = true;
    void fetch("/api/checkout/cashfree/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) })
      .then(async (response) => {
        const result = (await response.json()) as { data?: { status?: string; orderId?: string; balance?: number }; error?: string };
        if (!active) return;
        if (response.ok && result.data?.status === "success" && result.data.orderId) {
          setSuccess({ id: result.data.orderId, charge: totalPrice, balance: Number(result.data.balance ?? walletBalance ?? 0) });
          clearDraft();
          router.replace("/dashboard/orders");
        } else if (response.ok && result.data?.status === "pending") {
          setError("Payment verification is pending. Your order has not been placed yet; refresh shortly to retry safely.");
        } else if (response.ok && result.data?.status === "failed") {
          setError("Payment was not completed. No amount was charged. You can try again.");
          setSubmitting(false);
          setCheckoutStage("");
          inFlight.current = false;
        } else if (!response.ok) {
          setError(result.error || "Payment verification is pending. Please refresh shortly.");
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [searchParams, router, totalPrice, walletBalance]);

  const moveTo = (step: number) => {
    if (step === 2 && !platform) return;
    if (step === 3 && !selectedService) return;
    if (step === 4 && !formIsValid) return;
    setError("");
    setCheckoutStep(step);
    const target = step === 1 ? platformRef : step === 2 ? serviceRef : step === 3 ? detailsRef : summaryRef;
    scrollTo(target);
  };

  const primaryButton = (label: string, onClick: () => void, disabled = false) => (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-16px_rgba(255,142,0,.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#252525] disabled:bg-none disabled:text-[#777] disabled:shadow-none">
      {label}<ArrowRight className="h-4 w-4" />
    </button>
  );

  return (
    <main className="dashboard-premium-page relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[#050505] px-4 pb-10 pt-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" /><div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" /></div>
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">New order</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Build your campaign</h1></div>
          <p className="hidden text-right text-xs leading-5 text-[#9CA3AF] sm:block">Transparent pricing<br />Secure wallet checkout</p>
        </header>
        <nav aria-label="Order progress" className="relative mb-5 grid grid-cols-4 gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#101010]/95 p-1.5 backdrop-blur sm:mb-6 sm:gap-2 sm:p-2">
          <span aria-hidden="true" className="absolute left-[12%] right-[12%] top-[1.65rem] h-px bg-white/10" />
          {[[1, "Platform"], [2, "Service"], [3, "Details"], [4, "Review & Pay"]].map(([number, title]) => <button key={number} type="button" onClick={() => moveTo(Number(number))} disabled={Number(number) > currentStep} className="min-w-0 disabled:cursor-default"><ProgressItem number={Number(number)} title={String(title)} state={progressState(Number(number), currentStep)} /></button>)}
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="rounded-3xl border border-white/10 bg-[#111111] p-4 shadow-[0_28px_70px_-45px_rgba(0,0,0,.9)] sm:p-6">
            {currentStep === 1 ? <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 1 of 4</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Choose a platform</h2><p className="mt-2 text-sm text-[#9CA3AF]">Select where you want your campaign to run.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {platformOrder.map((platformId) => { const meta = platformMeta[platformId]; const active = platform === platformId; const serviceCount = customerOrderServices.filter((service) => service.platform === platformId).length; return <motion.button key={platformId} type="button" whileHover={{ y: -3 }} whileTap={{ scale: .98 }} onClick={() => choosePlatform(platformId)} aria-pressed={active} className={`relative min-h-28 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${active ? "border-orange-400 bg-orange-500/10 ring-2 ring-orange-500/15 shadow-[0_16px_32px_-20px_rgba(255,122,0,.85)]" : "border-white/10 bg-[#0B0B0F] hover:border-white/25 hover:bg-white/[.035]"}`}><IconBadge label={meta.label} className={`bg-gradient-to-br ${platformAccent(platformId)}`}><PlatformIcon platform={meta.label} className="h-6 w-6" /></IconBadge><span className="mt-4 block text-sm font-black">{meta.label}</span><span className="mt-1 block text-[10px] font-semibold text-[#9CA3AF]">{serviceCount} available service{serviceCount === 1 ? "" : "s"}</span>{active && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />}</motion.button>; })}
              </div>
              <p className="mt-5 text-center text-xs text-[#9CA3AF]" aria-live="polite">Select a platform to continue automatically.</p>
            </div> : null}
            {currentStep === 2 ? <div>
              <button type="button" onClick={() => moveTo(1)} className="text-xs font-bold text-[#B5B5B5] hover:text-white">← Back to platforms</button><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 2 of 4 · {platform && platformMeta[platform].label}</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Choose a service</h2>
              {favouriteServices.length ? <section className="mt-4 rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-3" aria-label="Your favourite services"><p className="text-xs font-black text-white">Your favourite services</p><p className="mt-1 text-[11px] text-[#9CA3AF]">Start a new editable order with a saved service.</p><div className="mt-3 flex flex-wrap gap-2">{favouriteServices.map((service) => <button key={service.code} type="button" onClick={() => chooseService(service)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/[.08] px-3 text-xs font-bold text-orange-100"><Heart className="h-3.5 w-3.5 fill-current" />{serviceExperience[service.code]?.name || service.name}</button>)}</div></section> : null}
              {(favouriteNotice || favouriteError) ? <p role="status" className={`mt-3 text-xs ${favouriteError ? "text-red-300" : "text-emerald-300"}`}>{favouriteError || favouriteNotice}</p> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const active = selectedService?.code === service.code;
                  const serviceId = serviceIds[service.code];
                  const isFavourite = Boolean(serviceId && favouriteServiceIds.has(serviceId));
                  const favouriteUpdating = Boolean(serviceId && favouriteUpdatingServiceIds.has(serviceId));
                  const health = healthByService[service.code];
                  const unavailable = Boolean(health && (!health.acceptsNewOrders || health.status === "paused"));
                  const experience = serviceExperience[service.code];
                  const ServiceGlyph = service.code.includes("likes") ? Heart : service.code.includes("views") ? Eye : service.code.includes("shares") ? ThumbsUp : Users;
                  return <article key={service.code} className={`rounded-2xl border p-4 transition ${active ? "border-orange-400/80 bg-orange-500/10 shadow-[0_18px_34px_-24px_rgba(255,122,0,.85)]" : "border-white/10 bg-[#0B0B0F] hover:border-white/25"} ${unavailable ? "opacity-55" : ""}`}>
                    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><IconBadge size="sm" label={platformMeta[service.platform].label} className={`bg-gradient-to-br ${platformAccent(service.platform)}`}><PlatformIcon platform={platformMeta[service.platform].label} /></IconBadge><div className="min-w-0"><h3 className="truncate text-sm font-black text-white">{experience.name}</h3><p className="mt-1 text-xs text-[#9CA3AF]">{service.description}</p></div></div><div className="flex shrink-0 items-center gap-2"><button type="button" aria-label={`${isFavourite ? "Remove" : "Save"} ${experience.name} ${isFavourite ? "from" : "to"} favourites`} aria-pressed={isFavourite} disabled={!serviceId || favouriteUpdating} onClick={(event) => { event.stopPropagation(); void toggleFavourite(service); }} onPointerDown={(event) => event.stopPropagation()} className={`grid h-10 w-10 place-items-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-45 ${isFavourite ? "border-orange-300 bg-orange-500/20 text-orange-200" : "border-white/15 bg-white/[.04] text-[#B5B5B5] hover:border-orange-400/60 hover:text-orange-200"}`}><Heart className={`h-5 w-5 ${isFavourite ? "fill-current" : ""}`} /></button>{active ? <Check className="h-5 w-5 text-emerald-400" /> : <ServiceGlyph className="h-5 w-5 text-orange-300" />}</div></div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white/[.035] p-2.5"><span className="text-[#777]">Live rate</span><strong className="mt-1 block text-white">{formatCurrency(service.pricePer1000, currency)} / 1K</strong></div><div className="rounded-xl bg-white/[.035] p-2.5"><span className="text-[#777]">Delivery</span><strong className="mt-1 block text-white">{service.deliveryTime}</strong></div></div>
                    <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">{service.refillPolicy}</span><ServiceHealthBadge health={health} /></div>
                    <details className="mt-3 rounded-xl border border-white/10 bg-white/[.025]" aria-label={`Service details for ${experience.name}`}><summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-[#D6D9DF]">Service details <span className="float-right text-orange-300">+</span></summary><div className="border-t border-white/10 px-3 py-3 text-xs leading-5 text-[#9CA3AF]"><p>Min {service.minQuantity.toLocaleString("en-IN")} · Max {service.maxQuantity.toLocaleString("en-IN")}</p><p className="mt-1">{service.importantInstruction}</p></div></details>
                    <button type="button" disabled={unavailable} onClick={() => chooseService(service)} className={`mt-4 min-h-11 w-full rounded-xl text-xs font-black transition disabled:cursor-not-allowed ${active ? "bg-emerald-500/15 text-emerald-200" : "border border-white/15 bg-white/5 text-white hover:border-orange-400/70"}`}>{unavailable ? "Unavailable" : active ? "✓ Selected" : "Select Service"}</button>
                  </article>;
                })}
              </div>
              <p className="mt-5 text-center text-xs text-[#9CA3AF]" aria-live="polite">Select an available service to continue automatically.</p>
            </div> : null}
            {currentStep === 3 && selectedService && linkRule ? <div>
              <button type="button" onClick={() => moveTo(2)} className="text-xs font-bold text-[#B5B5B5] hover:text-white">← Back to services</button><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 3 of 4</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Campaign details</h2><p className="mt-2 text-sm text-[#9CA3AF]">Only two things needed to get started.</p>
              <div className="mt-6 grid gap-5"><label className="text-xs font-black">Public Link / Username<input value={targetLink} onChange={(e) => { setTargetLink(e.target.value); setError(""); }} placeholder={linkRule.placeholder} className={`mt-2 min-h-14 w-full rounded-xl border bg-[#090909] px-4 text-base font-medium outline-none transition placeholder:text-[#555] focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 ${linkError ? "border-red-400" : "border-white/15"}`} /><span className={`mt-2 block font-medium ${linkError ? "text-red-300" : "text-[#999]"}`}>{linkError || linkRule.helper}</span></label><label className="text-xs font-black">Quantity<input value={quantityInput} onChange={(e) => { setQuantityInput(cleanQuantity(e.target.value)); setError(""); }} inputMode="numeric" placeholder="Enter quantity" className={`mt-2 min-h-14 w-full rounded-xl border bg-[#090909] px-4 text-base font-medium outline-none transition placeholder:text-[#555] focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 ${quantityError ? "border-red-400" : "border-white/15"}`} /><span className={`mt-2 block font-medium ${quantityError ? "text-red-300" : "text-[#999]"}`}>{quantityError || `Min ${selectedService.minQuantity.toLocaleString("en-IN")} · Max ${selectedService.maxQuantity.toLocaleString("en-IN")}`}</span></label></div>
              {quickQuantities.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{quickQuantities.map((value) => <button key={value} type="button" onClick={() => setQuantityInput(String(value))} className={`min-h-11 rounded-xl border px-4 text-xs font-black ${quantity === value ? "border-orange-400 bg-orange-500/15 text-orange-200" : "border-white/10 bg-white/5 text-[#bbb]"}`}>{compactQuantity(value)}</button>)}</div>}
              <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-orange-400/25 bg-[linear-gradient(135deg,#241505,#0b0b0b)] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-orange-300">Live order preview</p><p className="mt-2 text-2xl font-black">{formIsValid ? formatCurrency(totalPrice, currency) : "—"}</p><p className="mt-1 text-xs text-[#aaa]">{serviceExperience[selectedService.code].name} · {formIsValid ? quantity.toLocaleString("en-IN") : "Enter valid details"}</p></div><div className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/5 p-4 text-sm font-bold text-emerald-100"><LockKeyhole className="h-5 w-5 shrink-0 text-emerald-300" />No password required. Public link only.</div></div>
              {error && <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}<div className="mt-6">{primaryButton("Review Order", () => moveTo(4), !formIsValid)}</div>
            </div> : null}
            {currentStep === 4 && selectedService ? <div>
              <button type="button" onClick={() => moveTo(3)} className="text-xs font-bold text-[#B5B5B5] hover:text-white">← Back to details</button><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 4 of 4</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Review & pay</h2>
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B0B0F] p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><IconBadge size="sm" label={platformMeta[selectedService.platform].label} className={`bg-gradient-to-br ${platformAccent(selectedService.platform)}`}><PlatformIcon platform={platformMeta[selectedService.platform].label} /></IconBadge><div><h3 className="font-black">{serviceExperience[selectedService.code].name}</h3><p className="text-xs text-[#9CA3AF]">{platformMeta[selectedService.platform].label}</p></div></div><button type="button" onClick={() => moveTo(3)} className="text-xs font-bold text-orange-300">Edit details</button></div><dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">{[["Platform", platform && platformMeta[platform].label], ["Service", serviceExperience[selectedService.code].name], ["Public link", targetLink], ["Quantity", quantity.toLocaleString("en-IN")], ["Rate", `${formatCurrency(selectedService.pricePer1000, currency)} / 1K`], ["Delivery", selectedService.deliveryTime], ["Refill", selectedService.refillPolicy]].map(([label, value]) => <div key={String(label)} className="min-w-0"><dt className="text-[10px] font-black uppercase tracking-wider text-[#777]">{label}</dt><dd className="mt-1 break-words font-bold text-white">{label === "Public link" ? <span className="flex items-start gap-2"><span className="min-w-0 break-all">{value}</span><button type="button" aria-label="Copy public link" onClick={() => navigator.clipboard?.writeText(targetLink)} className="shrink-0 text-orange-300"><Copy className="h-4 w-4" /></button></span> : value}</dd></div>)}</dl></div>
              <div className="mt-4 rounded-2xl border border-orange-400/25 bg-[linear-gradient(135deg,#201406,#0b0b0b)] p-5"><p className="text-[10px] font-black uppercase tracking-wider text-orange-300">Payment summary</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-[#aaa]">Order total</span><strong>{formatCurrency(totalPrice, currency)}</strong></div><div className="flex justify-between"><span className="text-[#aaa]">Wallet balance</span><strong>{walletLoading ? "Checking…" : formatCurrency(walletBalance ?? 0, currency)}</strong></div><div className="flex justify-between border-t border-white/10 pt-3"><span className="text-[#aaa]">Balance after order</span><strong>{remainingBalance === null ? "—" : formatCurrency(remainingBalance, currency)}</strong></div></div>{!walletLoading && !hasEnoughWallet && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-100"><strong>Insufficient wallet balance.</strong><br />You need {formatCurrency(amountRequired, currency)} more to place this order.</div>}{walletError && <p className="mt-3 text-xs text-amber-200">{walletError}</p>}{error && <p className="mt-3 rounded-xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}{success && <p className="mt-3 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-100">Order placed successfully · #{success.id}. Opening Order History…</p>}<button type="button" onClick={() => { if (hasEnoughWallet) void placeOrder(); else void payAndPlaceOrder(); }} disabled={walletLoading || submitting || Boolean(success)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black shadow-[0_18px_36px_-16px_rgba(255,142,0,.55)] disabled:cursor-not-allowed disabled:bg-[#252525] disabled:bg-none disabled:text-[#777]">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />{checkoutStage || "Preparing secure payment..."}</> : hasEnoughWallet ? <><ShieldCheck className="h-4 w-4" />Confirm & Place Order</> : <><Wallet className="h-4 w-4" />Pay {formatCurrency(amountRequired, currency)} & Continue</>}</button></div>
            </div> : null}
          </section>
          <aside className="hidden h-fit rounded-3xl border border-white/10 bg-[#101010] p-5 lg:sticky lg:top-24 lg:block"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#888]">Your order</p>{platform ? <><div className="mt-4 flex items-center gap-3"><IconBadge label={platformMeta[platform].label}><PlatformIcon platform={platformMeta[platform].label} className="h-5 w-5" /></IconBadge><strong className="text-sm">{platformMeta[platform].label}</strong></div><div className="my-5 border-t border-white/10" /><p className="text-sm font-bold">{selectedService ? serviceExperience[selectedService.code].name : "Choose a service"}</p><p className="mt-2 text-xs text-[#999]">{quantity ? `${quantity.toLocaleString("en-IN")} units` : "Quantity not set"}</p><div className="mt-5 rounded-xl bg-orange-500/10 p-4"><span className="text-xs text-orange-200">Current total</span><strong className="mt-1 block text-2xl">{totalPrice ? formatCurrency(totalPrice, currency) : "—"}</strong></div><p className="mt-4 text-xs text-[#999]">Wallet: {walletLoading ? "Checking…" : formatCurrency(walletBalance ?? 0, currency)}</p></> : <p className="mt-4 text-sm leading-6 text-[#999]">Choose a platform to begin your order.</p>}</aside>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#aaa]"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure checkout</span><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-orange-300" /> Track from dashboard</span></div>
      </div>
    </main>
  );

  return (
    <main className="dashboard-premium-page dashboard-order-page relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[#050505] px-4 pb-36 pt-5 text-white sm:px-6 sm:pb-24 sm:pt-7 lg:px-8">
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
          {resumeNotice ? <p role="status" className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-xs font-semibold text-amber-100">{resumeNotice}</p> : null}
        </section>

        <section aria-label="Order progress" className="sticky top-[4.75rem] z-20 mt-3 rounded-xl border border-orange-400/20 bg-[#0B0B0F]/95 p-1.5 shadow-[0_16px_36px_-24px_rgba(0,0,0,.8)] backdrop-blur-xl sm:top-20 sm:mt-4 sm:rounded-2xl sm:p-3">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
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
                  className={`relative min-h-24 min-w-0 rounded-2xl border p-3 text-left transition sm:p-4 ${platformId === platformOrder[platformOrder.length - 1] ? "col-span-2 w-[calc(50%_-_0.375rem)] justify-self-center sm:col-span-1 sm:w-auto" : ""} ${active ? "border-orange-400/80 bg-orange-500/15 ring-2 ring-orange-500/15" : "border-white/10 bg-[#0B0B0F] hover:border-orange-400/45"}`}
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
                const health = healthByService[service.code];
                const unavailable = Boolean(health && (!health.acceptsNewOrders || health.status === "paused"));
                return (
                  <motion.article key={service.code} whileHover={{ y: -3 }} className={`flex min-w-0 flex-col rounded-2xl border p-4 transition sm:p-5 ${active ? "border-orange-400/80 bg-orange-500/10 ring-2 ring-orange-500/10" : "border-white/10 bg-[#0B0B0F]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <IconBadge label={platformMeta[service.platform].label}><PlatformIcon platform={platformMeta[service.platform].label} className="h-6 w-6" /></IconBadge>
                      {active ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700"><Check className="h-3 w-3" /> Selected</span> : null}
                    </div>
                    <h3 className="mt-3 text-base font-black text-white sm:text-lg">{experience.name}</h3>
                    <div className="mt-2"><ServiceHealthBadge health={health} showMessage /></div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/10 bg-[#151515] p-2.5"><span className="text-[#9CA3AF]">From</span><strong className="mt-1 block text-white">{formatCurrency(service.pricePer1000, currency)} / 1K</strong></div><div className="rounded-xl border border-white/10 bg-[#151515] p-2.5"><span className="text-[#9CA3AF]">Delivery</span><strong className="mt-1 block text-white">{service.deliveryTime}</strong></div></div>
                    <p className="mt-2 text-xs font-semibold text-emerald-300">{service.refillPolicy}</p>
                    <details className="mt-3 rounded-xl border border-white/10 bg-[#151515]"><summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-orange-300"><Info className="mr-2 inline h-4 w-4" />Details &amp; how it works</summary><div className="border-t border-white/10 px-3 py-3 text-xs leading-6 text-[#D1D5DB]"><p>{service.description}</p><p className="mt-2">{growthMethod(service)}</p></div></details>
                    <button type="button" disabled={unavailable} onClick={() => chooseService(service)} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(255,196,0,.65)] disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-[#9CA3AF] disabled:shadow-none">
                      {unavailable ? "Choose another service" : active ? "Service Selected" : "Choose Service"} <ArrowRight className="h-4 w-4" />
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
              {(["high_demand", "slower_delivery"] as const).includes(healthByService[selectedService.code]?.status as "high_demand" | "slower_delivery") ? <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4"><ServiceHealthBadge health={healthByService[selectedService.code]} showMessage /><p className="mt-2 text-xs leading-5 text-amber-100">Delivery may take longer than the standard estimate. The configured estimate remains {selectedService.deliveryTime}.</p></div> : null}
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <label className="block text-xs font-black text-white">
                  <span className="inline-flex items-center gap-2"><LinkIcon className="h-4 w-4 text-orange-400" />Public Link / Username</span>
                  {savedProfiles.some((item) => item.platform === platform) ? <select aria-label="Choose a saved profile" defaultValue="" onChange={(event) => { const saved=savedProfiles.find(item=>item.id===event.target.value);if(saved)setTargetLink(saved.public_url); }} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#0B0B0F] px-3 text-sm text-white"><option value="">Use a new public link</option>{savedProfiles.filter(item=>item.platform===platform).map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select> : null}
                  <input
                    value={targetLink}
                    onChange={(event) => { setTargetLink(event.target.value); setError(""); }}
                    placeholder={linkRule.placeholder}
                    className="mt-2 min-h-14 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3.5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-[#6B7280] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  />
                  <span className={`mt-2 block text-[11px] leading-5 ${linkError ? "font-semibold text-red-300" : "text-[#D1D5DB]"}`}>
                    {linkError || linkRule.helper}
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
                    {quantityError || `Min ${selectedService.minQuantity.toLocaleString("en-IN")} · Max ${selectedService.maxQuantity.toLocaleString("en-IN")} · Whole numbers`}
                  </span>
                  {quickQuantities.length ? <span className="mt-3 flex flex-wrap gap-2">{quickQuantities.map((value) => <button key={value} type="button" onClick={() => setQuantityInput(String(value))} className={`min-h-10 rounded-full border px-3 text-xs font-black ${quantity === value ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/15 bg-white/5 text-[#D1D5DB]"}`}>{value / 1000}K</button>)}</span> : null}
                </label>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl border bg-[linear-gradient(135deg,#19120B,#0B0B0F)] p-4 shadow-[0_18px_45px_-28px_rgba(255,122,0,.75)] ${quantityError ? "border-red-400/40" : "border-orange-400/35"}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-300">Price preview</p>
                  <p className={`mt-2 text-xl font-black sm:text-2xl ${quantityError ? "text-red-200" : "text-white"}`}>
                    {!formIsValid ? "Enter a valid public link and quantity to calculate your final total." : formatCurrency(totalPrice, currency)}
                  </p>
                  {formIsValid ? <p className="mt-2 text-xs text-[#D1D5DB]">{formatCurrency(selectedService.pricePer1000, currency)} / 1K × {quantity.toLocaleString("en-IN")}</p> : null}
                </div>
                <div className="safety-note flex items-center gap-3 rounded-2xl border border-emerald-400/45 bg-[#0B1F18] p-4 shadow-[0_16px_38px_rgba(0,0,0,0.22)]"><LockKeyhole className="h-5 w-5 shrink-0 text-emerald-300" /><p className="text-sm font-bold leading-6 text-white">No password required. Only your public link is needed.</p></div>
              </div>
              {formIsValid ? <button type="button" onClick={() => scrollTo(summaryRef)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 sm:w-auto">Review order summary <ArrowRight className="h-4 w-4" /></button> : null}
            </section>

            <section ref={summaryRef} className="scroll-mt-40 mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_30px_65px_-40px_rgba(255,122,0,.6)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-400">Step 4</p><h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Review order summary</h2></div>
                {formIsValid ? <button type="button" onClick={() => scrollTo(detailsRef)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-3.5 py-2.5 text-xs font-bold text-orange-300">Edit details</button> : null}
              </div>
              {!formIsValid ? <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#0B0B0F] p-4 text-sm font-semibold text-[#D1D5DB]"><LockKeyhole className="h-5 w-5 shrink-0 text-[#9CA3AF]" />Enter your public link and quantity to review your order.</div> : <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[["Platform", platform ? platformMeta[platform].label : "—"],["Service", serviceExperience[selectedService.code].name],["Public link", targetLink.trim()],["Quantity", quantity.toLocaleString("en-IN")],["Rate", `${formatCurrency(selectedService.pricePer1000, currency)} / 1K`],["Delivery", selectedService.deliveryTime],["Refill / support", selectedService.refillPolicy]].map(([label, value]) => <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-[#151515] p-4"><dt className="text-[10px] font-black uppercase tracking-wider text-[#9CA3AF]">{label}</dt><dd className="mt-2 text-sm font-bold text-white [overflow-wrap:anywhere]">{value}</dd></div>)}
                </dl>
                <aside className="dashboard-order-summary rounded-3xl bg-[#0B0B0F] p-5 text-white shadow-xl lg:sticky lg:top-24 lg:self-start">
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold text-orange-100"><Wallet className="h-4 w-4" />Wallet balance</span>{walletLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}</div>
                  <p className="mt-2 text-2xl font-black">{walletBalance === null ? "Checking..." : formatCurrency(walletBalance, currency)}</p>
                  <div className="my-5 border-t border-white/15" />
                  {remainingBalance !== null ? <div className="mb-3 flex items-center justify-between gap-3 text-xs"><span className="text-[#D1D5DB]">Wallet after order</span><strong>{formatCurrency(remainingBalance, currency)}</strong></div> : null}
                  <div className="flex items-end justify-between gap-3"><span className="text-xs text-orange-100">Order total</span><strong className="text-2xl">{formIsValid ? formatCurrency(totalPrice, currency) : "—"}</strong></div>
                  {formIsValid && walletBalance !== null && !hasEnoughWallet ? <div className="mt-4 rounded-xl bg-amber-400/15 p-3 text-xs leading-6 text-amber-100">Pay now: <strong>{formatCurrency(amountRequired, currency)}</strong></div> : null}
                  {walletError ? <p className="mt-4 text-xs leading-5 text-amber-200">{walletError}</p> : null}
                  {error ? <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-xs font-semibold text-red-100">{error}</p> : null}
                  {success ? <p className="mt-4 rounded-xl bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-100">Order placed successfully. Opening Order History…</p> : null}
                  {hasEnoughWallet ? (
                    <button type="button" onClick={() => void placeOrder()} disabled={!formIsValid || walletLoading || submitting || Boolean(success)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Placing order…</> : <><ShieldCheck className="h-4 w-4" /> Confirm &amp; Place Order</>}
                    </button>
                  ) : formIsValid && !walletLoading ? (
                    <button type="button" onClick={() => void payAndPlaceOrder()} disabled={submitting || Boolean(success)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> {checkoutStage || "Preparing secure payment..."}</> : <><Wallet className="h-4 w-4" /> Pay {formatCurrency(amountRequired, currency)} &amp; Continue</>}
                    </button>
                  ) : (
                    <button type="button" disabled className="mt-5 min-h-12 w-full rounded-xl bg-white/15 px-5 py-3 text-sm font-black text-white/60">Complete details to continue</button>
                  )}
                  <p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-orange-100"><RefreshCw className="h-3.5 w-3.5" /> Wallet charged only after confirmation</p>
                </aside>
              </div>}
            </section>
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[#D1D5DB]">
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure wallet checkout</span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-2"><Clock3 className="h-4 w-4 text-orange-300" /> Track from dashboard</span>
        </div>
        <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
          <div className="mx-auto max-w-md rounded-2xl border border-orange-400/30 bg-[#0B0B0F]/95 p-2 shadow-2xl backdrop-blur-xl">
            {currentStep === 1 ? <button type="button" disabled={!platform} onClick={() => scrollTo(serviceRef)} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black disabled:opacity-45">Continue to Services</button> : currentStep === 2 ? <button type="button" disabled={!selectedService} onClick={() => scrollTo(detailsRef)} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black disabled:opacity-45">Continue to Details</button> : currentStep === 3 ? <button type="button" disabled={!formIsValid} onClick={() => scrollTo(summaryRef)} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black disabled:opacity-45">Review Order</button> : hasEnoughWallet ? <button type="button" disabled={submitting || Boolean(success)} onClick={() => void placeOrder()} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black disabled:opacity-45">Confirm &amp; Place Order</button> : <button type="button" disabled={walletLoading || submitting || Boolean(success)} onClick={() => void payAndPlaceOrder()} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black disabled:opacity-45">Pay {formatCurrency(amountRequired, currency)} &amp; Continue</button>}
          </div>
        </div>
      </div>
    </main>
  );
}
