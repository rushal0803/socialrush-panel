"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import ServiceHealthBadge from "@/components/ServiceHealthBadge";
import { useServiceHealth } from "@/lib/use-service-health";
import HowToOrderSection from "@/components/marketing/HowToOrderSection";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import {
  activeSmmServices,
  platformMeta,
  type SmmPlatformId,
} from "@/lib/smm-service-catalog";

const platformOrder: SmmPlatformId[] = [
  "instagram",
  "youtube",
  "facebook",
  "linkedin",
  "telegram",
  "tiktok",
  "x",
];

const serviceNames: Record<string, string> = {
  "instagram-followers": "Instagram Followers",
  "instagram-likes": "Instagram Likes",
  "instagram-views": "Instagram Views",
  "youtube-subscribers": "YouTube Subscribers",
  "youtube-likes": "YouTube Likes",
  "youtube-views": "YouTube Views",
  "facebook-followers": "Facebook Followers",
  "facebook-likes": "Facebook Likes",
  "facebook-views": "Facebook Views",
  "facebook-shares": "Facebook Shares",
  "linkedin-followers": "LinkedIn Followers",
  "linkedin-likes": "LinkedIn Likes",
  "telegram-members": "Telegram Members",
  "tiktok-followers": "TikTok Followers",
  "tiktok-likes": "TikTok Likes",
  "tiktok-views": "TikTok Views",
  "x-followers": "Twitter/X Followers",
};

const seoServicePaths: Record<string, string> = {
  "instagram-followers": "/buy-instagram-followers-india",
  "instagram-likes": "/instagram-likes",
  "instagram-views": "/instagram-views",
  "youtube-subscribers": "/youtube-subscribers",
  "youtube-likes": "/youtube-likes",
  "youtube-views": "/youtube-views",
  "facebook-followers": "/facebook-followers",
  "facebook-likes": "/facebook-likes",
  "linkedin-followers": "/linkedin-followers",
  "linkedin-likes": "/linkedin-likes",
  "telegram-members": "/telegram-members",
  "tiktok-followers": "/tiktok-followers",
  "x-followers": "/twitter-followers",
};

const trustBadges = [
  { label: "Estimated Delivery", icon: Clock3 },
  { label: "Refill Support Where Eligible", icon: RefreshCw },
  { label: "Secure Checkout", icon: ShieldCheck },
  { label: "WhatsApp Support", icon: Headphones },
] as const;

const platformIconColors: Record<SmmPlatformId, string> = {
  instagram: "text-pink-400",
  youtube: "text-red-500",
  facebook: "text-blue-400",
  linkedin: "text-sky-400",
  telegram: "text-cyan-400",
  tiktok: "text-fuchsia-300",
  x: "text-white",
};

const serviceSeoFaqs = [
  { question: "Which social media growth services are available in India?", answer: "SocialRUSH lists Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and Twitter/X services with public-link ordering, transparent pricing and dashboard tracking." },
  { question: "Can I compare Instagram followers, YouTube subscribers and Facebook followers?", answer: "Yes. Use the service cards and package links to compare current rates, delivery estimates, refill/support terms and the correct public link required for each platform." },
  { question: "Do SocialRUSH services require my account password?", answer: "No. SocialRUSH uses public profile, post, video, channel, page or group links. You should never share a social media password to place an order." },
] as const;

const descriptiveServiceAnchors: Record<string, string> = {
  "instagram-followers": "Buy Instagram Followers India",
  "instagram-likes": "Instagram Likes India",
  "instagram-views": "Instagram Views India",
  "youtube-subscribers": "YouTube Subscribers India",
  "youtube-likes": "YouTube Likes India",
  "youtube-views": "YouTube Views India",
  "facebook-followers": "Facebook Followers India",
  "facebook-likes": "Facebook Likes India",
  "linkedin-followers": "LinkedIn Followers India",
  "linkedin-likes": "LinkedIn Likes India",
  "telegram-members": "Telegram Members India",
  "tiktok-followers": "TikTok Followers India",
  "x-followers": "Twitter/X Followers India",
};

