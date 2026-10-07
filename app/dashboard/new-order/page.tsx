"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Clock3,
  Eye,
  Gift,
  Hash,
  Heart,
  Info,
  Link as LinkIcon,
  LoaderCircle,
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
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
} from "@/lib/order-service-experience";
import { validateOrderLink } from "@/lib/order-link-validator";
import { validateQuantity } from "@/lib/service-pricing";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import ServiceHealthBadge from "@/components/ServiceHealthBadge";
import { useServiceHealth } from "@/lib/use-service-health";
import { track } from "@/lib/analytics/events";
import { addRecentService, CONTINUE_ORDER_KEY, parseRecentServices, RECENT_SERVICES_KEY, serializeContinueOrder } from "@/lib/cro/personalization";
import { buildQuantityMerchandising, quantityForMinimumSpend } from "@/lib/cro/quantity-merchandising";
import { findSafeAlternative } from "@/lib/service-alternatives";

type PlatformId = SmmPlatformId;
type ApiOrderData = { id: string; charge: number; balance: number; duplicate?: boolean };
type SavedProfile = { id: string; label: string; platform: string; public_url: string; last_used_at: string | null };
type ServiceRecord = { id: number; code: string | null };
type FirstOrderOffer = { reward: number; minimum: number };
const platformOrder: PlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const starterServiceRank = new Map<string, number>([
  ["instagram-followers", 1],
  ["youtube-subscribers", 2],
  ["instagram-views", 3],
  ["instagram-likes", 4],
  ["facebook-followers", 5],
]);
const starterServiceLabel = (code: string) => code === "instagram-followers" ? "Quick start" : code === "youtube-subscribers" ? "Starter option" : null;
const protectedLiveServiceDefinitions = [
  { code: "youtube-comments", name: "YouTube Comments", platform: "youtube", description: "Build visible conversation and engagement around your YouTube videos with comment activity." },
  { code: "youtube-watch-hours", name: "YouTube Watch Hours", platform: "youtube", description: "Build extended viewing activity around your public YouTube content with transparent watch-hour packages and dashboard tracking." },
  { code: "facebook-group-members", name: "Facebook Group Members", platform: "facebook", description: "Grow your Facebook community with group member packages, transparent pricing, and dashboard order tracking." },
] as const satisfies ReadonlyArray<Pick<SmmService, "code" | "name" | "platform" | "description">>;
const clientLiveServiceDefinitions = [
  { code: "instagram-followers", name: "Instagram Real Followers", platform: "instagram", description: "Compare Instagram follower campaigns with clear pricing, delivery estimates and eligible refill support.", fallbackInstruction: "Use a public Instagram profile URL." },
  { code: "instagram-saves", name: "Instagram Saves", platform: "instagram", description: "Strengthen post and Reel engagement signals with Instagram save activity.", fallbackInstruction: "Use a public Instagram post or reel URL." },
  { code: "instagram-shares", name: "Instagram Shares", platform: "instagram", description: "Expand post and Reel engagement with Instagram share activity.", fallbackInstruction: "Use a public Instagram post or reel URL." },
  { code: "linkedin-followers", name: "LinkedIn Profile Followers", platform: "linkedin", description: "Improve professional authority and profile visibility.", fallbackInstruction: "Use a public LinkedIn profile or company URL." },
  { code: "linkedin-usa-connections", name: "LinkedIn USA Connections", platform: "linkedin", description: "Increase connection activity for an eligible public LinkedIn personal profile with the USA-targeted service option.", fallbackInstruction: "Enter the correct public LinkedIn personal profile URL and keep the profile accessible while the order is processing." },
  { code: "linkedin-usa-post-likes", name: "LinkedIn USA Post Likes", platform: "linkedin", description: "Increase visible like activity on an eligible public LinkedIn post with the USA-targeted service option.", fallbackInstruction: "Enter the exact public LinkedIn post URL and keep the post accessible while the order is processing." },
  { code: "linkedin-usa-endorsements", name: "LinkedIn USA Endorsements", platform: "linkedin", description: "Increase endorsement activity for a specified skill on an eligible public LinkedIn personal profile with the USA-targeted service option.", fallbackInstruction: "Enter the correct public LinkedIn personal profile URL and specify the exact skill that should receive endorsements." },
  { code: "linkedin-usa-followers", name: "LinkedIn USA Followers", platform: "linkedin", description: "Increase follower activity on an eligible public LinkedIn personal profile with the USA-targeted service option.", fallbackInstruction: "Enter the correct public LinkedIn personal profile URL and keep the profile accessible while the order is processing." },
  { code: "linkedin-usa-group-members", name: "LinkedIn USA Group Members", platform: "linkedin", description: "Increase member activity for an eligible LinkedIn Group with the USA-targeted service option.", fallbackInstruction: "Enter the correct LinkedIn Group URL and keep the group accessible as required while the order is processing." },
  { code: "linkedin-usa-custom-comments", name: "LinkedIn USA Custom Comments", platform: "linkedin", description: "Add customer-provided comment activity to an eligible public LinkedIn post with the USA-targeted service option.", fallbackInstruction: "Enter the exact public LinkedIn post URL and provide exactly one custom comment per line. The number of valid comments must match the order quantity." },
  { code: "linkedin-usa-reposts", name: "LinkedIn USA Reposts", platform: "linkedin", description: "Increase repost activity on an eligible public LinkedIn post with the USA-targeted service option.", fallbackInstruction: "Enter the exact public LinkedIn post URL and keep the post accessible while the order is processing." },
  { code: "x-followers", name: "X Followers", platform: "x", description: "Increase profile authority and long-term social visibility.", fallbackInstruction: "Use a public X or Twitter profile URL." },
  { code: "twitter-likes", name: "Twitter / X Likes", platform: "x", description: "Increase visible engagement on a public Twitter/X post with like activity.", fallbackInstruction: "Submit the correct public Twitter/X post URL and keep the post public while the order is processing." },
  { code: "twitter-views", name: "Twitter / X Views", platform: "x", description: "Increase visible reach and activity on an eligible public Twitter/X post.", fallbackInstruction: "Submit the correct public Twitter/X post URL and keep the post public while the order is processing." },
  { code: "twitter-retweets", name: "Twitter / X Retweets", platform: "x", description: "Increase distribution and visible sharing activity on a public Twitter/X post.", fallbackInstruction: "Submit the correct public Twitter/X post URL and keep the post public while the order is processing." },
  { code: "telegram-post-views", name: "Telegram Post Views", platform: "telegram", description: "Increase visible viewing activity on an eligible public Telegram channel post.", fallbackInstruction: "Submit the exact public Telegram post and keep it accessible while the order is processing." },
  { code: "telegram-post-reactions", name: "Telegram Post Reactions", platform: "telegram", description: "Increase visible engagement on an eligible public Telegram post with reaction activity.", fallbackInstruction: "Submit the exact public Telegram post that should receive reactions and keep it accessible while processing." },
  { code: "telegram-poll-votes", name: "Telegram Poll Votes", platform: "telegram", description: "Increase voting activity on an eligible public Telegram poll.", fallbackInstruction: "Submit the exact public Telegram post containing the poll and keep it accessible while processing." },
  { code: "tiktok-followers", name: "TikTok Followers", platform: "tiktok", description: "Increase visible follower activity on an eligible public TikTok profile.", fallbackInstruction: "Enter the correct public TikTok profile URL and keep the profile publicly accessible while the order is processing." },
  { code: "tiktok-likes", name: "TikTok Likes", platform: "tiktok", description: "Increase visible engagement on an eligible public TikTok video with like activity.", fallbackInstruction: "Enter the correct public TikTok video URL and keep the video publicly accessible while the order is processing." },
  { code: "tiktok-views", name: "TikTok Views", platform: "tiktok", description: "Increase visible viewing activity on an eligible public TikTok video.", fallbackInstruction: "Enter the correct public TikTok video URL and keep the video publicly accessible while the order is processing." },
  { code: "tiktok-custom-comments", name: "TikTok Custom Comments", platform: "tiktok", description: "Add customer-provided comment activity to an eligible public TikTok video.", fallbackInstruction: "Enter the correct public TikTok video URL and provide exactly one custom comment per line. The number of comments must match the order quantity." },
  { code: "tiktok-story-views", name: "TikTok Story Views", platform: "tiktok", description: "Increase viewing activity on an eligible public TikTok story.", fallbackInstruction: "Enter the correct eligible TikTok target URL and keep the target accessible while the order is processing." },
  { code: "tiktok-saves", name: "TikTok Saves", platform: "tiktok", description: "Increase save activity on an eligible public TikTok video.", fallbackInstruction: "Enter the correct public TikTok video URL and keep the video publicly accessible while the order is processing." },
  { code: "twitter-crypto-followers", name: "Twitter / X Crypto-Based Followers", platform: "x", description: "Grow your crypto-focused Twitter/X profile with specialized crypto-based followers.", fallbackInstruction: "Twitter/X profile must remain public during delivery." },
  { code: "twitter-crypto-likes", name: "Twitter / X Crypto-Based Likes", platform: "x", description: "Increase engagement on crypto-related Twitter/X posts with specialized crypto-based likes.", fallbackInstruction: "Post must remain public during delivery." },
  { code: "twitter-crypto-retweets", name: "Twitter / X Crypto-Based Retweets", platform: "x", description: "Expand the reach of crypto-related Twitter/X posts with specialized crypto-based retweets.", fallbackInstruction: "Post must remain public during delivery." },
  { code: "twitter-crypto-custom-comments", name: "Twitter / X Crypto-Based Custom Comments", platform: "x", description: "Add custom crypto-focused comments to eligible Twitter/X posts.", fallbackInstruction: "Enter one comment per line and keep the post public during delivery." },
] as const satisfies ReadonlyArray<Pick<SmmService, "code" | "name" | "platform" | "description"> & { fallbackInstruction: string }>;
function cleanQuantity(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function compactQuantity(value: number) {
  if (value < 1000) return value.toLocaleString("en-IN");
  const thousands = value / 1000;
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1).replace(/\.0$/, "")}K`;
}

function serviceTotal(pricePer1000: number, quantity: number) {
  return Math.round((quantity * pricePer1000 * 100) / 1000) / 100;
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
      className={`sr-motion-pop flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-1.5 transition sm:flex-row sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5 ${
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
  const resumeRequested = searchParams.get("resume") === "1";
  const repeatRequested = searchParams.get("repeat") === "1";
  const repeatMode = searchParams.get("repeatMode") === "new_target" ? "new_target" : "same_target";
  const requestedClientId = searchParams.get("client")?.trim() || null;
  const requestedCampaignId = searchParams.get("campaign")?.trim() || null;
  const hasAgencyContext = Boolean(requestedClientId || requestedCampaignId);
  const requestedPlatform = platformFromQuery(searchParams.get("platform"));
  const requestedService = serviceFromQuery(searchParams.get("service"), requestedPlatform);
  const resumedService = resumeRequested
    ? mergeCustomerOrderServices().find((service) => service.code === searchParams.get("service")) ?? null
    : null;
  const initialService = resumedService ?? requestedService;

  const [platform, setPlatform] = useState<PlatformId | null>(initialService?.platform ?? requestedPlatform ?? null);
  const healthByService = useServiceHealth(Boolean(platform));
  const [selectedService, setSelectedService] = useState<SmmService | null>(initialService);
  const prefillRequested = resumeRequested || searchParams.get("prefill") === "1";
  const [targetLink, setTargetLink] = useState(prefillRequested ? searchParams.get("link") || "" : "");
  const [customComments, setCustomComments] = useState("");
  const [pollAnswerNumber, setPollAnswerNumber] = useState("");
  const [endorsementSkillName, setEndorsementSkillName] = useState(prefillRequested ? searchParams.get("endorsementSkillName") || "" : "");
  // Every live-only service enters the same canonical merge path. This keeps
  // identity and de-duplication consistent as additional services are added.
  const [liveServices, setLiveServices] = useState<SmmService[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [serviceIds, setServiceIds] = useState<Record<string, number>>({});
  const [favouriteServiceIds, setFavouriteServiceIds] = useState<Set<number>>(new Set());
  const [favouriteUpdatingServiceIds, setFavouriteUpdatingServiceIds] = useState<Set<number>>(new Set());
  const [favouriteNotice, setFavouriteNotice] = useState("");
  const [favouriteError, setFavouriteError] = useState("");
  const [quantityInput, setQuantityInput] = useState(() => {
    if (!prefillRequested) return "";
    const requestedQuantity = cleanQuantity(searchParams.get("quantity") || "");
    if (!initialService) return requestedQuantity;
    const numericQuantity = Number(requestedQuantity);
    return Number.isFinite(numericQuantity) && numericQuantity >= initialService.minQuantity && numericQuantity <= initialService.maxQuantity
      ? requestedQuantity
      : String(initialService.minQuantity);
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [firstOrderOffer, setFirstOrderOffer] = useState<FirstOrderOffer | null>(null);
  const [firstOrder, setFirstOrder] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ApiOrderData | null>(null);
  const [checkoutStage, setCheckoutStage] = useState("");
  const [resumeNotice, setResumeNotice] = useState("");
  const [repeatConfirmed, setRepeatConfirmed] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(initialService ? 3 : requestedPlatform ? 2 : 1);
  const inFlight = useRef(false);
  const requestId = useRef("");
  const funnelSignals = useRef(new Set<string>());
  const recoveryCampaign = searchParams.get("source") === "email_recovery"
    ? (searchParams.get("campaign") || "unknown").slice(0, 80)
    : null;
  const recoveryCampaignRef = useRef<string | null>(recoveryCampaign);
  const advanceTimer = useRef<number | null>(null);
  const platformRef = useRef<HTMLElement>(null);
  const serviceRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const stepTwoDataLoaded = useRef(false);
  const savedProfilesLoaded = useRef(false);
  const walletRequested = useRef(false);
  const loadedLivePlatforms = useRef(new Set<PlatformId>());

  useEffect(() => {
    if (!queryString) {
      setPlatform(null);
      setSelectedService(null);
      setTargetLink("");
      setQuantityInput("");
      setPollAnswerNumber("");
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
      setEndorsementSkillName(searchParams.get("endorsementSkillName") || "");
      setCustomComments(searchParams.get("comments") || "");
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
      setPlatform(service.platform); setSelectedService(service); setQuantityInput(cleanQuantity(String(data.quantity))); setTargetLink(data.target || ""); setPollAnswerNumber(""); setCheckoutStep(3); setResumeNotice("Your saved configuration is restored. Please review the current price before continuing.");
      track("order_started", { step: "draft_resumed", service_code: service.code, platform: service.platform });
    }).catch(() => undefined);
    return () => { active = false; };
  }, [liveServices, searchParams]);

  useEffect(() => {
    if (repeatRequested) setRepeatConfirmed(false);
  }, [repeatRequested, selectedService?.code, targetLink, quantityInput]);

  // A checkout request ID represents one exact order configuration.
  // If the customer edits material order details, generate a fresh ID on the next submit
  // instead of reusing an intent identity that belongs to the previous configuration.
  useEffect(() => {
    if (!inFlight.current) requestId.current = "";
  }, [
    selectedService?.code,
    quantityInput,
    targetLink,
    customComments,
    pollAnswerNumber,
    endorsementSkillName,
    requestedClientId,
    requestedCampaignId,
  ]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  useEffect(() => {
    if (!recoveryCampaign) return;
    recoveryCampaignRef.current = recoveryCampaign;
    track("checkout_recovery_click", { campaign: recoveryCampaign });
  }, [recoveryCampaign]);

  const services = useMemo(
    () => {
      if (!platform) return [];
      return mergeCustomerOrderServices(liveServices)
        .filter((service) => service.platform === platform)
        .sort((a, b) => (starterServiceRank.get(a.code) ?? 999) - (starterServiceRank.get(b.code) ?? 999));
    },
    [liveServices, platform],
  );
  const selectedServiceUnavailable = Boolean(selectedService && (() => {
    const health = healthByService[selectedService.code];
    return health && (!health.acceptsNewOrders || health.status === "paused" || health.status === "maintenance");
  })());
  const safeAlternative = useMemo(
    () => selectedService ? findSafeAlternative(selectedService, services, healthByService.health) : null,
    [healthByService.health, selectedService, services],
  );
  const favouriteServices = useMemo(
    () => mergeCustomerOrderServices(liveServices).filter((service) => {
      const serviceId = serviceIds[service.code];
      return Boolean(serviceId && favouriteServiceIds.has(serviceId));
    }),
    [favouriteServiceIds, liveServices, serviceIds],
  );
  const quickStartServices = useMemo(
    () => {
      const preferred = new Set(["instagram-followers", "instagram-likes", "youtube-subscribers"]);
      return mergeCustomerOrderServices(liveServices).filter((service) => preferred.has(service.code)).slice(0, 3);
    },
    [liveServices],
  );
  const quantity = Number(quantityInput || 0);
  const quantityError = useMemo(() => {
    if (!selectedService || !quantityInput) return "";
    return validateQuantity(quantity, selectedService) || "";
  }, [quantity, quantityInput, selectedService]);
  const linkRule = selectedService ? linkRules[selectedService.code] : null;
  const linkValidation = selectedService ? validateOrderLink({ platform: selectedService.platform, serviceCode: selectedService.code, serviceName: selectedService.name, destinationUrl: targetLink }) : null;
  const linkError = linkValidation?.severity === "error" ? linkValidation.message : "";
  const requiresCustomComments = selectedService?.code === "twitter-crypto-custom-comments" || selectedService?.code === "tiktok-custom-comments" || selectedService?.code === "linkedin-usa-custom-comments";
  const requiresPollAnswerNumber = selectedService?.code === "telegram-poll-votes";
  const requiresEndorsementSkill = selectedService?.code === "linkedin-usa-endorsements";
  const customCommentLines = customComments.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const customCommentsError = requiresCustomComments && customCommentLines.length === 0 ? "Enter at least one custom comment, one per line." : (selectedService?.code === "tiktok-custom-comments" || selectedService?.code === "linkedin-usa-custom-comments") && customCommentLines.length !== quantity ? `Enter exactly ${quantity.toLocaleString("en-IN")} valid comment lines to match your order quantity.` : selectedService?.code === "twitter-crypto-custom-comments" && customComments.split(/\r?\n/).some((line) => !line.trim()) ? "Remove blank comment lines before continuing." : "";
  const pollAnswerNumberError = requiresPollAnswerNumber && !/^\d+$/.test(pollAnswerNumber) ? "Enter a non-negative whole-number answer number." : "";
  const endorsementSkillError = requiresEndorsementSkill && !endorsementSkillName.trim() ? "Enter the exact LinkedIn skill that should receive endorsements." : "";
  const formIsValid = Boolean(selectedService && quantityInput && targetLink.trim() && !quantityError && !linkError && !customCommentsError && !pollAnswerNumberError && !endorsementSkillError);
  const detailChecks = [
    { key: "target", label: "Public link", complete: Boolean(targetLink.trim() && !linkError) },
    { key: "quantity", label: "Quantity", complete: Boolean(quantityInput && !quantityError) },
    ...(requiresCustomComments ? [{ key: "comments", label: "Custom comments", complete: !customCommentsError }] : []),
    ...(requiresPollAnswerNumber ? [{ key: "poll", label: "Poll answer", complete: !pollAnswerNumberError }] : []),
    ...(requiresEndorsementSkill ? [{ key: "skill", label: "Skill name", complete: !endorsementSkillError }] : []),
  ];
  const completedDetailChecks = detailChecks.filter((item) => item.complete).length;
  const priceIsReady = Boolean(selectedService && quantityInput && !quantityError);
  const totalPrice = selectedService ? serviceTotal(selectedService.pricePer1000, quantity) : 0;
  // Round to paise so the review summary agrees with server-priced checkout.
  const walletApplied = Math.min(Math.max(0, walletBalance ?? 0), totalPrice);
  const remainingToPay = Math.max(0, Math.round((totalPrice - walletApplied) * 100) / 100);
  const hasEnoughWallet = walletBalance !== null && totalPrice > 0 && remainingToPay === 0;
  const remainingBalance = walletBalance === null ? null : Math.max(0, Math.round((walletBalance - walletApplied) * 100) / 100);
  const currentStep = checkoutStep;
  const quantityOptions = selectedService ? buildQuantityMerchandising(selectedService) : [];
  const bonusThresholdQuantity = firstOrderOffer && selectedService && totalPrice < firstOrderOffer.minimum
    ? quantityForMinimumSpend(selectedService, firstOrderOffer.minimum)
    : null;
  const bonusThresholdTotal = bonusThresholdQuantity && selectedService
    ? serviceTotal(selectedService.pricePer1000, bonusThresholdQuantity)
    : 0;

  useEffect(() => {
    if (checkoutStep >= 3) router.prefetch("/dashboard/orders");
  }, [checkoutStep, router]);

  useEffect(() => {
    if (!selectedService || !quantityInput || quantityError || linkError || success) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/order-draft", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: selectedService.platform, serviceCode: selectedService.code, quantity, target: targetLink.trim() }) }).then((response) => { if (response.ok) track("order_draft_saved", { service_code: selectedService.code, platform: selectedService.platform }); }).catch(() => undefined);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [linkError, quantity, quantityError, quantityInput, selectedService, success, targetLink]);

  // Anonymous convenience state deliberately excludes the destination link,
  // price, payment state and all account data. The canonical order flow still
  // validates every fact when this configuration is reopened.
  useEffect(() => {
    if (!selectedService || !quantityInput || quantityError || success) return;
    localStorage.setItem(CONTINUE_ORDER_KEY, serializeContinueOrder({ serviceCode: selectedService.code, quantity, updatedAt: Date.now() }));
  }, [quantity, quantityError, quantityInput, selectedService, success]);

  useEffect(() => {
    if (!selectedService) return;
    const catalogCodes = new Set(mergeCustomerOrderServices(liveServices).map((service) => service.code));
    localStorage.setItem(RECENT_SERVICES_KEY, JSON.stringify(addRecentService(parseRecentServices(localStorage.getItem(RECENT_SERVICES_KEY), catalogCodes), selectedService.code)));
    track("service_viewed", { step: "order_builder", service_code: selectedService.code, platform: selectedService.platform });
  }, [liveServices, selectedService]);

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

  const pasteTargetLink = async () => {
    try {
      const value = await navigator.clipboard.readText();
      if (!value.trim()) {
        setError("Your clipboard is empty.");
        return;
      }
      setTargetLink(value.trim());
      setError("");
    } catch {
      setError("Paste permission was blocked. Please paste the public link manually.");
    }
  };

  const resetOrderDetails = () => {
    setTargetLink("");
    setCustomComments("");
    setPollAnswerNumber("");
    setEndorsementSkillName("");
    setQuantityInput("");
    setError("");
    setSuccess(null);
    requestId.current = "";
  };

  const choosePlatform = (nextPlatform: PlatformId) => {
    if (advanceTimer.current || platform === nextPlatform && checkoutStep === 2) return;
    track("order_platform_selected", { platform: nextPlatform });
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
    if (advanceTimer.current || health && (!health.acceptsNewOrders || health.status === "paused" || health.status === "maintenance")) return;
    if (selectedService?.code === service.code) return;
    track("service_selected", { service_code: service.code, platform: service.platform });
    track("order_started", { service_code: service.code, platform: service.platform });
    setSelectedService(service);
    resetOrderDetails();
    const starterQuantity = buildQuantityMerchandising(service)[0]?.value ?? service.minQuantity;
    setQuantityInput(String(starterQuantity));
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
        setWalletBalance(null);
        setWalletError("Wallet balance could not be loaded. Please refresh before ordering.");
        return;
      }
      setWalletBalance(Number(profile?.balance ?? 0));
    } catch {
      setWalletBalance(null);
      setWalletError("Wallet balance is unavailable right now.");
    } finally {
      setWalletLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const updateBalance = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) setWalletBalance(value);
    };
    window.addEventListener("wallet-balance-updated", updateBalance);
    return () => window.removeEventListener("wallet-balance-updated", updateBalance);
  }, []);

  // Load the lightweight first-order incentive immediately so a brand-new signup
  // sees the reward before choosing a platform. Service/favourite data stays deferred.
  useEffect(() => {
    let active = true;
    void fetch("/api/rewards/first-order-offer", { credentials: "same-origin", cache: "no-store" })
      .then(async (response): Promise<{ firstOrder: boolean; eligible: boolean; reward?: number; minimum?: number; variant?: string }> =>
        response.ok
          ? await response.json() as { firstOrder: boolean; eligible: boolean; reward?: number; minimum?: number; variant?: string }
          : { firstOrder: false, eligible: false, variant: "unknown" }
      )
      .then((data) => {
        if (!active) return;
        const isFirstOrder = Boolean(data.firstOrder);
        const reward = Number(data.reward || 0);
        const minimum = Number(data.minimum || 0);
        const offer = data.eligible && reward > 0 && minimum > 0 ? { reward, minimum } : null;
        setFirstOrder(isFirstOrder);
        setFirstOrderOffer(offer);
        if (isFirstOrder && !funnelSignals.current.has("first-order-context")) {
          funnelSignals.current.add("first-order-context");
          track("order_started", {
            step: "first_order_entry",
            first_order: true,
            source: (searchParams.get("source") || "direct").slice(0, 80),
          });
        }
        if (isFirstOrder && data.variant && !funnelSignals.current.has(`first-order-experiment:${data.variant}`)) {
          funnelSignals.current.add(`first-order-experiment:${data.variant}`);
          track("experiment_exposure", {
            experiment: "first_order_wallet_bonus",
            variant: data.variant,
            surface: "new_order_entry",
          });
        }
        if (offer) track("first_order_bonus_view", { reward: offer.reward, minimum: offer.minimum, surface: "new_order_entry" });
      })
      .catch(() => {
        if (!active) return;
        setFirstOrder(false);
        setFirstOrderOffer(null);
      });
    return () => { active = false; };
  }, []);

  // Defer non-critical account data until the user actually reaches the service step.
  useEffect(() => {
    if (checkoutStep < 2 || stepTwoDataLoaded.current) return;
    stepTwoDataLoaded.current = true;
    const db = createClient();

    void Promise.all([
      db.from("services").select("id,code").eq("status", "active"),
      db.from("customer_favourites").select("service_id"),
    ]).then(([servicesResult, favouritesResult]) => {
      const byCode: Record<string, number> = {};
      const records = (servicesResult.data || []) as ServiceRecord[];
      for (const record of records) if (record.code) byCode[record.code] = record.id;
      setServiceIds(byCode);
      setFavouriteServiceIds(new Set((favouritesResult.data || []).map((item) => Number(item.service_id))));
    });
  }, [checkoutStep]);

  // Saved profiles are useful only when entering campaign details.
  useEffect(() => {
    if (checkoutStep < 3 || savedProfilesLoaded.current) return;
    savedProfilesLoaded.current = true;
    const db = createClient();
    void db.from("saved_social_profiles")
      .select("id,label,platform,public_url,last_used_at")
      .order("last_used_at", { ascending: false, nullsFirst: false })
      .then(({data}) => setSavedProfiles((data || []) as SavedProfile[]));
  }, [checkoutStep]);

  // Wallet data is required only on the review/payment step.
  useEffect(() => {
    if (checkoutStep < 4 || walletRequested.current) return;
    walletRequested.current = true;
    void loadWalletBalance();
  }, [checkoutStep, loadWalletBalance]);

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

  // Load only the live catalog for the platform the customer actually selected.
  useEffect(() => {
    if (!platform || loadedLivePlatforms.current.has(platform)) return;
    loadedLivePlatforms.current.add(platform);
    let active = true;

    const clientDefinitions = clientLiveServiceDefinitions.filter((definition) => definition.platform === platform);
    const protectedDefinitions = protectedLiveServiceDefinitions.filter((definition) => definition.platform === platform);
    const isValidLiveService = (service: SmmService) =>
      Number.isFinite(service.pricePer1000) && service.pricePer1000 > 0 && service.minQuantity > 0 && service.maxQuantity >= service.minQuantity;
    const commitServices = (incoming: SmmService[]) => {
      if (!active || incoming.length === 0) return;
      const valid = incoming.filter(isValidLiveService);
      if (!valid.length) return;
      setLiveServices((current) => {
        const byCode = new Map(current.map((item) => [item.code, item]));
        for (const service of valid) byCode.set(service.code, service);
        return [...byCode.values()];
      });
      setSelectedService((current) => valid.find((item) => item.code === current?.code) ?? current);
    };

    const db = createClient();
    if (clientDefinitions.length) {
      const clientCodes = clientDefinitions.map((definition) => definition.code);
      void db.from("services")
        .select("code,platform,rate,min,max,delivery_time,refill_policy,quality_type,important_instruction")
        .in("code", clientCodes)
        .eq("status", "active")
        .eq("is_active", true)
        .eq("accepts_new_orders", true)
        .then(({ data }) => {
          const rowsByCode = new Map((data || []).map((row) => [String(row.code), row]));
          const services = clientDefinitions.flatMap((definition) => {
            const data = rowsByCode.get(definition.code);
            if (!data) return [];
            const expectedPlatform = definition.platform === "x" ? "twitter" : definition.platform;
            if (String(data.platform || "").toLowerCase() !== expectedPlatform) return [];
            return [{
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
            } satisfies SmmService];
          });
          commitServices(services);
        });
    }

    if (protectedDefinitions.length) {
      void Promise.all(protectedDefinitions.map(async (definition) => {
        const response = await fetch(`/api/services/live-catalog?code=${definition.code}`, { credentials: "same-origin" });
        if (!response.ok) return null;
        const payload = await response.json() as { data?: { rate: number; min: number; max: number; deliveryTime: string; refillPolicy: string; qualityType: string; importantInstruction: string } | null };
        if (!payload.data) return null;
        return {
          platform: definition.platform,
          code: definition.code,
          name: definition.name,
          description: definition.description,
          pricePer1000: Number(payload.data.rate),
          minQuantity: Number(payload.data.min),
          maxQuantity: Number(payload.data.max),
          deliveryTime: payload.data.deliveryTime,
          refillPolicy: payload.data.refillPolicy,
          qualityType: payload.data.qualityType,
          importantInstruction: payload.data.importantInstruction,
          isActive: true,
        } satisfies SmmService;
      })).then((services) => commitServices(services.filter((service): service is NonNullable<typeof service> => service !== null)));
    }

    return () => { active = false; };
  }, [platform]);

  async function placeOrder() {
    if (!selectedService || !linkRule || inFlight.current || submitting) return;
    setError("");
    if (repeatRequested && !repeatConfirmed) {
      setError("Confirm the repeated campaign details before placing this order.");
      scrollTo(summaryRef);
      return;
    }
    if (!quantityInput || quantityError) {
      setError(quantityError || "Enter a quantity to continue.");
      scrollTo(detailsRef);
      return;
    }
    if (customCommentsError) {
      setError(customCommentsError);
      scrollTo(detailsRef);
      return;
    }
    if (pollAnswerNumberError) {
      setError(pollAnswerNumberError);
      scrollTo(detailsRef);
      return;
    }
    if (endorsementSkillError) {
      setError(endorsementSkillError);
      scrollTo(detailsRef);
      return;
    }
    const validation = validateOrderLink({ platform: selectedService.platform, serviceCode: selectedService.code, serviceName: selectedService.name, destinationUrl: targetLink });
    if (!validation.valid) {
      setError(validation.message);
      scrollTo(detailsRef);
      return;
    }
    if (walletLoading || walletBalance === null || walletError) {
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
          clientId: requestedClientId,
          campaignId: requestedCampaignId,
          packageName: "Custom",
          notes: requiresCustomComments ? customComments.replace(/\r\n/g, "\n").trim() : null,
          pollAnswerNumber: requiresPollAnswerNumber ? pollAnswerNumber : undefined,
          endorsementSkillName: requiresEndorsementSkill ? endorsementSkillName.trim() : undefined,
        }),
      });
      const intentResult = (await intentResponse.json()) as { data?: { id: string }; error?: string };
      if (!intentResponse.ok || !intentResult.data?.id) {
        throw new Error(intentResult.error || "Unable to prepare your checkout right now.");
      }
      track("checkout_started", { service_code: selectedService.code, platform: selectedService.platform, checkout_intent_id: intentResult.data.id, payment_path: "wallet", recovery_campaign: recoveryCampaignRef.current });

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
      router.replace("/dashboard/orders");
    } catch (cause) {
      track("checkout_error", { step: "wallet_order", service_code: selectedService.code, platform: selectedService.platform });
      setError(cause instanceof Error ? cause.message : "Unable to place your order right now.");
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  async function payWithManualMethods() {
    if (!selectedService || !linkRule || inFlight.current || submitting || !formIsValid || walletLoading || walletBalance === null || walletError || Boolean(success)) return;
    if (hasEnoughWallet) {
      await placeOrder();
      return;
    }
    if (repeatRequested && !repeatConfirmed) {
      setError("Confirm the repeated campaign details before continuing to payment.");
      scrollTo(summaryRef);
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setCheckoutStage("Preparing UPI, Bank Transfer & USDT...");
    setError("");
    if (!requestId.current) requestId.current = crypto.randomUUID();
    track("payment_started", { service_code: selectedService.code, platform: selectedService.platform, payment_path: "manual_direct", recovery_campaign: recoveryCampaignRef.current });
    let intentStatus: number | null = null;
    let intentErrorCategory = "request_failed";
    try {
      const intentResponse = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCode: selectedService.code,
          quantity,
          link: targetLink.trim(),
          clientRequestId: requestId.current,
          clientId: requestedClientId,
          campaignId: requestedCampaignId,
          packageName: "Custom",
          notes: requiresCustomComments ? customComments.replace(/\r\n/g, "\n").trim() : null,
          pollAnswerNumber: requiresPollAnswerNumber ? pollAnswerNumber : undefined,
          endorsementSkillName: requiresEndorsementSkill ? endorsementSkillName.trim() : undefined,
        }),
      });
      intentStatus = intentResponse.status;
      const intent = await intentResponse.json() as { data?: { id?: string }; error?: string };
      if (!intentResponse.ok || !intent.data?.id) {
        intentErrorCategory = intentResponse.status === 409
          ? "request_conflict"
          : intentResponse.status === 422
            ? "validation_rejected"
            : intentResponse.status === 401
              ? "authentication_required"
              : intentResponse.status >= 500
                ? "server_unavailable"
                : "intent_rejected";
        throw new Error(intent.error || "Unable to prepare manual payment.");
      }
      track("checkout_started", {
        service_code: selectedService.code,
        platform: selectedService.platform,
        checkout_intent_id: intent.data.id,
        payment_path: "manual_direct",
        recovery_campaign: recoveryCampaignRef.current,
      });
      router.push(`/dashboard/direct-upi?intent=${encodeURIComponent(intent.data.id)}`);
    } catch (cause) {
      track("checkout_error", {
        step: "manual_intent",
        service_code: selectedService.code,
        platform: selectedService.platform,
        payment_path: "manual_direct",
        http_status: intentStatus,
        error_category: intentErrorCategory,
      });
      setError(cause instanceof Error ? cause.message : "Unable to prepare manual payment.");
      setCheckoutStage("");
      setSubmitting(false);
      inFlight.current = false;
    }
  }

  const moveTo = (step: number) => {
    if (step === 2 && !platform) return;
    if (step === 3 && !selectedService) return;
    if (step === 4 && !formIsValid) return;
    setError("");
    if (step === 4 && selectedService) track("order_details_completed", { service_code: selectedService.code, platform: selectedService.platform, quantity, recovery_campaign: recoveryCampaignRef.current });
    setCheckoutStep(step);
    const target = step === 1 ? platformRef : step === 2 ? serviceRef : step === 3 ? detailsRef : summaryRef;
    scrollTo(target);
  };

  const primaryButton = (label: string, onClick: () => void, disabled = false) => (
    <button type="button" onClick={onClick} disabled={disabled} className="sr-motion-press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-16px_rgba(255,142,0,.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#252525] disabled:bg-none disabled:text-[#777] disabled:shadow-none">
      {label}<ArrowRight className="h-4 w-4" />
    </button>
  );

  return (
    <main className="dashboard-premium-page relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[#050505] px-4 pb-10 pt-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" /><div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" /></div>
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">New order</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Build your campaign</h1></div>
          <p className="hidden text-right text-xs leading-5 text-[#9CA3AF] sm:block">Transparent pricing<br />Manual payment verification</p>
        </header>
        {firstOrder && currentStep === 1 ? <section className="mb-4 overflow-hidden rounded-2xl border border-emerald-400/25 bg-[linear-gradient(135deg,rgba(16,185,129,.13),rgba(255,122,0,.08),rgba(11,11,15,.98))] p-4 shadow-[0_18px_46px_-34px_rgba(16,185,129,.85)]" aria-label="First order guidance">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-300">{firstOrderOffer ? "First order reward" : "Your first order"}</p>
              <p className="mt-1 text-base font-black text-white sm:text-lg">{firstOrderOffer ? <>Get {formatCurrency(firstOrderOffer.reward, "INR")} wallet bonus on your first order</> : "Start with a clear four-step order review"}</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">{firstOrderOffer ? <>Place an eligible first order of {formatCurrency(firstOrderOffer.minimum, "INR")} or more. The bonus is added to your wallet after the order is completed.</> : "Choose a platform and service, add the correct public link, then review the exact price before payment. No password is required."}</p>
            </div>
            <button type="button" onClick={() => { if (firstOrderOffer) track("first_order_bonus_click", { reward: firstOrderOffer.reward, minimum: firstOrderOffer.minimum, surface: "new_order_entry" }); else track("new_order_clicked", { step: "first_order_entry", surface: "new_order_builder" }); scrollTo(platformRef); }} className="sr-motion-press inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-xs font-black text-white shadow-lg shadow-emerald-500/15">
              Choose a platform <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section> : null}
        {hasAgencyContext ? <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-500/[.06] px-4 py-3 text-xs leading-5 text-slate-300"><b className="text-sky-200">Agency context attached.</b> This order will stay linked to the selected {requestedCampaignId ? "campaign" : "client"} workspace after checkout. SocialRUSH verifies ownership before creating the checkout.</div> : null}
        {repeatRequested ? <div className="mb-4 flex items-start gap-3 rounded-2xl border border-orange-400/25 bg-orange-500/[.07] px-4 py-3 text-xs leading-5 text-slate-300"><RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /><div><b className="text-orange-200">Repeat campaign review required.</b> {repeatMode === "same_target" ? "The previous target and quantity were prefilled for convenience." : "The previous service and quantity were prefilled, but you must enter the new target."} Current service availability, limits and price are rechecked before checkout.</div></div> : null}
        <nav aria-label="Order progress" className="sr-motion-lift relative mb-5 grid grid-cols-4 gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#101010]/95 p-1.5 backdrop-blur sm:mb-6 sm:gap-2 sm:p-2">
          <span aria-hidden="true" className="absolute left-[12%] right-[12%] top-[1.65rem] h-px bg-white/10" />
          {[[1, "Platform"], [2, "Service"], [3, "Details"], [4, "Review & Pay"]].map(([number, title]) => <button key={number} type="button" onClick={() => moveTo(Number(number))} disabled={Number(number) > currentStep} className="min-w-0 disabled:cursor-default"><ProgressItem number={Number(number)} title={String(title)} state={progressState(Number(number), currentStep)} /></button>)}
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="rounded-3xl border border-white/10 bg-[#111111] p-4 shadow-[0_28px_70px_-45px_rgba(0,0,0,.9)] sm:p-6">
            {currentStep === 1 ? <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 1 of 4</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Choose a platform</h2><p className="mt-2 text-sm text-[#9CA3AF]">Select where you want your campaign to run.</p>
              {quickStartServices.length ? <section className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/[.055] p-4" aria-label="Quick start services">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-black text-white">Not sure where to start?</p><p className="mt-1 text-[11px] leading-5 text-[#A7ADB7]">Use a simple starting point below, or choose any platform from the full list.</p></div>
                  <Link href="/dashboard/support" className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[.04] px-3 text-[11px] font-bold text-orange-200 hover:border-orange-400/40">Need help choosing?</Link>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {quickStartServices.map((service) => {
                    const minimumTotal = Math.round((service.minQuantity * service.pricePer1000 * 100) / 1000) / 100;
                    return <button key={service.code} type="button" onClick={() => chooseService(service)} className="sr-motion-press rounded-xl border border-white/10 bg-[#0B0B0F] p-3 text-left transition hover:border-orange-400/45 hover:bg-orange-500/[.06]">
                      <div className="flex items-center gap-2"><IconBadge size="sm" label={platformMeta[service.platform].label} className={`bg-gradient-to-br ${platformAccent(service.platform)}`}><PlatformIcon platform={platformMeta[service.platform].label} /></IconBadge><span className="text-[10px] font-black uppercase tracking-wider text-[#8F949D]">{platformMeta[service.platform].label}</span></div>
                      <p className="mt-3 text-xs font-black text-white">{serviceExperience[service.code]?.name || service.name}</p>
                      <p className="mt-1 text-[10px] text-[#9CA3AF]">Start from {formatCurrency(minimumTotal, currency)}</p>
                    </button>;
                  })}
                </div>
              </section> : null}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {platformOrder.map((platformId) => { const meta = platformMeta[platformId]; const active = platform === platformId; const serviceCount = customerOrderServices.filter((service) => service.platform === platformId).length; return <button key={platformId} type="button" onClick={() => choosePlatform(platformId)} aria-pressed={active} className={`relative min-h-28 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${active ? "border-orange-400 bg-orange-500/10 ring-2 ring-orange-500/15 shadow-[0_16px_32px_-20px_rgba(255,122,0,.85)]" : "border-white/10 bg-[#0B0B0F] hover:border-white/25 hover:bg-white/[.035]"}`}><IconBadge label={meta.label} className={`bg-gradient-to-br ${platformAccent(platformId)}`}><PlatformIcon platform={meta.label} className="h-6 w-6" /></IconBadge><span className="mt-4 block text-sm font-black">{meta.label}</span><span className="mt-1 block text-[10px] font-semibold text-[#9CA3AF]">{serviceCount} service{serviceCount === 1 ? "" : "s"} to compare</span>{active && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />}</button>; })}
              </div>
              <p className="mt-5 text-center text-xs text-[#9CA3AF]" aria-live="polite">Select a platform to continue automatically.</p>
            </div> : null}
            {currentStep === 2 ? <div>
              <button type="button" onClick={() => moveTo(1)} className="text-xs font-bold text-[#B5B5B5] hover:text-white">← Back to platforms</button><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 2 of 4 · {platform && platformMeta[platform].label}</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Choose a service</h2>{firstOrderOffer ? <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/[.08] p-4"><div className="flex items-start gap-3"><Gift className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /><div><p className="text-xs font-black text-white">First-order wallet bonus</p><p className="mt-1 text-[11px] leading-5 text-[#C9D5CF]">Complete your first qualifying order of ₹{firstOrderOffer.minimum.toLocaleString("en-IN")} or more and receive ₹{firstOrderOffer.reward.toLocaleString("en-IN")} in your SocialRUSH wallet after completion.</p></div></div></div> : <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/[.06] p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /><div><p className="text-xs font-black text-white">First order tip</p><p className="mt-1 text-[11px] leading-5 text-[#AEB5C0]">If you’re unsure, start with the minimum or starter quantity. You can review delivery and scale your next order after you’re comfortable.</p></div></div></div>}
              {favouriteServices.length ? <section className="sr-motion-lift mt-4 rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-3" aria-label="Your favourite services"><p className="text-xs font-black text-white">Your favourite services</p><p className="mt-1 text-[11px] text-[#9CA3AF]">Start a new editable order with a saved service.</p><div className="mt-3 flex flex-wrap gap-2">{favouriteServices.map((service) => <button key={service.code} type="button" onClick={() => chooseService(service)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/[.08] px-3 text-xs font-bold text-orange-100"><Heart className="h-3.5 w-3.5 fill-current" />{serviceExperience[service.code]?.name || service.name}</button>)}</div></section> : null}
              {(favouriteNotice || favouriteError) ? <p role="status" className={`mt-3 text-xs ${favouriteError ? "text-red-300" : "text-emerald-300"}`}>{favouriteError || favouriteNotice}</p> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const active = selectedService?.code === service.code;
                  const serviceId = serviceIds[service.code];
                  const isFavourite = Boolean(serviceId && favouriteServiceIds.has(serviceId));
                  const favouriteUpdating = Boolean(serviceId && favouriteUpdatingServiceIds.has(serviceId));
                  const health = healthByService[service.code];
                  const unavailable = Boolean(health && (!health.acceptsNewOrders || health.status === "paused" || health.status === "maintenance"));
                  const experience = serviceExperience[service.code];
                  const ServiceGlyph = service.code.includes("likes") ? Heart : service.code.includes("views") ? Eye : service.code.includes("shares") ? ThumbsUp : Users;
                  return <article key={service.code} className={`rounded-2xl border p-4 transition ${active ? "border-orange-400/80 bg-orange-500/10 shadow-[0_18px_34px_-24px_rgba(255,122,0,.85)]" : "border-white/10 bg-[#0B0B0F] hover:border-white/25"} ${unavailable ? "opacity-55" : ""}`}>
                    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><IconBadge size="sm" label={platformMeta[service.platform].label} className={`bg-gradient-to-br ${platformAccent(service.platform)}`}><PlatformIcon platform={platformMeta[service.platform].label} /></IconBadge><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-black text-white">{experience.name}</h3>{starterServiceLabel(service.code) ? <span className="rounded-full border border-orange-400/25 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-orange-200">{starterServiceLabel(service.code)}</span> : null}</div><p className="mt-1 text-xs text-[#9CA3AF]">{service.description}</p></div></div><div className="flex shrink-0 items-center gap-2"><button type="button" aria-label={`${isFavourite ? "Remove" : "Save"} ${experience.name} ${isFavourite ? "from" : "to"} favourites`} aria-pressed={isFavourite} disabled={!serviceId || favouriteUpdating} onClick={(event) => { event.stopPropagation(); void toggleFavourite(service); }} onPointerDown={(event) => event.stopPropagation()} className={`grid h-10 w-10 place-items-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-45 ${isFavourite ? "border-orange-300 bg-orange-500/20 text-orange-200" : "border-white/15 bg-white/[.04] text-[#B5B5B5] hover:border-orange-400/60 hover:text-orange-200"}`}><Heart className={`h-5 w-5 ${isFavourite ? "fill-current" : ""}`} /></button>{active ? <Check className="h-5 w-5 text-emerald-400" /> : <ServiceGlyph className="h-5 w-5 text-orange-300" />}</div></div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl bg-white/[.035] p-2.5"><span className="text-[#777]">Live rate</span><strong className="mt-1 block text-white">{formatCurrency(service.pricePer1000, currency)} / 1K</strong></div><div className="rounded-xl bg-white/[.035] p-2.5"><span className="text-[#777]">Minimum total</span><strong className="mt-1 block text-white">{formatCurrency(Math.round((service.minQuantity * service.pricePer1000 * 100) / 1000) / 100, currency)}</strong></div><div className="rounded-xl bg-white/[.035] p-2.5"><span className="text-[#777]">Delivery</span><strong className="mt-1 block text-white">{service.deliveryTime}</strong></div></div>
                    <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">{service.refillPolicy}</span><ServiceHealthBadge health={health} /></div>
                    <details className="mt-3 rounded-xl border border-white/10 bg-white/[.025]" aria-label={`Service details for ${experience.name}`}><summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-[#D6D9DF]">Service details <span className="float-right text-orange-300">+</span></summary><div className="border-t border-white/10 px-3 py-3 text-xs leading-5 text-[#9CA3AF]"><p>Min {service.minQuantity.toLocaleString("en-IN")} · Max {service.maxQuantity.toLocaleString("en-IN")}</p><p className="mt-1">{service.importantInstruction}</p></div></details>
                    <button type="button" disabled={unavailable} onClick={() => chooseService(service)} className={`mt-4 min-h-11 w-full rounded-xl text-xs font-black transition disabled:cursor-not-allowed ${active ? "bg-emerald-500/15 text-emerald-200" : "border border-white/15 bg-white/5 text-white hover:border-orange-400/70"}`}>{unavailable ? "Unavailable" : active ? "✓ Selected" : "Select Service"}</button>
                  </article>;
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] px-4 py-3"><p className="text-xs font-bold text-white">What happens next?</p><p className="mt-1 text-[11px] leading-5 text-[#9CA3AF]">Select a service and we’ll take you to campaign details. You can review the target, quantity and final total before any payment.</p></div><div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-[#9DA3AD]"><span className="rounded-full border border-white/10 bg-white/[.03] px-2.5 py-1">Price shown first</span><span className="rounded-full border border-white/10 bg-white/[.03] px-2.5 py-1">Availability checked</span><span className="rounded-full border border-white/10 bg-white/[.03] px-2.5 py-1">Editable before payment</span></div><p className="mt-3 text-center text-xs text-[#9CA3AF]" aria-live="polite">Select an available service to continue automatically.</p>
            </div> : null}
            {currentStep === 3 && selectedService && linkRule ? <div>
              <button type="button" onClick={() => moveTo(2)} className="text-xs font-bold text-[#B5B5B5] hover:text-white">← Back to services</button><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 3 of 4</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Campaign details</h2><p className="mt-2 text-sm text-[#9CA3AF]">{requiresPollAnswerNumber
  ? "Enter the poll link, quantity, and answer number."
  : requiresCustomComments
    ? "Enter the post link, quantity, and custom comments."
    : "Enter the public link and quantity to get started."}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.025] p-3 sm:p-4" aria-live="polite">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-black text-white">Ready-to-review checklist</p><p className="mt-1 text-[11px] text-[#8F949D]">{formIsValid ? "Everything is complete. You can review the final total now." : `${detailChecks.length - completedDetailChecks} item${detailChecks.length - completedDetailChecks === 1 ? "" : "s"} left before review.`}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${formIsValid ? "bg-emerald-500/15 text-emerald-200" : "bg-orange-500/10 text-orange-200"}`}>{completedDetailChecks}/{detailChecks.length}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">{detailChecks.map((item) => <span key={item.key} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${item.complete ? "border-emerald-400/20 bg-emerald-500/[.07] text-emerald-200" : "border-white/10 bg-black/20 text-[#A7ADB7]"}`}>{item.complete ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />}{item.label}</span>)}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold text-[#AEB5C0]"><span className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1">No password</span><span className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1">Review total before payment</span><span className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1">Track after ordering</span></div><div className="sr-order-details-grid mt-5 grid gap-5"><label className="sr-order-field text-xs font-black">Public Link / Username<div className="mt-2 flex gap-2"><input value={targetLink} onChange={(e) => { setTargetLink(e.target.value); setError(""); }} placeholder={linkRule.placeholder} className={`min-h-14 min-w-0 flex-1 rounded-xl border bg-[#090909] px-4 text-base font-medium outline-none transition placeholder:text-[#555] focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 ${linkError ? "border-red-400" : "border-white/15"}`} /><button type="button" onClick={() => void pasteTargetLink()} className="min-h-14 shrink-0 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-xs font-black text-orange-200 hover:bg-orange-500/15">Paste</button></div><span className={`mt-2 block font-medium ${linkError ? "text-red-300" : "text-[#999]"}`}>{linkError || linkRule.helper}</span></label><label className="sr-order-field text-xs font-black">Quantity<input value={quantityInput} onChange={(e) => { setQuantityInput(cleanQuantity(e.target.value)); setError(""); }} inputMode="numeric" placeholder="Enter quantity" className={`mt-2 min-h-14 w-full rounded-xl border bg-[#090909] px-4 text-base font-medium outline-none transition placeholder:text-[#555] focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 ${quantityError ? "border-red-400" : "border-white/15"}`} /><span className={`mt-2 block font-medium ${quantityError ? "text-red-300" : "text-[#999]"}`}>{quantityError || `Min ${selectedService.minQuantity.toLocaleString("en-IN")} · Max ${selectedService.maxQuantity.toLocaleString("en-IN")}`}</span></label></div>
              {requiresPollAnswerNumber ? <label className="mt-5 block text-xs font-black">Poll Answer Number<input value={pollAnswerNumber} onChange={(e) => { setPollAnswerNumber(e.target.value); setError(""); }} inputMode="numeric" placeholder="Enter answer number" className={`mt-2 min-h-14 w-full rounded-xl border bg-[#090909] px-4 text-base font-medium outline-none transition placeholder:text-[#555] focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 ${pollAnswerNumberError ? "border-red-400" : "border-white/15"}`} /><span className={`mt-2 block font-medium ${pollAnswerNumberError ? "text-red-300" : "text-[#999]"}`}>{pollAnswerNumberError || "Enter the answer number for the poll option that should receive the votes."}</span></label> : null}
              {requiresEndorsementSkill ? <label className="mt-5 block text-xs font-black">Skill Name<input value={endorsementSkillName} onChange={(e) => { setEndorsementSkillName(e.target.value); setError(""); }} placeholder="e.g. Digital Marketing" className={`mt-2 min-h-14 w-full rounded-xl border bg-[#090909] px-4 text-base font-medium outline-none transition placeholder:text-[#555] focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 ${endorsementSkillError ? "border-red-400" : "border-white/15"}`} /><span className={`mt-2 block font-medium ${endorsementSkillError ? "text-red-300" : "text-[#999]"}`}>{endorsementSkillError || "Enter the exact LinkedIn skill that should receive endorsements."}</span></label> : null}
              {quantityOptions.length > 0 && <section className="mt-5" aria-label="Recommended quantity options">
      <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black text-white">Choose a quantity</p><p className="mt-1 text-[11px] text-[#8F949D]">Quick options based on this service’s live limits.</p></div><span className="hidden text-[10px] font-bold uppercase tracking-wider text-[#777] sm:inline">Same live rate</span></div>
      <div className="sr-order-quantity-grid mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{quantityOptions.map((option) => {
        const selected = quantity === option.value;
        const emphasis = option.emphasis === "balanced" ? "border-orange-400/50 bg-orange-500/[.08]" : option.emphasis === "scale" ? "border-emerald-400/35 bg-emerald-500/[.06]" : "border-white/10 bg-white/[.035]";
        const optionPrice = Math.round((option.value * selectedService.pricePer1000 * 100) / 1000) / 100;
        return <button key={option.value} type="button" aria-pressed={selected} onClick={() => { setQuantityInput(String(option.value)); setError(""); }} className={`sr-order-quantity-option relative min-h-20 rounded-xl border px-3 py-3 text-left transition hover:border-orange-300/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${selected ? "border-orange-400 bg-orange-500/15 ring-2 ring-orange-500/10" : emphasis}`}>
          <span className="flex items-start justify-between gap-2"><strong className="text-sm font-black text-white">{compactQuantity(option.value)}</strong>{option.label ? <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${option.emphasis === "balanced" ? "bg-orange-500/20 text-orange-200" : option.emphasis === "scale" ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-[#C7CBD1]"}`}>{option.label}</span> : null}</span>
          <span className="mt-2 block text-xs font-bold text-[#B8BDC6]">{formatCurrency(optionPrice, currency)}</span>
        </button>;
      })}</div>
      <p className="mt-2 text-[10px] leading-4 text-[#777]">These labels guide quantity selection only. Your live rate, service limits and checkout validation stay unchanged.</p>
    </section>}
              {firstOrderOffer && priceIsReady ? <section className={`mt-5 rounded-2xl border p-4 ${totalPrice >= firstOrderOffer.minimum ? "border-emerald-400/30 bg-emerald-500/[.08]" : "border-orange-400/25 bg-orange-500/[.06]"}`} aria-label="First order wallet bonus">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${totalPrice >= firstOrderOffer.minimum ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-orange-400/30 bg-orange-500/10 text-orange-300"}`}><Gift className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-black ${totalPrice >= firstOrderOffer.minimum ? "text-emerald-200" : "text-white"}`}>{totalPrice >= firstOrderOffer.minimum ? `${formatCurrency(firstOrderOffer.reward, "INR")} first-order bonus unlocked` : `Unlock ${formatCurrency(firstOrderOffer.reward, "INR")} wallet bonus`}</p>
                    {totalPrice >= firstOrderOffer.minimum ? <p className="mt-1 text-xs leading-5 text-slate-300">After this qualifying first order is completed, the bonus will be credited to your SocialRUSH wallet automatically.</p> : bonusThresholdQuantity ? <><p className="mt-1 text-xs leading-5 text-slate-300">Your current total is {formatCurrency(totalPrice, currency)}. Choose {bonusThresholdQuantity.toLocaleString("en-IN")} to reach {formatCurrency(bonusThresholdTotal, currency)} and qualify for the first-order bonus after completion.</p><button type="button" onClick={() => { setQuantityInput(String(bonusThresholdQuantity)); setError(""); track("first_order_bonus_click", { action: "quantity_threshold", service_code: selectedService.code, platform: selectedService.platform, quantity: bonusThresholdQuantity, total: bonusThresholdTotal }); }} className="sr-motion-press mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-xs font-black text-white shadow-lg shadow-emerald-500/10">Use {bonusThresholdQuantity.toLocaleString("en-IN")} · Unlock bonus</button></> : <p className="mt-1 text-xs leading-5 text-slate-300">This service cannot reach the {formatCurrency(firstOrderOffer.minimum, "INR")} qualifying minimum within its current quantity limit. You can still place the order normally.</p>}
                  </div>
                </div>
              </section> : null}
              <div className="sr-order-live-preview mt-5 grid gap-3 sm:grid-cols-2"><div className="sr-motion-lift rounded-2xl border border-orange-400/25 bg-[linear-gradient(135deg,#241505,#0b0b0b)] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-orange-300">Live order preview</p><p className="mt-2 text-2xl font-black">{priceIsReady ? formatCurrency(totalPrice, currency) : "—"}</p><p className="mt-1 text-xs text-[#aaa]">{serviceExperience[selectedService.code].name} · {priceIsReady ? `${quantity.toLocaleString("en-IN")} selected` : "Choose a valid quantity"}</p>{priceIsReady && !targetLink.trim() ? <p className="mt-2 text-[10px] font-semibold text-orange-200">Starter quantity is preselected. Add your public link to continue.</p> : null}</div><div className="sr-motion-lift flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/5 p-4 text-sm font-bold text-emerald-100"><LockKeyhole className="h-5 w-5 shrink-0 text-emerald-300" />{requiresPollAnswerNumber
  ? "No password required. Public poll link and answer number only."
  : requiresCustomComments
    ? "No password required. Public post link and custom comments only."
    : "No password required. Public link only."}</div></div>
              {error && <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}
              {!formIsValid ? <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-orange-400/20 bg-orange-500/[.06] px-3 py-2.5 text-[11px] text-orange-100"><span>Complete the checklist above to unlock review.</span><Link href="/dashboard/support" className="shrink-0 font-black text-orange-200 hover:text-white">Need help?</Link></div> : null}
              <div className="mt-6">{primaryButton(formIsValid ? "Review Order" : "Complete details to review", () => moveTo(4), !formIsValid)}</div>
            </div> : null}
            {currentStep === 4 && selectedService ? <div>
              <button type="button" onClick={() => moveTo(3)} className="text-xs font-bold text-[#B5B5B5] hover:text-white">← Back to details</button><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Step 4 of 4</p><h2 className="mt-2 text-xl font-black sm:text-2xl">Review & pay</h2><p className="mt-2 text-sm text-[#9CA3AF]">Nothing is placed yet. Confirm the service, target, quantity and final total before you pay.</p>
              <div className="sr-order-review-card sr-motion-lift mt-5 rounded-2xl border border-white/10 bg-[#0B0B0F] p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><IconBadge size="sm" label={platformMeta[selectedService.platform].label} className={`bg-gradient-to-br ${platformAccent(selectedService.platform)}`}><PlatformIcon platform={platformMeta[selectedService.platform].label} /></IconBadge><div><h3 className="font-black">{serviceExperience[selectedService.code].name}</h3><p className="text-xs text-[#9CA3AF]">{platformMeta[selectedService.platform].label}</p></div></div><button type="button" onClick={() => moveTo(3)} className="text-xs font-bold text-orange-300">Edit details</button></div><dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">{[["Platform", platform && platformMeta[platform].label], ["Service", serviceExperience[selectedService.code].name], ["Public link", targetLink], ["Quantity", quantity.toLocaleString("en-IN")], ...(requiresPollAnswerNumber ? [["Poll Answer Number", pollAnswerNumber]] : []), ...(requiresEndorsementSkill ? [["Skill Name", endorsementSkillName.trim()]] : []), ["Rate", `${formatCurrency(selectedService.pricePer1000, currency)} / 1K`], ["Delivery", selectedService.deliveryTime], ["Refill", selectedService.refillPolicy]].map(([label, value]) => <div key={String(label)} className="min-w-0"><dt className="text-[10px] font-black uppercase tracking-wider text-[#777]">{label}</dt><dd className="mt-1 break-words font-bold text-white">{label === "Public link" ? <span className="flex items-start gap-2"><span className="min-w-0 break-all">{value}</span><button type="button" aria-label="Copy public link" onClick={() => navigator.clipboard?.writeText(targetLink)} className="shrink-0 text-orange-300"><Copy className="h-4 w-4" /></button></span> : value}</dd></div>)}</dl></div>
              {repeatRequested ? <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/[.07] p-4 text-sm leading-6 text-amber-50">
                <input type="checkbox" checked={repeatConfirmed} onChange={(event) => { setRepeatConfirmed(event.target.checked); setError(""); }} className="mt-1 h-4 w-4 shrink-0 accent-orange-500" />
                <span><strong className="block text-amber-100">Confirm this repeat campaign</strong>I checked the service, ${repeatMode === "same_target" ? "target, " : "new target, "}quantity, current rate and final total. I understand this creates a new order and does not reuse the previous order price.</span>
              </label> : null}
              <div className="sr-order-payment-card sr-motion-lift mt-4 rounded-2xl border border-orange-400/25 bg-[linear-gradient(135deg,#201406,#0b0b0b)] p-5"><p className="text-[10px] font-black uppercase tracking-wider text-orange-300">Payment summary</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-[#aaa]">Order total</span><strong>{formatCurrency(totalPrice, currency)}</strong></div><div className="flex justify-between"><span className="text-[#aaa]">Wallet balance</span><strong>{walletLoading ? "Checking…" : formatCurrency(walletBalance ?? 0, currency)}</strong></div><div className="flex justify-between"><span className="text-[#aaa]">Wallet to apply</span><strong>{walletBalance === null ? "—" : formatCurrency(walletApplied, currency)}</strong></div><div className="flex justify-between"><span className="text-[#aaa]">Remaining to pay</span><strong>{walletBalance === null ? "—" : formatCurrency(remainingToPay, currency)}</strong></div><div className="flex justify-between border-t border-white/10 pt-3"><span className="text-[#aaa]">Projected wallet after order</span><strong>{remainingBalance === null ? "—" : formatCurrency(remainingBalance, currency)}</strong></div></div>{firstOrderOffer ? <div className={`mt-4 rounded-xl border p-3 text-xs leading-5 ${totalPrice >= firstOrderOffer.minimum ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100" : "border-white/10 bg-white/[.035] text-[#B8BDC6]"}`}>{totalPrice >= firstOrderOffer.minimum ? <><strong className="text-emerald-200">₹{firstOrderOffer.reward.toLocaleString("en-IN")} first-order bonus unlocked.</strong><br />It will be credited to your wallet after this qualifying order is completed.</> : <>First-order bonus: complete a qualifying order of <strong className="text-white">₹{firstOrderOffer.minimum.toLocaleString("en-IN")}+</strong> to receive <strong className="text-emerald-200">₹{firstOrderOffer.reward.toLocaleString("en-IN")}</strong> in your wallet after completion.</>}</div> : null}{!walletLoading && walletBalance !== null && !walletError && !hasEnoughWallet && <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm leading-6 text-amber-100"><strong className="text-white">Your wallet balance is used first.</strong><br />We’ll apply <strong className="text-white">{formatCurrency(walletApplied, currency)}</strong> from your wallet. Pay only the remaining <strong className="text-white">{formatCurrency(remainingToPay, currency)}</strong> with UPI, Bank Transfer or USDT.</div>}{!hasEnoughWallet && !walletLoading && walletBalance !== null && !walletError ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.025] p-4" aria-label="Available payment methods">
  <div className="flex items-center justify-between gap-3">
    <div><p className="text-xs font-black text-white">Choose your payment method on the next screen</p><p className="mt-1 text-[11px] leading-5 text-[#9DA3AD]">Your wallet is applied first. You only pay the remaining amount.</p></div>
    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-200">No extra order charge</span>
  </div>
  <div className="mt-3 grid grid-cols-3 gap-2">
    <div className="rounded-xl border border-orange-400/20 bg-orange-500/[.07] p-3 text-center"><span className="block text-xs font-black text-white">UPI</span><span className="mt-1 block text-[10px] text-[#9DA3AD]">QR / UPI payment</span></div>
    <div className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-center"><span className="block text-xs font-black text-white">Bank Transfer</span><span className="mt-1 block text-[10px] text-[#9DA3AD]">Manual transfer</span></div>
    <div className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-center"><span className="block text-xs font-black text-white">USDT</span><span className="mt-1 block text-[10px] text-[#9DA3AD]">International option</span></div>
  </div>
  <p className="mt-3 text-[10px] leading-4 text-[#7F8792]">Nothing is submitted until you choose a method and provide the required payment reference on the next screen.</p>
</div> : null}{walletError && <p className="mt-3 text-xs text-amber-200">{walletError}</p>}{error && <p className="mt-3 rounded-xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}{success && <p className="mt-3 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-100">Order placed successfully · #{success.id}. Opening Order History…</p>}<button type="button" onClick={() => { if (hasEnoughWallet) void placeOrder(); else void payWithManualMethods(); }} disabled={walletLoading || walletBalance === null || Boolean(walletError) || submitting || Boolean(success) || (repeatRequested && !repeatConfirmed)} className="sr-order-final-cta sr-motion-press mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black shadow-[0_18px_36px_-16px_rgba(255,142,0,.55)] disabled:cursor-not-allowed disabled:bg-[#252525] disabled:bg-none disabled:text-[#777]">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />{checkoutStage || "Preparing payment options..."}</> : hasEnoughWallet ? <><ShieldCheck className="h-4 w-4" />Place Order · {formatCurrency(totalPrice, currency)}</> : <><Wallet className="h-4 w-4" />Pay Remaining · {formatCurrency(remainingToPay, currency)}</>}</button><p className="mt-3 text-center text-[11px] leading-5 text-[#8F949D]">{hasEnoughWallet ? "Your wallet is charged only when you confirm this order." : "Next, choose UPI, Bank Transfer or USDT for the remaining amount. The next screen confirms the wallet/payment split again. Your wallet portion is applied once by the server when you submit the payment reference."}</p><div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-[#9DA3AD]"><span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-emerald-300" />No password required</span><span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-orange-300" />Details reviewed first</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-orange-300" />Track after order</span></div></div>
            </div> : null}
          </section>
          <aside className="sr-order-summary-aside hidden h-fit rounded-3xl border border-white/10 bg-[#101010] p-5 lg:sticky lg:top-24 lg:block"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#888]">Your order</p>{platform ? <><div className="mt-4 flex items-center gap-3"><IconBadge label={platformMeta[platform].label}><PlatformIcon platform={platformMeta[platform].label} className="h-5 w-5" /></IconBadge><strong className="text-sm">{platformMeta[platform].label}</strong></div><div className="my-5 border-t border-white/10" /><p className="text-sm font-bold">{selectedService ? serviceExperience[selectedService.code].name : "Choose a service"}</p><p className="mt-2 text-xs text-[#999]">{quantity ? `${quantity.toLocaleString("en-IN")} units` : "Quantity not set"}</p><div className="mt-5 rounded-xl bg-orange-500/10 p-4"><span className="text-xs text-orange-200">Current total</span><strong className="mt-1 block text-2xl">{totalPrice ? formatCurrency(totalPrice, currency) : "—"}</strong></div><p className="mt-4 text-xs text-[#999]">Wallet: {walletLoading ? "Checking…" : formatCurrency(walletBalance ?? 0, currency)}</p></> : <p className="mt-4 text-sm leading-6 text-[#999]">Choose a platform to begin your order.</p>}</aside>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#aaa]"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Manual payment verification</span><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-orange-300" /> Track from dashboard</span></div>
      </div>
    </main>
  );
}
