import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleDollarSign, Clock3, Link2, ShieldCheck } from "lucide-react";
import { smmSelectionCriteria } from "@/lib/seo/smm-selection-intent";

const icons = [CircleDollarSign, BadgeCheck, Link2, Clock3, ShieldCheck] as const;

export default function SmmSelectionAuthority() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-18" aria-labelledby="smm-selection-heading">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#111113,#0d0d10_60%,#15110d)] p-6 text-white shadow-[0_28px_70px_-42px_rgba(255,122,0,.8)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">SMM panel comparison guide</p>
          <h2 id="smm-selection-heading" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            How to compare a reliable SMM panel in India
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#C7CBD3]">
            Search results often use words like “best” or “trusted.” A more useful comparison is to verify the current facts for the exact service you want: price, payment options, public-link requirements, delivery/refill terms, and order tracking.
          </p>
        </div>
        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {smmSelectionCriteria.map((item, index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.045] p-4">
                <Icon className="h-5 w-5 text-orange-300" />
                <h3 className="mt-3 text-sm font-black">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#AEB5C0]">{item.description}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#service-catalog" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black">
            Compare live services <ArrowRight className="h-4 w-4" />
          </a>
          <Link href="/trust" className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[.05] px-5 text-sm font-black text-[#E8EBEF]">
            Review Trust Center
          </Link>
        </div>
        <p className="mt-5 text-[11px] leading-5 text-[#858C98]">
          SocialRUSH does not claim a universal “best” ranking. Service availability, price, delivery, refill and payment details can change; the live service and checkout views are authoritative.
        </p>
      </div>
    </section>
  );
}
