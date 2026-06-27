"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { bigPackages, type BigPackage } from "@/lib/big-packages";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

type Platform = BigPackage["platform"];
type Service = BigPackage["service"];

const platforms: Array<{ key: Platform; label: string; short: string }> = [
  { key: "Instagram", label: "Instagram", short: "IG" },
  { key: "YouTube", label: "YouTube", short: "YT" },
  { key: "Facebook", label: "Facebook", short: "FB" },
  { key: "LinkedIn", label: "LinkedIn", short: "IN" },
  { key: "Telegram", label: "Telegram", short: "TG" },
  { key: "TikTok", label: "TikTok", short: "TT" },
  { key: "X", label: "X / Twitter", short: "X" },
];

const platformGradient: Record<Platform, string> = {
  Instagram: "from-[#ff7dbf] via-[#9a96ff] to-[#58cbff]",
  YouTube: "from-[#ff8aa9] via-[#f96d83] to-[#ff5f68]",
  Facebook: "from-[#7ca6ff] via-[#5890ff] to-[#3967ea]",
  LinkedIn: "from-[#86d5ff] via-[#66a9ff] to-[#4a7ef0]",
  Telegram: "from-[#79d9ff] via-[#59b7ff] to-[#3d8cf3]",
  TikTok: "from-[#fc92c3] via-[#bb7cff] to-[#51c6ff]",
  X: "from-[#8fa1cb] via-[#7485b7] to-[#536188]",
};

const serviceLabels: Record<Service, string> = {
  followers: "Followers",
  subscribers: "Subscribers",
  likes: "Likes",
  views: "Views",
  members: "Members",
};

const serviceOrder: Service[] = ["followers", "subscribers", "likes", "views", "members"];
const trustBadges = ["Secure Wallet Checkout", "Instant Order Sync", "24x7 Support", "Delivery Tracking"] as const;

