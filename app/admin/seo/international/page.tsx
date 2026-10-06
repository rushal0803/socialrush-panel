import Link from "next/link";
import { CheckCircle2, Globe2, Languages, ShieldCheck, TriangleAlert } from "lucide-react";
import { buildInternationalSeoSnapshot } from "@/lib/seo/international-integrity";

export const dynamic = "force-dynamic";

export default function InternationalSeoPage() {
  const snapshot = buildInternationalSeoSnapshot();

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 40 · International SEO</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">International SEO Command Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
            Verify market hubs, localized service inventory, reciprocal hreflang clusters and international publishing guardrails without auto-generating unsupported country pages.
          </p>
        </div>
        <Link href="/admin/seo/authority" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
          Authority Graph
        </Link>
      </header>

      <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
        {snapshot.note}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Markets", snapshot.summary.markets, "Explicit market hubs"],
          ["Localized pages", snapshot.summary.localizedServicePages, "Allowlisted service pages"],
          ["Equivalent clusters", snapshot.summary.equivalentServiceClusters, "Same-service hreflang groups"],
          ["Integrity issues", snapshot.summary.issues, "Should remain zero"],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
            <b className="mt-3 block text-3xl text-white">{value}</b>
            <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-orange-300" />
              <h2 className="font-bold text-white">Published markets</h2>
            </div>
            <p className="mt-1 text-xs text-[#8B93A1]">Only explicitly published market/service combinations belong in organic discovery.</p>
          </div>
          <div className="divide-y divide-white/10">
            {snapshot.markets.map((market) => (
              <div key={market.slug} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-bold text-white">{market.name}</p>
                  <p className="mt-1 text-[11px] text-[#8B93A1]">{market.hreflang} · {market.currency} · {market.hubPath}</p>
                </div>
                <span className="shrink-0 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase text-orange-100">
                  {market.serviceCount} services
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-orange-300" />
            <h2 className="font-bold text-white">x-default policy</h2>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <p className="font-bold text-emerald-100">Neutral fallback intentionally disabled</p>
              <p className="mt-2 text-xs leading-6 text-emerald-100/80">{snapshot.xDefaultPolicy.reason}</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-[#8B93A1]">
            A future x-default must point to a genuinely equivalent international fallback page, not an India-specific money page or unrelated catalog URL.
          </p>
        </article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-bold text-white">Same-service hreflang clusters</h2>
          <p className="mt-1 text-xs text-[#8B93A1]">Each cluster contains only markets where that localized service page actually exists.</p>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.equivalentServiceClusters.map((cluster) => (
            <article key={cluster.catalogServiceCode} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
              <p className="text-sm font-bold text-white">{cluster.catalogServiceCode}</p>
              <p className="mt-2 text-xs text-[#8B93A1]">{cluster.pages.length} published equivalents</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cluster.pages.map((page) => (
                  <span key={page.path} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-[#D1D5DB]">
                    {page.hreflang}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-start gap-3">
          {snapshot.issues.length ? <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />}
          <div>
            <h2 className="font-bold text-white">International integrity</h2>
            {snapshot.issues.length ? (
              <div className="mt-3 space-y-2">
                {snapshot.issues.map((issue) => <p key={issue} className="text-sm text-amber-100">{issue}</p>)}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-emerald-200">
                Hubs, localized canonicals, reciprocal equivalents and the user-facing market switcher are internally consistent.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
