"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Link2, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import { type Dispatch, type MouseEvent, type RefObject, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { bigPackages, type BigPackage } from "@/lib/big-packages";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import HowToOrderSection from "@/components/marketing/HowToOrderSection";
import { createClient } from "@/lib/supabase/client";
import { linkRules, type LinkRule, validateCampaignLink } from "@/lib/order-service-experience";

type Platform = BigPackage["platform"];
type Service = BigPackage["service"];

const platforms: Array<{ key: Platform; label: string }> = [
  { key: "Instagram", label: "Instagram" },
  { key: "YouTube", label: "YouTube" },
  { key: "Facebook", label: "Facebook" },
  { key: "LinkedIn", label: "LinkedIn" },
  { key: "Telegram", label: "Telegram" },
  { key: "TikTok", label: "TikTok" },
  { key: "X", label: "X / Twitter" },
];

const serviceLabels: Record<Service, string> = {
  followers: "Followers",
  subscribers: "Subscribers",
  likes: "Likes",
  views: "Views",
  members: "Members",
};

const serviceOrder: Service[] = ["followers", "subscribers", "likes", "views", "members"];
const serviceDescriptions: Record<Service, string> = {
  followers: "Compare profile growth packages with clear pricing, delivery estimates and eligible support.",
  subscribers: "Compare channel subscriber packages with transparent pricing, delivery estimates and support.",
  likes: "Compare engagement packages for public posts or videos with clear pricing and delivery details.",
  views: "Compare content view packages for public posts, Reels or videos with transparent totals.",
  members: "Compare community member packages with clear quantity, delivery and support details.",
};
const trustBadges = ["Secure Wallet Checkout", "Instant Order Sync", "24x7 Support", "Delivery Tracking"] as const;
const PENDING_PACKAGE_ORDER_KEY = "socialrush.packages.pending-order.v1";

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
};

const platformCode: Record<Platform, string> = {
  Instagram: "instagram",
  YouTube: "youtube",
  Facebook: "facebook",
  LinkedIn: "linkedin",
  Telegram: "telegram",
  TikTok: "tiktok",
  X: "x",
};
const relatedGuideMap: Partial<Record<`${Platform}:${Service}`, Array<readonly [string, string]>>> = {
  "Instagram:followers": [["Instagram Followers Guide", "/buy-instagram-followers-india"]],
  "Instagram:likes": [["Instagram Likes Guide", "/instagram-likes"]],
  "Instagram:views": [["Instagram Views Guide", "/instagram-views"]],
  "YouTube:subscribers": [["YouTube Subscribers Guide", "/youtube-subscribers"]],
  "YouTube:likes": [["YouTube Likes Guide", "/youtube-likes"]],
  "YouTube:views": [["YouTube Views Guide", "/youtube-views"]],
  "Facebook:followers": [["Facebook Followers Guide", "/facebook-followers"]],
  "LinkedIn:followers": [["LinkedIn Followers Guide", "/linkedin-followers"]],
  "Telegram:members": [["Telegram Members Guide", "/telegram-members"]],
  "X:followers": [["Twitter/X Followers Guide", "/twitter-followers"]],
};

const packageSeoFaqs = [
  {
    question: "What are SocialRUSH social media growth packages?",
    answer:
      "SocialRUSH packages combine platform, service type, quantity, delivery estimate and price so customers can compare Instagram, YouTube, Facebook and other social growth options before checkout.",
  },
  {
    question: "Can I compare packages before placing an order?",
    answer:
      "Yes. Select a platform and service type to compare package quantity, price, delivery time and best-for notes before opening the checkout page.",
  },
  {
    question: "Are package prices shown before payment?",
    answer:
      "Yes. The selected package price and order details are shown before checkout so you can review the total before confirming.",
  },
] as const;

const platformParamMap: Record<string, Platform> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  tiktok: "TikTok",
  x: "X",
  twitter: "X",
  "twitter-x": "X",
  "x-twitter": "X",
  "twitter/x": "X",
  "x/twitter": "X",
};

const serviceParamMap: Record<string, Service> = {
  follower: "followers",
  followers: "followers",
  subscriber: "subscribers",
  subscribers: "subscribers",
  like: "likes",
  likes: "likes",
  view: "views",
  views: "views",
  member: "members",
  members: "members",
};

