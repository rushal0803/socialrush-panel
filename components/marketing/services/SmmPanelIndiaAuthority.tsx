import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Building2, CheckCircle2, Link2, ShieldCheck, WalletCards } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import { indiaCheckoutMethods } from "@/lib/seo/payment-intent";
import { smmPanelIndiaCriteria, smmPanelPlatformSummary } from "@/lib/seo/smm-panel-intent";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";

const platformLinks: Record<SmmPlatformId, string> = {
  instagram: "/instagram-growth-india",
  youtube: "/youtube-growth-india",
  facebook: "/facebook-growth-india",
  linkedin: "/linkedin-growth-india",
  telegram: "/services/telegram",
  tiktok: "/tiktok-growth-india",
  x: "/x-growth-india",
};

const criterionIcons = {
  pricing: BadgeIndianRupee,
  payments: WalletCards,
  requirements: Link2,
  delivery: ShieldCheck,
} as const;

export default function SmmPanelIndiaAuthority({ serviceCatalog }: { serviceCatalog: SmmService[] }) {
  const counts = serviceCatalog.reduce<Record<string, number>>((acc, service) => {
    acc[service.platform] = (acc[service.platform] || 0) + 1;
    return acc;
  }, {});
  const platforms = smmPanelPlatformSummary(counts)
    .filter((item): item is { platform: SmmPlatformId; count: number } => item.platform in platformMeta);

  return (
    <section aria-labelledby="smm-panel-india-heading" className="border-y border-white/[.07] bg-[#090B10] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.17em] text-orange-300">Social media growth services India</p>
            <h2 id="smm-panel-india-heading" className="mt-3 max-w-4xl text-3xl font-black tracking-[-.035em] sm:text-4xl">
              Compare social media services by the facts that matter before you order
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#B9C0CB] sm:text-base">
              A useful social media growth platform should make service details easy to compare before you order. For Indian customers, practical comparison points include INR pricing, quantity limits, payment options, public-link requirements, delivery estimates, refill terms and order tracking—not unsupported “best” or “cheapest” claims.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a href="#service-catalog" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
              Compare current services <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/pricing" className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[.05] px-5 text-sm font-black text-[#E8EBEF] hover:border-orange-400/45">
              Review pricing hub
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {smmPanelIndiaCriteria.map((criterion) => {
            const Icon = criterionIcons[criterion.id];
            return (
              <article key={criterion.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <Icon className="h-5 w-5 text-orange-300" />
                <h3 className="mt-3 text-sm font-black">{criterion.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#AEB5C0]">{criterion.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-[1.6rem] border border-white/10 bg-[#111318] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <h3 className="text-lg font-black">Current SocialRUSH platform coverage</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#AEB5C0]">
              The catalog below is the source of truth for currently available services. Platform counts can change as live services are added, paused or updated.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map(({ platform, count }) => (
                <Link key={platform} href={platformLinks[platform]} className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3.5 transition hover:border-orange-400/40">
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[.04]">
                      <PlatformIcon platform={platformMeta[platform].icon} className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-black">{platformMeta[platform].label}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#8F96A3]">{count} {count === 1 ? "service" : "services"}</span>
                </Link>
              ))}
            </div>
          </article>

          <div className="grid gap-5">
            <article className="rounded-[1.6rem] border border-orange-400/20 bg-orange-500/[.055] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-orange-200">
                <WalletCards className="h-5 w-5" />
                <h3 className="text-lg font-black text-white">India-friendly checkout</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#B9C0CB]">
                SocialRUSH shows the exact amount before payment. Current checkout methods may include the options below; the methods displayed at checkout are authoritative.
              </p>
              <div className="mt-4 space-y-2">
                {indiaCheckoutMethods.map((method) => (
                  <div key={method.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs font-black text-white">{method.label}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#9FA7B3]">{method.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.6rem] border border-white/10 bg-[#111318] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-300" />
                <h3 className="text-lg font-black">For creators, businesses and agencies</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#AEB5C0]">
                Individual customers can compare one campaign at a time, while agencies can use client, campaign and saved monthly-plan workflows to organize repeat work.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/for-agencies" className="text-xs font-black text-orange-300">Agency workflow →</Link>
                <Link href="/trust" className="text-xs font-black text-orange-300">Trust & safety →</Link>
                <Link href="/packages" className="text-xs font-black text-orange-300">Packages →</Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
