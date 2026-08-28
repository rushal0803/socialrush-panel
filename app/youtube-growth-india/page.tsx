import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import PublicShell from "@/components/marketing/PublicShell";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "YouTube Growth Services in India",
  description:
    "Explore YouTube growth in India across subscribers, views, likes, comments and watch hours. Compare goals and choose the right SocialRUSH service.",
  path: "/youtube-growth-india",
});

const growthOptions = [
  {
    title: "YouTube Subscribers",
    description:
      "Build stronger visible channel credibility when your goal is growing your subscriber count.",
    href: "/youtube-subscribers",
    label: "Channel growth",
  },
  {
    title: "YouTube Views",
    description:
      "Support the visible view count of eligible public videos as part of a wider content strategy.",
    href: "/youtube-views",
    label: "Video visibility",
  },
  {
    title: "YouTube Likes",
    description:
      "Strengthen visible engagement on selected public YouTube videos.",
    href: "/youtube-likes",
    label: "Engagement",
  },
  {
    title: "YouTube Comments",
    description:
      "Explore comment engagement for videos where visible conversation supports your campaign.",
    href: "/buy-youtube-comments-india",
    label: "Conversation",
  },
  {
    title: "YouTube Watch Hours",
    description:
      "Understand watch-hour campaigns and review the active service requirements before ordering.",
    href: "/buy-youtube-watch-hours-india",
    label: "Watch time",
  },
];

const steps = [
  "Decide what you want to improve on YouTube.",
  "Choose the service that matches that objective.",
  "Review the current quantity, pricing and delivery information.",
  "Provide the correct public YouTube channel or video link.",
  "Track supported order updates from your SocialRUSH dashboard.",
];

const strategyPoints = [
  "Use clear, curiosity-driven video titles without misleading viewers.",
  "Create thumbnails that communicate one strong idea quickly.",
  "Give viewers a reason to stay during the opening seconds.",
  "Publish around a clear niche instead of unrelated topics.",
  "Study audience retention and improve weak sections in future videos.",
  "Use promotional services as support for content, not a replacement for it.",
];

const faq = [
  {
    question: "What is the best YouTube growth service in India?",
    answer:
      "There is no single best service for every channel. Subscribers support visible channel size, views support video visibility, likes and comments support engagement, while watch hours serve a different objective. Choose according to your current goal.",
  },
  {
    question: "Should I focus on subscribers or views first?",
    answer:
      "It depends on your channel. A new channel may care more about building its subscriber base, while a channel with an existing audience may focus on increasing visibility and engagement around specific videos.",
  },
  {
    question: "Can buying YouTube services guarantee monetization?",
    answer:
      "No. SocialRUSH does not guarantee YouTube monetization, revenue, ranking, recommendations or channel approval. YouTube applies its own eligibility, policy and review requirements.",
  },
  {
    question: "Do I need to provide my YouTube password?",
    answer:
      "No. SocialRUSH services use the relevant public YouTube channel or video link. Never provide your Google or YouTube password.",
  },
  {
    question: "Can I track my YouTube order?",
    answer:
      "Yes. Supported order information and status can be viewed through the SocialRUSH customer dashboard after ordering.",
  },
];

export default function YouTubeGrowthIndiaPage() {
  return (
    <PublicShell>
      <main className="bg-[#050505] text-white">
        <section className="relative overflow-hidden px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(255,122,0,.22),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(255,176,0,.12),transparent_28%),linear-gradient(#050505,#090a0f)]" />

          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-orange-200">
                <PlayCircle className="h-4 w-4" />
                YouTube Growth India
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-.05em] sm:text-6xl lg:text-7xl">
                Build a smarter YouTube growth strategy in India.
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Explore YouTube subscribers, views, likes, comments and watch
                hours from one growth hub. Start with your channel objective,
                then choose the service that actually matches it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/youtube-subscribers"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-black text-black"
                >
                  Explore YouTube Subscribers
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-bold"
                >
                  Browse All Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Choose by objective
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Different YouTube metrics solve different problems.
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                Subscriber count, views, engagement and watch time are not the
                same thing. Compare your options before choosing a campaign.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {growthOptions.map((option) => (
                <Link
                  key={option.title}
                  href={option.href}
                  className="group rounded-3xl border border-white/10 bg-[#101116] p-6 transition hover:-translate-y-1 hover:border-orange-400/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-300">
                      <TrendingUp className="h-5 w-5" />
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {option.label}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black">{option.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {option.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-200">
                    Explore service
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#090A0E] px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-orange-300">
                <Target className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-3xl font-black">
                Start with the channel goal.
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                YouTube growth comes from useful content, strong packaging,
                audience retention, consistent publishing and smart
                distribution. Promotional services should support those
                fundamentals rather than replace them.
              </p>

              <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-5">
                <p className="text-sm font-bold text-orange-200">
                  Example
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  If a channel already has subscribers but new videos struggle
                  to attract attention, focusing only on subscriber count may
                  not address the main problem. Video visibility, packaging and
                  retention may deserve more attention.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111217] p-6 sm:p-8">
              <h3 className="text-xl font-black">
                Simple YouTube ordering process
              </h3>

              <div className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/10 text-xs font-black text-orange-300">
                      {index + 1}
                    </span>

                    <p className="pt-1 text-sm leading-6 text-slate-300">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                Watch time matters
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Views and watch hours are different metrics.
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                A view records video activity, while watch time relates to how
                long content is watched. If your objective involves watch
                hours, review the specific watch-hour service requirements
                rather than assuming a normal view campaign provides the same
                result.
              </p>

              <Link
                href="/buy-youtube-watch-hours-india"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-5 text-sm font-black text-orange-100"
              >
                <Clock3 className="h-4 w-4" />
                Explore YouTube Watch Hours
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#090A0E] px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
              Better YouTube fundamentals
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-black">
              Improve the content before increasing the numbers.
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {strategyPoints.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tools/youtube-engagement-rate-calculator"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-100"
              >
                YouTube Engagement Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/tools/youtube-thumbnail-preview"
                className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold"
              >
                Thumbnail Preview Tool
              </Link>

              <Link
                href="/tools/youtube-revenue-calculator"
                className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-bold"
              >
                YouTube Revenue Calculator
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
              YouTube Growth FAQ
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Common questions from YouTube creators in India
            </h2>

            <div className="mt-8 space-y-3">
              {faq.map((item) => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-white/10 bg-[#101116] p-5"
                >
                  <h3 className="font-black">{item.question}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-orange-400/25 bg-gradient-to-br from-orange-500/[.12] to-transparent p-7 sm:p-9">
              <div className="flex items-center gap-2 text-orange-200">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-[.16em]">
                  Explore your options
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black">
                Choose the YouTube service that matches your goal.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Review the current service details, quantity, pricing and
                requirements before placing an order.
              </p>

              <Link
                href="/services"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black"
              >
                Explore YouTube Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