function normalizeParam(value: string | null) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function platformFromParam(value: string | null): Platform | null {
  const normalized = normalizeParam(value).replace(/-\/-/g, "/").replace(/\/+/g, "/");
  return platformParamMap[normalized] ?? platformParamMap[normalized.replace(/\//g, "-")] ?? null;
}

function getFirstServiceForPlatform(platform: Platform): Service {
  return (
    serviceOrder.find((candidate) =>
      bigPackages.some((pkg) => pkg.platform === platform && pkg.service === candidate),
    ) ?? "followers"
  );
}

function getStartingPrice(platform: Platform, service: Service) {
  const prices = bigPackages
    .filter((pkg) => pkg.platform === platform && pkg.service === service)
    .map((pkg) => pkg.basePriceINR);
  return prices.length ? Math.min(...prices) : null;
}

function serviceFromParam(value: string | null, platform: Platform): Service | null {
  const normalized = normalizeParam(value).split("-").pop() || "";
  const service = serviceParamMap[normalized] ?? serviceParamMap[normalizeParam(value)];
  if (service && bigPackages.some((pkg) => pkg.platform === platform && pkg.service === service)) {
    return service;
  }

  return null;
}

function platformFromServiceParam(value: string | null): Platform | null {
  const normalized = normalizeParam(value);
  if (normalized.startsWith("instagram")) return "Instagram";
  if (normalized.startsWith("youtube")) return "YouTube";
  if (normalized.startsWith("facebook")) return "Facebook";
  if (normalized.startsWith("linkedin")) return "LinkedIn";
  if (normalized.startsWith("telegram")) return "Telegram";
  if (normalized.startsWith("tiktok")) return "TikTok";
  if (normalized.startsWith("twitter") || normalized.startsWith("x-")) return "X";
  return null;
}

function getServiceCode(pkg: BigPackage) {
  return `${platformCode[pkg.platform]}-${pkg.service}`;
}

const packageLinkCopy: Record<string, Partial<Pick<LinkRule, "label" | "placeholder" | "helper">>> = {
  "instagram-followers": {
    label: "Enter your public Instagram profile link",
    placeholder: "https://instagram.com/yourprofile",
    helper: "Use the public Instagram profile URL for this package.",
  },
  "instagram-likes": {
    label: "Enter the public Instagram post or Reel link",
    placeholder: "https://instagram.com/p/...",
    helper: "Use the exact public Instagram post or Reel URL for this package.",
  },
  "instagram-views": {
    label: "Enter the public Instagram post or Reel link",
    placeholder: "https://instagram.com/reel/...",
    helper: "Use the exact public Instagram post or Reel URL for this package.",
  },
  "youtube-subscribers": {
    label: "Enter your public YouTube channel link",
    placeholder: "https://youtube.com/@yourchannel",
    helper: "Use your public YouTube channel, handle, or channel ID URL.",
  },
  "youtube-likes": {
    label: "Enter the public YouTube video link",
    placeholder: "https://youtube.com/watch?v=...",
    helper: "Use the exact public YouTube video URL for this package.",
  },
  "youtube-views": {
    label: "Enter the public YouTube video link",
    placeholder: "https://youtube.com/watch?v=...",
    helper: "Use the exact public YouTube video URL for this package.",
  },
  "facebook-followers": {
    label: "Enter your public Facebook page or profile link",
    placeholder: "https://facebook.com/yourpage",
    helper: "Use the public Facebook page or profile URL for this package.",
  },
  "linkedin-followers": {
    label: "Enter your public LinkedIn profile or company-page link",
    placeholder: "https://linkedin.com/in/your-profile",
    helper: "Use a public LinkedIn profile or company page URL.",
  },
  "x-followers": {
    label: "Enter your public X/Twitter profile link",
    placeholder: "https://x.com/yourprofile",
    helper: "Use the public X/Twitter profile URL for this package.",
  },
  "telegram-members": {
    label: "Enter the public Telegram group or channel link",
    placeholder: "https://t.me/yourchannel",
    helper: "Use the public Telegram group or channel URL for this package.",
  },
};

function getPackageLinkRule(pkg: BigPackage): LinkRule | null {
  const code = getServiceCode(pkg);
  const baseRule = linkRules[code];
  if (!baseRule) return null;
  return { ...baseRule, ...packageLinkCopy[code] };
}

function getPackageUrl(pkg: BigPackage) {
  const params = new URLSearchParams({
    platform: platformCode[pkg.platform],
    service: pkg.service,
    package: pkg.packageId,
  });
  return `/packages?${params.toString()}`;
}

function trackPackageEvent(event: string, detail: Record<string, string | number | boolean | null> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...detail };
  const analyticsWindow = window as unknown as {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (type: string, name: string, params?: Record<string, unknown>) => void;
  };
  analyticsWindow.dataLayer?.push(payload);
  analyticsWindow.gtag?.("event", event, detail);
}

function withTimeout<T>(request: PromiseLike<T>, timeoutMs = 7000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Wallet request timed out.")), timeoutMs);
    Promise.resolve(request).then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (reason) => {
        window.clearTimeout(timeout);
        reject(reason);
      },
    );
  });
}

type PackagesPageContentProps = {
  initialPlatformParam?: string;
  initialServiceParam?: string;
  initialPackageIdParam?: string;
};

