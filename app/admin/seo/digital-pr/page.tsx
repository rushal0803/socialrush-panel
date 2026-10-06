import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, Link2, Megaphone, Newspaper, ShieldCheck } from "lucide-react";
import { buildDigitalPrSnapshot } from "@/lib/seo/digital-pr";

export const dynamic = "force-dynamic";

export default function DigitalPrAdminPage() {
  const snapshot = buildDigitalPrSnapshot();

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 41 · Backlinks & Digital PR</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Digital PR Command Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
            Promote citation-worthy SocialRUSH tools and guides through relevant editorial relationships. This workspace deliberately does not count unverified backlinks or invent publisher relationships.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/press"
            target="_blank"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100"
          >
            Public press page <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href="/partners"
            target="_blank"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-bold text-[#D1D5DB]"
          >
            Partnership page <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p>{snapshot.note}</p></div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Linkable assets", snapshot.summary.assets, "Verified SocialRUSH resources"],
          ["Free tools", snapshot.summary.tools, "Utility-first outreach assets"],
          ["Editorial guides", snapshot.summary.guides, "Research/supporting content"],
          ["Outreach lanes", snapshot.summary.lanes, "Audience-specific approaches"],
          ["Registry issues", snapshot.summary.missingLaneAssets + snapshot.summary.duplicatePaths, "Should stay at zero"],
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
            <div className="flex items-center gap-2"><Link2 className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Outreach-ready assets</h2></div>
            <p className="mt-1 text-xs text-[#8B93A1]">Lead with utility and audience fit, not exact-match anchor requests.</p>
          </div>
          <div className="divide-y divide-white/10">
            {snapshot.assets.map((asset) => (
              <div key={asset.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-white">{asset.title}</p>
                    <p className="mt-1 text-[11px] text-[#8B93A1]">{asset.path} · {asset.kind}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-200">
                    outreach ready
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#D1D5DB]">{asset.pitchAngle}</p>
                <p className="mt-2 text-[11px] leading-5 text-orange-100">{asset.evidenceNote}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {asset.suggestedAnchors.map((anchor) => (
                    <span key={anchor} className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1 text-[10px] text-[#C8CED8]">{anchor}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Outreach lanes</h2></div>
            <p className="mt-1 text-xs text-[#8B93A1]">Qualify relevance before contacting anyone.</p>
          </div>
          <div className="divide-y divide-white/10">
            {snapshot.lanes.map((lane) => (
              <div key={lane.id} className="p-4">
                <p className="font-bold text-white">{lane.label}</p>
                <p className="mt-1 text-[11px] text-[#8B93A1]">{lane.audience}</p>
                <p className="mt-3 text-xs leading-5 text-[#D1D5DB]">{lane.objective}</p>
                <div className="mt-3 space-y-1.5">
                  {lane.qualification.map((rule) => (
                    <div key={rule} className="flex gap-2 text-[11px] leading-5 text-[#A8AFBD]">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-center gap-2"><Newspaper className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Quality guardrails</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {snapshot.guardrails.map((rule) => (
            <p key={rule} className="rounded-xl border border-white/10 bg-white/[.025] p-4 text-xs leading-5 text-[#D1D5DB]">{rule}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
