"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Check,
  CheckCircle2,
  Headphones,
  Hash,
  Link as LinkIcon,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";
import { activeSmmServices, platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

type PlatformId = SmmPlatformId;

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
};

type LinkRule = {
  label: string;
  placeholder: string;
  helper: string;
  hosts: string[];
  pathHint?: RegExp;
  error: string;
};

const platformOrder: PlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const visibleServices = activeSmmServices.filter((service) => service.code !== "x-likes");

const discoveryStatement =
  "We promote your profile or content through targeted discovery campaigns, community placements, opt-in engagement tasks, and manual quality checks. People discover your public profile or content and choose to follow or engage. We focus on safe gradual delivery and avoid unsafe spammy activity.";

const serviceExperience: Record<string, { name: string; outcome: string; required: string }> = {
  "instagram-followers": { name: "Instagram Followers", outcome: "Stronger profile discovery and a broader visible audience.", required: "Public Instagram profile link" },
  "instagram-likes": { name: "Instagram Likes", outcome: "More visible interaction around a selected post or reel.", required: "Public Instagram post or reel link" },
  "instagram-views": { name: "Instagram Views", outcome: "Expanded discovery for a selected reel or video post.", required: "Public Instagram post or reel link" },
  "youtube-subscribers": { name: "YouTube Subscribers", outcome: "Broader channel discovery and stronger audience momentum.", required: "Public YouTube channel link" },
  "youtube-likes": { name: "YouTube Likes", outcome: "Additional engagement discovery around a selected video.", required: "Public YouTube video link" },
  "youtube-views": { name: "YouTube Views", outcome: "Wider video discovery and improved visible reach.", required: "Public YouTube video link" },
  "facebook-followers": { name: "Facebook Followers", outcome: "Expanded discovery for a page or public profile.", required: "Public Facebook page or profile link" },
  "facebook-likes": { name: "Facebook Likes", outcome: "More visible engagement around a selected Facebook post.", required: "Public Facebook post link" },
  "facebook-views": { name: "Facebook Views", outcome: "Broader discovery for selected Facebook video content.", required: "Public Facebook video link" },
  "linkedin-followers": { name: "LinkedIn Followers", outcome: "Professional audience discovery for a profile or company page.", required: "Public LinkedIn profile or company page" },
  "linkedin-likes": { name: "LinkedIn Likes", outcome: "Professional engagement discovery for a selected post.", required: "Public LinkedIn post link" },
  "telegram-members": { name: "Telegram Members", outcome: "Broader community discovery for a public channel or group.", required: "Public Telegram channel or group link" },
  "tiktok-followers": { name: "TikTok Followers", outcome: "Expanded profile discovery and creator audience momentum.", required: "Public TikTok profile link" },
  "tiktok-likes": { name: "TikTok Likes", outcome: "More engagement discovery around a selected TikTok video.", required: "Public TikTok video link" },
  "tiktok-views": { name: "TikTok Views", outcome: "Wider discovery and visible reach for a selected video.", required: "Public TikTok video link" },
  "x-followers": { name: "Twitter/X Followers", outcome: "Broader profile discovery and stronger visible audience presence.", required: "Public Twitter/X profile link" },
};

