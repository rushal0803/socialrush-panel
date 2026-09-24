import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Search, ShieldCheck } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import { activeSmmServices, platformMeta } from "@/lib/smm-service-catalog";

const canonicalServicePaths: Record<string, string> = {
  "linkedin-followers": "/linkedin-followers",
  "linkedin-likes": "/linkedin-likes",
  "linkedin-usa-connections": "/services/linkedin-usa-connections",
  "linkedin-usa-post-likes": "/services/linkedin-usa-post-likes",
  "linkedin-usa-reposts": "/services/linkedin-usa-reposts",
  "linkedin-usa-endorsements": "/services/linkedin-usa-endorsements",
  "linkedin-usa-group-members": "/services/linkedin-usa-group-members",
  "linkedin-usa-followers": "/services/linkedin-usa-followers",
  "linkedin-usa-custom-comments": "/services/linkedin-usa-custom-comments",
  "x-followers": "/twitter-followers",
  "tiktok-followers": "/tiktok-followers",
  "telegram-members": "/telegram-members",
};

const copy: Record<"linkedin" | "x" | "tiktok" | "telegram", { eyebrow: string; title: string; intro: string; guide: string; benefits: string[] }> = {
  linkedin: {
    eyebrow: "LINKEDIN GROWTH SERVICES",
    title: "LinkedIn Growth Services for Profiles, Posts and Communities",
    intro: "Compare all available SocialRUSH LinkedIn services in one place, including followers, likes and USA-focused campaign options. Review the right destination link before you order.",
    guide: "Choose the service that matches your goal, open the service page, review the current requirements, then continue to the secure order flow.",
    benefits: ["Professional profile growth", "Post engagement options", "USA-focused service options", "Public-link ordering"],
  },
  x: {
    eyebrow: "TWITTER / X GROWTH SERVICES",
    title: "Twitter / X Growth Services for Followers and Engagement",
    intro: "Browse SocialRUSH Twitter / X services for follower growth, likes, views, repost activity and campaign-specific engagement options with clear service requirements.",
    guide: "Select the X service that matches your campaign, confirm the correct public profile or post link, then review the service details before checkout.",
    benefits: ["Follower growth options", "Post engagement services", "Crypto-focused options", "Public-link ordering"],
  },
  telegram: {
    eyebrow: "TELEGRAM GROWTH SERVICES",
    title: "Telegram Growth Services for Members, Views, Reactions and Polls",
    intro: "Explore SocialRUSH Telegram services for channel or group members, post views, reactions and poll votes from one focused service hub.",
    guide: "Choose the Telegram service that matches your goal, use the exact public channel, group, post or poll link requested, and review current service details before ordering.",
    benefits: ["Community growth", "Post visibility", "Reaction activity", "Poll engagement"],
  },
  tiktok: {
    eyebrow: "TIKTOK GROWTH SERVICES",
    title: "TikTok Growth Services for Followers, Views and Engagement",
    intro: "Explore all available SocialRUSH TikTok services, including followers, likes, views, comments, story views and saves, from one focused service hub.",
    guide: "Pick the TikTok service you need, use the exact public profile or content link requested, and review the current service details before ordering.",
    benefits: ["Follower growth", "Video engagement", "Comment activity", "Story and save options"],
  },
};

function hrefFor(code: string) {
  return canonicalServicePaths[code] ?? `/services/${code}`;
}

