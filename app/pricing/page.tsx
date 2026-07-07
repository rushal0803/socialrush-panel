import Link from "next/link";
import MarketingIcon, {
  type MarketingIconName,
} from "@/components/marketing/MarketingIcon";
import PricingGrid from "@/components/marketing/pricing/PricingGrid";
import PublicShell from "@/components/marketing/PublicShell";
import PlatformIcon from "@/components/PlatformIcon";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Service Pricing India",
  description:
    "Review transparent India pricing for Instagram followers and likes, YouTube subscribers and views, LinkedIn followers, Facebook services and Twitter followers.",
  path: "/pricing",
  keywords: ["social media service pricing India", "Instagram likes price India"],
});

const heroTrust = [
  ["wallet", "Secure wallet checkout"],
  ["trend", "Live pricing"],
  ["dashboard", "Order tracking"],
  ["message", "WhatsApp support"],
] as const satisfies ReadonlyArray<readonly [MarketingIconName, string]>;

const walletSteps = [
  {
    icon: "wallet",
    title: "Add funds",
    text: "Top up your protected wallet through the available Razorpay checkout options.",
  },
  {
    icon: "search",
    title: "Choose service",
    text: "Select the platform and campaign service that matches your goal.",
  },
  {
    icon: "eye",
    title: "Review total",
    text: "Check the live rate, quantity, destination, and exact total before ordering.",
  },
  {
    icon: "check",
    title: "Confirm order",
    text: "Submit only after every campaign detail has been reviewed.",
  },
  {
    icon: "shield",
    title: "Wallet charged",
    text: "Your balance is charged only after you confirm a valid order.",
  },
] as const satisfies ReadonlyArray<{
  icon: MarketingIconName;
  title: string;
  text: string;
}>;

const trustPoints = [
  ["trend", "Transparent pricing", "See the current rate and calculated total before confirmation."],
  ["check", "No hidden charges", "The displayed campaign total is the amount deducted from your wallet."],
  ["refresh", "Refill support", "Eligible services clearly show their available refill coverage."],
  ["lock", "Secure Razorpay top-up", "Verified payments safely credit your protected account wallet."],
  ["message", "WhatsApp support", "Get human help when you need guidance with pricing or ordering."],
] as const satisfies ReadonlyArray<readonly [MarketingIconName, string, string]>;

const pricingFaqs = [
  [
    "Why are prices shown per 1,000?",
    "The per-1,000 rate provides a consistent comparison. Your quantity is calculated proportionally in New Campaign.",
  ],
  [
    "Can the rate change?",
    "Service conditions can change. The current rate and total are always displayed before confirmation.",
  ],
  [
    "Does every service include refill coverage?",
    "No. Eligible services are marked with their applicable refill terms before checkout.",
  ],
  [
    "When is my wallet charged?",
    "Only when you confirm a valid campaign order with sufficient balance.",
  ],
] as const;

const featuredPlatforms = [
  "Instagram",
  "YouTube",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "Twitter/X",
  "Telegram",
] as const;

