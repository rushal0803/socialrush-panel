import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, ExternalLink, FileSearch, ShieldCheck, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { canonicalIndiaServicePaths } from "@/lib/seo/canonical-india-services";
import { indexationTargets } from "@/lib/seo/indexation-command-center";
import {
  formatRecoveryLabel,
  recoveryEvidenceSources,
  recoveryIssues,
  recoveryPriorities,
  recoveryPriorityScore,
  recoveryStatuses,
  recoveryWorkstreams,
  type RecoveryPriority,
  type RecoveryStatus,
  type RecoveryWorkstream,
} from "@/lib/seo/growth-recovery";
import { createRecoveryItem, updateRecoveryItemStatus } from "./actions";

export const dynamic = "force-dynamic";

type RecoveryRow = {
  id: string;
  canonical_path: string;
  workstream: RecoveryWorkstream;
  issue_type: string;
  priority: RecoveryPriority;
  status: RecoveryStatus;
  title: string;
  details: string | null;
  evidence_source: string;
  evidence_date: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
};

const oldGscTargets = [
  "/buy-instagram-comments-india",
  "/buy-instagram-saves-india",
  "/buy-instagram-shares-india",
  "/buy-youtube-comments-india",
  "/buy-youtube-watch-hours-india",
  "/buy-facebook-group-members-india",
  "/facebook-views",
];

const suggestedPaths = [...new Set([
  ...oldGscTargets,
  ...Object.values(canonicalIndiaServicePaths),
  ...indexationTargets.map((item) => item.path),
])].filter((path) => path !== "/").sort();

const fieldClass = "min-h-11 w-full rounded-xl border border-white/15 bg-[#18181c] px-3 py-2 text-sm text-white placeholder:text-[#8B93A1] focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20";
const labelClass = "block text-xs font-bold text-[#D1D5DB] mb-2";

function statusColor(status: RecoveryStatus) {
  if (status === "verified" || status === "closed") return "bg-emerald-500/15 text-emerald-200";
  if (status === "blocked") return "bg-red-500/15 text-red-200";
  if (status === "in_progress") return "bg-sky-500/15 text-sky-200";
  return "bg-amber-500/15 text-amber-200";
}

