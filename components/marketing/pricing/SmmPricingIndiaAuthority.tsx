import Link from "next/link";
import { IndianRupee, Landmark, ListChecks, ShieldCheck } from "lucide-react";
import { smmPricingCriteria } from "@/lib/seo/smm-pricing-intent";

const icons = {
  rate: IndianRupee,
  quantity: ListChecks,
  payment: Landmark,
  support: ShieldCheck,
} as const;

export default function SmmPricingIndiaAuthority() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-orange-400/20 bg-[linear-gradient(135deg,rgba(255,122,0,.10),rgba(255,255,255,.035)_45%,rgba(255,255,255,.02))] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Social media service pricing in India</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white">How to compare social media service pricing without looking at price alone</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
          Customers comparing social media service pricing in India usually need more than one number. A useful comparison includes the current INR rate, valid quantity range, payment options, and the delivery or refill information attached to the service.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {smmPricingCriteria.map((item) => {
            const Icon = icons[item.id];
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <Icon className="h-5 w-5 text-orange-300" />
                <h3 className="mt-4 text-sm font-black text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-7 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">UPI and INR intent</p>
            <h3 className="mt-2 text-lg font-black text-white">Pay in India without guessing the final total</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              SocialRUSH shows service pricing in INR on this page. The active checkout or add-funds flow shows the payment methods available for the transaction, including UPI where applicable.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Use the live catalog</p>
            <h3 className="mt-2 text-lg font-black text-white">Treat checkout as the final authority</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Service availability and rates can change. Use the live pricing catalog and the final checkout summary rather than relying on an old blog table or cached search result.
            </p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="#pricing-catalog" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-black text-white">Compare live rates</Link>
          <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-black text-white">Browse services</Link>
        </div>
      </div>
    </section>
  );
}
