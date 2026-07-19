"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { bigPackages, type BigPackage } from "@/lib/big-packages";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import PlatformIcon from "@/components/PlatformIcon";
import IconBadge from "@/components/IconBadge";
import HowToOrderSection from "@/components/marketing/HowToOrderSection";

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
const trustBadges = ["Secure Wallet Checkout", "Instant Order Sync", "24x7 Support", "Delivery Tracking"] as const;
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

function platformFromParam(value: string | null): Platform {
  const normalized = normalizeParam(value).replace(/-\/-/g, "/").replace(/\/+/g, "/");
  return platformParamMap[normalized] ?? platformParamMap[normalized.replace(/\//g, "-")] ?? "Instagram";
}

function serviceFromParam(value: string | null, platform: Platform): Service {
  const normalized = normalizeParam(value).split("-").pop() || "";
  const service = serviceParamMap[normalized] ?? serviceParamMap[normalizeParam(value)];
  if (service && bigPackages.some((pkg) => pkg.platform === platform && pkg.service === service)) {
    return service;
  }

  return (
    serviceOrder.find((candidate) =>
      bigPackages.some((pkg) => pkg.platform === platform && pkg.service === candidate),
    ) ?? "followers"
  );
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
  const { currency } = usePreferredCurrency("INR");
  const initialPlatform = initialPlatformParam
    ? platformFromParam(initialPlatformParam)
    : platformFromServiceParam(initialServiceParam ?? null) ?? "Instagram";
  const initialService = serviceFromParam(initialServiceParam ?? null, initialPlatform);
  const initialPackageId = initialPackageIdParam || "";
  const initialPackage = bigPackages.find(
    (pkg) =>
      pkg.packageId === initialPackageId &&
      pkg.platform === initialPlatform &&
      pkg.service === initialService,
  );
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(initialPlatform);
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage?.packageId ?? "");
  const [showAllPackages, setShowAllPackages] = useState(false);
  const packageStepRef = useRef<HTMLElement>(null);

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
  const relatedGuides = relatedGuideMap[`${selectedPlatform}:${activeService}`] ?? [];

  useEffect(() => {
    const nextPlatform = initialPlatformParam
      ? platformFromParam(initialPlatformParam)
      : platformFromServiceParam(initialServiceParam ?? null) ?? "Instagram";
    const nextService = serviceFromParam(initialServiceParam ?? null, nextPlatform);
    const nextPackage = bigPackages.find(
      (pkg) =>
        pkg.packageId === (initialPackageIdParam || "") &&
        pkg.platform === nextPlatform &&
        pkg.service === nextService,
    );

    setSelectedPlatform(nextPlatform);
    setSelectedService(nextService);
    setSelectedPackageId(nextPackage?.packageId ?? "");
    setShowAllPackages(false);
  }, [initialPackageIdParam, initialPlatformParam, initialServiceParam]);

  function selectPlatform(platform: Platform) {
    setSelectedPlatform(platform);
    setSelectedPackageId("");
    setShowAllPackages(false);
    const firstService = serviceOrder.find((service) =>
      bigPackages.some((pkg) => pkg.platform === platform && pkg.service === service),
    );
    if (firstService) setSelectedService(firstService);
    window.requestAnimationFrame(() => {
      packageStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <BlogShell>
      <div className="packages-page relative overflow-x-clip pb-24 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-16 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute left-[34%] top-[55%] h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
        </div>

        <section className="relative px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pt-12">
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
              <p className="mt-3 text-xs font-semibold text-[#9CA3AF]">{getCurrencyDisclaimer()}</p>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-[#9CA3AF]">
                Final price may vary based on selected package, quantity, service quality, and availability. Please check the live package price before placing your order.
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
          <div className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-2 rounded-2xl border border-orange-400/20 bg-[#111111] p-2.5 sm:gap-3 sm:p-3">
            <PackageStep number="1" title="Platform" state="complete" />
            <PackageStep number="2" title="Package" state="active" />
            <PackageStep number="3" title="Checkout" state="upcoming" />
          </div>
        </section>

        <section className="relative px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 1</p>
                <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Select a platform</h2>
              </div>
              <span className="text-xs font-semibold text-[#9CA3AF]">7 platforms</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              {platforms.map((platform) => {
                const active = selectedPlatform === platform.key;
                return (
                  <button
                    key={platform.key}
                    type="button"
                    onClick={() => selectPlatform(platform.key)}
                    className={`min-w-0 rounded-2xl border p-3 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98] sm:p-4 ${
                      active
                        ? "border-orange-400/80 bg-orange-500/15 shadow-[0_16px_36px_-24px_rgba(255,122,0,.75)] ring-2 ring-orange-500/10"
                        : "border-white/10 bg-[#111111] hover:border-orange-400/45"
                    }`}
                  >
                    <IconBadge label={platform.label}>
                      <PlatformIcon platform={platform.label} className="h-6 w-6" />
                    </IconBadge>
                    <span className="mt-3 block truncate text-xs font-bold text-white">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={packageStepRef} className="relative scroll-mt-24 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-orange-400/20 bg-[#111111] p-4 shadow-[0_18px_42px_-30px_rgba(255,122,0,.6)] sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 2</p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Choose a package</h2>
            <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">
              Pick a service type to compare packages for {selectedPlatform === "X" ? "X / Twitter" : selectedPlatform}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {services.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedPackageId("");
                    setShowAllPackages(false);
                  }}
                  className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[.98] ${
                    activeService === service
                      ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white shadow-[0_10px_24px_rgba(255, 196, 0, .3)]"
                      : "border border-white/10 bg-[#0B0B0F] text-[#D1D5DB] hover:border-orange-400/40"
                  }`}
                >
                  {serviceLabels[service]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="relative px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
                        <h2 id={headingId} className="mt-1 text-xl font-black text-white sm:text-2xl">
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
                              onClick={() => setSelectedPackageId(pkg.packageId)}
                              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,196,0,.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,122,0,.4)] active:scale-[.98]"
                            >
                              {selectedPackageId === pkg.packageId ? "Selected" : "Select Package"}
                            </button>
                          </article>
                        ))}
                      </div>
                      {categoryPackages.length > 6 ? (
                        <div className="mt-6 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setShowAllPackages((value) => !value)}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-white/[.06] px-5 py-3 text-sm font-black text-white transition hover:border-orange-400/60 hover:bg-orange-500/10"
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
        </div>

        <section className="relative px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[26px] border border-orange-400/25 bg-[#111111]/95 p-5 shadow-[0_22px_50px_-32px_rgba(255,122,0,.75)] sm:p-6 lg:sticky lg:bottom-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">
                    Selected package summary
                  </p>
                  {selectedPackage ? (
                    <>
                      <h2 className="mt-2 text-xl font-black text-white">
                        {selectedPackage.platform === "X" ? "X / Twitter" : selectedPackage.platform}{" "}
                        {serviceLabels[selectedPackage.service]} · {selectedPackage.title}
                      </h2>
                      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-4">
                        <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3">
                          <dt className="text-orange-200">Price</dt>
                          <dd className="mt-1 text-base font-black text-white">
                            {formatCurrency(selectedPackage.basePriceINR, currency)}
                          </dd>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#151515] p-3">
                          <dt className="text-[#9CA3AF]">Quantity</dt>
                          <dd className="mt-1 font-bold text-white">{selectedPackage.quantityLabel}</dd>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#151515] p-3">
                          <dt className="text-[#9CA3AF]">Delivery</dt>
                          <dd className="mt-1 font-bold text-white">{selectedPackage.deliveryTime}</dd>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#151515] p-3">
                          <dt className="text-[#9CA3AF]">Best for</dt>
                          <dd className="mt-1 font-bold leading-5 text-white">{selectedPackage.bestFor}</dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">
                      Select a package above to review the platform, service, included quantity, price, and delivery before checkout.
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  {selectedPackage ? (
                    <Link
                      href={`/packages/checkout?packageId=${encodeURIComponent(selectedPackage.packageId)}`}
                      className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(255,196,0,.3)] transition hover:-translate-y-0.5"
                    >
                      Continue to Checkout
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.05] px-6 py-3 text-sm font-black text-[#9CA3AF]"
                    >
                      Select a Package
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPackageId("");
                      packageStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-orange-400/25 bg-white/[.05] px-6 py-3 text-sm font-black text-[#D1D5DB] transition hover:border-orange-400/50 hover:text-white"
                  >
                    Change Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

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
