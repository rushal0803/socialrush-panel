import Link from "next/link";
import { AlertTriangle, BookOpenCheck, CheckCircle2, ExternalLink, FileClock, Link2, Search } from "lucide-react";
import { buildSeoContentEngineSnapshot } from "@/lib/seo/content-engine";

export const dynamic = "force-dynamic";

function statusClass(status: "healthy" | "review" | "action") {
  if (status === "healthy") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (status === "review") return "border-sky-400/20 bg-sky-500/10 text-sky-100";
  return "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

export default function SeoContentEnginePage() {
  const snapshot = buildSeoContentEngineSnapshot();
  const queue = snapshot.articles.filter((article) => article.status !== "healthy");

  return <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 27 · SEO Content Engine</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Editorial Content Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
          Track published guides, platform clusters, canonical support links, freshness and approved content-gap decisions from one place.
        </p>
      </div>
      <Link href="/blog" target="_blank" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
        Open public blog <ExternalLink className="h-4 w-4"/>
      </Link>
    </header>

    <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
      <div className="flex gap-3"><Search className="mt-0.5 h-5 w-5 shrink-0"/><p>{snapshot.note}</p></div>
    </section>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {[
        ["Published articles", snapshot.summary.articles, "Repository-backed inventory"],
        ["Healthy", snapshot.summary.healthy, "No current editorial action"],
        ["Review queue", snapshot.summary.review, `${snapshot.editorialReviewWindowDays}-day editorial window`],
        ["Needs action", snapshot.summary.action, "Metadata/linking/date issues"],
        ["Cluster coverage", `${snapshot.summary.clusterGuideCoverage}%`, "Planned cluster guides published"],
      ].map(([label, value, note]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
        <b className="mt-3 block text-3xl text-white">{value}</b>
        <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
      </article>)}
    </section>

    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-2"><BookOpenCheck className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Platform content clusters</h2></div>
          <p className="mt-1 text-xs text-[#8B93A1]">Every guide below should support a clear platform hub and canonical service path.</p>
        </div>
        <div className="divide-y divide-white/10">
          {snapshot.clusters.map((cluster) => <div key={cluster.platform} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-bold text-white">{cluster.label}</p>
              <p className="mt-1 text-[11px] text-[#8B93A1]">{cluster.publishedGuides}/{cluster.guideCount} guides · {cluster.serviceCount} service targets</p>
              <p className="mt-1 truncate text-[10px] text-[#737B8B]">{cluster.hubPath}</p>
            </div>
            {cluster.missingGuides.length
              ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300"/>
              : <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300"/>}
          </div>)}
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-2"><FileClock className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Editorial queue</h2></div>
          <p className="mt-1 text-xs text-[#8B93A1]">Only repository-detected actions and scheduled freshness reviews appear here.</p>
        </div>
        {queue.length ? <div className="divide-y divide-white/10">
          {queue.slice(0, 12).map((article) => <div key={article.slug} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-white">{article.title}</p>
                <p className="mt-1 text-[11px] text-[#8B93A1]">{article.path}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusClass(article.status)}`}>{article.status}</span>
            </div>
            <p className="mt-3 text-xs font-semibold text-orange-100">{article.action}</p>
          </div>)}
        </div> : <div className="p-6 text-sm text-emerald-200">No editorial actions are currently due.</div>}
      </article>
    </section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-2"><Link2 className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Content-gap decision register</h2></div>
        <p className="mt-1 text-xs text-[#8B93A1]">“Defer” topics stay deferred until verified evidence justifies a separate URL.</p>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
        {snapshot.gapPlans.map((plan) => <article key={`${plan.source}-${plan.id}`} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-wide text-[#737B8B]">{plan.source}</p><h3 className="mt-1 text-sm font-bold text-white">{plan.queryTheme}</h3></div>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase text-[#D1D5DB]">{plan.decision}</span>
          </div>
          <p className="mt-2 break-all text-[11px] text-orange-100">{plan.primaryTarget}</p>
          <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">{plan.reason}</p>
        </article>)}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[1000px] w-full text-left text-xs">
          <thead className="bg-white/[.025] text-[10px] uppercase tracking-wide text-[#737B8B]"><tr><th className="px-5 py-3">Source</th><th className="px-4 py-3">Query theme</th><th className="px-4 py-3">Decision</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Risk</th><th className="px-5 py-3">Coverage</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {snapshot.gapPlans.map((plan) => <tr key={`${plan.source}-${plan.id}`}>
              <td className="px-5 py-4 font-bold text-white">{plan.source}</td>
              <td className="px-4 py-4 text-[#D1D5DB]">{plan.queryTheme}</td>
              <td className="px-4 py-4 uppercase text-[#A8AFBD]">{plan.decision}</td>
              <td className="px-4 py-4 text-orange-100">{plan.primaryTarget}</td>
              <td className="px-4 py-4 uppercase text-[#A8AFBD]">{plan.cannibalizationRisk}</td>
              <td className="px-5 py-4">{plan.targetExists ? <span className="text-emerald-200">Present</span> : <span className="text-amber-100">Missing</span>}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
