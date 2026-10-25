import Link from "next/link";
import { ArrowLeft, ArrowRight, FileSpreadsheet, SearchCheck, ShieldCheck, TriangleAlert, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { indexingReasons } from "@/lib/seo/gsc-csv-import";
import { formatRecoveryLabel } from "@/lib/seo/growth-recovery";
import { importGscCsv } from "./actions";

export const dynamic = "force-dynamic";

type Batch = {
  id:string; report_kind:"performance_pages"|"indexing_examples"; reason:string|null;
  evidence_date:string; period_start:string|null; period_end:string|null;
  filename:string; row_count:number; imported_at:string;
};
type Observation = {
  source_path:string; canonical_path:string;
  clicks:number|null; impressions:number|null; ctr:number|null; position:number|null;
};
const fieldClass="min-h-11 w-full rounded-xl border border-white/15 bg-[#1a1a1d] px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20";
const labelClass="mb-2 block text-xs font-bold text-[#D1D5DB]";
function validMessage(value:unknown):string|null {return typeof value==="string" ? value.slice(0,180) : null;}
function humanDate(date:string|null) {return date||"Not provided";}
function formatCount(value:number|null) {return value===null?"—":value.toLocaleString("en-IN");}

export default async function GscImportPage({ searchParams }:{searchParams:Promise<{error?:string;imported?:string}>}) {
  const params=await searchParams;
  const db=await createClient();
  const {data:batchData,error:batchError}=await db.from("growth_gsc_import_batches")
    .select("id,report_kind,reason,evidence_date,period_start,period_end,filename,row_count,imported_at")
    .eq("status","complete").order("imported_at",{ascending:false}).limit(25);
  const batches=(batchData||[]) as Batch[];
  const recentPerformance=batches.find(b=>b.report_kind==="performance_pages")||null;
  const recentIndexing=batches.find(b=>b.report_kind==="indexing_examples")||null;
  const priorPerformance=batches.find(b=>b.report_kind==="performance_pages" && b.id!==recentPerformance?.id)||null;
  const [performanceResult,indexingResult,priorResult]=await Promise.all([
    recentPerformance ? db.from("growth_gsc_page_observations").select("source_path,canonical_path,clicks,impressions,ctr,position").eq("batch_id",recentPerformance.id).order("clicks",{ascending:false}).limit(300):Promise.resolve({data:[] as Observation[],error:null}),
    recentIndexing ? db.from("growth_gsc_page_observations").select("source_path,canonical_path,clicks,impressions,ctr,position").eq("batch_id",recentIndexing.id).order("source_path").limit(300):Promise.resolve({data:[] as Observation[],error:null}),
    priorPerformance ? db.from("growth_gsc_page_observations").select("source_path,canonical_path,clicks,impressions,ctr,position").eq("batch_id",priorPerformance.id).limit(300):Promise.resolve({data:[] as Observation[],error:null}),
  ]);
  const error=!!(batchError||performanceResult.error||indexingResult.error||priorResult.error);
  const performanceRows=(performanceResult.data||[]) as Observation[];
  const indexingRows=(indexingResult.data||[]) as Observation[];
  const priorRows=(priorResult.data||[]) as Observation[];
  const sameLength=!!recentPerformance && !!priorPerformance &&
    !!recentPerformance.period_start && !!recentPerformance.period_end && !!priorPerformance.period_start && !!priorPerformance.period_end &&
    (Date.parse(recentPerformance.period_end)-Date.parse(recentPerformance.period_start)===
     Date.parse(priorPerformance.period_end)-Date.parse(priorPerformance.period_start)) &&
    priorPerformance.period_end < recentPerformance.period_start;
  const priorMap=new Map(priorRows.map(r=>[r.source_path,r]));
  const deltas=sameLength?performanceRows
    .filter(r=>priorMap.has(r.source_path))
    .map(r=>({path:r.source_path,current:r.clicks??0,previous:priorMap.get(r.source_path)?.clicks??0,loss:(r.clicks??0)-(priorMap.get(r.source_path)?.clicks??0)}))
    .sort((a,b)=>a.loss-b.loss)
    .filter(r=>r.loss<0).slice(0,8):[];
  return <main className="mx-auto max-w-[1650px] space-y-6 p-4 pb-20 text-white sm:p-8">
    <header className="rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.12),transparent_54%),#111114] p-5 sm:p-8">
      <Link href="/admin/crm/growth-hub" className="inline-flex items-center gap-2 text-xs font-bold text-orange-200"><ArrowLeft size={15}/> Growth Hub</Link>
      <p className="mt-5 text-xs font-black uppercase tracking-[.17em] text-orange-300">Phase 3 · First-party search evidence</p>
      <h1 className="mt-2 text-3xl font-black">Search Console Imports</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#CBD2DC]">
        Import official Google Search Console CSV reports directly into your Growth CRM. Preserve the evidence date and original URL,
        compare comparable performance periods, and investigate indexing exclusions without pretending these are live Google API results.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/crm/growth-hub/recovery" className="rounded-xl border border-orange-400/30 px-4 py-2.5 text-xs font-bold text-orange-200">Recovery queue <ArrowRight size={14} className="inline"/></Link>
        <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white">Open Search Console <ExternalLink size={14} className="inline"/></a>
      </div>
    </header>

    <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 px-4 py-3 text-xs leading-6 text-sky-100">
      <ShieldCheck size={17} className="mr-2 inline"/> This is a secure, manual CSV import—not continuous Google synchronization. Use Search Console → Performance → Pages → Export CSV or Page Indexing → select an exclusion reason → Examples → Export CSV. The CSV upload limit is 300 URLs and 750 KB.
    </div>
    {validMessage(params.error)?<div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{validMessage(params.error)}</div>:null}
    {validMessage(params.imported)?<div role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">Imported {validMessage(params.imported)} page rows successfully. Historical evidence is saved; Google indexing status is not updated by the import.</div>:null}
    {error?<div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">Search evidence storage is unavailable or incomplete. Apply the Phase 3 database migration before importing. Do not treat missing counts as zero.</div>:null}

    <section aria-label="Import status" className="grid gap-3 sm:grid-cols-3">
      {[
        ["Completed exports",error?"Unavailable":batches.length,"Latest 25 completed uploads"],
        ["Latest performance rows",error?"Unavailable":recentPerformance?.row_count??"No report","One dated performance snapshot"],
        ["Latest indexing examples",error?"Unavailable":recentIndexing?.row_count??"No report","Evidence only, not a live index count"],
      ].map(([name,count,note])=><article key={name} className="rounded-2xl border border-white/10 bg-[#111] p-5"><p className="text-xs text-[#A8AFBD]">{name}</p><strong className="mt-2 block text-2xl">{count}</strong><p className="mt-2 text-xs text-[#8B93A1]">{note}</p></article>)}
    </section>
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-[#111] p-5 sm:p-6">
        <div className="flex gap-2"><FileSpreadsheet size={21} className="text-orange-300"/><h2 className="text-lg font-black">Import Performance → Pages CSV</h2></div>
        <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">Required columns: Top pages / Page, Clicks, Impressions, CTR, Position. Enter the exact date range used in Search Console before exporting.</p>
        <form action={importGscCsv} className="mt-5 space-y-4">
          <input type="hidden" name="report_kind" value="performance_pages"/>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="perf-start" className={labelClass}>Report start date</label><input id="perf-start" type="date" name="period_start" required className={fieldClass} disabled={error}/></div>
            <div><label htmlFor="perf-end" className={labelClass}>Report end date</label><input id="perf-end" type="date" name="period_end" required className={fieldClass} disabled={error}/></div>
          </div>
          <div><label htmlFor="perf-evidence" className={labelClass}>Date you exported the report</label><input id="perf-evidence" type="date" name="evidence_date" required className={fieldClass} disabled={error}/></div>
          <div><label htmlFor="perf-file" className={labelClass}>Performance CSV</label><input id="perf-file" type="file" name="file" accept=".csv,text/csv" required className={fieldClass} disabled={error}/></div>
          <button disabled={error} className="min-h-11 w-full rounded-xl bg-[#FF8A1F] px-4 py-3 text-sm font-black text-[#151009] disabled:opacity-40" type="submit">Import page performance</button>
        </form>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111] p-5 sm:p-6">
        <div className="flex gap-2"><SearchCheck size={21} className="text-orange-300"/><h2 className="text-lg font-black">Import Page Indexing → Examples CSV</h2></div>
        <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">Export the URL examples for a single exclusion reason. Choose the exact reason from Search Console. Do not combine different reasons in one file.</p>
        <form action={importGscCsv} className="mt-5 space-y-4">
          <input type="hidden" name="report_kind" value="indexing_examples"/>
          <div><label htmlFor="index-reason" className={labelClass}>Exclusion category</label>
            <select id="index-reason" name="indexing_reason" required className={fieldClass} disabled={error}>{indexingReasons.map(reason=><option key={reason} value={reason}>{formatRecoveryLabel(reason)}</option>)}</select>
          </div>
          <div><label htmlFor="index-evidence" className={labelClass}>Export date</label><input id="index-evidence" type="date" name="evidence_date" required className={fieldClass} disabled={error}/></div>
          <div><label htmlFor="index-file" className={labelClass}>Examples CSV (URL column)</label><input id="index-file" type="file" name="file" accept=".csv,text/csv" required className={fieldClass} disabled={error}/></div>
          <button disabled={error} type="submit" className="min-h-11 w-full rounded-xl bg-[#FF8A1F] px-4 py-3 text-sm font-black text-[#151009] disabled:opacity-40">Import exclusion examples</button>
        </form>
      </article>
    </section>

    {recentPerformance&&!error?<section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
      <div className="border-b border-white/10 p-5"><h2 className="text-lg font-black">Latest page performance</h2>
        <p className="mt-2 text-xs text-[#A8AFBD]">Evidence period: {humanDate(recentPerformance.period_start)} to {humanDate(recentPerformance.period_end)} · Uploaded {recentPerformance.evidence_date} · {recentPerformance.row_count} URLs in export</p>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[690px] text-left text-xs">
        <thead className="bg-white/5 text-[#B6BECC]"><tr>{["Observed page","Clicks","Impressions","CTR","Position"].map(h=><th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/10">{performanceRows.map(row=><tr key={row.source_path}>
          <td className="max-w-sm px-4 py-3"><a href={"https://www.getsocialrush.com"+row.source_path} className="break-all font-bold text-orange-200" target="_blank" rel="noreferrer">{row.source_path}</a>{row.canonical_path!==row.source_path?<p className="mt-1 text-[10px] text-[#A8AFBD]">Mapped owner: {row.canonical_path}</p>:null}</td>
          <td className="px-4 py-3">{formatCount(row.clicks)}</td><td className="px-4 py-3">{formatCount(row.impressions)}</td>
          <td className="px-4 py-3">{row.ctr===null?"—":(Number(row.ctr)*100).toFixed(2)+"%"}</td>
          <td className="px-4 py-3">{row.position===null?"—":Number(row.position).toFixed(1)}</td>
        </tr>)}</tbody>
      </table></div>
    </section>:null}

    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <h2 className="font-black">Largest click declines</h2>
        <p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Only shown when the two most recent imported performance periods have equal duration and do not overlap; compares observed URLs present in both.</p>
        {deltas.length&& !error ?<div className="mt-4 space-y-3">{deltas.map(row=><div key={row.path} className="rounded-xl border border-white/10 p-3"><p className="break-all text-xs font-bold text-white">{row.path}</p><p className="mt-1 text-xs text-red-200">{row.loss} clicks · {row.previous} prior → {row.current} recent</p></div>)}</div>:
          <p className="mt-5 text-xs text-[#9CA3AF]">{sameLength?"No declines among pages in both exports.":"Import two non-overlapping, equal-length Performance → Pages exports to compare."}</p>}
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <h2 className="font-black">Latest indexing examples</h2>
        {recentIndexing && !error?<><p className="mt-2 text-xs text-[#9CA3AF]">{formatRecoveryLabel(recentIndexing.reason||"other")} · Exported {recentIndexing.evidence_date}. These examples do not describe all indexed or excluded URLs.</p>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">{indexingRows.map(row=><div key={row.source_path} className="rounded-lg border border-white/10 p-3 text-xs"><span className="break-all text-orange-200">{row.source_path}</span>{row.canonical_path!==row.source_path?<p className="mt-1 text-[#A8AFBD]">Canonical owner: {row.canonical_path}</p>:null}</div>)}</div></>:
          <p className="mt-4 text-xs text-[#9CA3AF]">No exclusion-example export imported yet.</p>}
      </article>
    </section>
    <section className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <h2 className="font-black">Import history</h2>
      <p className="mt-2 text-xs text-[#9CA3AF]">The most recent 25 completed exports are shown. Reimporting an identical file for the same evidence period is rejected.</p>
      <div className="mt-4 divide-y divide-white/10">{batches.map(b=><div key={b.id} className="flex flex-col gap-2 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-semibold text-white">{b.filename}</p><p className="mt-1 text-[#9CA3AF]">{formatRecoveryLabel(b.report_kind)} · Evidence {b.evidence_date}{b.reason?" · "+formatRecoveryLabel(b.reason):""}</p></div>
        <span className="shrink-0 text-[#D1D5DB]">{b.row_count} URLs</span>
      </div>)}{!batches.length?<p className="py-8 text-sm text-[#9CA3AF]">No completed CSV imports have been recorded.</p>:null}</div>
    </section>
    <p className="flex items-start gap-2 text-xs leading-5 text-[#A8AFBD]"><TriangleAlert size={16} className="mt-0.5 shrink-0"/>Google can change an indexing state after an export. Exclusion examples are not sitewide totals; page performance alone does not establish indexed/not-indexed status. No imported rows automatically create, resolve or delete recovery tasks.</p>
  </main>;
}
