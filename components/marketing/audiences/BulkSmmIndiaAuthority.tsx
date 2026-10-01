import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, CheckCircle2, Layers3, ListChecks, ShieldCheck } from "lucide-react";
import { bulkSmmDecisionPoints } from "@/lib/seo/bulk-smm-intent";

const icons = [Layers3, BadgeIndianRupee, ListChecks, ShieldCheck] as const;

export default function BulkSmmIndiaAuthority() {
  return (
    <section className="bg-[#0B0B0F] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Bulk social media growth orders India</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Plan larger social-media requirements without losing client-level control
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Bulk social-media work is usually an operations problem before it is a checkout problem. Agencies need to separate clients,
              destinations, services, quantities, current prices and delivery terms before any real order is placed.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              SocialRUSH supports that workflow with saved clients, campaign attribution, a bulk planner, monthly planning and tracked order history.
              Final availability, price, delivery and refill/support terms still come from the active service and verified checkout flow.
            </p>
            <div className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-300/[.07] p-4 text-xs leading-6 text-orange-100">
              This is not a promise of a white-label child panel, automatic wholesale rate or guaranteed volume discount. Larger commercial requirements can be discussed through the agency enquiry flow.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard/reseller/bulk-planner" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-xs font-black text-white">
                Open bulk planner <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a href="#bulk-lead-engine" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-4 text-xs font-black text-white">
                Discuss a larger requirement <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {bulkSmmDecisionPoints.map((item, index) => {
              const Icon = icons[index] ?? CheckCircle2;
              return (
                <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[.05] p-5 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-400/10 text-orange-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            ["Multi-client requirements", "Keep each client and campaign context separate instead of merging destinations into one unclear request."],
            ["Multi-platform planning", "Prepare Instagram, YouTube, LinkedIn, Facebook, X, TikTok or Telegram work according to currently supported services."],
            ["Repeat agency operations", "Use campaign history and saved monthly plans for repeat work without creating automatic subscriptions or charges."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <h3 className="mt-3 text-sm font-black">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
