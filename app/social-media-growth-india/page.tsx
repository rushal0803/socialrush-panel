import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, BriefcaseBusiness, CheckCircle2, Layers3, ShieldCheck, TrendingUp, Users2, type LucideIcon } from "lucide-react";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import IndiaGrowthDiscovery from "@/components/marketing/IndiaGrowthDiscovery";
import PublicShell from "@/components/marketing/PublicShell";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Services India | Compare Platforms | SocialRUSH",
  description: "Compare SocialRUSH social media growth services in India across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X, then review current pricing and order requirements.",
  path: "/social-media-growth-india",
  keywords: [
    "social media growth services India",
    "social media services India",
    "Instagram growth India",
    "YouTube growth India",
    "LinkedIn growth India",
    "social media packages India",
    "social media services for agencies India",
  ],
});

const platforms = [
  ["Instagram", "Followers, likes, views and other eligible Instagram services.", "/services?platform=instagram"],
  ["YouTube", "Subscriber, video engagement and other eligible YouTube services.", "/services?platform=youtube"],
  ["Facebook", "Explore current Facebook page and post growth options.", "/services?platform=facebook"],
  ["LinkedIn", "Professional profile, company and engagement services where available.", "/services?platform=linkedin"],
  ["TikTok", "Follower and video engagement options from the current catalog.", "/services?platform=tiktok"],
  ["Telegram", "Channel and post activity options currently available to order.", "/services?platform=telegram"],
  ["X / Twitter", "Profile and post engagement options for eligible public links.", "/services?platform=x"],
] as const;

const commercialPaths = [
  ["Instagram followers", "For public Instagram profiles that need a visible audience-building service path.", "/buy-instagram-followers-india"],
  ["Instagram likes", "For eligible public posts and Reels where post-level activity is the goal.", "/instagram-likes"],
  ["Instagram views", "For eligible public video and Reel visibility campaigns.", "/instagram-views"],
  ["YouTube subscribers", "For public YouTube channels reviewing subscriber campaign options.", "/youtube-subscribers"],
  ["YouTube views", "For public videos where the campaign is centered on view activity.", "/youtube-views"],
  ["LinkedIn followers", "For professional profiles and company pages where the active service supports the destination.", "/linkedin-followers"],
  ["Facebook followers", "For supported public Facebook pages or profiles.", "/buy-facebook-followers-india"],
  ["TikTok followers", "For eligible public TikTok profiles with current catalog availability.", "/tiktok-followers"],
  ["X / Twitter followers", "For eligible public X / Twitter profiles using the current service terms.", "/twitter-followers"],
] as const;

const authorityGuides = [
  ["Instagram growth in India", "Organic profile and content foundations that help new visitors understand why they should follow.", "/blog/how-to-grow-instagram-followers-organically-india"],
  ["Instagram followers vs engagement", "A practical framework for balancing visible audience scale with saves, shares, comments and profile actions.", "/blog/instagram-followers-vs-engagement"],
  ["YouTube subscribers in India", "Channel positioning, search, playlists, retention and audience-building guidance for creators.", "/blog/how-to-increase-youtube-subscribers-in-india"],
  ["YouTube subscribers vs views", "Use the metric that matches the real channel bottleneck instead of chasing both at once.", "/blog/youtube-subscribers-vs-views-india"],
  ["LinkedIn business growth", "Build a useful professional audience through expertise, company clarity and consistent publishing.", "/blog/linkedin-followers-for-business-growth"],
  ["LinkedIn followers vs engagement", "Compare company-page credibility with meaningful professional interaction and business actions.", "/blog/linkedin-followers-vs-engagement-india"],
] as const;

const safeguards: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ShieldCheck, title: "Public-link ordering", text: "Never share a social media password, OTP or recovery code." },
  { icon: BarChart3, title: "Current service facts", text: "Review the active price, delivery estimate, quantity rules and refill information before checkout." },
  { icon: BookOpenCheck, title: "Use a wider strategy", text: "Treat paid campaign signals as support for useful content, not a guarantee of business results." },
];

