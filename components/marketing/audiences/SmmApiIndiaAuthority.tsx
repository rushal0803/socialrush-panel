import Link from "next/link";
import { ArrowRight, Braces, KeyRound, ListChecks, ShieldCheck } from "lucide-react";
import { smmApiCriteria } from "@/lib/seo/smm-api-intent";

const icons = {
  auth: KeyRound,
  create: Braces,
  status: ListChecks,
  limits: ShieldCheck,
} as const;

export default function SmmApiIndiaAuthority() {
  return (
    <section className="bg-[#0B0B0F] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">SMM panel API India</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              API access for agency and reseller workflows
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              SocialRUSH already provides authenticated API documentation for agencies and developers that want to connect
              campaign ordering and status checks to their own internal workflow.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The public overview below explains the available workflow at a high level. Generate keys, review endpoint
              examples and confirm current API rules only inside the signed-in developer documentation.
            </p>
            <Link
              href="/dashboard/api-docs"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3 text-sm font-black text-white"
            >
              Review signed-in API docs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {smmApiCriteria.map((item) => {
              const Icon = icons[item.id];
              return (
                <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[.055] p-5 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/15 text-orange-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/[.06] p-5 text-xs leading-6 text-amber-100 sm:p-6">
          API access does not guarantee service availability, delivery speed, refill eligibility or an order outcome.
          Current service facts, validation, account balance/payment rules and API responses remain authoritative when a request is submitted.
        </div>
      </div>
    </section>
  );
}