export default function PackagesPageContent() {
  const { currency } = usePreferredCurrency("INR");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("Instagram");

  const services = useMemo(
    () =>
      serviceOrder.filter((service) =>
        bigPackages.some((pkg) => pkg.platform === selectedPlatform && pkg.service === service),
      ),
    [selectedPlatform],
  );
  const [selectedService, setSelectedService] = useState<Service>("followers");
  const activeService = services.includes(selectedService) ? selectedService : services[0];

  const packages = useMemo(
    () =>
      bigPackages.filter(
        (pkg) => pkg.platform === selectedPlatform && pkg.service === activeService,
      ),
    [activeService, selectedPlatform],
  );

  function selectPlatform(platform: Platform) {
    setSelectedPlatform(platform);
    const firstService = serviceOrder.find((service) =>
      bigPackages.some((pkg) => pkg.platform === platform && pkg.service === service),
    );
    if (firstService) setSelectedService(firstService);
  }

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-20 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-16 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute left-[34%] top-[55%] h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
        </div>

        <section className="relative px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pt-12">
          <div className="mx-auto w-full max-w-7xl rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_24px_60px_rgba(82,111,172,.22)] backdrop-blur-xl sm:rounded-[34px] sm:p-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <p className="inline-flex rounded-full border border-white/85 bg-white/88 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#355294] sm:px-4 sm:py-2 sm:text-xs">
                Premium Package Selection
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight text-[#112551] sm:mt-5 sm:text-5xl">
                Choose Your Package
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4a6290] sm:mt-4 sm:text-lg sm:leading-8">
                Select a platform, choose a service, and compare only the packages that match your campaign.
              </p>
              <p className="mt-3 text-xs font-semibold text-[#5a72a3]">{getCurrencyDisclaimer()}</p>
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                {trustBadges.map((chip) => (
                  <span key={chip} className="rounded-full border border-white/85 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#2f4a86] shadow-[0_8px_20px_rgba(87,114,173,.12)]">
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f6caa]">Step 1</p>
                <h2 className="mt-1 text-xl font-black text-[#10234f] sm:text-2xl">Select a platform</h2>
              </div>
              <span className="text-xs font-semibold text-[#6880ad]">7 platforms</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {platforms.map((platform) => {
                const active = selectedPlatform === platform.key;
                return (
                  <button
                    key={platform.key}
                    type="button"
                    onClick={() => selectPlatform(platform.key)}
                    className={`min-w-0 rounded-2xl border p-3 text-left transition sm:p-4 ${
                      active
                        ? "border-transparent bg-white shadow-[0_16px_36px_rgba(81,108,169,.2)] ring-2 ring-[#8ea9ff]"
                        : "border-white/85 bg-white/80 hover:border-[#c9d9ff]"
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-[0_10px_22px_rgba(80,105,167,.28)] ${platformGradient[platform.key]}`}>
                      {platform.short}
                    </span>
                    <span className="mt-3 block truncate text-xs font-bold text-[#1f3b75]">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-white/85 bg-white/72 p-4 shadow-[0_18px_42px_rgba(86,114,175,.12)] backdrop-blur-xl sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f6caa]">Step 2</p>
            <h2 className="mt-1 text-xl font-black text-[#10234f] sm:text-2xl">Choose a service</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {services.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    activeService === service
                      ? "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_10px_24px_rgba(117,109,255,.3)]"
                      : "border border-[#d5e3ff] bg-white text-[#264276]"
                  }`}
                >
                  {serviceLabels[service]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f6caa]">Step 3</p>
              <h2 className="mt-1 text-xl font-black text-[#10234f] sm:text-2xl">
                {selectedPlatform === "X" ? "X / Twitter" : selectedPlatform} {serviceLabels[activeService]} packages
              </h2>
              <p className="mt-2 text-sm text-[#5f77a6]">Choose one package to continue to the dedicated checkout page.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg, index) => (
                <motion.article
                  key={pkg.packageId}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={{ y: -5 }}
                  className="flex min-w-0 flex-col rounded-3xl border border-white/85 bg-white/92 p-5 shadow-[0_16px_36px_rgba(81,108,169,.18)] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-[0_10px_22px_rgba(80,105,167,.28)] ${platformGradient[pkg.platform]}`}>
                      {platforms.find((item) => item.key === pkg.platform)?.short}
                    </span>
                    {pkg.discountBadge ? (
                      <span className="rounded-full border border-[#d6e2ff] bg-[#f6f9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5670aa]">
                        {pkg.discountBadge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[#122a5c]">{pkg.title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#5b75ab]">
                    {pkg.platform === "X" ? "X / Twitter" : pkg.platform} · {serviceLabels[pkg.service]}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#4f6795]">{pkg.description}</p>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-[#d9e5ff] bg-[#f7faff] p-3">
                      <dt className="text-[#6078ab]">Price</dt>
                      <dd className="mt-1 break-words text-base font-extrabold text-[#355186]">{formatCurrency(pkg.basePriceINR, currency)}</dd>
                    </div>
                    <div className="rounded-xl border border-[#d9e5ff] bg-[#f7faff] p-3">
                      <dt className="text-[#6078ab]">Quantity</dt>
                      <dd className="mt-1 font-bold text-[#355186]">{pkg.quantityLabel}</dd>
                    </div>
                    <div className="rounded-xl border border-[#d9e5ff] bg-[#f7faff] p-3">
                      <dt className="text-[#6078ab]">Delivery</dt>
                      <dd className="mt-1 font-bold text-[#355186]">{pkg.deliveryTime}</dd>
                    </div>
                    <div className="rounded-xl border border-[#d9e5ff] bg-[#f7faff] p-3">
                      <dt className="text-[#6078ab]">Best for</dt>
                      <dd className="mt-1 font-bold leading-5 text-[#355186]">{pkg.bestFor}</dd>
                    </div>
                  </dl>

                  <Link
                    href={`/packages/checkout?packageId=${encodeURIComponent(pkg.packageId)}`}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(117,109,255,.3)] transition hover:-translate-y-0.5"
                  >
                    Select Package
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </BlogShell>
  );
}
