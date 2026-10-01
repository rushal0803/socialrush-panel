import Link from "next/link";
import { ArrowRight, Clock3, Gauge, Link2, PackageSearch } from "lucide-react";
import type { SmmService } from "@/lib/smm-service-catalog";
import { fastDeliveryDecisionPoints, selectDeliverySpeedExamples } from "@/lib/seo/fast-delivery-intent";

const icons = {
  estimate: Clock3,
  "start-vs-finish": Gauge,
  quantity: PackageSearch,
  stability: Link2,
} as const;

export default function FastDeliveryIntentSection({ serviceCatalog }: { serviceCatalog: readonly SmmService[] }) {
  const examples = selectDeliverySpeedExamples(serviceCatalog, 4);

  return (
    <section aria-labelledby="fast-smm-delivery-india" className="border-y border-white/10 bg-[#0a0b0f] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Fast social media delivery India</p>
          <h2 id="fast-smm-delivery-india" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Fast social media growth services in India: compare delivery estimates clearly
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Social-media service speed is service-specific. Some campaigns can start quickly, while completion depends on the platform, quantity, destination and current service conditions. SocialRUSH shows the current delivery estimate for each available service and keeps the live order status visible after checkout.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fastDeliveryDecisionPoints.map((item) => {
            const Icon = icons[item.id];
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <Icon className="h-5 w-5 text-orange-300" />
                <h3 className="mt-4 text-sm font-black">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{item.copy}</p>
              </article>
            );
          })}
        </div>

        {examples.length ? (
          <div className="mt-7 rounded-3xl border border-white/10 bg-[#101116] p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">Current catalog examples</p>
                <h3 className="mt-1 text-xl font-black">Delivery guidance differs by service</h3>
              </div>
              <p className="text-xs leading-5 text-slate-500">Check the selected service again before payment; live catalog facts remain authoritative.</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {examples.map((example) => (
                <div key={example.code} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                  <p className="text-[9px] font-black uppercase tracking-[.12em] text-orange-300">{example.platform === "x" ? "X / Twitter" : example.platform}</p>
                  <p className="mt-2 text-sm font-black">{example.name}</p>
                  <p className="mt-3 text-xs text-slate-400">Current estimate</p>
                  <p className="mt-1 text-sm font-black text-white">{example.deliveryTime}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/pricing" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-400">
            Compare current pricing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/packages" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-black text-white transition hover:border-orange-400/40">
            Compare packages <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/trust" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-black text-white transition hover:border-orange-400/40">
            Review ordering safety <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
