"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import OrderNowButton from "@/components/marketing/OrderNowButton";
import PlatformIcon from "@/components/PlatformIcon";
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
  "instagram-followers": "/instagram-followers",
  "instagram-likes": "/instagram-likes",
  "instagram-views": "/instagram-views",
  "youtube-subscribers": "/youtube-subscribers",
  "youtube-likes": "/youtube-likes",
  "youtube-views": "/youtube-views",
  "facebook-followers": "/facebook-followers",
  "linkedin-followers": "/linkedin-followers",
  "telegram-members": "/telegram-members",
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

function packagePlatform(platform: SmmPlatformId) {
  return platform === "x" ? "twitter" : platform;
}

export default function ServicesPageContent() {
  const { currency } = usePreferredCurrency("INR");
  const [selectedPlatform, setSelectedPlatform] = useState<SmmPlatformId>("instagram");

  return (
    <BlogShell>
      <main className="relative overflow-x-clip pb-16 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-10%] top-36 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute bottom-20 left-[30%] h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
        </div>

        <section className="relative px-4 pb-7 pt-6 sm:px-6 sm:pb-9 sm:pt-9 lg:px-8 lg:pt-12">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_58px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 sm:px-4 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Premium Service Catalog
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] text-[#10234f] sm:text-5xl">
              Social Media Growth Services
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4b628e] sm:text-base sm:leading-8">
              Choose your platform, compare services, and start your growth campaign in a few clicks.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:flex lg:flex-wrap">
              {trustBadges.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/90 bg-white/80 px-3 py-2 text-[10px] font-bold text-[#496496] shadow-sm sm:text-xs"
                >
                  <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-[#5a71a1]">{getCurrencyDisclaimer()}</p>
          </div>
        </section>

        <section className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">Choose a platform</p>
              <h2 className="mt-2 text-xl font-black text-[#14316a] sm:text-2xl">Find the right growth service</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              {platformOrder.map((platformId) => {
                const meta = platformMeta[platformId];
                const active = selectedPlatform === platformId;
                return (
                  <button
                    key={platformId}
                    type="button"
                    onClick={() => setSelectedPlatform(platformId)}
                    aria-pressed={active}
                    className={`min-w-0 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 sm:p-4 ${
                      active
                        ? "border-transparent bg-white shadow-[0_18px_38px_-24px_rgba(82,112,180,.5)] ring-2 ring-[#8ea9ff]"
                        : "border-white/85 bg-white/72 hover:border-[#cbdcff]"
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg sm:h-11 sm:w-11`}>
                      <PlatformIcon platform={meta.icon} title={meta.label} className="h-5 w-5" />
                    </span>
                    <span className="mt-3 block truncate text-xs font-black text-[#1c3a71]">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="relative px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {platformOrder.map((platformId) => {
              const meta = platformMeta[platformId];
              const platformServices = activeSmmServices.filter(
                (service) => service.platform === platformId,
              );
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
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">{meta.label}</p>
                      <h2 id={`${platformId}-services-heading`} className="mt-2 text-2xl font-black text-[#14316a]">{meta.label} services</h2>
                    </div>
                    <p className="text-xs font-semibold text-[#6079a7]">{platformServices.length} services available</p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {platformServices.map((service) => {
                const nextPath = `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`;
                const packagesPath = `/packages?platform=${encodeURIComponent(packagePlatform(service.platform))}`;
                const serviceDetailPath = seoServicePaths[service.code] ?? `/services/${service.code}`;
                const refillAvailable = !service.refillPolicy.toLowerCase().includes("no refill");

                return (
                  <article
                    key={service.code}
                    className="group flex min-w-0 flex-col rounded-3xl border border-white/85 bg-white/88 p-5 shadow-[0_18px_44px_-28px_rgba(15,23,42,.35)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#cbdcff] hover:shadow-[0_24px_52px_-26px_rgba(65,89,150,.4)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg`}>
                        <PlatformIcon platform={meta.icon} title={meta.label} className="h-6 w-6" />
                      </span>
                      <span className="rounded-full border border-[#dce7ff] bg-[#f8fbff] px-3 py-1 text-[10px] font-black uppercase text-[#5270aa]">
                        {service.qualityType}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-[#14316a]">
                      <Link href={serviceDetailPath} className="transition hover:text-blue-600">
                        {serviceNames[service.code] || service.name}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[#526d9f]">{service.description}</p>

                    <div className="mt-5 rounded-2xl border border-[#e1eaff] bg-[#f8fbff] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7890bb]">Starting from</p>
                      <p className="mt-1 text-xl font-black text-[#204083]">
                        {formatCurrency(service.pricePer1000, currency)} <span className="text-xs text-[#6079a7]">/ 1K</span>
                      </p>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div className="flex items-start gap-2 rounded-xl border border-[#e1eaff] bg-white/80 p-3">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        <span><b className="block text-[#294981]">Delivery</b><span className="mt-1 block text-[#6079a7]">{service.deliveryTime}</span></span>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl border border-[#e1eaff] bg-white/80 p-3">
                        <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                        <span><b className="block text-[#294981]">{refillAvailable ? "Refill" : "Coverage"}</b><span className="mt-1 block text-[#6079a7]">{service.refillPolicy}</span></span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2 min-[420px]:grid-cols-2">
                      <Link
                        href={packagesPath}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d4e1ff] bg-white px-4 py-2.5 text-xs font-black text-[#35548d] transition hover:border-[#9fb8ee] hover:bg-[#f7faff]"
                      >
                        View Packages
                      </Link>
                      <OrderNowButton
                        nextPath={nextPath}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2.5 text-xs font-black text-white shadow-[0_12px_26px_rgba(122,113,241,.35)] transition hover:-translate-y-0.5"
                      >
                        Start Order <ArrowRight className="h-4 w-4" />
                      </OrderNowButton>
                    </div>
                  </article>
                );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <section className="relative px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/85 bg-white/78 p-5 shadow-[0_24px_58px_-32px_rgba(15,23,42,.36)] backdrop-blur-xl sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5270aa]">Why customers choose SocialRUSH</p>
              <h2 className="mt-2 text-2xl font-black text-[#14316a]">A simpler way to start and track growth</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {customerBenefits.map((benefit) => (
                  <p key={benefit} className="flex items-center gap-2 text-sm font-semibold text-[#526d9f]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {benefit}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-7 shrink-0 lg:mt-0">
              <OrderNowButton
                nextPath="/dashboard/new-order"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_-14px_rgba(117,109,255,.65)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                Start Your First Order <ArrowRight className="h-4 w-4" />
              </OrderNowButton>
              <p className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-[#6079a7]">
                <CreditCard className="h-3.5 w-3.5" /> Secure wallet checkout
              </p>
            </div>
          </div>
        </section>
      </main>
    </BlogShell>
  );
}
