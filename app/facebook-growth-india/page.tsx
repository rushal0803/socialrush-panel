import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  Heart,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import {
  createPageMetadata,
  SEO_SITE_URL,
} from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Facebook Growth India | Followers, Likes & Views",
  description:
    "Explore Facebook growth in India across followers, likes and views. Compare campaign goals, improve your content strategy and choose the right SocialRUSH service.",
  path: "/facebook-growth-india",
});

const services = [
  {
    title: "Facebook Followers",
    label: "Audience Growth",
    description:
      "Strengthen the visible size of your Facebook audience and improve the first impression of your public presence.",
    href: "/buy-facebook-followers-india",
    icon: Users,
  },
  {
    title: "Facebook Likes",
    label: "Engagement",
    description:
      "Support visible engagement on eligible Facebook content when stronger interaction is the campaign goal.",
    href: "/facebook-likes",
    icon: Heart,
  },
  {
    title: "Facebook Views",
    label: "Video Visibility",
    description:
      "Increase visible view activity on eligible Facebook video content as part of a wider content strategy.",
    href: "/facebook-views",
    icon: Eye,
  },
];

const growthFramework = [
  {
    step: "01",
    title: "Build your audience base",
    description:
      "Create a clear page identity, publish around a defined topic and make your Facebook presence easy to understand.",
  },
  {
    step: "02",
    title: "Strengthen visible engagement",
    description:
      "Use relevant posts, videos and creative formats that encourage people to react, watch and interact.",
  },
  {
    step: "03",
    title: "Improve content distribution",
    description:
      "Study what performs well and use promotion selectively to support your strongest content.",
  },
  {
    step: "04",
    title: "Measure and repeat",
    description:
      "Track performance, learn from audience behavior and improve future content based on real data.",
  },
];

const strategyPoints = [
  "Use a clear profile image, cover and page description.",
  "Publish content around a consistent audience theme.",
  "Create short videos with a strong first few seconds.",
  "Use captions that give people a reason to react or respond.",
  "Study which formats earn the strongest organic response.",
  "Use promotional growth as support, not the entire strategy.",
];

const faq = [
  {
    question: "What is the best Facebook growth service in India?",
    answer:
      "There is no single best service for every Facebook page. Followers support visible audience size, likes support engagement and views support video visibility. The right option depends on the campaign objective.",
  },
  {
    question: "Should I buy Facebook followers or engagement first?",
    answer:
      "It depends on your current page. A newer page may focus on building visible audience size, while an established page may benefit more from supporting specific posts or videos.",
  },
  {
    question: "Does SocialRUSH guarantee Facebook reach or sales?",
    answer:
      "No. Facebook reach, recommendations, leads and sales depend on many factors outside SocialRUSH. Promotional services should support a broader content and marketing strategy.",
  },
  {
    question: "Do I need to provide my Facebook password?",
    answer:
      "No. SocialRUSH uses the relevant public Facebook page, post or video link for supported services. Never provide your Facebook password or private login information.",
  },
  {
    question: "Can I track my Facebook order?",
    answer:
      "Yes. Supported order information and status can be viewed through the SocialRUSH customer dashboard after an order is placed.",
  },
];

