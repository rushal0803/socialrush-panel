import Link from "next/link";
import MarketingIcon, {
  type MarketingIconName,
} from "@/components/marketing/MarketingIcon";
import PricingGrid from "@/components/marketing/pricing/PricingGrid";
import PublicShell from "@/components/marketing/PublicShell";
import PlatformIcon from "@/components/PlatformIcon";
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
      <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(255,159,214,.38),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(94,210,255,.35),transparent_30%),linear-gradient(145deg,#fff8fd_0%,#eef7ff_48%,#f5f2ff_100%)]">
        <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(120,145,205,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(120,145,205,.07)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

        <section className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-[#7657c7] shadow-[0_12px_30px_-18px_rgba(70,60,160,.55)] backdrop-blur-xl">
              <MarketingIcon name="sparkles" className="h-4 w-4" />
              Transparent campaign pricing
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.045em] text-[#122a5c] sm:text-5xl lg:text-[62px]">
              Clear pricing before every{" "}
              <span className="bg-gradient-to-r from-[#ff5cad] via-[#8777f4] to-[#25b9ec] bg-clip-text text-transparent">
                campaign.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#526d9e] sm:text-base sm:leading-8">
              Compare public starting rates by platform, then review the current
              quantity, destination, and exact total inside your secure dashboard
              before any wallet charge is applied.
            </p>

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {heroTrust.map(([icon, label]) => (
                <div
                  key={label}
                  className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/85 bg-white/65 px-4 py-3 text-xs font-bold text-[#36558c] shadow-[0_14px_28px_-22px_rgba(29,61,120,.5)] backdrop-blur-xl"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#fff1f8] to-[#eaf7ff] text-[#6c70dc]">
                    <MarketingIcon name={icon} className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl [perspective:1200px]">
            <div className="absolute -inset-5 rounded-[44px] bg-gradient-to-r from-fuchsia-300/25 via-violet-300/25 to-sky-300/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/90 bg-white/70 p-5 shadow-[0_38px_80px_-38px_rgba(49,67,130,.48)] backdrop-blur-2xl sm:p-7 lg:[transform:rotateY(-4deg)_rotateX(2deg)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5ecfb] pb-5">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#8a74ce]">
                    Live service catalog
                  </p>
                  <p className="mt-1 text-lg font-black text-[#17366f]">
                    Choose your platform
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                  Prices visible
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {featuredPlatforms.map((platform, index) => (
                  <div
                    key={platform}
                    className={`group rounded-2xl border p-3 shadow-[0_16px_30px_-24px_rgba(32,61,120,.5)] transition duration-300 hover:-translate-y-1 ${
                      index === 0
                        ? "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white"
                        : "border-white bg-white/80"
                    }`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f8eaff] to-[#eaf7ff] text-[#586fc8] shadow-inner">
                      <PlatformIcon platform={platform} className="h-5 w-5" />
                    </span>
                    <p className="mt-3 truncate text-[11px] font-extrabold text-[#24457f]">
                      {platform}
                    </p>
                  </div>
                ))}
                <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-[#dce7fb] bg-gradient-to-r from-[#f5efff] to-[#edf8ff] p-4 sm:col-span-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8072bc]">
                      Your checkout
                    </p>
                    <p className="mt-1 text-xs font-extrabold text-[#23447e]">
                      Rate × quantity = exact total
                    </p>
                  </div>
                  <MarketingIcon name="arrow" className="h-5 w-5 shrink-0 text-[#696fe0]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="relative overflow-hidden px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#6e6ddb]">
              Starting-price overview
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.035em] text-[#122a5c] sm:text-4xl">
              Compare live services by platform.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5c75a3]">
              Every amount below is loaded from the same central pricing source
              used by the SocialRUSH ordering experience.
            </p>
          </div>
          <PricingGrid />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/85 bg-[linear-gradient(145deg,#132b5a_0%,#292d70_48%,#174f7d_100%)] p-6 text-white shadow-[0_36px_80px_-38px_rgba(20,42,99,.75)] sm:p-9 lg:p-12">
          <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200 shadow-inner backdrop-blur">
                <MarketingIcon name="wallet" className="h-7 w-7" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-cyan-200">
                Protected wallet flow
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.03em]">
                How wallet charging works
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-blue-100/80">
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
                  <MarketingIcon name={step.icon} className="h-5 w-5 text-cyan-200" />
                  <h3 className="mt-5 text-sm font-extrabold text-white">{step.title}</h3>
                  <p className="mt-2 text-[11px] leading-6 text-blue-100/70">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#6e6ddb]">
              Order with confidence
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.035em] text-[#122a5c] sm:text-4xl">
              Clear from top-up to delivery.
            </h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustPoints.map(([icon, title, text]) => (
              <article
                key={title}
                className="group rounded-3xl border border-white/90 bg-white/70 p-5 shadow-[0_22px_50px_-34px_rgba(40,65,125,.5)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#d4ddfb] hover:shadow-[0_28px_55px_-32px_rgba(87,92,190,.5)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#fff0f8] via-[#f4efff] to-[#e8f7ff] text-[#696fd3]">
                  <MarketingIcon name={icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-sm font-extrabold text-[#1b3b75]">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#6179a6]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div className="rounded-[32px] border border-white/90 bg-gradient-to-br from-[#fff2fa] via-white to-[#edf8ff] p-7 shadow-[0_24px_55px_-36px_rgba(61,70,150,.5)] sm:p-9">
            <span className="inline-flex rounded-full border border-[#e0dafa] bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#7163c3]">
              Pricing questions
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-.035em] text-[#122a5c]">
              Helpful answers before you order.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6078a5]">
              The checkout screen always shows the final current total before
              confirmation.
            </p>
          </div>
          <div className="space-y-3">
            {pricingFaqs.map(([question, answer], index) => (
              <details
                key={question}
                className="group overflow-hidden rounded-3xl border border-white/90 bg-white/75 p-5 shadow-[0_18px_45px_-34px_rgba(41,65,120,.45)] backdrop-blur-xl transition open:border-[#d7dcfa] open:bg-white open:shadow-[0_24px_55px_-34px_rgba(91,85,180,.55)] sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-[#19396f]">
                  <span className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f0f3ff] text-[10px] font-black text-[#7371ce]">
                      0{index + 1}
                    </span>
                    {question}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#e0e6f6] bg-white text-lg text-[#6f70d3] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-[#edf0f8] pb-1 pt-4 text-xs leading-7 text-[#6078a5]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/90 bg-[linear-gradient(135deg,#fff0f8_0%,#f0edff_45%,#eaf8ff_100%)] p-7 shadow-[0_30px_70px_-38px_rgba(71,73,160,.55)] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-fuchsia-300/25 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#7067ca]">
                Start with clarity
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-[#122a5c]">
                Ready to check live campaign pricing?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d75a2]">
                Compare packages, choose a service, and review your exact order
                total before confirming.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff5cad] via-[#8a78f4] to-[#32bde9] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_30px_-16px_rgba(119,89,221,.65)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                View Packages
              </Link>
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d6ddf4] bg-white/80 px-5 py-3 text-sm font-extrabold text-[#294983] shadow-sm transition hover:-translate-y-0.5 hover:border-[#bfcaf0]"
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
