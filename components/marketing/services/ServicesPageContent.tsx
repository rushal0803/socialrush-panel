"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import OrderNowButton from "@/components/marketing/OrderNowButton";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import HowToOrderSection from "@/components/marketing/HowToOrderSection";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
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
  { label: "Fast Delivery", icon: Clock3 },
  { label: "Refill Support", icon: RefreshCw },
  { label: "Secure Payment", icon: ShieldCheck },
  { label: "24/7 WhatsApp Help", icon: Headphones },
] as const;

const customerBenefits = [
  "Easy order process",
  "Affordable packages",
  "Fast campaign start",
  "Refill support on eligible services",
  "WhatsApp support for help",
] as const;

const serviceSeoFaqs = [
  {
    question: "Which social media growth services are available in India?",
    answer:
      "SocialRUSH lists Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and Twitter/X services with public-link ordering, transparent pricing and dashboard tracking.",
  },
  {
    question: "Can I compare Instagram followers, YouTube subscribers and Facebook followers?",
    answer:
      "Yes. Use the service cards and package links to compare current rates, delivery estimates, refill/support terms and the correct public link required for each platform.",
  },
  {
    question: "Do SocialRUSH services require my account password?",
    answer:
      "No. SocialRUSH uses public profile, post, video, channel, page or group links. You should never share a social media password to place an order.",
  },
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

export default function ServicesPageContent() {
  const { currency } = usePreferredCurrency("INR");
  const [selectedPlatform, setSelectedPlatform] = useState<SmmPlatformId>("instagram");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activePlatformServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeSmmServices.filter((service) => {
      const matchesPlatform = service.platform === selectedPlatform;
      const serviceType = serviceTypeFromCode(service.code);
      const matchesType = selectedType === "all" || serviceType === selectedType;
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
        .filter((service) => service.platform === selectedPlatform)
        .map((service) => serviceTypeFromCode(service.code)),
    );

    return ["all", ...Array.from(types)];
  }, [selectedPlatform]);

  return (
    <BlogShell>
      <main className="relative overflow-x-clip pb-16 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute right-[-10%] top-36 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute bottom-20 left-[30%] h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <section className="relative px-4 pb-7 pt-6 sm:px-6 sm:pb-9 sm:pt-9 lg:px-8 lg:pt-12">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-orange-400/25 bg-[#111111] p-5 shadow-[0_24px_58px_-28px_rgba(255,122,0,.45)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-orange-200 sm:px-4 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Premium Service Catalog
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] text-white sm:text-5xl">
              Social Media Growth Services India
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#D1D5DB] sm:text-base sm:leading-8">
              Explore SocialRUSH social media growth services in India for Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok, and X/Twitter. Compare public-link ordering, transparent pricing, delivery estimates, and dashboard tracking before you start.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:flex lg:flex-wrap">
              {trustBadges.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-orange-400/20 bg-white/[.06] px-3 py-2 text-[10px] font-bold text-[#D1D5DB] shadow-sm sm:text-xs"
                >
                  <Icon className="h-4 w-4 shrink-0 text-orange-300" />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-[#9CA3AF]">{getCurrencyDisclaimer()}</p>
          </div>
        </section>

        <section className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF9F00]">Choose a platform</p>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Find the right growth service</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
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
                    className={`min-w-0 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 sm:p-4 ${
                      active
                        ? "border-orange-400/75 bg-orange-500/15 shadow-[0_18px_38px_-24px_rgba(255, 159, 0, .7)] ring-2 ring-[#FF9F00]/20"
                        : "border-white/10 bg-[#111111] hover:border-orange-400/45"
                    }`}
                  >
                    <IconBadge label={meta.label}>
                      <PlatformIcon platform={meta.icon} title={meta.label} className="h-5 w-5" />
                    </IconBadge>
                    <span className="mt-3 block truncate text-xs font-black text-white">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-4 pt-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-3 rounded-[1.5rem] border border-orange-400/20 bg-[#111111] p-4 shadow-[0_18px_42px_-30px_rgba(255,122,0,.55)] lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">Search SocialRUSH services</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Instagram followers, YouTube views, Facebook likes..."
                className="min-h-12 w-full rounded-2xl border border-orange-400/20 bg-[#050505] py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-[#9CA3AF] focus:border-orange-400/70 focus:ring-2 focus:ring-orange-500/15"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end lg:pb-0">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`min-h-10 shrink-0 rounded-xl px-4 py-2 text-xs font-black capitalize transition ${
                    selectedType === type
                      ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white shadow-[0_10px_24px_rgba(255,122,0,.28)]"
                      : "border border-orange-400/20 bg-white/[.06] text-[#D1D5DB] hover:border-orange-400/45 hover:text-white"
                  }`}
                >
                  {type === "all" ? "All service types" : type}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="relative px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {platformOrder.map((platformId) => {
              const meta = platformMeta[platformId];
              const platformServices = platformId === selectedPlatform ? activePlatformServices : [];
              const active = selectedPlatform === platformId;

              return (
                <section
                  key={platformId}
                  id={`${platformId}-services`}
                  aria-labelledby={`${platformId}-services-heading`}
                  hidden={!active}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF9F00]">{meta.label}</p>
                      <h2 id={`${platformId}-services-heading`} className="mt-2 text-2xl font-black text-white">{meta.label} services</h2>
                    </div>
                    <p className="text-xs font-semibold text-[#D1D5DB]">{platformServices.length} matching services</p>
                  </div>

                  {platformServices.length > 0 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {platformServices.map((service) => {
                const nextPath = `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`;
                const packagesPath = `/packages?platform=${encodeURIComponent(packagePlatform(service.platform))}`;
                const serviceDetailPath = seoServicePaths[service.code] ?? `/services/${service.code}`;
                const refillAvailable = !service.refillPolicy.toLowerCase().includes("no refill");

                return (
                  <article
                    key={service.code}
                    className="group flex min-w-0 flex-col rounded-3xl border border-white/85 bg-white/88 p-5 shadow-[0_18px_44px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#FFF3E0] hover:shadow-[0_24px_52px_-26px_rgba(255, 159, 0, .4)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <IconBadge label={meta.label}>
                        <PlatformIcon platform={meta.icon} title={meta.label} className="h-6 w-6" />
                      </IconBadge>
                      <span className="rounded-full border border-[#FFF8F1] bg-[#FFF8F1] px-3 py-1 text-[10px] font-black uppercase text-[#111827]">
                        {service.qualityType}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-[#0B0B0F]">
                      <Link href={serviceDetailPath} className="transition hover:text-orange-600">
                        {descriptiveServiceAnchors[service.code] || serviceNames[service.code] || service.name}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[#111827]">{service.description}</p>

                    <div className="mt-5 rounded-2xl border border-[#FFF8F1] bg-[#FFF8F1] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#111827]">Starting from</p>
                      <p className="mt-1 text-xl font-black text-[#0B0B0F]">
                        {formatCurrency(service.pricePer1000, currency)} <span className="text-xs text-[#111827]">/ 1K</span>
                      </p>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div className="flex items-start gap-2 rounded-xl border border-[#FFF8F1] bg-white/80 p-3">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                        <span><b className="block text-[#0B0B0F]">Delivery</b><span className="mt-1 block text-[#111827]">{service.deliveryTime}</span></span>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl border border-[#FFF8F1] bg-white/80 p-3">
                        <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span><b className="block text-[#0B0B0F]">{refillAvailable ? "Refill" : "Coverage"}</b><span className="mt-1 block text-[#111827]">{service.refillPolicy}</span></span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2 min-[420px]:grid-cols-2">
                      <Link
                        href={packagesPath}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-4 py-2.5 text-xs font-black text-[#FF9F00] transition hover:border-[#FF9F00] hover:bg-[#FFF8F1]"
                      >
                        View Packages
                      </Link>
                      <OrderNowButton
                        nextPath={nextPath}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-xs font-black text-white shadow-[0_12px_26px_rgba(255, 196, 0, .35)] transition hover:-translate-y-0.5"
                      >
                        Start Order <ArrowRight className="h-4 w-4" />
                      </OrderNowButton>
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

        <section aria-labelledby="complete-service-directory-heading" className="relative px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
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

            <div className="mt-7 space-y-3">
              {platformOrder.map((platformId) => {
                const meta = platformMeta[platformId];
                const platformServices = activeSmmServices.filter(
                  (service) => service.platform === platformId,
                );

                return (
                  <details
                    key={`directory-${platformId}`}
                    className="group rounded-2xl border border-orange-400/20 bg-[#151515] p-4"
                    open={platformId === selectedPlatform}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
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
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-lg font-black text-orange-200 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {platformServices.map((service) => {
                        const detailPath =
                          seoServicePaths[service.code] ??
                          `/services/${service.code}`;
                        const packagesPath = `/packages?platform=${encodeURIComponent(
                          packagePlatform(service.platform),
                        )}`;
                        const orderPath = `/dashboard/new-order?platform=${encodeURIComponent(
                          service.platform,
                        )}&service=${encodeURIComponent(service.code)}`;

                        return (
                          <article
                            key={`directory-${service.code}`}
                            className="flex min-w-0 flex-col rounded-2xl border border-orange-400/15 bg-[#0B0B0F] p-5 shadow-[0_16px_38px_-30px_rgba(255,122,0,.45)]"
                          >
                            <h4 className="text-base font-black text-white">
                              <Link
                                href={detailPath}
                                className="transition hover:text-orange-200"
                              >
                                {descriptiveServiceAnchors[service.code] || serviceNames[service.code] || service.name}
                              </Link>
                            </h4>
                            <p className="mt-2 flex-1 text-sm leading-6 text-[#D1D5DB]">
                              {service.description}
                            </p>
                            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-xl border border-orange-400/15 bg-orange-500/10 p-3">
                                <dt className="font-bold text-orange-200">
                                  Starting price
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
                            </dl>
                            <p className="mt-3 text-xs leading-5 text-[#D1D5DB]">
                              <strong className="text-white">
                                Refill/support:
                              </strong>{" "}
                              {service.refillPolicy}
                            </p>
                            <div className="mt-4 grid gap-2 min-[420px]:grid-cols-3">
                              <Link
                                href={detailPath}
                                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-400/25 bg-white/[.06] px-3 py-2 text-center text-[11px] font-black text-[#D1D5DB]"
                              >
                                Service Details
                              </Link>
                              <Link
                                href={packagesPath}
                                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-400/25 bg-white/[.06] px-3 py-2 text-center text-[11px] font-black text-orange-200"
                              >
                                View Packages
                              </Link>
                              <Link
                                href={orderPath}
                                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 py-2 text-center text-[11px] font-black text-white"
                              >
                                Start Order
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </section>

        <HowToOrderSection />

        <section className="relative px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/85 bg-white/78 p-5 shadow-[0_24px_58px_-32px_rgba(15,23,42,.36)] backdrop-blur-xl sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">
              Service FAQs
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0B0B0F]">
              Questions about SocialRUSH growth services
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {serviceSeoFaqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-white/85 bg-white/88 p-5">
                  <h3 className="text-base font-black text-[#0B0B0F]">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#111827]">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/85 bg-white/78 p-5 shadow-[0_24px_58px_-32px_rgba(15,23,42,.36)] backdrop-blur-xl sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">Why customers choose SocialRUSH</p>
              <h2 className="mt-2 text-2xl font-black text-[#0B0B0F]">A simpler way to start and track growth</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {customerBenefits.map((benefit) => (
                  <p key={benefit} className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {benefit}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-7 shrink-0 lg:mt-0">
              <OrderNowButton
                nextPath="/dashboard/new-order"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_-14px_rgba(255, 196, 0, .65)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                Start Your First Order <ArrowRight className="h-4 w-4" />
              </OrderNowButton>
              <p className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-[#111827]">
                <CreditCard className="h-3.5 w-3.5" /> Secure wallet checkout
              </p>
            </div>
          </div>
        </section>
      </main>
    </BlogShell>
  );
}