export default function PlatformServicesLanding({ platform }: { platform: "linkedin" | "x" | "tiktok" | "telegram" }) {
  const meta = platformMeta[platform];
  const services = activeSmmServices.filter((service) => service.platform === platform);
  const pageCopy = copy[platform];

  return (
    <PublicShell>
      <main className="relative overflow-hidden bg-[#08090c] text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_12%,rgba(255,122,0,.18),transparent_30rem),radial-gradient(circle_at_88%_15%,rgba(255,185,70,.10),transparent_25rem)]" />

        <section className="relative px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-xs font-semibold text-white/55">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/services" className="hover:text-white">Services</Link>
              <span className="mx-2">/</span>
              <span className="text-orange-300">{meta.label}</span>
            </nav>

            <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-[#111318]/95 p-6 shadow-[0_28px_80px_-44px_rgba(255,122,0,.75)] sm:p-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:p-12">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black tracking-[.16em] text-orange-200">
                  <PlatformIcon platform={meta.icon} className="h-4 w-4" />
                  {pageCopy.eyebrow}
                </div>
                <h1 className="mt-5 max-w-4xl text-3xl font-black leading-[1.07] tracking-[-.035em] sm:text-5xl lg:text-6xl">{pageCopy.title}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#c5cad3] sm:text-base">{pageCopy.intro}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={`/services?platform=${platform}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black shadow-[0_14px_32px_-20px_rgba(255,122,0,.95)] hover:brightness-110">Browse live services <ArrowRight className="h-4 w-4" /></Link>
                  <Link href="/dashboard/new-order" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[.05] px-5 text-sm font-black text-white hover:border-orange-400/50">Start order</Link>
                </div>
              </div>

              <aside className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[.14em] text-orange-300">At a glance</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-3xl font-black">{services.length}</p><p className="mt-1 text-xs font-bold text-white/55">services available</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-3xl font-black">24/7</p><p className="mt-1 text-xs font-bold text-white/55">online ordering</p></div>
                </div>
                <div className="mt-4 space-y-3 text-sm text-[#c5cad3]">
                  <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />No password required</p>
                  <p className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />Service-specific delivery details</p>
                  <p className="flex gap-2"><Search className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />Clear public-link requirements</p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black tracking-[.16em] text-orange-300">ALL {meta.label.toUpperCase()} SERVICES</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Choose the exact service for your campaign</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">{pageCopy.guide}</p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article key={service.code} className="group rounded-[1.5rem] border border-white/10 bg-[#111318] p-5 transition hover:-translate-y-1 hover:border-orange-400/45 hover:shadow-[0_20px_45px_-30px_rgba(255,122,0,.75)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-200"><PlatformIcon platform={meta.icon} className="h-5 w-5" /></div>
                    <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white/55">{meta.label}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black tracking-tight">{service.name}</h3>
                  <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-white/58">{service.description}</p>
                  <div className="mt-4 space-y-2 text-xs font-semibold text-white/62">
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{service.importantInstruction}</p>
                    <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-orange-300" />Delivery details shown before ordering</p>
                  </div>
                  <Link href={hrefFor(service.code)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/[.08] px-4 text-sm font-black text-orange-200 transition group-hover:bg-orange-500/[.14]">View service <ArrowRight className="h-4 w-4" /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pageCopy.benefits.map((benefit) => <div key={benefit} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><CheckCircle2 className="h-5 w-5 text-orange-300" /><p className="mt-3 text-sm font-black">{benefit}</p></div>)}
          </div>
        </section>

        {platform === "linkedin" && (
          <section className="relative px-4 pb-10 sm:px-6 lg:px-8" aria-labelledby="linkedin-guides-title">
            <div className="mx-auto max-w-7xl rounded-[1.7rem] border border-white/10 bg-[#111318] p-6 sm:p-9">
              <h2 id="linkedin-guides-title" className="text-2xl font-black tracking-tight sm:text-3xl">Choose the right LinkedIn signal</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">Followers build a visible audience on a profile or company page. Connections concern a personal profile network. Likes, comments and reposts apply to individual posts; group members and skill endorsements have different destinations. Check each service page for eligibility and current catalog details.</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-orange-200">
                <Link href="/linkedin-growth-india" className="hover:text-white">LinkedIn growth in India</Link>
                <Link href="/blog/linkedin-followers-vs-engagement-india" className="hover:text-white">Followers vs engagement guide</Link>
                <Link href="/blog/linkedin-followers-for-business-growth" className="hover:text-white">Followers for business growth</Link>
              </div>
            </div>
          </section>
        )}

        <section className="relative px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.7rem] border border-orange-400/20 bg-gradient-to-br from-orange-500/[.12] to-white/[.025] p-6 sm:p-9">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Ready to choose your {meta.label} service?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">Compare the available options above, open the service that matches your goal, and review the current ordering requirements before checkout.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href={`/services?platform=${platform}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black">Browse services</Link><Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 bg-white/[.05] px-5 text-sm font-black">Contact support</Link></div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
