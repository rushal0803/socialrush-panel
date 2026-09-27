import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Link2, ShieldCheck, WalletCards } from "lucide-react";
import { contentClusters, type ContentPlatform } from "@/lib/seo/content-clusters";
import { platformSmmIntent } from "@/lib/seo/platform-smm-intent";

const facts = [
  { icon: BadgeIndianRupee, title: "INR-first comparison", text: "Review current service rates and quantity-based totals before checkout." },
  { icon: Link2, title: "Public-link ordering", text: "Use the public profile, post, video, channel, page or group link required by the selected service." },
  { icon: WalletCards, title: "India-friendly payment flow", text: "Review the payment methods currently shown at checkout; availability can change by flow." },
  { icon: ShieldCheck, title: "Delivery and support terms", text: "Check the current delivery estimate, refill or support terms, and dashboard tracking for the exact service." },
] as const;

export default function PlatformSmmIntentSection({ platform }: { platform: ContentPlatform }) {
  const cluster = contentClusters[platform];
  const intent = platformSmmIntent[platform];
  return (
    <section className="border-y border-white/10 bg-[#090B10] px-5 py-14 text-white sm:px-6 lg:px-8 lg:py-18" aria-labelledby={`${platform}-smm-panel-heading`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.17em] text-orange-300">{intent.primaryKeyword}</p>
            <h2 id={`${platform}-smm-panel-heading`} className="mt-3 max-w-4xl text-3xl font-black tracking-[-.035em] sm:text-4xl">
              Compare {cluster.label} services from one canonical India hub
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              {intent.description} The live service page and checkout remain authoritative for current price, minimum and maximum quantity, delivery, refill eligibility and availability.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href={cluster.serviceLinks[0]?.href || "/services"} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
              Explore {cluster.label} services <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[.05] px-5 text-sm font-black text-slate-200">
              Review pricing
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {facts.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <Icon className="h-5 w-5 text-orange-300" />
              <h3 className="mt-3 text-sm font-black">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-[#111318] p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[.14em] text-orange-300">Current {cluster.label} service paths</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cluster.serviceLinks.map((service) => (
              <Link key={service.href} href={service.href} className="group flex min-h-14 items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-orange-400/40">
                <span className="text-sm font-black">{service.label}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-orange-300 transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-5 text-slate-500">
            SocialRUSH does not claim universal “best,” “#1,” “cheapest,” guaranteed reach, sales or platform outcomes. Compare the current facts for the exact service you need.
          </p>
        </div>
      </div>
    </section>
  );
}