export default function PricingPage() {
  return (
    <PublicShell tone="light3d">
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]} />
      <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(255, 122, 0, .38),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(255, 159, 0, .35),transparent_30%),linear-gradient(145deg,#FFF8F1_0%,#FFF8F1_48%,#FFF8F1_100%)]">
        <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-orange-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255, 159, 0, .07)_1px,transparent_1px),linear-gradient(90deg,rgba(255, 159, 0, .07)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

        <section className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-[#FFC400] shadow-[0_12px_30px_-18px_rgba(255, 196, 0, .55)] backdrop-blur-xl">
              <MarketingIcon name="sparkles" className="h-4 w-4" />
              Transparent campaign pricing
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.045em] text-[#0B0B0F] sm:text-5xl lg:text-[62px]">
              Clear pricing before every{" "}
              <span className="bg-gradient-to-r from-[#FF7A00] to-[#FFB000] bg-clip-text text-transparent">
                campaign.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#111827] sm:text-base sm:leading-8">
              Compare public starting rates by platform, then review the current
              quantity, destination, and exact total inside your secure dashboard
              before any wallet charge is applied.
            </p>

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {heroTrust.map(([icon, label]) => (
                <div
                  key={label}
                  className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/85 bg-white/65 px-4 py-3 text-xs font-bold text-[#FF9F00] shadow-[0_14px_28px_-22px_rgba(255, 159, 0, .5)] backdrop-blur-xl"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FFF8F1] to-[#FFF8F1] text-[#FFC400]">
                    <MarketingIcon name={icon} className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl [perspective:1200px]">
            <div className="absolute -inset-5 rounded-[44px] bg-gradient-to-r from-orange-300/25 via-amber-300/25 to-orange-300/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-orange-400/35 bg-[#111111] p-5 shadow-[0_38px_80px_-38px_rgba(255,122,0,.58)] backdrop-blur-2xl sm:p-7 lg:[transform:rotateY(-4deg)_rotateX(2deg)]">
              <div className="flex items-center justify-between gap-4 border-b border-orange-400/20 pb-5">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#FFC400]">
                    Live service catalog
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    Choose your platform
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-200">
                  Prices visible
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {featuredPlatforms.map((platform, index) => (
                  <div
                    key={platform}
                    className={`group rounded-2xl border p-3 shadow-[0_16px_30px_-24px_rgba(255, 159, 0, .5)] transition duration-300 hover:-translate-y-1 ${
                      index === 0
                        ? "border-orange-400/55 bg-orange-500/15"
                        : "border-orange-400/20 bg-[#151515]"
                    }`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_12px_26px_-16px_rgba(255,122,0,.8)]">
                      <PlatformIcon platform={platform} className="h-5 w-5" />
                    </span>
                    <p className="mt-3 truncate text-[11px] font-extrabold text-white">
                      {platform}
                    </p>
                  </div>
                ))}
                <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-orange-400/35 bg-[#151515] p-4 shadow-[0_18px_42px_-30px_rgba(255,122,0,.75)] sm:col-span-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#FF9F00]">
                      Your checkout
                    </p>
                    <p className="mt-1 text-xs font-extrabold text-[#D1D5DB]">
                      Rate × quantity = exact total
                    </p>
                  </div>
                  <MarketingIcon name="arrow" className="h-5 w-5 shrink-0 text-[#FF9F00]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="relative overflow-hidden px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-orange-200/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#FFC400]">
              Starting-price overview
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.035em] text-[#0B0B0F] sm:text-4xl">
              Compare live services by platform.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#111827]">
              Every amount below is loaded from the same central pricing source
              used by the SocialRUSH ordering experience.
            </p>
          </div>
          <PricingGrid />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/85 bg-[linear-gradient(145deg,#111827_0%,#111827_48%,#111827_100%)] p-6 text-white shadow-[0_36px_80px_-38px_rgba(255, 159, 0, .75)] sm:p-9 lg:p-12">
          <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-amber-200 shadow-inner backdrop-blur">
                <MarketingIcon name="wallet" className="h-7 w-7" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-amber-200">
                Protected wallet flow
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.03em]">
                How wallet charging works
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-orange-100/80">
                Funding and ordering stay separate, so you always review the
                campaign total before your wallet is charged.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {walletSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_40px_-28px_rgba(0,0,0,.7)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[.14]"
                >
                  <span className="absolute right-4 top-4 text-2xl font-black text-white/10">
                    0{index + 1}
                  </span>
                  <MarketingIcon name={step.icon} className="h-5 w-5 text-amber-200" />
                  <h3 className="mt-5 text-sm font-extrabold text-white">{step.title}</h3>
                  <p className="mt-2 text-[11px] leading-6 text-orange-100/70">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#FFC400]">
              Order with confidence
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.035em] text-[#0B0B0F] sm:text-4xl">
              Clear from top-up to delivery.
            </h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustPoints.map(([icon, title, text]) => (
              <article
                key={title}
                className="group rounded-3xl border border-white/90 bg-white/70 p-5 shadow-[0_22px_50px_-34px_rgba(255, 159, 0, .5)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#FFF3E0] hover:shadow-[0_28px_55px_-32px_rgba(255, 196, 0, .5)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FFF8F1] via-[#FFF8F1] to-[#FFF8F1] text-[#FFC400]">
                  <MarketingIcon name={icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-sm font-extrabold text-[#0B0B0F]">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#111827]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div className="rounded-[32px] border border-white/90 bg-gradient-to-br from-[#FFF8F1] via-white to-[#FFF8F1] p-7 shadow-[0_24px_55px_-36px_rgba(255, 196, 0, .5)] sm:p-9">
            <span className="inline-flex rounded-full border border-[#FFF3E0] bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#FFC400]">
              Pricing questions
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-.035em] text-[#0B0B0F]">
              Helpful answers before you order.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#111827]">
              The checkout screen always shows the final current total before
              confirmation.
            </p>
          </div>
          <div className="space-y-3">
            {pricingFaqs.map(([question, answer], index) => (
              <details
                key={question}
                className="group overflow-hidden rounded-3xl border border-white/90 bg-white/75 p-5 shadow-[0_18px_45px_-34px_rgba(255, 159, 0, .45)] backdrop-blur-xl transition open:border-[#FFF3E0] open:bg-white open:shadow-[0_24px_55px_-34px_rgba(255, 196, 0, .55)] sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-[#0B0B0F]">
                  <span className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#FFF8F1] text-[10px] font-black text-[#FFC400]">
                      0{index + 1}
                    </span>
                    {question}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#FFF3E0] bg-white text-lg text-[#FFC400] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-[#FFF8F1] pb-1 pt-4 text-xs leading-7 text-[#111827]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/90 bg-[linear-gradient(135deg,#FFF8F1_0%,#FFF8F1_45%,#FFF8F1_100%)] p-7 shadow-[0_30px_70px_-38px_rgba(255, 196, 0, .55)] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-orange-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-orange-300/25 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#FFC400]">
                Start with clarity
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-[#0B0B0F]">
                Ready to check live campaign pricing?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#111827]">
                Compare packages, choose a service, and review your exact order
                total before confirming.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_30px_-16px_rgba(255, 196, 0, .65)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                View Packages
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white/80 px-5 py-3 text-sm font-extrabold text-[#0B0B0F] shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF9F00]"
              >
                Start Order
              </Link>
              <a
                href="https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20with%20campaign%20pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-5 py-3 text-sm font-extrabold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <MarketingIcon name="message" className="h-4 w-4" />
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
