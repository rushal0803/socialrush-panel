import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, Layers3, ShieldCheck, Users2 } from "lucide-react";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import IndiaGrowthDiscovery from "@/components/marketing/IndiaGrowthDiscovery";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Services India | SocialRUSH",
  description: "Explore SocialRUSH social media growth services in India across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X with live pricing and public-link ordering.",
  path: "/social-media-growth-india",
  keywords: [
    "social media growth services India",
    "social media services India",
    "Instagram growth India",
    "YouTube growth India",
    "LinkedIn growth India",
    "social media packages India",
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

const faq = [
  ["Which social media growth services does SocialRUSH offer in India?", "The live SocialRUSH catalog covers eligible services across Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X/Twitter. Availability, pricing, delivery and refill information can vary by service and should be reviewed before checkout."],
  ["Do I need to share my social media password?", "No. SocialRUSH ordering uses the relevant public profile, page, post, channel or video link. Never share a password, OTP or recovery code."],
  ["Are prices fixed?", "Use the live service or package page for the current INR rate and exact total. Avoid relying on old screenshots or quoted prices because active service details can change."],
  ["Do these services guarantee reach, leads or sales?", "No. Followers, subscribers, views or engagement services do not guarantee organic reach, platform ranking, monetization, leads or sales. They should be considered alongside useful content and a broader marketing strategy."],
];

export default function SocialMediaGrowthIndiaPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Social media growth services in India",
    itemListElement: platforms.map(([name, , path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: `https://www.getsocialrush.com${path}`,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Social Media Growth India", path: "/social-media-growth-india" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(245,158,11,.10),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.2em] text-orange-300">SocialRUSH India growth hub</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-5xl lg:text-6xl">Social media growth services in India, organized around the goal.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Compare supported platforms, review current service information and choose a campaign path without jumping between disconnected pages. Every order still uses the live SocialRUSH catalog and the normal secure checkout flow.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/services" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">Explore live services <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/packages" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-black text-white">Compare packages <Layers3 className="h-4 w-4" /></Link>
            </div>
          </div>
          <aside className="rounded-3xl border border-orange-400/20 bg-[#101116]/90 p-6 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Before you order</p>
            <div className="mt-5 space-y-4">
              {[
                [ShieldCheck, "Public-link ordering", "Never share a social media password, OTP or recovery code."],
                [BarChart3, "Live service facts", "Review current INR pricing, delivery and refill information before checkout."],
                [BookOpenCheck, "Use a wider strategy", "Treat paid campaign signals as support for useful content, not a guarantee of business results."],
              ].map(([Icon, title, text]) => <div key={String(title)} className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Icon className="h-5 w-5" /></span><div><h2 className="text-sm font-black">{String(title)}</h2><p className="mt-1 text-xs leading-5 text-slate-400">{String(text)}</p></div></div>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Explore by platform</p><h2 className="mt-2 text-3xl font-black">Seven platforms. One current catalog.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Use these platform paths to filter the live directory. Only currently supported and orderable services should be used for an active campaign.</p></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map(([name, text, href]) => <Link key={name} href={href} className="group rounded-2xl border border-white/10 bg-[#101116] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Users2 className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-300" /></div><h3 className="mt-4 text-lg font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></Link>)}
        </div>
      </section>

      <IndiaGrowthDiscovery />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">How to choose</p><h2 className="mt-2 text-3xl font-black">Start with the metric that matches the actual gap.</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["Audience scale", "If a credible profile or channel needs a stronger visible audience, compare follower or subscriber options and keep content quality central."],
            ["Content activity", "If the audience exists but posts or videos need more visible activity, compare eligible view, like or engagement services."],
            ["Client campaigns", "If you manage multiple brands or recurring work, use packages and the authenticated agency workspace instead of treating every order as unrelated."],
          ].map(([title, text]) => <article key={title} className="rounded-2xl border border-white/10 bg-[#0d0e12] p-5"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8"><div className="rounded-3xl border border-white/10 bg-[#101116] p-6 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Helpful answers</p><h2 className="mt-2 text-2xl font-black">India growth services FAQ</h2><div className="mt-6 divide-y divide-white/10">{faq.map(([question, answer]) => <details key={question} className="group py-4"><summary className="cursor-pointer list-none pr-6 text-sm font-black">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{answer}</p></details>)}</div></div></section>
    </main>
  );
}
