import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import PublicShell from "@/components/marketing/PublicShell";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Instagram Growth India | Followers, Likes, Views & Engagement",
  description:
    "Explore Instagram growth options in India including followers, likes, views, comments, saves and shares. Compare goals, understand engagement signals and choose the right SocialRUSH service.",
  path: "/instagram-growth-india",
});

const growthOptions = [
  {
    title: "Instagram Followers",
    description:
      "Build a stronger follower count and improve the first impression of your Instagram profile.",
    href: "/buy-instagram-followers-india",
  },
  {
    title: "Instagram Likes",
    description:
      "Support engagement on posts and reels when your campaign goal is stronger visible interaction.",
    href: "/buy-instagram-likes-india",
  },
  {
    title: "Instagram Views",
    description:
      "Increase visible reach signals on eligible Instagram video and reel content.",
    href: "/buy-instagram-views-india",
  },
  {
    title: "Instagram Comments",
    description:
      "Explore comment services when conversation and visible engagement matter to your campaign.",
    href: "/buy-instagram-comments-india",
  },
  {
    title: "Instagram Saves",
    description:
      "Use saves as one part of a broader content-engagement strategy for useful or evergreen posts.",
    href: "/buy-instagram-saves-india",
  },
  {
    title: "Instagram Shares",
    description:
      "Explore share services for content designed to be distributed beyond the original audience.",
    href: "/buy-instagram-shares-india",
  },
];

const steps = [
  "Choose one clear Instagram growth goal.",
  "Select the service that matches that goal.",
  "Review the current price, quantity and service details.",
  "Enter the correct public Instagram link.",
  "Track your order from the SocialRUSH dashboard.",
];

const faq = [
  {
    question: "What is the best Instagram growth service in India?",
    answer:
      "There is no single best service for every account. Followers can support profile social proof, while likes, views, comments, saves and shares serve different engagement goals. Choose the service that matches what you are trying to improve.",
  },
  {
    question: "Should I buy followers or engagement first?",
    answer:
      "It depends on your current profile. A newer profile may focus on follower count, while an established profile may benefit more from engagement around specific posts or reels.",
  },
  {
    question: "Does SocialRUSH guarantee Instagram reach or sales?",
    answer:
      "No. Instagram distribution, reach, sales and business results depend on many factors outside SocialRUSH. Services should support a broader content and marketing strategy rather than replace it.",
  },
  {
    question: "Can I track my Instagram order?",
    answer:
      "Yes. SocialRUSH customers can view supported order information and status from their dashboard after placing an order.",
  },
];

export default function InstagramGrowthIndiaPage() {
  return (
    <PublicShell>
      <main className="bg-[#050505] text-white">
        <section className="relative overflow-hidden px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,122,0,.22),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(255,176,0,.12),transparent_28%),linear-gradient(#050505,#090a0f)]" />

          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-orange-200">
                <Sparkles className="h-4 w-4" />
                Instagram Growth India
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-.05em] sm:text-6xl lg:text-7xl">
                Build a smarter Instagram growth strategy in India.
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Explore Instagram followers, likes, views, comments, saves and
                shares from one growth hub. Choose services around your real
                campaign goal instead of ordering without a strategy.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/buy-instagram-followers-india"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-black text-black"
                >
                  Explore Instagram Followers
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
                Choose by goal
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Instagram growth is more than follower count.
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                Different Instagram signals support different goals. Use the
                options below to choose the service that best matches your
                campaign.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {growthOptions.map((option) => (
                <Link
                  key={option.title}
                  href={option.href}
                  className="group rounded-3xl border border-white/10 bg-[#101116] p-6 transition hover:-translate-y-1 hover:border-orange-400/40"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-300">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {option.title}
                  </h3>

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
                Start with the objective, not the number.
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                A strong Instagram strategy combines content quality,
                consistency, profile positioning and the right engagement
                signals. SocialRUSH services should support that strategy, not
                replace it.
              </p>

              <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-5">
                <p className="text-sm font-bold text-orange-200">
                  Example
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  If your profile already has followers but new reels receive
                  weak visible interaction, an engagement-focused service may
                  make more sense than simply increasing follower count again.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111217] p-6 sm:p-8">
              <h3 className="text-xl font-black">
                Simple Instagram ordering process
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
                Better Instagram decisions
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Improve the content before boosting the signal.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                "Use a clear profile photo, bio and call to action.",
                "Create reels with a strong first few seconds.",
                "Make posts useful enough to earn genuine saves and shares.",
                "Keep branding and visual style consistent.",
                "Track which content formats actually perform best.",
                "Use paid or promotional growth as support, not the entire strategy.",
              ].map((item) => (
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
                href="/tools/instagram-engagement-rate-calculator"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-bold text-orange-100"
              >
                Instagram Engagement Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/tools/instagram-caption-counter"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold"
              >
                Instagram Caption Counter
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
              Instagram Growth FAQ
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Common questions from Instagram users in India
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
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-200">
                Ready to explore?
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Choose the Instagram service that matches your goal.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Review the current service details, quantity and pricing before
                placing an order.
              </p>

              <Link
                href="/services"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-black"
              >
                Explore Instagram Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}