export default function PackagesPageContent({
  initialPlatformParam,
  initialServiceParam,
  initialPackageIdParam,
}: PackagesPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currency } = usePreferredCurrency("INR");
  const initialPlatformFromService = platformFromServiceParam(initialServiceParam ?? null);
  const initialPlatformFromParam = platformFromParam(initialPlatformParam ?? null);
  const initialPlatform = initialPlatformFromParam ?? initialPlatformFromService ?? "Instagram";
  const initialServiceFromParam = serviceFromParam(initialServiceParam ?? null, initialPlatform);
  const initialHasPlatformSelection = Boolean(initialPlatformFromParam || initialPlatformFromService);
  const initialHasServiceSelection = Boolean(initialServiceFromParam);
  const initialService = initialServiceFromParam ?? getFirstServiceForPlatform(initialPlatform);
  const initialPackageId = initialPackageIdParam || "";
  const initialPackage = bigPackages.find(
    (pkg) =>
      initialHasServiceSelection &&
      pkg.packageId === initialPackageId &&
      pkg.platform === initialPlatform &&
      pkg.service === initialService,
  );
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(initialPlatform);
  const [hasPlatformSelection, setHasPlatformSelection] = useState(initialHasPlatformSelection || Boolean(initialPackage));
  const [hasServiceSelection, setHasServiceSelection] = useState(initialHasServiceSelection || Boolean(initialPackage));
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage?.packageId ?? "");
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [targetLink, setTargetLink] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletLoadError, setWalletLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showLinkError, setShowLinkError] = useState(false);
  const [summaryInView, setSummaryInView] = useState(false);
  const packageStepRef = useRef<HTMLElement>(null);
  const platformStepRef = useRef<HTMLElement>(null);
  const serviceHeadingRef = useRef<HTMLHeadingElement>(null);
  const packageHeadingRef = useRef<HTMLHeadingElement>(null);
  const summaryStepRef = useRef<HTMLElement>(null);
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestIdRef = useRef("");

  const services = useMemo(
    () =>
      serviceOrder.filter((service) =>
        bigPackages.some((pkg) => pkg.platform === selectedPlatform && pkg.service === service),
      ),
    [selectedPlatform],
  );
  const [selectedService, setSelectedService] = useState<Service>(initialService);
  const activeService = services.includes(selectedService) ? selectedService : services[0];
  const selectedPackage = useMemo(
    () => bigPackages.find((pkg) => pkg.packageId === selectedPackageId),
    [selectedPackageId],
  );
  const relatedGuides = hasServiceSelection ? relatedGuideMap[`${selectedPlatform}:${activeService}`] ?? [] : [];
  const linkRule = selectedPackage ? getPackageLinkRule(selectedPackage) : null;
  const currentLinkError = linkRule && (targetLink.trim() || showLinkError) ? validateCampaignLink(targetLink, linkRule) : "";
  const canSubmitLink = Boolean(selectedPackage && targetLink.trim() && !currentLinkError);
  const hasEnoughBalance = Boolean(
    selectedPackage &&
      isLoggedIn &&
      walletBalance !== null &&
      walletBalance + 0.0001 >= selectedPackage.basePriceINR,
  );
  const amountNeeded = selectedPackage && walletBalance !== null
    ? Math.max(0, Math.round((selectedPackage.basePriceINR - walletBalance) * 100) / 100)
    : 0;
  const packageUrl = selectedPackage ? getPackageUrl(selectedPackage) : "";
  const currentStepAnnouncement = selectedPackage
    ? "Step 4 active: review your package."
    : hasServiceSelection
      ? "Step 3 active: choose a package."
      : hasPlatformSelection
        ? "Step 2 active: choose a service."
        : "Step 1 active: select a platform.";

  const updatePackageUrl = useCallback(
    (platform: Platform, service?: Service, packageId?: string, mode: "push" | "replace" = "push") => {
      const params = new URLSearchParams({
        platform: platformCode[platform],
      });
      if (service) params.set("service", service);
      if (packageId) params.set("package", packageId);
      const nextUrl = `${pathname}?${params.toString()}`;
      if (mode === "replace") router.replace(nextUrl, { scroll: false });
      else router.push(nextUrl, { scroll: false });
    },
    [pathname, router],
  );

  const refreshWalletBalance = useCallback(async () => {
    const supabase = createClient();
    setIsAuthLoading(true);
    setWalletLoadError("");
    try {
      const {
        data: { user },
        error: authError,
      } = await withTimeout(supabase.auth.getUser());

      if (authError) {
        setIsLoggedIn(false);
        setWalletBalance(null);
        setWalletLoadError("Could not load wallet balance. Please refresh.");
        return;
      }

      setIsLoggedIn(Boolean(user));
      if (!user) {
        setWalletBalance(null);
        return;
      }

      const { data: profile, error: profileError } = await withTimeout(
        supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(),
      );

      if (profileError) {
        setWalletBalance(null);
        setWalletLoadError("Could not load wallet balance. Please refresh.");
        return;
      }

      setWalletBalance(Number(profile?.balance ?? 0));
    } catch {
      setWalletBalance(null);
      setWalletLoadError("Could not load wallet balance. Please refresh.");
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const nextPlatformFromService = platformFromServiceParam(initialServiceParam ?? null);
    const nextPlatformFromParam = platformFromParam(initialPlatformParam ?? null);
    const nextPlatform = nextPlatformFromParam ?? nextPlatformFromService ?? "Instagram";
    const nextServiceFromParam = serviceFromParam(initialServiceParam ?? null, nextPlatform);
    const nextHasPlatformSelection = Boolean(nextPlatformFromParam || nextPlatformFromService);
    const nextHasServiceSelection = Boolean(nextServiceFromParam);
    const nextService = nextServiceFromParam ?? getFirstServiceForPlatform(nextPlatform);
    const nextPackage = bigPackages.find(
      (pkg) =>
        nextHasServiceSelection &&
        pkg.packageId === (initialPackageIdParam || "") &&
        pkg.platform === nextPlatform &&
        pkg.service === nextService,
    );

    setSelectedPlatform(nextPlatform);
    setHasPlatformSelection(nextHasPlatformSelection || Boolean(nextPackage));
    setHasServiceSelection(nextHasServiceSelection || Boolean(nextPackage));
    setSelectedService(nextService);
    setSelectedPackageId(nextPackage?.packageId ?? "");
    setShowAllPackages(false);
  }, [initialPackageIdParam, initialPlatformParam, initialServiceParam]);

  useEffect(() => {
    void refreshWalletBalance();

    const handleBalanceUpdate = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) {
        setWalletBalance(value);
        setWalletLoadError("");
        setIsAuthLoading(false);
        setIsLoggedIn(true);
      }
    };

    window.addEventListener("wallet-balance-updated", handleBalanceUpdate);
    return () => window.removeEventListener("wallet-balance-updated", handleBalanceUpdate);
  }, [refreshWalletBalance]);

  useEffect(() => {
    if (!selectedPackage) return;
    const raw = window.localStorage.getItem(PENDING_PACKAGE_ORDER_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { packageId?: string; targetLink?: string };
      if (pending.packageId === selectedPackage.packageId && pending.targetLink) {
        setTargetLink(pending.targetLink);
      }
    } catch {
      // Ignore malformed local package state.
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (!selectedPackage) return;
    window.localStorage.setItem(
      PENDING_PACKAGE_ORDER_KEY,
      JSON.stringify({
        packageId: selectedPackage.packageId,
        targetLink: targetLink.trim(),
      }),
    );
  }, [selectedPackage, targetLink]);

  useEffect(() => {
    if (!selectedPackage || !summaryStepRef.current) {
      setSummaryInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setSummaryInView(Boolean(entry?.isIntersecting)),
      { rootMargin: "0px", threshold: 0.01 },
    );
    observer.observe(summaryStepRef.current);
    return () => observer.disconnect();
  }, [selectedPackage]);

  function selectPlatform(platform: Platform) {
    setSelectedPlatform(platform);
    setHasPlatformSelection(true);
    setHasServiceSelection(false);
    setSelectedPackageId("");
    setTargetLink("");
    setError("");
    setSuccessMessage("");
    setShowLinkError(false);
    requestIdRef.current = "";
    setShowAllPackages(false);
    const firstService = serviceOrder.find((service) =>
      bigPackages.some((pkg) => pkg.platform === platform && pkg.service === service),
    );
    if (firstService) {
      setSelectedService(firstService);
      updatePackageUrl(platform);
    }
    trackPackageEvent("package_platform_selected", { platform: platformCode[platform] });
    window.requestAnimationFrame(() => {
      packageStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => serviceHeadingRef.current?.focus(), 450);
    });
  }

  function selectService(service: Service) {
    setHasPlatformSelection(true);
    setHasServiceSelection(true);
    setSelectedService(service);
    setSelectedPackageId("");
    setTargetLink("");
    setError("");
    setSuccessMessage("");
    setShowLinkError(false);
    requestIdRef.current = "";
    setShowAllPackages(false);
    updatePackageUrl(selectedPlatform, service);
    trackPackageEvent("package_service_selected", {
      platform: platformCode[selectedPlatform],
      service,
    });
    window.requestAnimationFrame(() => {
      packageHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => packageHeadingRef.current?.focus(), 450);
    });
  }

  function changeService() {
    setHasPlatformSelection(true);
    setHasServiceSelection(false);
    setSelectedPackageId("");
    setTargetLink("");
    setError("");
    setSuccessMessage("");
    setShowLinkError(false);
    requestIdRef.current = "";
    setShowAllPackages(false);
    updatePackageUrl(selectedPlatform);
    window.requestAnimationFrame(() => {
      packageStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => serviceHeadingRef.current?.focus(), 450);
    });
  }

  function selectPackage(pkg: BigPackage) {
    setSelectedPlatform(pkg.platform);
    setHasPlatformSelection(true);
    setHasServiceSelection(true);
    setSelectedService(pkg.service);
    setSelectedPackageId(pkg.packageId);
    setError("");
    setSuccessMessage("");
    setShowLinkError(false);
    setShowAllPackages(false);
    requestIdRef.current = "";
    updatePackageUrl(pkg.platform, pkg.service, pkg.packageId);
    trackPackageEvent("package_selected", {
      packageId: pkg.packageId,
      platform: platformCode[pkg.platform],
      service: pkg.service,
    });
    window.requestAnimationFrame(() => {
      summaryStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => summaryHeadingRef.current?.focus(), 450);
      trackPackageEvent("package_summary_viewed", { packageId: pkg.packageId });
    });
  }

  function changePackage() {
    setSelectedPackageId("");
    setHasPlatformSelection(true);
    setHasServiceSelection(true);
    setError("");
    setSuccessMessage("");
    setShowLinkError(false);
    requestIdRef.current = "";
    updatePackageUrl(selectedPlatform, activeService);
    window.requestAnimationFrame(() => {
      packageHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => packageHeadingRef.current?.focus(), 450);
    });
  }

  function persistPendingPackageOrder() {
    if (selectedPackage) {
      window.localStorage.setItem(
        PENDING_PACKAGE_ORDER_KEY,
        JSON.stringify({ packageId: selectedPackage.packageId, targetLink: targetLink.trim() }),
      );
    }
  }

  function requireValidPublicLink() {
    setSuccessMessage("");
    setShowLinkError(true);
    if (!selectedPackage || !linkRule) return false;

    const validationError = validateCampaignLink(targetLink, linkRule);
    if (validationError) {
      setError("Please enter a valid public link before continuing.");
      return false;
    }

    setError("");
    return true;
  }

  function getLoginHref() {
    return `/login?next=${encodeURIComponent(packageUrl || "/packages")}`;
  }

  function getAddFundsHref() {
    if (!selectedPackage) return "/dashboard/wallet";
    return `/dashboard/wallet?amount=${encodeURIComponent(String(amountNeeded))}&returnTo=${encodeURIComponent(packageUrl)}`;
  }

  async function placeOrder() {
    setError("");
    setSuccessMessage("");
    if (!selectedPackage || !linkRule || submitting) return;

    const validationError = validateCampaignLink(targetLink, linkRule);
    if (validationError) {
      setShowLinkError(true);
      setError(validationError);
      return;
    }

    if (!isLoggedIn) {
      persistPendingPackageOrder();
      trackPackageEvent("package_login_clicked", { packageId: selectedPackage.packageId });
      router.push(getLoginHref());
      return;
    }

    if (isAuthLoading || walletBalance === null) {
      setError("Your wallet balance is still being checked. Please try again.");
      return;
    }

    if (walletBalance + 0.0001 < selectedPackage.basePriceINR) {
      setError("Your wallet balance is lower than this package total. Please add funds to continue.");
      return;
    }

    const fallbackPrice = Math.round((selectedPackage.basePriceINR / (selectedPackage.quantity / 1000)) * 10000) / 10000;
    if (!requestIdRef.current) requestIdRef.current = crypto.randomUUID();
    const payload = {
      serviceCode: getServiceCode(selectedPackage),
      serviceId: 0,
      quantity: selectedPackage.quantity,
      link: targetLink.trim(),
      requestId: requestIdRef.current,
      notes: null,
      fallbackPrice,
      fallbackName: `${selectedPackage.platform === "X" ? "X / Twitter" : selectedPackage.platform} ${serviceLabels[selectedPackage.service]}`,
      fallbackPlatform: platformCode[selectedPackage.platform],
      fallbackMin: selectedPackage.quantity,
      fallbackMax: selectedPackage.quantity,
    };

    try {
      setSubmitting(true);
      trackPackageEvent("package_order_submitted", { packageId: selectedPackage.packageId });
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) {
        setError(result.error || "Unable to place this order right now.");
        trackPackageEvent("package_order_error", { packageId: selectedPackage.packageId });
        setSubmitting(false);
        return;
      }

      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      window.localStorage.removeItem(PENDING_PACKAGE_ORDER_KEY);
      requestIdRef.current = "";
      setSuccessMessage("Order placed successfully. Redirecting to your orders...");
      trackPackageEvent("package_order_success", { packageId: selectedPackage.packageId });
      router.push("/dashboard/orders");
      router.refresh();
    } catch {
      setError("Unable to place this order right now.");
      trackPackageEvent("package_order_error", { packageId: selectedPackage.packageId });
      setSubmitting(false);
    }
  }

  return (
    <BlogShell>
      <div className="packages-page relative scroll-pt-24 overflow-x-clip pb-36 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-16 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute left-[34%] top-[55%] h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
        </div>

        <section className="relative scroll-mt-24 px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pt-12">
          <div className="mx-auto w-full max-w-7xl rounded-[28px] border border-orange-400/25 bg-[#111111] p-5 shadow-[0_24px_60px_-34px_rgba(255,122,0,.7)] sm:rounded-[34px] sm:p-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <p className="inline-flex rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-orange-300 sm:px-4 sm:py-2 sm:text-xs">
                Premium Package Selection
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:mt-5 sm:text-5xl">
                Choose Your Package
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#D1D5DB] sm:mt-4 sm:text-lg sm:leading-8">
                Select a platform, choose a service, and compare only the packages that match your campaign.
              </p>
              <p className="mt-3 max-w-3xl text-xs font-semibold leading-6 text-[#9CA3AF]">
                Prices are converted from INR and may vary slightly based on exchange rates and service availability.
              </p>
              {relatedGuides[0] ? (
                <Link
                  href={relatedGuides[0][1]}
                  className="mt-4 inline-flex text-sm font-bold text-orange-300 underline decoration-orange-400/60 underline-offset-4 transition hover:text-amber-200"
                >
                  Read the {relatedGuides[0][0].replace(" Guide", "").toLowerCase()} guide
                </Link>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                {trustBadges.map((chip) => (
                  <span key={chip} className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-100">
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section aria-label="Package selection progress" className="relative px-4 py-3 sm:px-6 lg:px-8">
          <p className="sr-only" aria-live="polite">
            {currentStepAnnouncement}
          </p>
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-2 rounded-2xl border border-orange-400/20 bg-[#111111] p-2.5 sm:grid-cols-4 sm:gap-3 sm:p-3">
            <PackageStep number="1" title="Platform" state={hasPlatformSelection ? "complete" : "active"} />
            <PackageStep
              number="2"
              title="Service"
              state={hasServiceSelection ? "complete" : hasPlatformSelection ? "active" : "upcoming"}
            />
            <PackageStep
              number="3"
              title="Package"
              state={selectedPackage ? "complete" : hasServiceSelection ? "active" : "upcoming"}
            />
            <PackageStep number="4" title="Review" state={selectedPackage ? "active" : "upcoming"} />
          </div>
        </section>

        <section ref={platformStepRef} className="relative scroll-mt-28 px-4 py-5 sm:scroll-mt-32 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 1</p>
                <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Select a platform</h2>
              </div>
              {hasPlatformSelection ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackageId("");
                    setTargetLink("");
                    setError("");
                    setSuccessMessage("");
                    requestIdRef.current = "";
                    setHasServiceSelection(false);
                    updatePackageUrl(selectedPlatform);
                    platformStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100 transition hover:border-orange-400"
                >
                  Change Platform
                </button>
              ) : (
                <span className="text-xs font-semibold text-[#9CA3AF]">7 platforms</span>
              )}
            </div>
            {hasPlatformSelection ? (
              <CompletedPackageStepCard
                title="Platform selected"
                value={selectedPlatform === "X" ? "X / Twitter" : selectedPlatform}
                detail={hasServiceSelection ? "Change it to browse another platform." : "Next, choose the service you want."}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                {platforms.map((platform) => {
                  const active = hasPlatformSelection && selectedPlatform === platform.key;
                  return (
                    <button
                      key={platform.key}
                      type="button"
                      onClick={() => selectPlatform(platform.key)}
                      className={`min-w-0 rounded-2xl border p-2.5 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 sm:p-4 ${
                        active
                          ? "border-orange-400/80 bg-orange-500/15 shadow-[0_16px_36px_-24px_rgba(255,122,0,.75)] ring-2 ring-orange-500/10"
                          : "border-white/10 bg-[#111111] hover:border-orange-400/45"
                      } ${platform.key === "X" ? "col-span-2 mx-auto w-full max-w-[calc(50%_-_0.375rem)] sm:col-span-1 sm:max-w-none" : ""}`}
                    >
                      <IconBadge label={platform.label}>
                        <PlatformIcon platform={platform.label} className="h-6 w-6" />
                      </IconBadge>
                      <span className="mt-3 block truncate text-xs font-bold text-white">{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section ref={packageStepRef} className="relative scroll-mt-28 px-4 py-4 sm:scroll-mt-32 sm:px-6 lg:px-8">
          {!hasPlatformSelection ? (
            <CompactStepCard number="2" title="Choose a service" detail="Select a platform to continue" />
          ) : hasServiceSelection ? (
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">Step 2 complete</p>
                  <h2 ref={serviceHeadingRef} tabIndex={-1} className="mt-1 text-xl font-black text-white outline-none sm:text-2xl">
                    Service selected
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={changeService}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2.5 text-xs font-black text-orange-100 transition hover:border-orange-400 hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 sm:text-sm"
                >
                  Change Service
                </button>
              </div>
              <CompletedPackageStepCard
                title={`${selectedPlatform === "X" ? "X / Twitter" : selectedPlatform} service`}
                value={serviceLabels[activeService]}
                detail="Next, choose one package for this service."
              />
            </div>
          ) : (
            <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-orange-400/20 bg-[#111111] p-4 shadow-[0_18px_42px_-30px_rgba(255,122,0,.6)] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 2</p>
                  <h2 ref={serviceHeadingRef} tabIndex={-1} className="mt-1 text-xl font-black text-white outline-none sm:text-2xl">
                    Choose a service
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">
                    Pick a service type to compare packages for {selectedPlatform === "X" ? "X / Twitter" : selectedPlatform}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => platformStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2.5 text-xs font-black text-orange-100 transition hover:border-orange-400 hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 sm:text-sm"
                >
                  Change Platform
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => {
                  const startingPrice = getStartingPrice(selectedPlatform, service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => selectService(service)}
                      className="flex min-h-[132px] flex-col rounded-2xl border border-white/10 bg-[#0B0B0F] p-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-orange-400/45 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                    >
                      <span className="text-base font-black text-white">{serviceLabels[service]}</span>
                      <span className="mt-2 line-clamp-2 text-sm leading-6 text-[#D1D5DB]">{serviceDescriptions[service]}</span>
                      <span className="mt-auto pt-3 text-xs font-black text-orange-200">
                        {startingPrice !== null ? `Starts at ${formatCurrency(startingPrice, currency)}` : "View available packages"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {!selectedPackage && !hasServiceSelection ? (
          <section className="relative px-4 py-4 sm:px-6 lg:px-8">
            <CompactStepCard number="3" title="Choose a package" detail="Choose a service to view packages" />
          </section>
        ) : null}

        {!selectedPackage && hasPlatformSelection && hasServiceSelection ? (
        <section className="relative scroll-mt-28 px-4 py-6 sm:scroll-mt-32 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {platforms.flatMap((platform) =>
              serviceOrder
                .filter((service) =>
                  bigPackages.some(
                    (pkg) => pkg.platform === platform.key && pkg.service === service,
                  ),
                )
                .map((service) => {
                  const categoryPackages = bigPackages.filter(
                    (pkg) => pkg.platform === platform.key && pkg.service === service,
                  );
                  const visiblePackages = showAllPackages ? categoryPackages : categoryPackages.slice(0, 6);
                  const bestValuePackageId =
                    categoryPackages.find((pkg) => pkg.discountBadge === "Best Value")?.packageId ??
                    categoryPackages[Math.min(2, categoryPackages.length - 1)]?.packageId;
                  const active =
                    selectedPlatform === platform.key && activeService === service;
                  if (!active) return null;
                  const headingId = `${platform.key.toLowerCase()}-${service}-packages`;

                  return (
                    <section
                      key={`${platform.key}-${service}`}
                      aria-labelledby={headingId}
                    >
                      <div className="mb-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Available packages</p>
                        <h2 id={headingId} ref={packageHeadingRef} tabIndex={-1} className="mt-1 text-xl font-black text-white outline-none sm:text-2xl">
                          {platform.label} {serviceLabels[service]} packages
                        </h2>
                        <p className="mt-2 text-sm text-[#D1D5DB]">
                          Choose one package to continue to the dedicated checkout page.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visiblePackages.map((pkg) => (
                          <article
                            key={pkg.packageId}
                            className={`flex min-w-0 flex-col rounded-3xl border bg-[#111111] p-5 shadow-[0_20px_46px_-32px_rgba(255,122,0,.65)] transition duration-200 hover:-translate-y-1 hover:border-orange-400/55 active:scale-[.99] sm:p-6 ${
                              selectedPackageId === pkg.packageId
                                ? "border-orange-400 ring-2 ring-orange-500/15"
                                : "border-orange-400/20"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <IconBadge label={pkg.platform}>
                                <PlatformIcon platform={pkg.platform} className="h-6 w-6" />
                              </IconBadge>
                              {pkg.packageId === bestValuePackageId ? (
                                <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-orange-200">
                                  Best Value
                                </span>
                              ) : null}
                            </div>

                            <h3 className="mt-4 text-xl font-extrabold text-white">{pkg.title}</h3>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                              {pkg.platform === "X" ? "X / Twitter" : pkg.platform} · {serviceLabels[pkg.service]}
                            </p>
                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#D1D5DB]">{pkg.description}</p>
                            <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-200">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Refill support if eligible
                            </span>

                            <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                              <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-3">
                                <dt className="text-orange-200">Price</dt>
                                <dd className="mt-1 break-words text-base font-extrabold text-white">{formatCurrency(pkg.basePriceINR, currency)}</dd>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-[#151515] p-3">
                                <dt className="text-[#9CA3AF]">Quantity</dt>
                                <dd className="mt-1 font-bold text-white">{pkg.quantityLabel}</dd>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-[#151515] p-3">
                                <dt className="text-[#9CA3AF]">Delivery</dt>
                                <dd className="mt-1 font-bold text-white">{pkg.deliveryTime}</dd>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-[#151515] p-3">
                                <dt className="text-[#9CA3AF]">Best for</dt>
                                <dd className="mt-1 font-bold leading-5 text-white">{pkg.bestFor}</dd>
                              </div>
                            </dl>

                            <button
                              type="button"
                              onClick={() => selectPackage(pkg)}
                              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,196,0,.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,122,0,.4)] active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                            >
                              {selectedPackageId === pkg.packageId ? "Selected ✓" : "Select Package"}
                            </button>
                            {selectedPackageId === pkg.packageId ? (
                              <button
                                type="button"
                                onClick={() => selectPackage(pkg)}
                                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-orange-400/35 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-100 transition hover:border-orange-400 hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                              >
                                Continue to Review
                              </button>
                            ) : null}
                          </article>
                        ))}
                      </div>
                      {categoryPackages.length > 6 ? (
                        <div className="mt-6 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setShowAllPackages((value) => !value)}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-white/[.06] px-5 py-3 text-sm font-black text-white transition hover:border-orange-400/60 hover:bg-orange-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                          >
                            {showAllPackages ? "Show Fewer Packages" : `View More Packages (${categoryPackages.length - 6} more)`}
                          </button>
                        </div>
                      ) : null}
                    </section>
                  );
                }),
            )}
          </div>
        </section>
        ) : null}

        {selectedPackage ? (
          <section className="relative scroll-mt-28 px-4 py-4 sm:scroll-mt-32 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">Step 3 complete</p>
                  <h2 ref={packageHeadingRef} tabIndex={-1} className="mt-1 text-xl font-black text-white outline-none sm:text-2xl">
                    Package selected
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={changePackage}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2.5 text-xs font-black text-orange-100 transition hover:border-orange-400 hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 sm:text-sm"
                >
                  Change Package
                </button>
              </div>
              <CompletedPackageStepCard
                title="Package selected"
                value={selectedPackage.title}
                detail={`${selectedPackage.quantityLabel} • ${formatCurrency(selectedPackage.basePriceINR, currency)} • ${selectedPackage.deliveryTime}`}
              />
            </div>
          </section>
        ) : null}

        {!selectedPackage ? (
          <section className="relative px-4 py-4 sm:px-6 lg:px-8">
            <CompactStepCard number="4" title="Review your package" detail="Select a package to review your order" />
          </section>
        ) : null}

        {selectedPackage ? (
          <PackageReviewSection
            selectedPackage={selectedPackage}
            currency={currency}
            linkRuleLabel={linkRule?.label || "Public link"}
            linkRulePlaceholder={linkRule?.placeholder || "Paste public profile, post, video, channel or page link"}
            linkRuleHelper={linkRule?.helper || "Enter the public destination for this package."}
            targetLink={targetLink}
            setTargetLink={setTargetLink}
            currentLinkError={currentLinkError}
            error={error}
            successMessage={successMessage}
            isAuthLoading={isAuthLoading}
            isLoggedIn={isLoggedIn}
            walletLoadError={walletLoadError}
            hasEnoughBalance={hasEnoughBalance}
            walletBalance={walletBalance}
            amountNeeded={amountNeeded}
            submitting={submitting}
            canSubmitLink={canSubmitLink}
            loginHref={getLoginHref()}
            addFundsHref={getAddFundsHref()}
            onPersist={persistPendingPackageOrder}
            onRequireValidLink={requireValidPublicLink}
            onRefreshWallet={() => void refreshWalletBalance()}
            onPlaceOrder={placeOrder}
            onChangePackage={changePackage}
            summaryStepRef={summaryStepRef}
            summaryHeadingRef={summaryHeadingRef}
            onClearMessages={() => {
              setError("");
              setSuccessMessage("");
              setShowLinkError(false);
            }}
          />
        ) : null}


        {selectedPackage && !summaryInView ? (
          <div className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-orange-400/35 bg-[#111111]/95 p-3 shadow-[0_18px_42px_-18px_rgba(255,122,0,.85)] backdrop-blur-xl sm:hidden">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white">
                  Continue with {selectedPackage.title} — {formatCurrency(selectedPackage.basePriceINR, currency)}
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-orange-200">Review package details</p>
              </div>
              <button
                type="button"
                onClick={() => summaryStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-xs font-black text-white"
              >
                Review
              </button>
            </div>
          </div>
        ) : null}

        <HowToOrderSection />

        <section className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-orange-400/20 bg-[#111111] p-6 shadow-[0_20px_48px_rgba(255,122,0,.16)] sm:p-8">
            <h2 className="text-2xl font-black text-white">Social media growth package FAQs</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {packageSeoFaqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-orange-400/20 bg-[#151515] p-5">
                  <h3 className="text-base font-black text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {relatedGuides.length ? (
          <section className="relative px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[28px] border border-white/85 bg-white/78 p-6 shadow-[0_20px_48px_rgba(255, 159, 0, .13)] backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-black text-[#0B0B0F]">Read relevant service guides</h2>
              <p className="mt-2 text-sm leading-7 text-[#111827]">
                Review current {selectedPlatform === "X" ? "X / Twitter" : selectedPlatform} {serviceLabels[activeService].toLowerCase()} details before choosing a package.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {relatedGuides.map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-xl border border-[#FFF3E0] bg-white px-4 py-2.5 text-sm font-bold text-[#FF9F00] transition hover:border-amber-300 hover:text-amber-700">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[28px] border border-white/85 bg-white/82 p-6 text-center shadow-[0_24px_58px_rgba(255, 159, 0, .16)] backdrop-blur-xl sm:p-9">
            <h2 className="text-2xl font-black text-[#0B0B0F] sm:text-3xl">Confused About Which Package to Choose?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#111827]">
              Send us your platform, service, quantity, and link. Our team will help you choose the right SocialRUSH package.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20the%20right%20package"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                Chat on WhatsApp
              </a>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255, 196, 0, .3)] transition hover:-translate-y-0.5">
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </BlogShell>
  );
}

function PackageStep({
  number,
  title,
  state,
}: {
  number: string;
  title: string;
  state: "complete" | "active" | "upcoming";
}) {
  const complete = state === "complete";
  const active = state === "active";

  return (
    <div
      aria-current={active ? "step" : undefined}
      className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 sm:gap-3 sm:px-4 ${
        complete
          ? "border-emerald-400/30 bg-emerald-500/10"
          : active
            ? "border-orange-400/55 bg-orange-500/15 shadow-[0_12px_28px_-22px_rgba(255,122,0,.8)]"
            : "border-white/10 bg-[#0B0B0F]"
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black sm:h-8 sm:w-8 ${
          complete
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white"
              : "bg-white/10 text-[#9CA3AF]"
        }`}
      >
        {complete ? <CheckCircle2 className="h-4 w-4" /> : number}
      </span>
      <span className="min-w-0">
        <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-[#9CA3AF] sm:text-[9px]">
          Step {number}
        </span>
        <span className={`block truncate text-[10px] font-black sm:text-xs ${active || complete ? "text-white" : "text-[#9CA3AF]"}`}>
          {title}
        </span>
      </span>
    </div>
  );
}

function CompactStepCard({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div
      aria-disabled="true"
      className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-3 rounded-[22px] border border-white/10 bg-[#0B0B0F]/85 p-4 text-left shadow-[0_12px_30px_-26px_rgba(255,122,0,.5)] sm:min-h-[88px] sm:p-5"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[#9CA3AF]">
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">Step {number}</span>
        <span className="mt-1 block text-base font-black text-white sm:text-lg">{title}</span>
        <span className="mt-1 block text-sm font-semibold leading-5 text-[#D1D5DB]">{detail}</span>
      </span>
    </div>
  );
}

function CompletedPackageStepCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">
        <CheckCircle2 className="h-4 w-4" />
        {title}
      </p>
      <p className="mt-2 text-base font-black text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#D1D5DB]">{detail}</p>
    </div>
  );
}

function SummaryMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? "border-orange-400/30 bg-orange-500/10" : "border-white/10 bg-[#0B0B0F]"}`}>
      <dt className={highlight ? "text-orange-200" : "text-[#9CA3AF]"}>{label}</dt>
      <dd className="mt-1 break-words text-sm font-black leading-5 text-white">{value}</dd>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[#9CA3AF]">{label}</span>
      <span className={`max-w-[62%] break-words text-right ${strong ? "text-lg font-black text-white" : "font-bold text-white"}`}>{value}</span>
    </div>
  );
}

function PackageReviewSection({
  selectedPackage,
  currency,
  linkRuleLabel,
  linkRulePlaceholder,
  linkRuleHelper,
  targetLink,
  setTargetLink,
  currentLinkError,
  error,
  successMessage,
  isAuthLoading,
  isLoggedIn,
  walletLoadError,
  hasEnoughBalance,
  walletBalance,
  amountNeeded,
  submitting,
  canSubmitLink,
  loginHref,
  addFundsHref,
  onPersist,
  onRequireValidLink,
  onRefreshWallet,
  onPlaceOrder,
  onChangePackage,
  summaryStepRef,
  summaryHeadingRef,
  onClearMessages,
}: {
  selectedPackage: BigPackage;
  currency: Parameters<typeof formatCurrency>[1];
  linkRuleLabel: string;
  linkRulePlaceholder: string;
  linkRuleHelper: string;
  targetLink: string;
  setTargetLink: Dispatch<SetStateAction<string>>;
  currentLinkError: string;
  error: string;
  successMessage: string;
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  walletLoadError: string;
  hasEnoughBalance: boolean;
  walletBalance: number | null;
  amountNeeded: number;
  submitting: boolean;
  canSubmitLink: boolean;
  loginHref: string;
  addFundsHref: string;
  onPersist: () => void;
  onRequireValidLink: () => boolean;
  onRefreshWallet: () => void;
  onPlaceOrder: () => void;
  onChangePackage: () => void;
  summaryStepRef: RefObject<HTMLElement>;
  summaryHeadingRef: RefObject<HTMLHeadingElement>;
  onClearMessages: () => void;
}) {
  const platformLabel = selectedPackage.platform === "X" ? "X / Twitter" : selectedPackage.platform;
  const walletBalanceLabel =
    isAuthLoading
      ? "Checking..."
      : !isLoggedIn
        ? "Login required"
        : walletLoadError
          ? "Unavailable"
          : formatCurrency(walletBalance ?? 0, currency);

  function handleLoginClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!onRequireValidLink()) {
      event.preventDefault();
      return;
    }

    onPersist();
    trackPackageEvent("package_login_clicked", { packageId: selectedPackage.packageId });
  }

  function handleAddFundsClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!onRequireValidLink()) {
      event.preventDefault();
      return;
    }

    onPersist();
    trackPackageEvent("package_add_funds_clicked", {
      packageId: selectedPackage.packageId,
      amountNeeded,
    });
  }

  return (
    <section ref={summaryStepRef} className="relative scroll-mt-28 px-4 pb-6 pt-2 sm:scroll-mt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <article className="rounded-[28px] border border-orange-400/25 bg-[#111111] p-5 shadow-[0_24px_64px_-36px_rgba(255,122,0,.72)] sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 4</p>
            <h2 ref={summaryHeadingRef} tabIndex={-1} className="mt-2 text-2xl font-black text-white outline-none sm:text-3xl">
              Review Your Package
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#D1D5DB]">
              Confirm your package and enter the public link where the service should be delivered.
            </p>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-orange-400/25 bg-[#151515]">
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                <div className="flex min-w-0 gap-4">
                  <IconBadge label={platformLabel}>
                    <PlatformIcon platform={platformLabel} className="h-6 w-6" />
                  </IconBadge>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.13em] text-orange-300">
                      {platformLabel} • {serviceLabels[selectedPackage.service]}
                    </p>
                    <h3 className="mt-1 break-words text-xl font-black text-white">{selectedPackage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">{selectedPackage.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onChangePackage}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2.5 text-sm font-black text-orange-100 transition hover:border-orange-400 hover:bg-orange-500/15"
                >
                  Change Package
                </button>
              </div>

              <dl className="grid gap-3 p-4 text-xs sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                <SummaryMetric label="Platform" value={platformLabel} />
                <SummaryMetric label="Service" value={serviceLabels[selectedPackage.service]} />
                <SummaryMetric label="Quantity" value={selectedPackage.quantityLabel} />
                <SummaryMetric label="Delivery" value={selectedPackage.deliveryTime} />
                <SummaryMetric label="Price" value={formatCurrency(selectedPackage.basePriceINR, currency)} highlight />
                <SummaryMetric label="Refill/support" value="Available if eligible" />
                <SummaryMetric label="Best for" value={selectedPackage.bestFor} />
                <SummaryMetric label="Final total" value={formatCurrency(selectedPackage.basePriceINR, currency)} highlight />
              </dl>
            </div>

            <div className="mt-6 rounded-[24px] border border-orange-400/20 bg-[#151515] p-4 sm:p-5">
              <label className="text-sm font-black text-white">
                {linkRuleLabel}
                <span className="mt-2 flex rounded-2xl border border-orange-400/25 bg-[#0B0B0F] transition focus-within:border-[#FF7A00] focus-within:ring-4 focus-within:ring-orange-500/15">
                  <span className="grid w-12 shrink-0 place-items-center text-[#FF9F00]">
                    <Link2 className="h-5 w-5" />
                  </span>
                  <input
                    value={targetLink}
                    onChange={(event) => {
                      setTargetLink(event.target.value);
                      onClearMessages();
                    }}
                    aria-invalid={Boolean(currentLinkError || (error && !targetLink.trim()))}
                    aria-describedby="package-public-link-help package-public-link-error"
                    placeholder={linkRulePlaceholder}
                    className="min-h-14 min-w-0 flex-1 rounded-r-2xl bg-transparent pr-4 text-base font-medium text-white outline-none placeholder:text-[#6B7280]"
                  />
                </span>
              </label>
              <p id="package-public-link-help" className="mt-2 text-xs font-semibold leading-6 text-[#D1D5DB]">
                {linkRuleHelper} The destination must remain public during delivery. SocialRUSH never asks for passwords, recovery codes, or private access.
              </p>
              {currentLinkError ? (
                <p id="package-public-link-error" role="alert" className="mt-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
                  {currentLinkError}
                </p>
              ) : null}
            </div>

            {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-100">{error}</p> : null}
            {successMessage ? <p role="status" className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold leading-6 text-emerald-100">{successMessage}</p> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {isAuthLoading ? (
                <button type="button" disabled className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-orange-400/20 bg-white/10 px-7 py-3.5 text-sm font-black text-[#D1D5DB] sm:w-auto">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Checking wallet...
                </button>
              ) : !isLoggedIn ? (
                <Link
                  href={loginHref}
                  onClick={handleLoginClick}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition hover:-translate-y-0.5 active:scale-[.98] sm:w-auto"
                >
                  <LockKeyhole className="h-4 w-4" />
                  Continue to Login
                </Link>
              ) : walletLoadError ? (
                <button type="button" onClick={onRefreshWallet} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition hover:-translate-y-0.5 active:scale-[.98] sm:w-auto">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Wallet
                </button>
              ) : hasEnoughBalance ? (
                <button type="button" disabled={submitting || !canSubmitLink} onClick={onPlaceOrder} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition hover:-translate-y-0.5 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {submitting ? "Processing..." : "Place Order"}
                </button>
              ) : (
                <Link
                  href={addFundsHref}
                  onClick={handleAddFundsClick}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_34px_-14px_rgba(255,196,0,.7)] transition hover:-translate-y-0.5 active:scale-[.98] sm:w-auto"
                >
                  <WalletCards className="h-4 w-4" />
                  Add Funds
                </Link>
              )}
              <button type="button" onClick={onChangePackage} className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-orange-400/30 bg-[#151515] px-7 py-3.5 text-sm font-black text-white transition hover:border-orange-400 hover:bg-orange-500/10 active:scale-[.98] sm:w-auto">
                Change Package
              </button>
            </div>
          </article>

          <aside className="rounded-[28px] border border-orange-400/25 bg-[#111111] p-5 shadow-[0_24px_64px_-36px_rgba(255,122,0,.72)] lg:sticky lg:top-28">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">Package invoice</p>
            <h3 className="mt-2 text-xl font-black text-white">Order summary</h3>
            <div className="mt-5 space-y-3.5 text-sm">
              <SummaryRow label="Package" value={selectedPackage.title} />
              <SummaryRow label="Platform" value={platformLabel} />
              <SummaryRow label="Service" value={serviceLabels[selectedPackage.service]} />
              <SummaryRow label="Quantity" value={selectedPackage.quantityLabel} />
              <SummaryRow label="Public link" value={targetLink.trim() || "Not entered"} />
              <SummaryRow label="Delivery" value={selectedPackage.deliveryTime} />
              <SummaryRow label="Refill" value="Available if eligible" />
              <SummaryRow label="Wallet balance" value={walletBalanceLabel} />
              <div className="border-t border-dashed border-orange-400/25 pt-4">
                <SummaryRow label="Final total" value={formatCurrency(selectedPackage.basePriceINR, currency)} strong />
              </div>
              {!isAuthLoading && isLoggedIn && !hasEnoughBalance ? <SummaryRow label="Amount needed" value={formatCurrency(amountNeeded, currency)} strong /> : null}
            </div>
            <div className={`mt-6 rounded-2xl border p-4 ${hasEnoughBalance ? "border-emerald-400/30 bg-emerald-500/10" : "border-orange-400/30 bg-orange-500/10"}`}>
              <p className={`text-xs font-black ${hasEnoughBalance ? "text-emerald-200" : "text-orange-200"}`}>
                {isAuthLoading
                  ? "Checking secure wallet..."
                  : !isLoggedIn
                    ? "Login to check wallet balance and place this order."
                    : hasEnoughBalance
                      ? "Wallet balance is sufficient for this package."
                      : `Available balance: ${walletBalanceLabel}. Required total: ${formatCurrency(selectedPackage.basePriceINR, currency)}. Please add ${formatCurrency(amountNeeded, currency)} to place this order.`}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#D1D5DB]">Wallet is charged only after you confirm the order.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
