import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Compass,
  Sparkles,
  Target,
} from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import {
  activeSmmServices,
  platformMeta,
  type SmmPlatformId,
} from "@/lib/smm-service-catalog";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Creator Growth Hub | Social Media Growth Services",
  description:
    "Explore SocialRUSH creator growth services by platform and campaign goal. Compare Instagram, YouTube, Facebook, LinkedIn and other social media growth options.",
  path: "/creator-growth",
});

const platforms = Object.keys(platformMeta) as SmmPlatformId[];

const goals = [
  {
    title: "Build social proof",
    keyword: "followers",
    description:
      "Explore audience-growth options when stronger visible presence is your priority.",
    icon: CheckCircle2,
  },
  {
    title: "Increase engagement",
    keyword: "likes",
    description:
      "Explore engagement-focused services for eligible posts and social content.",
    icon: Sparkles,
  },
  {
    title: "Grow video visibility",
    keyword: "views",
    description:
      "Explore video-view services when visibility around selected content matters.",
    icon: BarChart3,
  },
  {
    title: "Strengthen creator presence",
    keyword: "followers",
    description:
      "Build a more complete growth plan around audience, content and consistency.",
    icon: Target,
  },
] as const;

const authorityHubs = [
  {
    title: "Instagram Growth India",
    description:
      "Explore followers, likes, views, comments, saves and shares with an India-focused Instagram growth framework.",
    href: "/instagram-growth-india",
    platform: "Instagram",
    accent: "from-pink-500/20 via-purple-500/10 to-transparent",
  },
  {
    title: "YouTube Growth India",
    description:
      "Explore subscribers, views, likes, comments and watch-hour options alongside practical YouTube growth strategy.",
    href: "/youtube-growth-india",
    platform: "YouTube",
    accent: "from-red-500/20 via-red-500/5 to-transparent",
  },
  {
    title: "Facebook Growth India",
    description:
      "Explore Facebook followers, likes and views while choosing services around your actual campaign objective.",
    href: "/facebook-growth-india",
    platform: "Facebook",
    accent: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  {
    title: "LinkedIn Growth India",
    description:
      "Explore professional audience growth, LinkedIn followers, likes and stronger professional positioning.",
    href: "/linkedin-growth-india",
    platform: "LinkedIn",
    accent: "from-sky-500/20 via-blue-500/5 to-transparent",
  },
] as const;

const growthSteps = [
  {
    number: "01",
    title: "Choose your platform",
    description:
      "Start with the social platform where your audience and content strategy are already focused.",
  },
  {
    number: "02",
    title: "Define the objective",
    description:
      "Decide whether the current priority is audience growth, engagement, video visibility or another measurable goal.",
  },
  {
    number: "03",
    title: "Review the service",
    description:
      "Check current quantity, price and service details before placing any order.",
  },
  {
    number: "04",
    title: "Track your order",
    description:
      "Use your SocialRUSH dashboard to follow supported order information and status.",
  },
];

export default function CreatorGrowthPage() {
  return (
    <PublicShell>
      <main className="overflow-hidden bg-[#050505] text-white">
        {/* HERO */}
        <section className="relative px-5 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_8%,rgba(255,122,0,.22),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(59,130,246,.11),transparent_26%),linear-gradient(#050505,#090A0E)]" />

          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-orange-200">
                <Sparkles className="h-4 w-4" />
                SocialRUSH Creator Growth Hub
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">
                Build a smarter{" "}
                <span className="bg-gradient-to-r from-orange-300 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  social growth strategy.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Choose SocialRUSH services around the platform and campaign
                objective that actually matters to you — then review current
                pricing, quantity and order details before buying.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-black text-black shadow-[0_18px_42px_-18px_rgba(255,153,0,.9)] transition hover:-translate-y-0.5"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/tools"
                  className="inline-flex min-h-12 items-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-bold text-white transition hover:border-orange-400/35"
                >
                  Explore Creator Tools
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Choose by campaign goal",
                  "Review current service details",
                  "Track supported orders",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-xs font-bold text-slate-300"
                  >
                    <CheckCircle2 className="h-4 w-4 text-orange-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 -z-10 bg-orange-500/10 blur-3xl" />

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#15161c,#0d0e12)] p-6 shadow-[0_40px_100px_-48px_rgba(255,122,0,.7)] sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                      Growth System
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Platform → Goal → Service
                    </h2>
                  </div>

                  <Target className="h-6 w-6 text-orange-300" />
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    ["Choose platform", "Instagram, YouTube, LinkedIn + more"],
                    ["Select objective", "Followers, likes, views + more"],
                    ["Review details", "Quantity, price and destination"],
                    ["Track order", "Customer dashboard"],
                  ].map(([label, value], index) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 rounded-2xl border border-white/[.07] bg-white/[.03] p-4"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-xs font-black text-orange-300">
                        0{index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-black text-white">{label}</p>
                        <p className="mt-1 text-xs leading-6 text-slate-400">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-slate-500">
                  Growth outcomes depend on content quality, audience,
                  platform behavior and other factors. SocialRUSH does not
                  guarantee reach, revenue, sales or ranking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GOALS */}
        <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Start with your objective
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                What are you trying to improve?
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Different campaign goals need different services. Pick the
                objective first instead of ordering based only on the biggest
                number.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const match = activeSmmServices.find((service) =>
                  service.code.includes(goal.keyword),
                );

                return (
                  <Link
                    key={goal.title}
                    href={
                      match
                        ? `/order-summary?service=${match.code}`
                        : "/services"
                    }
                    className="group rounded-[1.6rem] border border-white/10 bg-[#101116] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-orange-300">
                      <Icon className="h-5 w-5" />
                    </span>

                    <h3 className="mt-5 text-lg font-black">{goal.title}</h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {goal.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-orange-200">
                      Explore options
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* AUTHORITY HUBS */}
        <section className="border-y border-white/10 bg-[#090A0E] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                  India Growth Guides
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  Go deeper by platform.
                </h2>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-slate-400 lg:justify-self-end">
                These platform-specific hubs combine service discovery with
                practical growth guidance so you can understand the difference
                between audience growth, engagement and visibility.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {authorityHubs.map((hub) => {
              
                return (
                  <Link
                    key={hub.title}
                    href={hub.href}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101116] p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-400/35"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${hub.accent}`}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-4">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/20">
                       <PlatformIcon platform={hub.platform} className="h-6 w-6" />
                        </span>

                        <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-orange-300" />
                      </div>

                      <h3 className="mt-6 text-2xl font-black">{hub.title}</h3>

                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                        {hub.description}
                      </p>

                      <span className="mt-6 inline-flex text-xs font-black uppercase tracking-[.13em] text-orange-300">
                        Open Growth Hub
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* PLATFORM SERVICES */}
        <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Current Service Catalog
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Choose your platform.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                The options below are generated from SocialRUSH&apos;s current
                active service catalog instead of duplicated hard-coded
                pricing.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform) => {
                const services = activeSmmServices.filter(
                  (service) => service.platform === platform,
                );

                if (!services.length) return null;

                return (
                  <article
                    key={platform}
                    className="rounded-[1.6rem] border border-white/10 bg-[#101219] p-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-orange-400/15 bg-orange-500/10">
                        <PlatformIcon
                          platform={platformMeta[platform].label}
                          className="h-5 w-5"
                        />
                      </span>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">
                          Platform
                        </p>
                        <h3 className="mt-1 font-black">
                          {platformMeta[platform].label}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {services.map((service) => (
                        <Link
                          key={service.code}
                          href={`/order-summary?service=${service.code}`}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-transparent bg-white/[.04] px-3 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-400/20 hover:bg-orange-500/10 hover:text-white"
                        >
                          <span>{service.name}</span>

                          <ArrowRight className="h-4 w-4 shrink-0 text-orange-300 transition group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-white/10 bg-[#090A0E] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Simple Growth Workflow
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Plan first. Order second.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Use a clear objective and the correct platform before choosing
                the service that supports your campaign.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {growthSteps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-3xl border border-white/10 bg-white/[.025] p-6"
                >
                  <span className="text-4xl font-black text-orange-400/25">
                    {step.number}
                  </span>

                  <h3 className="mt-5 text-lg font-black">{step.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TOOLS + CTA */}
        <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-orange-400/25 bg-[radial-gradient(circle_at_85%_0%,rgba(255,122,0,.15),transparent_32%),linear-gradient(135deg,#17110c,#0d0e12)] p-7 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-orange-300">
                    <Compass className="h-4 w-4" />
                    Not sure where to start?
                  </div>

                  <h2 className="mt-4 max-w-2xl text-3xl font-black sm:text-4xl">
                    Use a free tool before choosing your next growth service.
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                    Plan your objective, review your budget and explore the
                    current SocialRUSH service catalog. Tool results are for
                    planning and do not guarantee commercial outcomes.
                  </p>
                </div>

                <Sparkles className="hidden h-12 w-12 text-orange-300 lg:block" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/tools"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black transition hover:-translate-y-0.5"
                >
                  Explore Creator Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center rounded-xl border border-orange-400/30 px-5 text-sm font-black text-orange-100 transition hover:bg-orange-500/10"
                >
                  Browse All Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}