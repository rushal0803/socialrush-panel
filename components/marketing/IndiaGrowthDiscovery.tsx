import Link from "next/link";
import { ArrowRight, BookOpen, Layers3, PackageSearch, TrendingUp } from "lucide-react";

const moneyPages = [
  {
    title: "Instagram Followers India",
    text: "Review live INR pricing, quantity, delivery and refill information for a public Instagram profile.",
    href: "/buy-instagram-followers-india",
  },
  {
    title: "YouTube Subscribers India",
    text: "Compare the current subscriber rate and order requirements for a public YouTube channel.",
    href: "/youtube-subscribers",
  },
  {
    title: "LinkedIn Followers India",
    text: "Review current LinkedIn follower pricing and the public-link order flow for profiles or company pages.",
    href: "/linkedin-followers",
  },
];

const discoveryLinks = [
  { title: "All growth services", text: "Compare the live catalog across seven supported platforms.", href: "/services", icon: PackageSearch },
  { title: "Compare packages", text: "Choose a platform, goal and quantity before starting an order.", href: "/packages", icon: Layers3 },
  { title: "Growth guides", text: "Use practical India-focused guides alongside any paid campaign.", href: "/blog", icon: BookOpen },
];

export default function IndiaGrowthDiscovery({ compact = false }: { compact?: boolean }) {
  return (
    <section className="border-y border-white/10 bg-[#090909] px-4 py-10 text-white sm:px-6 lg:px-8" aria-labelledby="india-growth-discovery-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">India growth directory</p>
            <h2 id="india-growth-discovery-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Find the right SocialRUSH path before you order.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Start with a focused India service page or compare the live catalog. Current pricing, delivery estimates and refill information are shown before checkout; follower, subscriber or engagement services do not guarantee organic reach, leads, sales or platform outcomes.</p>
          </div>
          <Link href="/social-media-growth-india" className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-sm font-black text-orange-200 transition hover:border-orange-300/50 hover:bg-orange-500/15">Explore India growth hub <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className={`mt-6 grid gap-3 ${compact ? "lg:grid-cols-3" : "md:grid-cols-3"}`}>
          {moneyPages.map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/10 bg-[#111216] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><TrendingUp className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-black">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{item.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">Review service <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>

        {!compact ? <div className="mt-3 grid gap-3 md:grid-cols-3">
          {discoveryLinks.map(({ title, text, href, icon: Icon }) => (
            <Link key={href} href={href} className="rounded-2xl border border-white/[.07] bg-black/20 p-4 transition hover:border-white/20">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[.05] text-slate-300"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>
            </Link>
          ))}
        </div> : null}
      </div>
    </section>
  );
}
