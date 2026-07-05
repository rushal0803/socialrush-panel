"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
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
const buyerGuides = [
  ["Instagram Followers", "/buy-instagram-followers-india"],
  ["Instagram Likes", "/buy-instagram-likes-india"],
  ["Instagram Views", "/buy-instagram-views-india"],
  ["YouTube Subscribers", "/buy-youtube-subscribers-india"],
  ["YouTube Likes", "/buy-youtube-likes-india"],
  ["YouTube Views", "/buy-youtube-views-india"],
  ["LinkedIn Followers", "/buy-linkedin-followers-india"],
  ["Facebook Followers", "/buy-facebook-followers-india"],
  ["Telegram Members", "/buy-telegram-members-india"],
] as const;

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

  function selectPlatform(platform: Platform) {
    setSelectedPlatform(platform);
    const firstService = serviceOrder.find((service) =>
      bigPackages.some((pkg) => pkg.platform === platform && pkg.service === service),
    );
    if (firstService) setSelectedService(firstService);
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
              <Link
                href="/buy-instagram-followers-india"
                className="mt-4 inline-flex text-sm font-bold text-orange-700 underline decoration-orange-300 underline-offset-4 transition hover:text-amber-700"
              >
                Learn about buying Instagram followers in India
              </Link>
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

        <section className="relative px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-orange-400/20 bg-[#111111] p-4 shadow-[0_18px_42px_-30px_rgba(255,122,0,.6)] sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 2</p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Choose a service</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {services.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setSelectedService(service)}
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
                  const active =
                    selectedPlatform === platform.key && activeService === service;
                  const headingId = `${platform.key.toLowerCase()}-${service}-packages`;

                  return (
                    <section
                      key={`${platform.key}-${service}`}
                      aria-labelledby={headingId}
                      hidden={!active}
                    >
                      <div className="mb-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9F00]">Step 3</p>
                        <h2 id={headingId} className="mt-1 text-xl font-black text-white sm:text-2xl">
                          {platform.label} {serviceLabels[service]} packages
                        </h2>
                        <p className="mt-2 text-sm text-[#D1D5DB]">
                          Choose one package to continue to the dedicated checkout page.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {categoryPackages.map((pkg) => (
                          <article
                            key={pkg.packageId}
                            className="flex min-w-0 flex-col rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_20px_46px_-32px_rgba(255,122,0,.65)] transition hover:-translate-y-1 hover:border-orange-400/45 sm:p-6"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <IconBadge label={pkg.platform}>
                                <PlatformIcon platform={pkg.platform} className="h-6 w-6" />
                              </IconBadge>
                              {pkg.discountBadge ? (
                                <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-orange-200">
                                  {pkg.discountBadge}
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

                            <Link
                              href={`/packages/checkout?packageId=${encodeURIComponent(pkg.packageId)}`}
                              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,196,0,.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,122,0,.4)] active:scale-[.98]"
                            >
                              Select Package
                            </Link>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                }),
            )}
          </div>
        </div>

        <HowToOrderSection />

        <section className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-white/85 bg-white/78 p-6 shadow-[0_20px_48px_rgba(255, 159, 0, .13)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-black text-[#0B0B0F]">Read service pricing and safety guides</h2>
            <p className="mt-2 text-sm leading-7 text-[#111827]">Review current service details before choosing a package.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {buyerGuides.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl border border-[#FFF3E0] bg-white px-4 py-2.5 text-sm font-bold text-[#FF9F00] transition hover:border-amber-300 hover:text-amber-700">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

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
