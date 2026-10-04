import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, MousePointerClick, SearchCheck } from "lucide-react";
import { getSerpCtrSnapshot } from "@/lib/seo/serp-ctr";

export const dynamic = "force-dynamic";

function issueTone(severity: "high" | "medium" | "low") {
  if (severity === "high") return "border-red-400/20 bg-red-500/10 text-red-200";
  if (severity === "medium") return "border-amber-400/20 bg-amber-500/10 text-amber-100";
  return "border-sky-400/20 bg-sky-500/10 text-sky-100";
}

export default async function SeoCtrPage() {
  const snapshot = await getSerpCtrSnapshot();

  return <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 28 · Google CTR Optimization</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">SERP Snippet Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
          Review priority-page titles and descriptions for clarity, duplication, truncation risk, commercial value signals and canonical consistency.
        </p>
      </div>
      <Link href="/admin/seo/indexation" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
        Indexation Center <ExternalLink className="h-4 w-4"/>
      </Link>
    </header>

    <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-100">
      <div className="flex gap-3"><SearchCheck className="mt-0.5 h-5 w-5 shrink-0"/><p>{snapshot.note}</p></div>
    </section>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {[
        ["Priority URLs", snapshot.summary.total, "Curated SERP targets"],
        ["Healthy", snapshot.summary.healthy, "No current snippet warning"],
        ["Review", snapshot.summary.review, "Editorial improvement suggested"],
        ["Needs action", snapshot.summary.action, "High-severity issue"],
        ["Duplicate snippets", snapshot.summary.duplicateTitles + snapshot.summary.duplicateDescriptions, "Title + description occurrences"],
      ].map(([label, value, note]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
        <b className="mt-3 block text-3xl text-white">{value}</b>
        <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
      </article>)}
    </section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-2"><MousePointerClick className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Priority snippet queue</h2></div>
        <p className="mt-1 text-xs text-[#8B93A1]">Checked {new Date(snapshot.checkedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {snapshot.checks.map((check) => <article key={check.path} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#737B8B]">{check.group}</p>
              <h3 className="mt-1 text-sm font-bold text-white">{check.label}</h3>
              <p className="mt-1 break-all text-[11px] text-[#8B93A1]">{check.path}</p>
            </div>
            {check.issues.length ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300"/> : <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300"/>}
          </div>
          <p className="mt-3 text-sm font-semibold text-white">{check.title ?? "Missing title"}</p>
          <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">{check.description ?? "Missing description"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-[#8B93A1]">
            <span>Score {check.score}/100</span><span>•</span><span>Title {check.titleLength}</span><span>•</span><span>Description {check.descriptionLength}</span>
          </div>
          {check.issues.length ? <div className="mt-3 flex flex-wrap gap-1.5">{check.issues.map((issue) => <span key={`${issue.code}-${issue.message}`} className={`rounded-full border px-2 py-1 text-[10px] font-bold ${issueTone(issue.severity)}`}>{issue.message}</span>)}</div> : null}
        </article>)}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1250px] w-full text-left text-xs">
          <thead className="bg-white/[.025] text-[10px] uppercase tracking-wide text-[#737B8B]">
            <tr><th className="px-5 py-3">URL</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Length</th><th className="px-4 py-3">Score</th><th className="px-5 py-3">Issues</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {snapshot.checks.map((check) => <tr key={check.path} className="align-top">
              <td className="px-5 py-4"><p className="font-bold text-white">{check.label}</p><p className="mt-1 text-[11px] text-[#8B93A1]">{check.path}</p></td>
              <td className="max-w-sm px-4 py-4 text-[#D1D5DB]">{check.title ?? "—"}</td>
              <td className="max-w-md px-4 py-4 leading-5 text-[#A8AFBD]">{check.description ?? "—"}</td>
              <td className="px-4 py-4 text-[#A8AFBD]"><p>T {check.titleLength}</p><p className="mt-1">D {check.descriptionLength}</p></td>
              <td className="px-4 py-4"><span className={check.score >= 90 ? "font-black text-emerald-200" : check.score >= 75 ? "font-black text-sky-100" : "font-black text-amber-100"}>{check.score}</span></td>
              <td className="max-w-sm px-5 py-4">{check.issues.length ? <div className="space-y-1.5">{check.issues.map((issue) => <p key={`${issue.code}-${issue.message}`} className="text-[11px] leading-5 text-[#D1D5DB]">• {issue.message}</p>)}</div> : <span className="text-emerald-200">Healthy</span>}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