function schema(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function FacebookGrowthIndiaPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SEO_SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Creator Growth",
        item: `${SEO_SITE_URL}/creator-growth`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Facebook Growth India",
        item: `${SEO_SITE_URL}/facebook-growth-india`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <PublicShell>
      <main className="overflow-hidden bg-[#050505] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema(breadcrumbSchema) }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema(faqSchema) }}
        />

        {/* HERO */}
        <section className="relative px-5 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_5%,rgba(255,122,0,.24),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(37,99,235,.18),transparent_26%),linear-gradient(#050505,#080a10)]" />

          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.04fr_.96fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-orange-200">
                <PlatformIcon platform="Facebook" className="h-4 w-4" />
                Facebook Growth India
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">
                Build a stronger{" "}
                <span className="bg-gradient-to-r from-orange-300 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  Facebook growth system
                </span>{" "}
                in India.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Bring followers, likes, views, content quality and campaign
                strategy together in one place. Choose the growth signal that
                matches your actual Facebook objective.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/buy-facebook-followers-india"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-black text-black shadow-[0_18px_42px_-18px_rgba(255,153,0,.9)] transition hover:-translate-y-0.5"
                >
                  Explore Facebook Followers
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-bold transition hover:border-orange-400/35"
                >
                  Browse All Services
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Public-link ordering",
                  "Transparent service details",
                  "Dashboard tracking",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-xs font-bold text-slate-300"
                  >
                    <ShieldCheck className="h-4 w-4 text-orange-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* PREMIUM VISUAL CARD */}
            <aside className="relative">
              <div className="absolute -inset-12 -z-10 bg-orange-500/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#17191f,#0d0f14_55%,#090a0d)] p-5 shadow-[0_40px_100px_-48px_rgba(255,122,0,.9)] sm:p-7">
                <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
                      <PlatformIcon
                        platform="Facebook"
                        className="h-6 w-6 text-white"
                      />
                    </span>

                    <div>
                      <p className="text-sm font-black">
                        Facebook Growth System
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[.15em] text-orange-300">
                        Strategy Preview
                      </p>
                    </div>
                  </div>

                  <Sparkles className="h-5 w-5 text-orange-300" />
                </div>

                <div className="relative mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">
                    Growth flow
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      ["Audience", "Followers", "01"],
                      ["Engagement", "Likes", "02"],
                      ["Visibility", "Views", "03"],
                    ].map(([label, value, number], index) => (
                      <div key={label}>
                        <div className="flex items-center gap-4">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-xs font-black text-orange-300">
                            {number}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-bold text-slate-400">
                                {label}
                              </p>
                              <p className="text-sm font-black text-white">
                                {value}
                              </p>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                style={{
                                  width:
                                    index === 0
                                      ? "82%"
                                      : index === 1
                                        ? "68%"
                                        : "74%",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-slate-500">
                    Visual framework only. This is not a customer performance
                    result or guarantee.
                  </p>
                </div>

                <div className="relative mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["Goal", "Clarity"],
                    ["Content", "Quality"],
                    ["Growth", "Support"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[.07] bg-white/[.035] p-3 text-center"
                    >
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-black text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* SERVICES */}
        <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                  Choose by campaign goal
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  One platform. Different growth signals.
                </h2>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-slate-400 lg:justify-self-end">
                Facebook followers, likes and views serve different purposes.
                Start with the objective instead of simply choosing the biggest
                number.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {services.map((service, index) => {
                const Icon = service.icon;

                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101116] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-orange-400/40"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/[.07] blur-3xl transition group-hover:bg-orange-500/15" />

                    <div className="relative flex items-center justify-between gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="text-4xl font-black text-white/[.04]">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="relative mt-6 text-[10px] font-black uppercase tracking-[.16em] text-orange-300">
                      {service.label}
                    </p>

                    <h3 className="relative mt-2 text-xl font-black">
                      {service.title}
                    </h3>

                    <p className="relative mt-3 text-sm leading-7 text-slate-400">
                      {service.description}
                    </p>

                    <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-black text-orange-200">
                      Explore service
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* GROWTH FRAMEWORK */}
        <section className="relative border-y border-white/10 bg-[#090A0E] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,.08),transparent_35%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-orange-300">
                <Layers3 className="h-6 w-6" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Facebook Growth Framework
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Growth works better when every stage supports the next.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Strong Facebook campaigns combine page positioning, content,
                engagement, distribution and measurement rather than relying on
                one metric alone.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {growthFramework.map((item) => (
                <article
                  key={item.step}
                  className="relative rounded-3xl border border-white/10 bg-white/[.025] p-6"
                >
                  <span className="text-4xl font-black text-orange-400/20">
                    {item.step}
                  </span>

                  <h3 className="mt-5 text-lg font-black">{item.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* OBJECTIVE SECTION */}
        <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-orange-300">
                <Target className="h-6 w-6" />
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-black sm:text-4xl">
                Start with the problem you actually want to solve.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                More followers cannot fix weak content, and more views cannot
                automatically create a loyal audience. Match the service to the
                stage of your Facebook presence.
              </p>

              <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-5">
                <p className="text-xs font-black uppercase tracking-[.15em] text-orange-200">
                  Example
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  If your page already has a reasonable follower count but your
                  new videos receive weak visible activity, improving the video
                  creative and supporting video visibility may make more sense
                  than adding more followers.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#121319,#0d0e12)] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">
                    Campaign decision map
                  </p>
                  <h3 className="mt-2 text-xl font-black">
                    What are you trying to improve?
                  </h3>
                </div>

                <BarChart3 className="h-6 w-6 text-orange-300" />
              </div>

              <div className="mt-7 space-y-3">
                {[
                  [
                    "My page looks too small",
                    "Focus on audience-building and profile quality.",
                  ],
                  [
                    "My posts look inactive",
                    "Review content quality and visible engagement.",
                  ],
                  [
                    "My videos need more visibility",
                    "Improve hooks, retention and video distribution.",
                  ],
                ].map(([problem, action]) => (
                  <div
                    key={problem}
                    className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"
                  >
                    <p className="text-sm font-black text-white">{problem}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-400">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STRATEGY */}
        <section className="border-y border-white/10 bg-[#090A0E] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Better Facebook fundamentals
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Improve the content before boosting the signal.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                The strongest Facebook presence combines useful content,
                consistent branding and smart promotion.
              </p>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2">
              {strategyPoints.map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TOOLS */}
        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-orange-400/20 bg-[radial-gradient(circle_at_80%_20%,rgba(255,122,0,.12),transparent_30%),linear-gradient(135deg,#15120e,#0d0e12)] p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                  Free growth tools
                </p>

                <h2 className="mt-3 max-w-2xl text-3xl font-black">
                  Plan your campaign before spending on growth.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                  Use SocialRUSH creator tools to think through your growth goal,
                  budget and content priorities first.
                </p>
              </div>

              <TrendingUp className="hidden h-12 w-12 text-orange-300 lg:block" />
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <Link
                href="/tools/creator-growth-goal-planner"
                className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-orange-400/35"
              >
                <p className="font-black">Growth Goal Planner</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Clarify the objective before choosing a campaign.
                </p>
              </Link>

              <Link
                href="/tools/social-media-growth-budget-calculator"
                className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-orange-400/35"
              >
                <p className="font-black">Growth Budget Calculator</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Plan how much budget you want to allocate.
                </p>
              </Link>

              <Link
                href="/tools/creator-growth-checklist"
                className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-orange-400/35"
              >
                <p className="font-black">Creator Growth Checklist</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Review important growth fundamentals before promotion.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-5 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Facebook Growth FAQ
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Common questions from Facebook users in India
              </h2>
            </div>

            <div className="mt-9 space-y-3">
              {faq.map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0}
                  className="group rounded-2xl border border-white/10 bg-[#101116] p-5 transition open:border-orange-400/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black">
                    {item.question}

                    <span className="text-xl text-orange-300 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-slate-400">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            {/* FINAL CTA */}
            <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-orange-400/25 bg-[linear-gradient(135deg,#22160c,#111217)] p-7 text-center sm:p-10">
              <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />

              <div className="relative">
                <Sparkles className="mx-auto h-6 w-6 text-orange-300" />

                <p className="mt-4 text-xs font-black uppercase tracking-[.16em] text-orange-200">
                  Ready to explore?
                </p>

                <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black">
                  Choose the Facebook service that matches your growth goal.
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  Review the current service details, quantity and pricing
                  before placing your order.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/buy-facebook-followers-india"
                    className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black"
                  >
                    Explore Facebook Followers
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/services"
                    className="inline-flex min-h-12 items-center rounded-xl border border-white/15 px-5 text-sm font-black"
                  >
                    Browse All Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}