export default async function SearchRecoveryQueue() {
  // Parent admin layout handles authentication and authorization.
  // This view only reads saved work items; it does not crawl or schedule jobs.
  const db = await createClient();
  const { data, error } = await db.from("growth_search_work_items")
    .select("id,canonical_path,workstream,issue_type,priority,status,title,details,evidence_source,evidence_date,resolution_note,created_at,updated_at")
    .order("updated_at", { ascending: false }).limit(200);
  const rows = ((data ?? []) as RecoveryRow[]).sort((a, b) =>
    recoveryPriorityScore(a.priority) - recoveryPriorityScore(b.priority) || b.updated_at.localeCompare(a.updated_at));
  const activeRows = rows.filter((row) => !["verified", "closed"].includes(row.status));
  const geoRows = rows.filter((row) => row.workstream === "geo");
  const finishedRows = rows.filter((row) => ["verified", "closed"].includes(row.status));

  return (
    <main className="mx-auto max-w-[1650px] space-y-6 p-4 pb-20 text-white sm:p-8">
      <header className="rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.15),transparent_55%),#111114] p-5 sm:p-8">
        <Link href="/admin/crm/growth-hub" className="inline-flex items-center gap-2 text-xs font-bold text-orange-200"><ArrowLeft size={15} /> Growth Hub</Link>
        <p className="mt-5 text-xs font-black uppercase tracking-[.15em] text-orange-300">Phase 2 · Evidence-first growth operations</p>
        <h1 className="mt-2 text-3xl font-black">SEO & GEO Recovery Queue</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#C6CCD5]">
          Track a real issue against a canonical service page, assign priority, record its source and require evidence before verification.
          Work items represent investigation status, not Google's confirmed indexing state or AI-search placement.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/admin/seo/indexation" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-[#D1D5DB] hover:bg-white/10">Technical indexation <ArrowRight size={13} className="ml-1 inline" /></Link>
          <Link href="/admin/seo/aeo" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-[#D1D5DB] hover:bg-white/10">AI-search readiness <ArrowRight size={13} className="ml-1 inline" /></Link>
          <a target="_blank" rel="noreferrer" href="https://search.google.com/search-console" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-[#D1D5DB] hover:bg-white/10">Search Console <ExternalLink size={13} className="ml-1 inline" /></a>
        </div>
      </header>

      {error ? (
        <section role="alert" className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          <h2 className="font-black">Recovery queue storage unavailable</h2>
          <p className="mt-2 leading-6">The new work-item table may not have been migrated to this environment. No counts are shown and the add/edit forms are disabled until setup is complete. Nothing has been recorded.</p>
        </section>
      ) : null}

      <section aria-label="Recovery queue totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total recorded", rows.length, "Items in the latest 200 records"],
          ["Open / in progress", activeRows.length, "Unresolved investigations"],
          ["GEO work items", geoRows.length, "AI-search evidence & readiness"],
          ["Verified / closed", finishedRows.length, "Resolution recorded by an admin"],
        ].map(([title, value, note]) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-xs text-[#A8AFBD]">{title}</p>
            <strong className="mt-2 block text-3xl font-black">{error ? "Unavailable" : value}</strong>
            <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
          </article>
        ))}
      </section>
      {rows.length === 200 && !error ? <p className="text-xs text-amber-200">Only the 200 most recently updated work items are loaded. Use pagination before treating the counts as site-wide totals.</p> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center gap-2"><ClipboardList size={20} className="text-orange-300" /><h2 className="text-lg font-black">Record a verified issue</h2></div>
          <p className="mt-2 text-xs leading-5 text-[#9CA3AF]">Start with an actual report or observation. Do not add automatic indexing claims.</p>
          <form action={createRecoveryItem} className="mt-5 space-y-4">
            <div>
              <label className={labelClass} htmlFor="recovery-path">Canonical page path</label>
              <input id="recovery-path" name="canonical_path" type="text" list="recovery-paths" placeholder="/buy-instagram-comments-india" required maxLength={180} className={fieldClass} disabled={!!error} />
              <datalist id="recovery-paths">{suggestedPaths.map((path) => <option key={path} value={path} />)}</datalist>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass} htmlFor="workstream">Workstream</label>
                <select id="workstream" name="workstream" defaultValue="seo" className={fieldClass} disabled={!!error}>{recoveryWorkstreams.map((v) => <option key={v} value={v}>{v.toUpperCase()}</option>)}</select>
              </div>
              <div><label className={labelClass} htmlFor="issue-type">Issue type</label>
                <select id="issue-type" name="issue_type" defaultValue="discovered_not_indexed" className={fieldClass} disabled={!!error}>{recoveryIssues.map((v) => <option key={v} value={v}>{formatRecoveryLabel(v)}</option>)}</select>
              </div>
              <div><label className={labelClass} htmlFor="issue-priority">Priority</label>
                <select id="issue-priority" name="priority" defaultValue="high" className={fieldClass} disabled={!!error}>{recoveryPriorities.map((v) => <option key={v} value={v}>{formatRecoveryLabel(v)}</option>)}</select>
              </div>
              <div><label className={labelClass} htmlFor="evidence-source">Evidence source</label>
                <select id="evidence-source" name="evidence_source" defaultValue="search_console" className={fieldClass} disabled={!!error}>{recoveryEvidenceSources.map((v) => <option key={v} value={v}>{formatRecoveryLabel(v)}</option>)}</select>
              </div>
            </div>
            <div><label className={labelClass} htmlFor="recovery-title">Issue summary</label>
              <input id="recovery-title" name="title" placeholder="Page discovered but not indexed" minLength={8} maxLength={160} required className={fieldClass} disabled={!!error} />
            </div>
            <div><label className={labelClass} htmlFor="evidence-date">Evidence date (optional)</label>
              <input id="evidence-date" name="evidence_date" type="date" max={new Date().toISOString().slice(0,10)} className={fieldClass} disabled={!!error} />
            </div>
            <div><label className={labelClass} htmlFor="recovery-details">Notes & next check</label>
              <textarea id="recovery-details" name="details" rows={3} maxLength={2000} className={fieldClass} placeholder="Record GSC status, Google-selected canonical, and what needs checking." disabled={!!error} />
            </div>
            <button type="submit" disabled={!!error} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A1F] px-4 py-3 text-sm font-black text-[#161006] disabled:cursor-not-allowed disabled:opacity-40">
              Add recovery item <ArrowRight size={16} />
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center gap-2"><FileSearch size={20} className="text-orange-300" /><h2 className="text-lg font-black">Historical indexation targets</h2></div>
          <p className="mt-2 text-xs leading-5 text-[#A8AFBD]">October 10 Search Console export previously reported the following money pages as discovered but not indexed. Reinspect before entering a current verdict.</p>
          <div className="mt-4 grid gap-2">
            {oldGscTargets.map((path) => (
              <div key={path} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[.02] p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 break-all text-xs font-semibold text-[#D1D5DB]">{path}</span>
                <a href={"https://www.getsocialrush.com" + path} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-orange-200">View <ExternalLink size={13} /></a>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4 text-xs leading-5 text-sky-100">
            <ShieldCheck className="mt-0.5 shrink-0" size={16} />
            A historical exclusion is a lead for investigation, not proof that a page remains excluded. Intentional redirects and canonical alternates should not be treated as defects.
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black">Work item history</h2>
          <p className="mt-2 text-xs text-[#9CA3AF]">Sorted by priority, then latest update. Every status change is an admin-reviewed action.</p>
        </div>
        {!error && rows.length === 0 ? <div className="p-10 text-center"><CheckCircle2 size={28} className="mx-auto text-[#9CA3AF]" /><h3 className="mt-3 font-bold">No recovery items recorded yet</h3><p className="mt-2 text-sm text-[#9CA3AF]">Use the form above to document the first verified issue.</p></div> : null}
        <div className="divide-y divide-white/10">
          {rows.map((row) => (
            <article key={row.id} className="p-5">
              <div className="flex flex-wrap gap-2">
                <span className={"rounded-md px-2 py-1 text-[10px] font-black uppercase " + statusColor(row.status)}>{formatRecoveryLabel(row.status)}</span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-[#D1D5DB]">{row.priority}</span>
                <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-[#D1D5DB]">{row.workstream}</span>
              </div>
              <h3 className="mt-3 font-bold text-white">{row.title}</h3>
              <p className="mt-1 break-all text-xs text-orange-200">{row.canonical_path}</p>
              <p className="mt-2 text-xs text-[#A8AFBD]">{formatRecoveryLabel(row.issue_type)} · {formatRecoveryLabel(row.evidence_source)}{row.evidence_date ? " · " + row.evidence_date : ""}</p>
              {row.details ? <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[#CBD2DC]">{row.details}</p> : null}
              {row.resolution_note ? <p className="mt-3 text-xs leading-5 text-emerald-100">Resolution: {row.resolution_note}</p> : null}
              <form action={updateRecoveryItemStatus} className="mt-4 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
                <input type="hidden" name="item_id" value={row.id} />
                <div><label className={labelClass} htmlFor={"status-" + row.id}>Status</label>
                  <select name="status" id={"status-" + row.id} defaultValue={row.status} className={fieldClass}>{recoveryStatuses.map((s) => <option key={s} value={s}>{formatRecoveryLabel(s)}</option>)}</select>
                </div>
                <div><label className={labelClass} htmlFor={"resolution-" + row.id}>Resolution note (required when verifying or closing)</label>
                  <input id={"resolution-" + row.id} name="resolution_note" type="text" maxLength={2000} className={fieldClass} placeholder="Evidence, fix or reason for closure" defaultValue={row.resolution_note ?? ""} />
                </div>
                <button className="min-h-11 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-black text-orange-200 hover:bg-orange-500/20" type="submit">Save status</button>
              </form>
              <p className="mt-2 text-[11px] text-[#737B8B]">Updated {new Date(row.updated_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST</p>
            </article>
          ))}
        </div>
      </section>
      <p className="flex items-start gap-2 text-xs leading-5 text-[#8B93A1]"><TriangleAlert size={15} className="mt-0.5 shrink-0" /> No URLs are requested for indexing or automatically changed by this queue. Google Search Console and source-backed review remain the authority.</p>
    </main>
  );
}
