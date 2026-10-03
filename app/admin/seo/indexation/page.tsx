import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, FileSearch, RefreshCw, SearchCheck, ShieldCheck } from "lucide-react";
import IndexationRefreshButton from "@/components/admin/IndexationRefreshButton";
import { getIndexationSnapshot } from "@/lib/seo/indexation-command-center";

export const dynamic = "force-dynamic";

function pill(ok: boolean) {
  return ok
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    : "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

function StatusPill({ ok, good, bad }: { ok: boolean; good: string; bad: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${pill(ok)}`}>{ok ? good : bad}</span>;
}

export default async function SeoIndexationPage() {
  const snapshot = await getIndexationSnapshot();
  const coverage = snapshot.summary.total
    ? Math.round((snapshot.summary.sitemapIncluded / snapshot.summary.total) * 100)
    : 0;

  return <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 24 · SEO Operations</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Google Indexation Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
          Live technical eligibility for priority URLs: HTTP status, sitemap coverage, robots rules, canonical tags and accidental noindex signals.
        </p>
      </div>
      <IndexationRefreshButton />
    </header>

    <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
      <div className="flex gap-3">
        <SearchCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <b>Google status is intentionally not guessed.</b>
          <p className="mt-1 text-sky-100/80">{snapshot.searchConsole.note}</p>
        </div>
      </div>
    </section>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">Priority URLs</p>
        <b className="mt-3 block text-3xl text-white">{snapshot.summary.total}</b>
        <p className="mt-2 text-xs text-[#8B93A1]">Curated search targets only</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">Technically ready</p>
        <b className="mt-3 block text-3xl text-emerald-200">{snapshot.summary.eligible}</b>
        <p className="mt-2 text-xs text-[#8B93A1]">Eligible for Google crawling/indexing</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">Needs action</p>
        <b className="mt-3 block text-3xl text-amber-100">{snapshot.summary.needsAction}</b>
        <p className="mt-2 text-xs text-[#8B93A1]">Technical issues to review</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">Sitemap coverage</p>
        <b className="mt-3 block text-3xl text-white">{coverage}%</b>
        <p className="mt-2 text-xs text-[#8B93A1]">{snapshot.summary.sitemapIncluded}/{snapshot.summary.total} priority URLs</p>
      </article>
    </section>

    <section className="mt-5 grid gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">robots.txt</h2></div>
        <div className="mt-4"><StatusPill ok={snapshot.robotsOk} good="Healthy" bad="Check required" /></div>
        <p className="mt-3 text-xs leading-5 text-[#8B93A1]">Private admin/dashboard/API routes remain excluded while public search targets should stay crawlable.</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-center gap-2"><FileSearch className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Sitemap</h2></div>
        <div className="mt-4"><StatusPill ok={snapshot.sitemapOk} good="Readable" bad="Unavailable" /></div>
        <p className="mt-3 text-xs leading-5 text-[#8B93A1]">Coverage below is measured against the live production sitemap, not repository assumptions.</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-center gap-2"><SearchCheck className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Search Console</h2></div>
        <div className="mt-4"><span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-100">Manual verification</span></div>
        <p className="mt-3 text-xs leading-5 text-[#8B93A1]">Use Google URL Inspection for indexed state, Google-selected canonical and request-indexing actions.</p>
      </article>
    </section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-white">Priority URL queue</h2>
          <p className="mt-1 text-xs text-[#8B93A1]">Checked {new Date(snapshot.checkedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
        </div>
        <Link href="/admin/analytics" className="inline-flex items-center gap-1 text-xs font-bold text-orange-200">Organic analytics <ExternalLink className="h-3.5 w-3.5"/></Link>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {snapshot.checks.map((check) => <article key={check.path} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wide text-[#737B8B]">{check.group}</p><h3 className="mt-1 truncate text-sm font-bold text-white">{check.label}</h3><p className="mt-1 break-all text-[11px] text-[#8B93A1]">{check.path}</p></div>
            {check.eligible ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300"/> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300"/>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusPill ok={check.httpStatus === 200} good="200" bad={check.httpStatus ? String(check.httpStatus) : "HTTP ?"} />
            <StatusPill ok={check.sitemapIncluded} good="Sitemap" bad="Not in sitemap" />
            <StatusPill ok={check.canonicalMatches} good="Canonical" bad="Canonical issue" />
            <StatusPill ok={!check.noindex && !check.robotsBlocked} good="Indexable" bad="Blocked" />
          </div>
          <p className="mt-3 text-xs font-semibold text-orange-100">{check.action}</p>
          {check.lastmod ? <p className="mt-1 text-[10px] text-[#737B8B]">Lastmod {check.lastmod}</p> : null}
        </article>)}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[1050px] w-full text-left text-xs">
          <thead className="bg-white/[.025] text-[10px] uppercase tracking-wide text-[#737B8B]">
            <tr><th className="px-5 py-3">URL</th><th className="px-4 py-3">HTTP</th><th className="px-4 py-3">Sitemap</th><th className="px-4 py-3">Canonical</th><th className="px-4 py-3">Indexable</th><th className="px-4 py-3">Lastmod</th><th className="px-5 py-3">Next action</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {snapshot.checks.map((check) => <tr key={check.path} className="align-top">
              <td className="px-5 py-4"><p className="font-bold text-white">{check.label}</p><p className="mt-1 text-[11px] text-[#8B93A1]">{check.path}</p></td>
              <td className="px-4 py-4"><StatusPill ok={check.httpStatus === 200} good="200" bad={check.httpStatus ? String(check.httpStatus) : "Error"} /></td>
              <td className="px-4 py-4"><StatusPill ok={check.sitemapIncluded} good="Included" bad="Missing" /></td>
              <td className="px-4 py-4"><StatusPill ok={check.canonicalMatches} good="Match" bad="Review" /></td>
              <td className="px-4 py-4"><StatusPill ok={!check.noindex && !check.robotsBlocked} good="Yes" bad="Blocked" /></td>
              <td className="px-4 py-4 text-[#A8AFBD]">{check.lastmod || "—"}</td>
              <td className="px-5 py-4"><p className={check.eligible ? "font-semibold text-emerald-200" : "font-semibold text-amber-100"}>{check.action}</p>{check.error ? <p className="mt-1 max-w-xs text-[10px] text-red-300">{check.error}</p> : null}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