const serviceCardDescriptions: Record<string, string> = {
  "instagram-followers": "Compare Instagram follower campaigns with clear pricing, delivery estimates and eligible refill support.",
  "instagram-likes": "Compare Instagram like campaigns for public posts and reels with clear package options.",
  "instagram-views": "Review Instagram view campaigns for public reels or videos with delivery and support details.",
  "youtube-subscribers": "Compare YouTube subscriber campaigns with channel-link requirements, pricing and delivery estimates.",
  "youtube-likes": "Review YouTube like campaigns for public videos with clear pricing and delivery details.",
  "youtube-views": "Compare YouTube view campaigns for public videos and Shorts with transparent package options.",
  "facebook-followers": "Compare Facebook follower campaigns for public pages or profiles with delivery guidance.",
  "facebook-likes": "Review Facebook like campaigns for public posts with pricing and support details.",
  "facebook-views": "Compare Facebook video view campaigns with delivery estimates and public-link requirements.",
  "facebook-shares": "Review Facebook share campaigns for public posts with package and delivery details.",
  "linkedin-followers": "Compare LinkedIn follower campaigns for public profiles or company pages.",
  "linkedin-likes": "Review LinkedIn like campaigns for public posts with pricing and delivery details.",
  "telegram-members": "Compare Telegram member campaigns for public channels or groups with support information.",
  "tiktok-followers": "Review TikTok follower campaigns for public profiles with clear pricing and delivery terms.",
  "tiktok-likes": "Compare TikTok like campaigns for public videos with package and support details.",
  "tiktok-views": "Review TikTok view campaigns for public videos with delivery estimates.",
  "x-followers": "Compare Twitter/X follower campaigns for public profiles with pricing and tracking details.",
};

function getServiceCardDescription(code: string) {
  return serviceCardDescriptions[code] ?? "Compare this service with clear pricing, delivery estimates and support details.";
}

function packagePlatform(platform: SmmPlatformId) {
  return platform === "x" ? "twitter" : platform;
}

function serviceTypeFromCode(code: string) {
  if (code.includes("followers")) return "followers";
  if (code.includes("subscribers")) return "subscribers";
  if (code.includes("likes")) return "likes";
  if (code.includes("views")) return "views";
  if (code.includes("members")) return "members";
  if (code.includes("shares")) return "shares";
  return "all";
}

function packageServiceFromCode(code: string) {
  return serviceTypeFromCode(code);
}

const platformAliases: Record<string, SmmPlatformId> = {
  instagram: "instagram",
  youtube: "youtube",
  youTube: "youtube",
  facebook: "facebook",
  linkedin: "linkedin",
  "linked-in": "linkedin",
  telegram: "telegram",
  tiktok: "tiktok",
  "tik-tok": "tiktok",
  x: "x",
  twitter: "x",
  "twitter-x": "x",
  "x-twitter": "x",
  "twitter/x": "x",
  "x/twitter": "x",
};

const serviceTypeAliases: Record<string, string> = {
  all: "all",
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
  share: "shares",
  shares: "shares",
};

