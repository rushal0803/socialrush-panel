import Link from "next/link";
import { Activity, ArrowLeft, ArrowRight, Search, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { acquisitionAttention, summarizeAcquisitionDiscovery } from "@/lib/crm/acquisition-insights";

export const dynamic = "force-dynamic";

const displayNumber = (value: number | null | undefined) => value == null ? "Unavailable" : value.toLocaleString("en-IN");
const date = (iso: string | null) => iso
  ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso))
  : "—";

export default async function AcquisitionInsightsPage() {
  // Admin authentication and noindex are enforced by the existing admin layout.
  // This page only reads CRM data; it never triggers searches, contacts or email sends.
  const db = await createClient();
  const since14 = new Date(Date.now() - 14 * 86400000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const [runs, allCandidates, mxCandidates, promoted, qualified, sent, delivered, replies, settings] = await Promise.all([
    db.from("crm_prospect_discovery_runs").select("started_at,status,search_count,discovered_count,staged_count,invalid_count,metadata")
      .gte("started_at", since14).order("started_at", { ascending: false }).limit(100),
    db.from("crm_lead_candidates").select("id", { count: "exact", head: true }),
    db.from("crm_lead_candidates").select("id", { count: "exact", head: true }).eq("email_verification_status", "valid"),
    db.from("crm_lead_candidates").select("id", { count: "exact", head: true }).eq("qualification_status", "promoted"),
    db.from("crm_lead_candidates").select("id", { count: "exact", head: true }).in("qualification_status", ["qualified", "ready"]),
    db.from("crm_outreach_messages").select("id", { count: "exact", head: true }).not("sent_at", "is", null).gte("created_at", since30),
    db.from("crm_outreach_messages").select("id", { count: "exact", head: true }).not("delivered_at", "is", null).gte("created_at", since30),
    db.from("crm_inbound_messages").select("id", { count: "exact", head: true }).gte("received_at", since30),
    db.from("crm_outreach_settings").select("enabled,auto_send,provider,global_daily_send_limit").eq("id", 1).maybeSingle(),
  ]);
  const anyErrors = [runs, allCandidates, mxCandidates, promoted, qualified, sent, delivered, replies, settings]
    .some((response) => response.error);
  const summary = runs.error ? null : summarizeAcquisitionDiscovery(runs.data || []);
  const sendingOn = Boolean(settings.data?.enabled && settings.data?.auto_send);
  const counters = [
    ["Discovered candidates", allCandidates.error ? null : allCandidates.count, "Total candidate records, not confirmed buyers"],
    ["Mail-domain ready", mxCandidates.error ? null : mxCandidates.count, "Only DNS/MX checks, not verified inbox delivery"],
    ["Promoted leads", promoted.error ? null : promoted.count, "Candidates promoted into CRM lead records"],
    ["Qualified in queue", qualified.error ? null : qualified.count, "Candidates marked qualified or ready"],
    ["Emails sent · 30 days", sent.error ? null : sent.count, "Outbound CRM records with a send timestamp"],
    ["Delivered · 30 days", delivered.error ? null : delivered.count, "Provider-delivered outbound CRM records"],
    ["Inbound replies · 30 days", replies.error ? null : replies.count, "Inbound CRM messages, not necessarily interested replies"],
  ] as const;
  return (
    <main className="mx-auto max-w-[1400px] space-y-6 p-4 pb-20 text-white sm:p-8">
      <header className="rounded-3xl border border-orange-400/20 bg-[#111111] p-6 sm:p-8">
        <Link href="/admin/crm/growth-hub" className="inline-flex items-center gap-2 text-xs font-bold text-orange-200"><ArrowLeft size={15}/> Back to Growth Hub</Link>
        <p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-orange-300">Revenue acquisition · Discovery quality</p>
        <h1 className="mt-2 text-3xl font-black">Lead Acquisition Insights</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#AFB6C2]">
          Monitor where discovery loses qualified companies. Search results, MX readiness, emails sent, replies and paid sales are different stages.
          No sales or conversion claims are inferred from search-result counts.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold">
          <span className={sendingOn ? "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-200" : "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-200"}>
            <ShieldCheck size={14} className="mr-2 inline-block"/> Automatic outbound: {settings.error ? "Unavailable" : sendingOn ? "ON" : "OFF"}
          </span>
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-200">
            Provider: {settings.error ? "Unavailable" : settings.data?.provider || "Not configured"}
          </span>
        </div>
      </header>
      {anyErrors ? <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100" role="status">
        Some CRM queries failed. Missing values are displayed as unavailable, never assumed to be zero.
      </p> : null}
      <section aria-labelledby="discovery-heading" className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-wider text-orange-300">Last 14 days</p><h2 id="discovery-heading" className="mt-1 text-xl font-black">Discovery conversion</h2></div>
          <Link href="/admin/crm/prospecting" className="inline-flex items-center gap-2 text-xs font-bold text-orange-200">Review candidates <ArrowRight size={14}/></Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {([
            ["Completed/attempted runs", summary?.runs, "Runs in period"],
            ["Search queries", summary?.searches, "Brave API searches"],
            ["Search results", summary?.results, "Returned search results"],
            ["New candidate records", summary?.candidates, "Stored after validation"],
            ["Result-to-candidate yield", summary ? String(summary.yieldPercent) + "%" : null, "Not a sales conversion rate"],
            ["Invalid/rejected results", summary?.invalid, "Rejected during discovery"],
            ["Zero-company-seed runs", summary?.zeroSeedRuns, "Searches yielding no acceptable business names"],
            ["Fallback searches used", summary?.fallbackRuns, "Alternative discovery searches in period"],
          ] as const).map(([label, value, note]) => (
            <article key={label} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-4">
              <p className="text-xs font-semibold text-[#A8AFBD]">{label}</p>
              <b className="mt-2 block text-2xl text-white">{value == null ? "Unavailable" : typeof value === "number" ? displayNumber(value) : value}</b>
              <p className="mt-2 text-xs text-[#8F949D]">{note}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 flex gap-2 rounded-xl border border-white/10 bg-[#0B0B0F] p-4 text-sm leading-6 text-[#D1D5DB]"><Search size={17} className="mt-1 shrink-0 text-orange-300"/>{summary ? acquisitionAttention(summary) : "Discovery diagnostics are unavailable."}</p>
      </section>
      <section aria-labelledby="pipeline-heading" className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-wider text-orange-300">Lead pipeline</p><h2 id="pipeline-heading" className="mt-1 text-xl font-black">Contact quality and replies</h2></div>
          <Link href="/admin/crm/pipeline" className="inline-flex items-center gap-2 text-xs font-bold text-orange-200">Sales pipeline <ArrowRight size={14}/></Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {counters.map(([label, value, note]) => <article key={label} className="rounded-xl border border-white/10 bg-[#0B0B0F] p-4">
            <p className="text-xs font-semibold text-[#A8AFBD]">{label}</p>
            <b className="mt-2 block text-2xl text-white">{displayNumber(value)}</b>
            <p className="mt-2 text-xs text-[#8F949D]">{note}</p>
          </article>)}
        </div>
      </section>
      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="flex items-center gap-2"><Activity size={17} className="text-orange-300"/><h2 className="text-xl font-black">Recent discovery runs</h2></div>
        <p className="mt-2 text-xs text-[#9CA3AF]">Only the eight most recent runs are shown. A completed run does not mean that usable leads were found.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-xs">
            <thead className="text-[#9CA3AF]"><tr>{["Date (IST)", "Status", "Results", "Candidates", "Invalid", "Queries"].map(label => <th key={label} scope="col" className="p-3 font-semibold">{label}</th>)}</tr></thead>
            <tbody>{runs.error ? <tr><td colSpan={6} className="p-4">Run history unavailable.</td></tr> : (runs.data || []).slice(0, 8).map((run, index) => (
              <tr key={run.started_at + String(index)} className="border-t border-white/10 text-[#D1D5DB]">
                <td className="p-3">{date(run.started_at)}</td><td className="p-3">{run.status}</td>
                <td className="p-3">{run.discovered_count ?? 0}</td><td className="p-3">{run.staged_count ?? 0}</td>
                <td className="p-3">{run.invalid_count ?? 0}</td><td className="p-3">{run.search_count ?? 0}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-[#9CA3AF]">This dashboard does not send emails, contact prospects, run discovery or change CRM settings. Paid revenue attribution requires verified order-to-campaign data.</p>
    </main>
  );
}