const faq = [
  ["Which social media growth services does SocialRUSH offer in India?", "The SocialRUSH catalog covers eligible services across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X/Twitter. Availability, pricing, delivery and refill information can vary by service and should be reviewed before checkout."],
  ["How should I choose between followers, views and engagement services?", "Start with the actual campaign gap. Audience services relate to visible profile or channel scale, while views, likes and other engagement services are tied to eligible content. Review the service requirements and current terms before ordering."],
  ["Do I need to share my social media password?", "No. SocialRUSH ordering uses the relevant public profile, page, post, channel or video link. Never share a password, OTP or recovery code."],
  ["Are prices fixed?", "Use the current service or package page for the active INR rate and exact total. Avoid relying on old screenshots or quoted prices because service details can change."],
  ["Can an agency use SocialRUSH for repeat client campaigns?", "Yes. Agencies can review the multi-platform catalog and use the agency workflow for recurring requirements. Each order still follows the current service terms and normal checkout process."],
  ["Do these services guarantee reach, leads or sales?", "No. Followers, subscribers, views or engagement services do not guarantee organic reach, platform ranking, monetization, leads or sales. They should be considered alongside useful content and a broader marketing strategy."],
] as const;

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function SocialMediaGrowthIndiaPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Social media growth services in India",
    itemListElement: commercialPaths.map(([name, , path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: `${SEO_SITE_URL}${path}`,
    })),
  };
  const guideList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Social media growth guides for India",
    itemListElement: authorityGuides.map(([name, , path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: `${SEO_SITE_URL}${path}`,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };

  return (
    <PublicShell tone="light3d">
      <div className="bg-[#050505] text-white">
        <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Social Media Growth India", path: "/social-media-growth-india" }]} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(guideList) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />

        <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(245,158,11,.10),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-orange-300">SocialRUSH India growth hub</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-5xl lg:text-6xl">Compare social media growth services in India before you order.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Choose the platform and campaign type that match the actual goal, then review the current service price, quantity rules, delivery information and link requirements before checkout.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/services" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">Explore current services <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/packages" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-black text-white">Compare packages <Layers3 className="h-4 w-4" /></Link>
                <Link href="/for-agencies" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/[.06] px-5 text-sm font-black text-orange-200">Agency requirements <BriefcaseBusiness className="h-4 w-4" /></Link>
              </div>
            </div>
            <aside className="rounded-3xl border border-orange-400/20 bg-[#101116]/90 p-6 shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Before you order</p>
              <div className="mt-5 space-y-4">
                {safeguards.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Icon className="h-5 w-5" /></span><div><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div></div>)}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">High-intent service paths</p><h2 className="mt-2 text-3xl font-black">Go directly to the service you are comparing.</h2><p className="mt-3 text-sm leading-6 text-slate-400">These pages explain the relevant public-link requirement and connect to the current order experience. Review the active details before payment.</p></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {commercialPaths.map(([name, text, href]) => <Link key={href} href={href} className="group rounded-2xl border border-white/10 bg-[#101116] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><TrendingUp className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-300" /></div><h3 className="mt-4 text-lg font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></Link>)}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#090a0d] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Topical authority guides</p><h2 className="mt-2 text-3xl font-black">Connect the service to a stronger content strategy.</h2><p className="mt-3 text-sm leading-6 text-slate-400">These existing guides answer the informational questions around the same commercial topics, creating a clearer path from research to service comparison.</p></div>
            <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {authorityGuides.map(([name, text, href]) => <Link key={href} href={href} className="group rounded-2xl border border-orange-400/15 bg-orange-500/[.045] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/35"><BookOpenCheck className="h-5 w-5 text-orange-300" /><h3 className="mt-4 text-base font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">Read guide <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link>)}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Explore by platform</p><h2 className="mt-2 text-3xl font-black">Seven supported platform directories.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Use a platform directory when you want to compare several service types before choosing one.</p></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {platforms.map(([name, text, href]) => <Link key={name} href={href} className="group rounded-2xl border border-white/10 bg-[#101116] p-5 transition hover:border-orange-400/30"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Users2 className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-orange-300" /></div><h3 className="mt-4 text-lg font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></Link>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">How to choose</p><h2 className="mt-2 text-3xl font-black">Start with the metric that matches the actual gap.</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["Audience scale", "If a credible profile or channel needs a stronger visible audience, compare follower or subscriber options and keep content quality central."],
              ["Content activity", "If the audience exists but posts or videos need more visible activity, compare eligible view, like or engagement services."],
              ["Client campaigns", "If you manage multiple brands or recurring work, use the agency path and dashboard tools instead of treating every order as unrelated."],
            ].map(([title, text]) => <article key={title} className="rounded-2xl border border-white/10 bg-[#0d0e12] p-5"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}
          </div>
        </section>

        <IndiaGrowthDiscovery compact />

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"><div className="rounded-3xl border border-white/10 bg-[#101116] p-6 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Helpful answers</p><h2 className="mt-2 text-2xl font-black">India growth services FAQ</h2><div className="mt-6 divide-y divide-white/10">{faq.map(([question, answer]) => <details key={question} className="group py-4"><summary className="cursor-pointer list-none pr-6 text-sm font-black">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{answer}</p></details>)}</div></div></section>
      </div>
    </PublicShell>
  );
}