function normalizeFilterValue(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function platformFromParam(value: string | null | undefined): SmmPlatformId {
  const normalized = normalizeFilterValue(value).replace(/-\/-/g, "/").replace(/\/+/g, "/");
  return platformAliases[normalized] ?? platformAliases[normalized.replace(/\//g, "-")] ?? "instagram";
}

function serviceTypeFromParam(value: string | null | undefined) {
  const normalized = normalizeFilterValue(value);
  const lastSegment = normalized.split("-").pop() || normalized;
  return serviceTypeAliases[normalized] ?? serviceTypeAliases[lastSegment] ?? "all";
}

function platformFromServiceParam(value: string | null | undefined): SmmPlatformId | null {
  const normalized = normalizeFilterValue(value);
  if (normalized.startsWith("instagram")) return "instagram";
  if (normalized.startsWith("youtube")) return "youtube";
  if (normalized.startsWith("facebook")) return "facebook";
  if (normalized.startsWith("linkedin")) return "linkedin";
  if (normalized.startsWith("telegram")) return "telegram";
  if (normalized.startsWith("tiktok")) return "tiktok";
  if (normalized.startsWith("twitter") || normalized.startsWith("x-")) return "x";
  return null;
}

type ServicesPageContentProps = {
  initialPlatformParam?: string;
  initialTypeParam?: string;
  initialSearchParam?: string;
};

export default function ServicesPageContent({
  initialPlatformParam,
  initialTypeParam,
  initialSearchParam,
}: ServicesPageContentProps) {
  const { currency } = usePreferredCurrency("INR");
  const healthByService = useServiceHealth();
  const [selectedPlatform, setSelectedPlatform] = useState<SmmPlatformId>(() =>
    initialPlatformParam ? platformFromParam(initialPlatformParam) : platformFromServiceParam(initialTypeParam) ?? "instagram",
  );
  const [selectedType, setSelectedType] = useState(() => serviceTypeFromParam(initialTypeParam));
  const [searchQuery, setSearchQuery] = useState(initialSearchParam?.trim() ?? "");
  const [openDirectoryPlatform, setOpenDirectoryPlatform] = useState<SmmPlatformId>(selectedPlatform);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const activePlatformServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const platform = platformFromParam(selectedPlatform);
    const requestedType = serviceTypeFromParam(selectedType);
    const typeHasServices =
      requestedType === "all" ||
      activeSmmServices.some(
        (service) =>
          platformFromParam(service.platform) === platform &&
          serviceTypeFromCode(service.code) === requestedType,
      );
    const type = typeHasServices ? requestedType : "all";

    return activeSmmServices.filter((service) => {
      const matchesPlatform = platformFromParam(service.platform) === platform;
      const serviceType = serviceTypeFromCode(service.code);
      const matchesType = type === "all" || serviceType === type;
      const matchesSearch =
        query === "" ||
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.code.toLowerCase().includes(query) ||
        platformMeta[service.platform].label.toLowerCase().includes(query);

      return matchesPlatform && matchesType && matchesSearch;
    });
  }, [searchQuery, selectedPlatform, selectedType]);

  const availableTypes = useMemo(() => {
    const types = new Set(
      activeSmmServices
        .filter((service) => platformFromParam(service.platform) === selectedPlatform)
        .map((service) => serviceTypeFromCode(service.code)),
    );

    return ["all", ...Array.from(types)];
  }, [selectedPlatform]);

  useEffect(() => {
    if (!availableTypes.includes(selectedType)) {
      setSelectedType("all");
    }
  }, [availableTypes, selectedType]);

  useEffect(() => {
    const nextPlatform = initialPlatformParam
      ? platformFromParam(initialPlatformParam)
      : platformFromServiceParam(initialTypeParam) ?? "instagram";

    setSelectedPlatform(nextPlatform);
    setOpenDirectoryPlatform(nextPlatform);
    setSelectedType(serviceTypeFromParam(initialTypeParam));
    setSearchQuery(initialSearchParam?.trim() ?? "");
  }, [initialPlatformParam, initialSearchParam, initialTypeParam]);

  return (
    <BlogShell>
      <main className="premium-services relative scroll-pt-28 overflow-x-clip pb-16 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-12 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-[-10%] top-36 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <section className="relative scroll-mt-28 px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-7 lg:px-8 lg:pt-9">
          <div className="mx-auto max-w-7xl rounded-[1.5rem] border border-white/10 bg-[#111111] p-4 shadow-[0_20px_48px_-32px_rgba(255,122,0,.4)] sm:rounded-[1.75rem] sm:p-7 lg:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-orange-200 sm:px-4 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Clear Service Catalog
            </p>
            <h1 className="mt-3 text-[2rem] font-black leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
              Growth Services Built Around Your Goals
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#D1D5DB] sm:text-base sm:leading-7">
              Choose a platform, compare clear pricing and delivery details, and find the right option for your goal.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {trustBadges.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-2.5 py-1.5 text-[10px] font-bold leading-4 text-[#D1D5DB] sm:px-3 sm:text-xs"
                >
                  <Icon className="h-4 w-4 shrink-0 text-orange-300" />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#9CA3AF]">Prices shown may vary based on service availability and selected currency.</p>
          </div>
        </section>

        <section className="relative scroll-mt-28 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF9F00]">Choose a platform</p>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Find the right growth service</h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {platformOrder.map((platformId) => {
                const meta = platformMeta[platformId];
                const active = selectedPlatform === platformId;
                return (
                  <button
                    key={platformId}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(platformId);
                      setSelectedType("all");
                    }}
                    aria-pressed={active}
                    className={`relative flex min-h-20 min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${
                      active
                        ? "border-2 border-orange-400 bg-[#151821] shadow-[0_18px_38px_-26px_rgba(255,159,0,.7)]"
                        : "border-white/10 bg-[#111111] hover:border-orange-400/45"
                    } ${platformId === "x" ? "col-span-2 mx-auto w-full max-w-[calc(50%_-_0.3125rem)] sm:col-span-1 sm:max-w-none lg:col-span-1" : ""}`}
                  >
                    {active ? <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-orange-400" aria-hidden="true" /> : null}
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#0B0B0F] ${platformIconColors[platformId]}`}>
                      <PlatformIcon platform={meta.icon} title={meta.label} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 truncate text-xs font-black text-white">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative scroll-mt-28 px-4 pt-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-3 rounded-[1.5rem] border border-orange-400/20 bg-[#111111] p-4 shadow-[0_18px_42px_-30px_rgba(255,122,0,.55)] lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">Search SocialRUSH services</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search followers, likes, views or a platform…"
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#050505] py-3 pl-11 pr-12 text-sm font-semibold text-white outline-none transition placeholder:text-[#9CA3AF] focus:border-orange-400/70 focus:ring-2 focus:ring-orange-500/15"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear service search"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-[#9CA3AF] transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:justify-end lg:px-0 lg:pb-0">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`min-h-11 shrink-0 rounded-xl px-4 py-2.5 text-xs font-black capitalize transition ${
                    selectedType === type
                      ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white shadow-[0_10px_24px_rgba(255,122,0,.28)]"
                      : "border border-white/10 bg-white/[.05] text-[#D1D5DB] hover:border-orange-400/45 hover:text-white"
                  }`}
                >
                  {type === "all" ? "All service types" : type}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="relative scroll-mt-28 px-4 pt-6 sm:px-6 sm:pt-9 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {platformOrder.map((platformId) => {
              const meta = platformMeta[platformId];
              const platformServices = platformId === selectedPlatform ? activePlatformServices : [];
              const active = selectedPlatform === platformId;
              if (!active) return null;

              return (
                <section
                  key={platformId}
                  id={`${platformId}-services`}
                  aria-labelledby={`${platformId}-services-heading`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF9F00]">{meta.label}</p>
                      <h2 id={`${platformId}-services-heading`} className="mt-2 text-2xl font-black text-white">{meta.label} services</h2>
                    </div>
                    <p className="text-xs font-semibold text-[#D1D5DB]">{platformServices.length} matching services</p>
                  </div>

                  {platformServices.length > 0 ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                    {platformServices.map((service) => {
                const packagesPath = `/packages?platform=${encodeURIComponent(packagePlatform(service.platform))}&service=${encodeURIComponent(packageServiceFromCode(service.code))}`;
                const serviceDetailPath = seoServicePaths[service.code] ?? `/services/${service.code}`;
                const health = healthByService[service.code];
                return (
                  <article
                    key={service.code}
                    className="group flex h-full min-w-0 flex-col rounded-3xl border border-white/10 bg-[#111111] p-4 shadow-[0_18px_44px_-32px_rgba(0,0,0,.6)] transition hover:-translate-y-1 hover:border-orange-400/50 focus-within:border-orange-400/50 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-[#151821] ${platformIconColors[service.platform]}`}>
                        <PlatformIcon platform={meta.icon} title={meta.label} className="h-6 w-6" />
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-black text-white sm:text-lg">
                      <Link href={serviceDetailPath} className="transition hover:text-orange-200">
                        {descriptiveServiceAnchors[service.code] || serviceNames[service.code] || service.name}
                      </Link>
                    </h3>
                    <div className="mt-2"><ServiceHealthBadge health={health} showMessage /></div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#D1D5DB]">{getServiceCardDescription(service.code)}</p>

                    <div className="mt-auto pt-4 sm:pt-5">
                      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#0B0B0F] p-3 text-xs">
                        <div>
                          <p className="font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Starting from</p>
                          <p className="mt-1 text-base font-black text-white sm:text-lg">
                            {formatCurrency(service.pricePer1000, currency)} <span className="text-[11px] text-[#9CA3AF]">per 1K</span>
                          </p>
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Delivery</p>
                          <p className="mt-1 font-black leading-5 text-white">{service.deliveryTime}</p>
                        </div>
                      </div>
                      <p className="mt-2 rounded-xl bg-white/[.05] px-3 py-2 text-xs leading-5 text-[#D1D5DB]">
                        <strong className="text-white">Refill/support:</strong> {service.refillPolicy}
                      </p>

                      <div className="mt-4 grid gap-2 min-[390px]:grid-cols-2">
                        {health && (!health.acceptsNewOrders || health.status === "paused") ? <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-center text-xs font-black text-[#9CA3AF]">Choose another service</span> : <Link
                          href={packagesPath}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-xs font-black text-white shadow-[0_12px_26px_rgba(255, 196, 0, .28)] transition hover:-translate-y-0.5"
                        >
                          View Packages
                        </Link>}
                        <Link
                          href={serviceDetailPath}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.05] px-4 py-2.5 text-xs font-black text-[#D1D5DB] transition hover:border-orange-400/45 hover:text-white"
                        >
                          Service Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
                    })}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-3xl border border-orange-400/20 bg-[#111111] p-6 text-sm leading-7 text-[#D1D5DB]">
                      No matching services found for this platform. Try another search term, choose another service type, or contact support for help choosing the right campaign.
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {false ? <section aria-labelledby="complete-service-directory-heading" className="relative scroll-mt-28 px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-orange-400/20 bg-[#111111] p-5 shadow-[0_20px_48px_-34px_rgba(255,122,0,.55)] sm:p-7">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF9F00]">Compact service directory</p>
              <h2 id="complete-service-directory-heading" className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Browse all currently available SocialRUSH services
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
                Open a platform to compare service pages, starting rates, delivery estimates, and refill/support terms.
              </p>
            </div>

            <div className="mt-6 space-y-3 sm:mt-7">
              {platformOrder.map((platformId) => {
                const meta = platformMeta[platformId];
                const platformServices = activeSmmServices.filter(
                  (service) => service.platform === platformId,
                );

                const isOpen = openDirectoryPlatform === platformId;

                return (
                  <section
                    key={`directory-${platformId}`}
                    className="rounded-2xl border border-orange-400/20 bg-[#151515] p-3 sm:p-4"
                    aria-labelledby={`directory-${platformId}-heading`}
                  >
                    <button
                      type="button"
                      className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                      aria-expanded={isOpen}
                      aria-controls={`directory-${platformId}-panel`}
                      onClick={() => setOpenDirectoryPlatform(platformId)}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <IconBadge label={meta.label} size="sm">
                          <PlatformIcon platform={meta.icon} title={meta.label} className="h-5 w-5" />
                        </IconBadge>
                        <span className="min-w-0">
                          <span id={`directory-${platformId}-heading`} className="block text-base font-black text-white">
                            {meta.label} services
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-[#9CA3AF]">
                            {platformServices.length} services · prices and support terms listed
                          </span>
                        </span>
                      </span>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-lg font-black text-orange-200 transition ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>

                    <div
                      id={`directory-${platformId}-panel`}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                    <div className="grid gap-3">
                      {platformServices.map((service) => {
                        const detailPath =
                          seoServicePaths[service.code] ??
                          `/services/${service.code}`;
                        const packagesPath = `/packages?platform=${encodeURIComponent(
                          packagePlatform(service.platform),
                        )}&service=${encodeURIComponent(packageServiceFromCode(service.code))}`;
                        return (
                          <article
                            key={`directory-${service.code}`}
                            className="grid min-w-0 gap-3 rounded-2xl border border-orange-400/15 bg-[#0B0B0F] p-3 shadow-[0_16px_38px_-30px_rgba(255,122,0,.45)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4"
                          >
                            <div className="min-w-0">
                            <h4 className="text-base font-black text-white">
                              <Link
                                href={detailPath}
                                className="transition hover:text-orange-200"
                              >
                                {descriptiveServiceAnchors[service.code] || serviceNames[service.code] || service.name}
                              </Link>
                            </h4>
                            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs min-[430px]:grid-cols-3">
                              <div className="rounded-xl border border-orange-400/15 bg-orange-500/10 p-3">
                                <dt className="font-bold text-orange-200">
                                  Price
                                </dt>
                                <dd className="mt-1 font-black text-white">
                                  {formatCurrency(service.pricePer1000, currency)} / 1K
                                </dd>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-[#151515] p-3">
                                <dt className="font-bold text-[#9CA3AF]">Delivery</dt>
                                <dd className="mt-1 font-black text-white">
                                  {service.deliveryTime}
                                </dd>
                              </div>
                              <div className="col-span-2 rounded-xl border border-white/10 bg-[#151515] p-3 min-[430px]:col-span-1">
                                <dt className="font-bold text-[#9CA3AF]">Refill/support</dt>
                                <dd className="mt-1 line-clamp-2 font-black text-white">
                                  {service.refillPolicy}
                                </dd>
                              </div>
                            </dl>
                            </div>
                            <div className="grid gap-2 min-[430px]:grid-cols-2 sm:min-w-64">
                              <Link
                                href={packagesPath}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 py-2.5 text-center text-[11px] font-black text-white"
                              >
                                View Packages
                              </Link>
                              <Link
                                href={detailPath}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-white/[.06] px-3 py-2.5 text-center text-[11px] font-black text-orange-200"
                              >
                                Service Details
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section> : null}

        <HowToOrderSection compactMobile />

        {false ? <section className="relative scroll-mt-28 px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/85 bg-white/78 p-5 shadow-[0_24px_58px_-32px_rgba(15,23,42,.36)] backdrop-blur-xl sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">
              Service FAQs
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0B0B0F]">
              Questions about SocialRUSH growth services
            </h2>
            <div className="mt-6 space-y-3">
              {serviceSeoFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <article key={faq.question} className="rounded-2xl border border-white/85 bg-white/88">
                    <h3>
                      <button
                        type="button"
                        className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left text-sm font-black text-[#0B0B0F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 sm:px-5 sm:text-base"
                        aria-expanded={isOpen}
                        aria-controls={`services-faq-${index}`}
                        onClick={() => setOpenFaqIndex(index)}
                      >
                        <span>{faq.question}</span>
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-orange-200 bg-orange-50 text-lg font-black text-orange-600 transition ${isOpen ? "rotate-45" : ""}`}>
                          +
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`services-faq-${index}`}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm leading-7 text-[#111827] sm:px-5">{faq.answer}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section> : null}

        <section className="relative scroll-mt-28 px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/10 bg-[#111111] p-5 text-center shadow-[0_24px_58px_-34px_rgba(255,122,0,.55)] sm:p-8">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Ready to Choose Your Growth Service?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#D1D5DB]">
              Compare available options, review clear pricing and start your order with confidence.
            </p>
            <div className="mx-auto mt-5 grid max-w-xl gap-2 min-[390px]:grid-cols-2">
              <Link href="/packages" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(255,122,0,.8)] transition hover:-translate-y-0.5">
                View Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.05] px-5 py-3 text-sm font-black text-white transition hover:border-orange-400/45">
                Create Account
              </Link>
            </div>
            <a href="https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20service" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-400/10">
              <Headphones className="h-4 w-4" /> WhatsApp support
            </a>
          </div>
        </section>
      </main>
    </BlogShell>
  );
}
