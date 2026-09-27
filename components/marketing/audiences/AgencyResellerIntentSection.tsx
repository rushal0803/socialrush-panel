import Link from "next/link";
import { ArrowRight, Braces, BriefcaseBusiness, Layers3, RefreshCw } from "lucide-react";
import { agencyResellerCriteria } from "@/lib/seo/agency-reseller-intent";

const icons = {
  clients: BriefcaseBusiness,
  bulk: Layers3,
  monthly: RefreshCw,
  api: Braces,
} as const;

export default function AgencyResellerIntentSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-600">SMM reseller panel India</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">
              An agency workflow built around real client operations
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Agencies and resellers usually need more than a low headline rate. Practical workflows include client separation,
              bulk planning, current service details, repeat-campaign organization, pricing review and a clear handoff into the
              verified order flow.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              SocialRUSH keeps those functions in one account while final service availability, quantity limits, delivery,
              refill terms and payable totals remain controlled by the current service and checkout information.
            </p>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
              SocialRUSH does not claim to provide a white-label child panel, automatic wholesale discount, guaranteed delivery
              outcome or guaranteed reseller profit. Use the live workspace and catalog to evaluate the fit for your agency.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {agencyResellerCriteria.map((item) => {
              const Icon = icons[item.id];
              return (
                <article key={item.id} className="rounded-3xl border border-orange-100 bg-[#FFFDFC] p-5 shadow-[0_20px_50px_-38px_rgba(255,122,0,.55)] sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-black text-[#0B0B0F]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
                  <Link href={item.href} className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-600">
                    {item.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-[#0B0B0F] p-6 text-white sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">How to compare an agency SMM workflow</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Client organization", "Can separate clients and preserve campaign context."],
              ["Current pricing", "Uses current catalog information instead of assuming a permanent wholesale rate."],
              ["Order control", "Lets staff review each destination before a real order or payment happens."],
              ["Repeat operations", "Supports saved plans, campaign history and renewal review without automatic charges."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
                <h3 className="text-sm font-black">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
