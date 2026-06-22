import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";
import PortalCTA from "@/components/marketing/PortalCTA";
import PublicShell from "@/components/marketing/PublicShell";
import { agencyServices } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Social Media Growth Services",
  description: "Browse SocialRUSH Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X followers, likes, views, and subscriber services.",
};

const platforms = [
  ["Instagram", "Followers, likes, and video views for creators, brands, and public profiles."],
  ["YouTube", "Subscriber, like, and view services for channels and public videos."],
  ["Facebook", "Page followers, post likes, and video views for public business content."],
  ["LinkedIn", "Profile followers and post likes for professional visibility."],
  ["TikTok", "Follower, like, and video-view services for public creator content."],
  ["Twitter/X", "Follower growth campaigns for public profiles on X."],
] as const;

export default function ServicesPage() {
  return (
    <PublicShell>
      <PageHero eyebrow="Social media growth services" title="Choose the right growth service for every platform." description="Compare customer-friendly service names, starting rates, delivery features, and recommended uses before placing a campaign in your protected dashboard." />
      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Service platforms" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{platforms.map(([platform]) => <a key={platform} href={`#${platform.toLowerCase().replace("/", "-")}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{platform}</a>)}</nav>
          <div className="mt-16 space-y-20">
            {platforms.map(([platform, description]) => {
              const services = agencyServices.filter((service) => service.platform === platform);
              return <section id={platform.toLowerCase().replace("/", "-")} key={platform} className="scroll-mt-28"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">{platform} growth</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#07152f]">{platform} services</h2><p className="mt-3 text-sm leading-7 text-slate-600">{description}</p></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service, index) => <article id={service.slug} key={service.slug} className="group scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-600">{platform.slice(0, 2).toUpperCase()}</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">{index === 0 ? "Popular" : "Tracked delivery"}</span></div><h3 className="mt-5 text-xl font-bold text-[#07152f]">{service.name}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{service.summary}</p><p className="mt-5 text-2xl font-bold text-blue-600">{service.price}</p><ul className="mt-5 space-y-2">{service.deliverables.map((item) => <li key={item} className="flex gap-2 text-xs text-slate-600"><span className="font-bold text-emerald-600">✓</span>{item}</li>)}</ul><p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500"><strong className="text-slate-700">Recommended for:</strong> {service.ideal}</p><PortalCTA className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#07152f] px-5 py-3 text-xs font-bold text-white transition group-hover:bg-blue-600">Order this service →</PortalCTA></article>)}</div></section>;
            })}
          </div>
        </div>
      </section>
      <section className="bg-[#07152f] px-5 py-14 text-white sm:px-6"><div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><h2 className="text-2xl font-bold">Ready to launch a campaign?</h2><p className="mt-2 text-sm text-slate-300">Create an account or open New Campaign to view current availability and the final total.</p></div><PortalCTA className="inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white">View live services →</PortalCTA></div></section>
    </PublicShell>
  );
}