const linkRules: Record<string, LinkRule> = {
  "instagram-followers": { label: "Paste Instagram profile link", placeholder: "https://instagram.com/yourprofile", helper: "Use the public URL for the profile you want to grow.", hosts: ["instagram.com"], error: "Enter a valid public Instagram profile link." },
  "instagram-likes": { label: "Paste Instagram post or reel link", placeholder: "https://instagram.com/reel/...", helper: "Use the exact public post or reel that should receive engagement.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "instagram-views": { label: "Paste Instagram post or reel link", placeholder: "https://instagram.com/reel/...", helper: "Use the exact public reel or video post you want people to discover.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "youtube-subscribers": { label: "Paste YouTube channel link", placeholder: "https://youtube.com/@yourchannel", helper: "Use your public channel URL, handle URL, or channel ID URL.", hosts: ["youtube.com"], pathHint: /\/(@|channel\/|c\/|user\/)/i, error: "Enter a valid public YouTube channel link." },
  "youtube-likes": { label: "Paste YouTube video link", placeholder: "https://youtube.com/watch?v=...", helper: "Use the exact public video or Short you want people to discover.", hosts: ["youtube.com", "youtu.be"], error: "Enter a valid public YouTube video link." },
  "youtube-views": { label: "Paste YouTube video link", placeholder: "https://youtube.com/watch?v=...", helper: "Use the exact public video or Short you want people to discover.", hosts: ["youtube.com", "youtu.be"], error: "Enter a valid public YouTube video link." },
  "facebook-followers": { label: "Paste Facebook page/profile link", placeholder: "https://facebook.com/yourpage", helper: "Use the public page or profile URL you want to grow.", hosts: ["facebook.com", "fb.com"], error: "Enter a valid public Facebook page or profile link." },
  "facebook-likes": { label: "Paste Facebook post/video link", placeholder: "https://facebook.com/yourpage/posts/...", helper: "Use the exact public Facebook post that should receive engagement.", hosts: ["facebook.com", "fb.watch"], error: "Enter a valid public Facebook post link." },
  "facebook-views": { label: "Paste Facebook post/video link", placeholder: "https://facebook.com/watch/?v=...", helper: "Use the exact public Facebook video you want people to discover.", hosts: ["facebook.com", "fb.watch"], error: "Enter a valid public Facebook video link." },
  "linkedin-followers": { label: "Paste LinkedIn profile/company page link", placeholder: "https://linkedin.com/in/your-profile", helper: "Use a public personal profile or company page URL.", hosts: ["linkedin.com"], pathHint: /\/(in|company)\//i, error: "Enter a valid LinkedIn profile or company page link." },
  "linkedin-likes": { label: "Paste LinkedIn post link", placeholder: "https://linkedin.com/posts/...", helper: "Use the exact public LinkedIn post that should receive engagement.", hosts: ["linkedin.com"], pathHint: /\/(posts|feed\/update)\//i, error: "Enter a valid public LinkedIn post link." },
  "telegram-members": { label: "Paste Telegram channel/group link", placeholder: "https://t.me/yourchannel", helper: "Use a public channel or group invite URL.", hosts: ["t.me", "telegram.me"], error: "Enter a valid public Telegram channel or group link." },
  "tiktok-followers": { label: "Paste TikTok profile link", placeholder: "https://tiktok.com/@yourprofile", helper: "Use the public profile URL for the creator account.", hosts: ["tiktok.com"], pathHint: /\/@[^/]+\/?$/i, error: "Enter a valid public TikTok profile link." },
  "tiktok-likes": { label: "Paste TikTok video link", placeholder: "https://tiktok.com/@username/video/...", helper: "Use the exact public TikTok video that should receive engagement.", hosts: ["tiktok.com"], pathHint: /\/video\//i, error: "Enter a valid public TikTok video link." },
  "tiktok-views": { label: "Paste TikTok video link", placeholder: "https://tiktok.com/@username/video/...", helper: "Use the exact public TikTok video you want people to discover.", hosts: ["tiktok.com"], pathHint: /\/video\//i, error: "Enter a valid public TikTok video link." },
  "x-followers": { label: "Paste Twitter/X profile link", placeholder: "https://x.com/yourprofile", helper: "Use the public profile URL and keep the handle unchanged during delivery.", hosts: ["x.com", "twitter.com"], error: "Enter a valid public Twitter/X profile link." },
};

const trustCards = [
  { title: "No password required", icon: LockKeyhole },
  { title: "Public link only", icon: LinkIcon },
  { title: "Safe gradual delivery", icon: ShieldCheck },
  { title: "Refill support", icon: BadgeCheck },
  { title: "Order tracking", icon: Activity },
  { title: "Support available", icon: Headphones },
] as const;

function readableOrderId(id: string) {
  const compact = id.replace(/-/g, "");
  const seed = Number.parseInt(compact.slice(0, 8), 16);
  return `SR-${String(Math.abs(seed % 900000) + 1000).padStart(4, "0")}`;
}

function cleanQuantity(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+(?=\d)/, "");
}

function validateCampaignLink(value: string, rule: LinkRule) {
  const trimmed = value.trim();
  if (!trimmed) return `${rule.label}.`;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const validHost = rule.hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
    if (!validHost || (rule.pathHint && !rule.pathHint.test(url.pathname))) return rule.error;
    return "";
  } catch {
    return rule.error;
  }
}

function growthMethod(service: SmmService) {
  if (service.platform === "linkedin") {
    return "Your campaign is prepared for professional audience discovery using relevant profile or post placements, opt-in engagement opportunities, gradual pacing, and manual quality checks.";
  }
  if (service.platform === "telegram") {
    return "Your public channel or group is introduced through community discovery placements and opt-in growth tasks, with gradual pacing and ongoing delivery checks.";
  }
  if (service.platform === "youtube") {
    return service.code.includes("subscribers")
      ? "Your channel receives structured discovery support through creator and community placements designed to help interested viewers find and explore your public channel."
      : "Your video receives discovery support through relevant content placements and opt-in engagement tasks, helping more people find the public video naturally.";
  }
  if (/(followers|subscribers|members)/.test(service.code)) {
    return "Your public profile is introduced through targeted discovery placements and opt-in community tasks. Delivery is paced gradually and checked for consistency.";
  }
  return "Your selected content is introduced through relevant discovery placements and opt-in engagement tasks. Delivery is paced gradually with manual quality checks.";
}

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = usePreferredCurrency("INR");

  const initialCode = searchParams.get("service") ?? "instagram-followers";
  const initialService = visibleServices.find((service) => service.code === initialCode) ?? visibleServices[0];
  const [platform, setPlatform] = useState<PlatformId>(initialService.platform);
  const [serviceCode, setServiceCode] = useState(initialService.code);
  const [quantityInput, setQuantityInput] = useState(() => cleanQuantity(searchParams.get("quantity") || ""));
  const [targetLink, setTargetLink] = useState(searchParams.get("link") ?? "");
  const [notes, setNotes] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState(false);
  const [successOrder, setSuccessOrder] = useState<ApiOrderData | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef("");

  const servicesForPlatform = useMemo(
    () => visibleServices.filter((service) => service.platform === platform),
    [platform],
  );
  const selectedService = useMemo(
    () => visibleServices.find((service) => service.code === serviceCode) ?? servicesForPlatform[0],
    [serviceCode, servicesForPlatform],
  );
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
  const linkRule = linkRules[selectedService.code];
  const experience = serviceExperience[selectedService.code];
  const currentLinkError = targetLink.trim() ? validateCampaignLink(targetLink, linkRule) : "";

  const loadWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWalletBalance(0);
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

  function choosePlatform(nextPlatform: PlatformId) {
    const firstService = visibleServices.find((service) => service.platform === nextPlatform);
    setPlatform(nextPlatform);
    if (firstService) setServiceCode(firstService.code);
    setQuantityInput("");
    setTargetLink("");
    setError("");
  }

  function chooseService(nextService: SmmService) {
    setServiceCode(nextService.code);
    setPlatform(nextService.platform);
    setQuantityInput("");
    setTargetLink("");
    setError("");
  }

  function openConfirmation() {
    setError("");
    if (quantityError) {
      setError(quantityError);
      return;
    }
    const validationError = validateCampaignLink(targetLink, linkRule);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (walletLoading || walletBalance === null) {
      setError("Your wallet balance is still being checked. Please try again.");
      return;
    }
    if (!hasEnoughWallet) {
      setError("Your wallet balance is lower than this campaign total.");
      return;
    }
    setConfirmedDetails(false);
    setConfirmOpen(true);
  }

  async function confirmOrder() {
    if (inFlight.current || submitting) return;
    if (!confirmedDetails) {
      setError("Please confirm the campaign details before placing your order.");
      return;
    }
    if (!hasEnoughWallet) {
      setError("Your wallet balance is lower than this campaign total.");
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
    setError("");
    if (!requestId.current) requestId.current = crypto.randomUUID();

    const payload = {
      serviceCode,
      serviceId: 0,
      quantity,
      link: targetLink.trim(),
      requestId: requestId.current,
      notes: notes.trim() || null,
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
        setError(result.error || "Unable to place your campaign right now.");
        setSubmitting(false);
        inFlight.current = false;
        return;
      }
      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      setSuccessOrder(result.data);
      setConfirmOpen(false);
      setSubmitting(false);
      inFlight.current = false;
      requestId.current = "";
    } catch {
      setError("Unable to place your campaign right now.");
      setSubmitting(false);
      inFlight.current = false;
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[radial-gradient(circle_at_0%_0%,#dbe8ff_0%,transparent_34%),radial-gradient(circle_at_100%_0%,#e5f8ff_0%,transparent_36%),radial-gradient(circle_at_50%_100%,#ffe9e2_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 pb-48 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute bottom-6 left-1/3 h-64 w-64 rounded-full bg-orange-100/45 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1550px]">
        <section className="relative overflow-hidden rounded-[1.6rem] border border-white/75 bg-white/65 p-5 shadow-[0_30px_80px_-38px_rgba(15,23,42,.5)] backdrop-blur-2xl sm:p-8">
          <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-pink-200/55 via-violet-200/40 to-cyan-200/55 blur-2xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
                <Sparkles className="h-3.5 w-3.5" /> Campaign Builder
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2b61] sm:text-5xl">
                Create Your Growth Campaign
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#536d9d] sm:text-base">
                Choose your platform, select a growth package, add your link, and track your order from your dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-[0_20px_44px_-28px_rgba(15,23,42,.38)]">
              {[
                ["1", "Platform"],
                ["2", "Service"],
                ["3", "Quantity"],
                ["4", "Campaign link"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-2xl border border-[#e1eaff] bg-white/85 p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-[10px] font-black text-white">{number}</span>
                  <p className="mt-2 text-xs font-bold text-[#335389]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <BuilderSection step="Step 1" title="Choose your platform" description="Select the social platform where you want to run this campaign.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
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
                      className={`min-w-0 rounded-2xl border p-3 text-left shadow-[0_18px_38px_-28px_rgba(15,23,42,.5)] transition sm:p-4 ${
                        active ? "border-transparent bg-white ring-2 ring-[#8ea9ff]" : "border-white/85 bg-white/72 hover:border-[#cbdcff]"
                      }`}
                    >
                      <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${meta.gradient} text-xs font-black text-white shadow-lg`}>{meta.short}</span>
                      <span className="mt-3 block truncate text-xs font-black text-[#1c3a71]">{meta.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </BuilderSection>

            <BuilderSection step="Step 2" title="Choose a growth service" description="Review the campaign outcome, required public link, delivery, and support before selecting.">
              <div className="grid gap-4 lg:grid-cols-2">
                {servicesForPlatform.map((service) => {
                  const selected = service.code === selectedService.code;
                  const copy = serviceExperience[service.code];
                  return (
                    <motion.button
                      key={service.code}
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => chooseService(service)}
                      className={`min-w-0 rounded-3xl border p-5 text-left shadow-[0_22px_48px_-32px_rgba(15,23,42,.5)] transition ${
                        selected ? "border-transparent bg-white ring-2 ring-[#8ea9ff]" : "border-white/85 bg-white/76 hover:border-[#cbdcff]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${platformMeta[service.platform].gradient} text-xs font-black text-white shadow-lg`}>
                          {platformMeta[service.platform].short}
                        </span>
                        {selected ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-700"><Check className="h-3 w-3" /> Selected</span> : null}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-[#14316a]">{copy.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#526d9f]">{service.description}</p>
                      <div className="mt-4 space-y-2 rounded-2xl border border-[#e1eaff] bg-[#f8fbff] p-4 text-xs leading-5 text-[#506b9e]">
                        <p><b className="text-[#24457f]">What you get:</b> {copy.outcome}</p>
                        <p><b className="text-[#24457f]">Required link:</b> {copy.required}</p>
                        <p><b className="text-[#24457f]">Delivery:</b> {service.deliveryTime}</p>
                        <p><b className="text-[#24457f]">Coverage:</b> {service.refillPolicy}</p>
                      </div>
                      <p className="mt-4 text-xs leading-6 text-[#6079a7]">{discoveryStatement}</p>
                    </motion.button>
                  );
                })}
              </div>
            </BuilderSection>

            <BuilderSection step="Step 3" title="Enter campaign quantity" description="Choose the campaign size you need. Your total updates automatically as you type.">
              <div className="max-w-xl rounded-3xl border border-white/85 bg-white/80 p-4 shadow-[0_20px_44px_-30px_rgba(15,23,42,.45)] sm:p-5">
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
                </label>
                {quantityError ? <p className="mt-3 text-xs font-bold text-rose-600">{quantityError}</p> : <p className="mt-3 text-xs font-semibold text-emerald-700">Your campaign total is ready and shown in the order summary.</p>}
              </div>
            </BuilderSection>

            <BuilderSection step="Step 4" title="Add your campaign link" description="We only need the public destination for the selected campaign.">
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
              </label>
              <p className="mt-3 text-xs leading-6 text-[#5872a4]">{linkRule.helper}</p>
              <p className="mt-1 text-xs font-semibold leading-6 text-[#36578f]">Make sure your account, post, video, page, or channel is public during delivery.</p>
              {currentLinkError ? <p className="mt-2 text-xs font-bold text-rose-600">{currentLinkError}</p> : null}

              <label className="mt-5 block text-sm font-black text-[#294981]">
                Campaign notes <span className="font-medium text-[#7890bb]">(optional)</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Add any useful context for the support team."
                  className="mt-2 w-full resize-y rounded-2xl border border-[#d4e1ff] bg-white/95 px-4 py-3 text-base text-[#17366f] outline-none transition focus:border-[#8faeff] focus:ring-4 focus:ring-[#dce7ff]"
                />
              </label>
            </BuilderSection>

            <section className="rounded-3xl border border-white/85 bg-white/70 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">How We Grow Your Campaign</p>
              <h2 className="mt-2 text-xl font-black text-[#14316a]">{experience.name} campaign method</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${platformMeta[selectedService.platform].gradient} text-sm font-black text-white shadow-lg`}>
                  {platformMeta[selectedService.platform].short}
                </span>
                <div>
                  <p className="text-sm leading-7 text-[#506b9e]">{growthMethod(selectedService)}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {["Targeted discovery", "Gradual delivery", "Manual quality checks"].map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-xl border border-[#dce7ff] bg-[#f8fbff] px-3 py-2 text-xs font-bold text-[#426097]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {trustCards.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/85 bg-white/76 p-4 shadow-[0_18px_38px_-28px_rgba(15,23,42,.45)] backdrop-blur-xl">
                  <item.icon className="h-5 w-5 text-[#5270aa]" />
                  <p className="mt-3 text-xs font-black leading-5 text-[#24457f]">{item.title}</p>
                </article>
              ))}
            </section>

            {error ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p> : null}
            {successOrder ? (
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                  <div>
                    <h2 className="text-xl font-black text-emerald-700">Campaign created successfully</h2>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">Order ID: {readableOrderId(successOrder.id)}</p>
                    <p className="mt-2 text-sm text-emerald-800">You can follow delivery progress from your order history.</p>
                    <Link href="/dashboard/orders" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">View order</Link>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="hidden h-fit xl:sticky xl:top-24 xl:block">
            <OrderSummary
              platform={platformMeta[selectedService.platform].label}
              service={experience.name}
              quantity={quantity}
              delivery={selectedService.deliveryTime}
              total={totalLabel}
              wallet={walletLabel}
              walletLoading={walletLoading}
              walletError={walletError}
              hasEnoughWallet={hasEnoughWallet}
              canCheckout={!quantityError}
              onCheckout={openConfirmation}
            />
          </aside>
        </div>
      </div>

      <section className="fixed inset-x-3 bottom-[4.75rem] z-40 rounded-2xl border border-white/80 bg-white/92 p-3 shadow-[0_18px_50px_rgba(15,23,42,.28)] backdrop-blur-2xl xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#6079aa]">{experience.name}</p>
            <p className="mt-1 text-lg font-black text-[#17366f]">{totalLabel}</p>
            <p className="truncate text-[10px] text-[#6b82ac]">Quantity: {quantity > 0 ? quantity.toLocaleString("en-IN") : "Not entered"} · {selectedService.deliveryTime}</p>
            <p className="truncate text-[10px] text-[#6b82ac]">Wallet: {walletLabel}</p>
          </div>
          {!walletLoading && walletBalance !== null && totalPrice > 0 && !hasEnoughWallet ? (
            <Link href="/dashboard/wallet" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 py-3 text-xs font-black text-white shadow-lg">Add Funds</Link>
          ) : (
            <button
              type="button"
              disabled={walletLoading || !hasEnoughWallet || Boolean(quantityError)}
              onClick={openConfirmation}
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-3 text-xs font-black text-white shadow-lg disabled:opacity-50"
            >
              Place Order Securely
            </button>
          )}
        </div>
      </section>

      <AnimatePresence>
        {confirmOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_36px_80px_-30px_rgba(15,23,42,.72)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6079aa]">Final review</p>
                  <h2 className="mt-2 text-xl font-black text-[#17366f]">Confirm your campaign</h2>
                </div>
                <button type="button" onClick={() => setConfirmOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">×</button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                {[
                  ["Platform", platformMeta[selectedService.platform].label],
                  ["Service", experience.name],
                  ["Quantity", quantity.toLocaleString("en-IN")],
                  ["Delivery", selectedService.deliveryTime],
                  ["Total", totalLabel],
                  ["Wallet", walletLabel],
                  ["Public link", targetLink.trim()],
                ].map(([label, value]) => (
                  <div key={label} className={`rounded-xl bg-[#f7faff] p-3 ${label === "Public link" ? "col-span-2" : ""}`}>
                    <p className="text-[#7590bb]">{label}</p>
                    <p className="mt-1 break-words font-black text-[#26477f]">{value}</p>
                  </div>
                ))}
              </div>
              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-4 text-sm font-semibold leading-6 text-[#35548d]">
                <input type="checkbox" checked={confirmedDetails} onChange={(event) => setConfirmedDetails(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />
                I reviewed the public link, package, campaign size, and wallet total.
              </label>
              {error ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setConfirmOpen(false)} className="min-h-12 rounded-xl border border-[#d6e3ff] bg-white px-5 py-3 text-sm font-bold text-[#1e3d77]">Go back</button>
                <button type="button" onClick={confirmOrder} disabled={submitting || !confirmedDetails} className="min-h-12 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white disabled:opacity-50">
                  {submitting ? "Creating campaign..." : "Place Order Securely"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function BuilderSection({ step, title, description, children }: { step: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.4 }} className="rounded-3xl border border-white/85 bg-white/68 p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">{step}</p>
      <h2 className="mt-2 text-xl font-black text-[#14316a] sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6079a7]">{description}</p>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function OrderSummary({
  platform,
  service,
  quantity,
  delivery,
  total,
  wallet,
  walletLoading,
  walletError,
  hasEnoughWallet,
  canCheckout,
  onCheckout,
}: {
  platform: string;
  service: string;
  quantity: number;
  delivery: string;
  total: string;
  wallet: string;
  walletLoading: boolean;
  walletError: string | null;
  hasEnoughWallet: boolean;
  canCheckout: boolean;
  onCheckout: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/85 bg-white/88 p-6 shadow-[0_30px_70px_-38px_rgba(15,23,42,.55)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6079aa]">Order summary</p>
          <h2 className="mt-2 text-xl font-black text-[#14316a]">Campaign overview</h2>
        </div>
        <Wallet className="h-6 w-6 text-[#5270aa]" />
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        {[
          ["Platform", platform],
          ["Service", service],
          ["Quantity", quantity > 0 ? quantity.toLocaleString("en-IN") : "Not entered"],
          ["Delivery", delivery],
        ].map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 rounded-xl border border-[#e1eaff] bg-[#f8fbff] px-3 py-2.5">
            <dt className="text-[#6079a7]">{label}</dt>
            <dd className="max-w-[62%] break-words text-right font-black text-[#294981]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-2xl border border-[#dce7ff] bg-white p-4">
        <div className="flex justify-between gap-3 text-sm"><span className="text-[#6079a7]">Wallet balance</span><b className="text-[#17366f]">{wallet}</b></div>
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#e1eaff] pt-3"><span className="text-sm font-semibold text-[#6079a7]">Total price</span><b className="text-2xl text-[#17366f]">{total}</b></div>
      </div>
      {walletError ? <p className="mt-3 text-xs font-semibold leading-5 text-amber-700">{walletError}</p> : null}
      {!walletLoading && !hasEnoughWallet ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold text-amber-800">Your wallet balance is lower than this campaign total.</p>
          <Link href="/dashboard/wallet" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white">Add Funds</Link>
        </div>
      ) : null}
      <button type="button" disabled={walletLoading || !hasEnoughWallet || !canCheckout} onClick={onCheckout} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.65)] disabled:opacity-50">
        Place Order Securely
      </button>
      <p className="mt-4 text-center text-[10px] font-semibold leading-5 text-[#7890ba]">{getCurrencyDisclaimer()}</p>
    </div>
  );
}
