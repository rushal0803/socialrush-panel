import Link from "next/link";
import { ArrowRight, ExternalLink, Radar, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  buildCompetitorIntelligenceSnapshot,
  competitorProfiles,
} from "@/lib/seo/competitor-intelligence";

export const dynamic = "force-dynamic";

function statusTone(status: "socialrush-advantage" | "parity" | "opportunity") {
  if (status === "socialrush-advantage") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (status === "parity") return "border-sky-400/20 bg-sky-500/10 text-sky-100";
  return "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

export default function SeoCompetitorsPage() {
  const snapshot = buildCompetitorIntelligenceSnapshot();

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 30 · Competitor Intelligence</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Competitor Intelligence Command Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
            Maintain source-backed observations about competitor positioning, package presentation, checkout, trust and content without turning estimates into facts.
          </p>
        </div>
        <Link
          href="/admin/seo/authority"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100"
        >
          Authority Graph <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{snapshot.note}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Competitors reviewed", snapshot.reviewedCompetitors, "Evidence-backed profiles"],
          ["Evidence items", snapshot.summary.evidenceItems, "Competitor-owned public sources"],
          ["SocialRUSH advantages", snapshot.summary.advantages, "Protect these differentiators"],
          ["Open opportunities", snapshot.summary.opportunities, "Feed later CRO/growth phases"],
          ["Stale evidence", snapshot.summary.staleEvidence, "Should stay at zero"],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
            <b className="mt-3 block text-3xl text-white">{value}</b>
            <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-orange-300" />
              <h2 className="font-bold text-white">Reviewed competitors</h2>
            </div>
            <p className="mt-1 text-xs text-[#8B93A1]">Only first-party competitor pages are recorded as evidence.</p>
          </div>
          <div className="divide-y divide-white/10">
            {competitorProfiles.map((competitor) => (
              <div key={competitor.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{competitor.name}</p>
                    <p className="mt-1 text-[11px] text-[#8B93A1]">{competitor.domain} · {competitor.marketFocus}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[10px] font-black uppercase text-[#D1D5DB]">
                    {competitor.evidence.length} sources
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {competitor.evidence.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/[.025] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wide text-orange-200">{item.kind}</span>
                        <span className="text-[10px] text-[#737B8B]">Reviewed {item.reviewedAt}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#D1D5DB]">{item.observation}</p>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-200 hover:text-white"
                      >
                        Open evidence <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-bold text-white">Strategic opportunity register</h2>
            <p className="mt-1 text-xs text-[#8B93A1]">Translate competitor patterns into SocialRUSH actions without copying unsupported claims or prices.</p>
          </div>
          <div className="divide-y divide-white/10">
            {snapshot.opportunities.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-[11px] text-[#8B93A1]">Priority {item.priority}/5 · {item.socialRushPath}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusTone(item.status)}`}>
                    {item.status.replaceAll("-", " ")}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#D1D5DB]">{item.rationale}</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-orange-100">{item.recommendedAction}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {snapshot.summary.staleEvidence ? (
        <section className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <p className="text-sm leading-6 text-amber-100">Some competitor evidence is older than the review window. Re-verify it before using it for a decision.</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
