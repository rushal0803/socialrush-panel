import Link from "next/link";
import { BadgeIndianRupee, Boxes, ClipboardCheck, RefreshCw } from "lucide-react";
import { affordableSmmCriteria } from "@/lib/seo/affordable-smm-intent";

const icons = {
  "unit-cost": BadgeIndianRupee,
  minimum: Boxes,
  terms: RefreshCw,
  checkout: ClipboardCheck,
} as const;

export default function AffordableSmmIndiaAuthority() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(16,185,129,.08),rgba(255,255,255,.035)_45%,rgba(255,255,255,.02))] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-300">Affordable SMM panel India</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-white">
          What “cheap SMM panel” should mean when you compare real campaign cost
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
          A cheap headline rate is not enough to judge affordability. Compare the live INR rate with the quantity you can actually order, the current delivery and refill terms, and the final amount shown before payment.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {affordableSmmCriteria.map((item) => {
            const Icon = icons[item.id];
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <Icon className="h-5 w-5 text-emerald-300" />
                <h3 className="mt-4 text-sm font-black text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">{item.text}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.035] p-5">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">No “cheapest” ranking claim</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            SocialRUSH does not claim to be universally the cheapest SMM panel in India. Different services can have different rates, limits and support terms. Use the live pricing catalog for a like-for-like comparison and treat checkout as the final authority.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="#pricing-catalog" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-black text-white">
            Compare live INR rates
          </Link>
          <Link href="/tools/social-media-service-cost-calculator" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-black text-white">
            Compare quantity cost
          </Link>
        </div>
      </div>
    </section>
  );
}
