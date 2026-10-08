import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, Gauge, ShieldCheck } from "lucide-react";
import { runProductionQualityMonitor, type QualityState } from "@/lib/monitoring/quality";

export const dynamic = "force-dynamic";

function tone(state: QualityState) {
  if (state === "healthy") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (state === "warning") return "border-amber-400/20 bg-amber-500/10 text-amber-100";
  return "border-red-400/20 bg-red-500/10 text-red-200";
}

export default async function QualityMonitorPage() {
  const snapshot = await runProductionQualityMonitor();

  return <main className="mx-auto max-w-[1500px] p-4 pb-20 sm:p-8">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 47 · Automated Quality Monitoring</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Production Quality Monitor</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
          Read-only checks for customer-facing availability, database health, security headers, core revenue pages and crawl-critical files.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/incidents" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
          View incidents <ExternalLink className="h-4 w-4"/>
        </Link>
        <Link href="/status" target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 text-xs font-bold text-white">
          Public status <ExternalLink className="h-4 w-4"/>
        </Link>
      </div>
    </header>

    <section className={`mt-6 rounded-2xl border p-4 ${tone(snapshot.overall)}`}>
      <div className="flex gap-3">
        {snapshot.overall === "healthy" ? <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0"/> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/>}
        <div>
          <p className="font-black uppercase tracking-wide">Overall: {snapshot.overall}</p>
          <p className="mt-1 text-sm leading-6">{snapshot.note}</p>
        </div>
      </div>
    </section>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Signals checked", snapshot.summary.total, "Current production probe"],
        ["Healthy", snapshot.summary.healthy, "Passed"],
        ["Warnings", snapshot.summary.warning, "Successful but needs review"],
        ["Critical", snapshot.summary.critical, "Fails scheduled quality gate"],
      ].map(([label, value, note]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
        <b className="mt-3 block text-3xl text-white">{value}</b>
        <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
      </article>)}
    </section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-orange-300"/><h2 className="font-bold text-white">Live production checks</h2></div>
        <p className="mt-1 text-xs text-[#8B93A1]">Checked {new Date(snapshot.checkedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {snapshot.checks.map((check) => <article key={check.id} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">{check.label}</p>
              <p className="mt-1 break-all text-[11px] text-[#8B93A1]">{check.target}</p>
            </div>
            {check.state === "healthy" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300"/> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300"/>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <span className={`rounded-full border px-2 py-1 font-black uppercase ${tone(check.state)}`}>{check.state}</span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[#A8AFBD]">HTTP {check.httpStatus ?? "n/a"}</span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[#A8AFBD]">{check.latencyMs === null ? "n/a" : `${check.latencyMs}ms`}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#D1D5DB]">{check.message}</p>
        </article>)}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1000px] w-full text-left text-xs">
          <thead className="bg-white/[.025] text-[10px] uppercase tracking-wide text-[#737B8B]">
            <tr><th className="px-5 py-3">Check</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">State</th><th className="px-4 py-3">HTTP</th><th className="px-4 py-3">Latency</th><th className="px-5 py-3">Result</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {snapshot.checks.map((check) => <tr key={check.id}>
              <td className="px-5 py-4 font-bold text-white">{check.label}</td>
              <td className="px-4 py-4 text-[#A8AFBD]">{check.target}</td>
              <td className="px-4 py-4"><span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${tone(check.state)}`}>{check.state}</span></td>
              <td className="px-4 py-4 text-[#A8AFBD]">{check.httpStatus ?? "—"}</td>
              <td className="px-4 py-4 text-[#A8AFBD]">{check.latencyMs === null ? "—" : `${check.latencyMs}ms`}</td>
              <td className="max-w-md px-5 py-4 leading-5 text-[#D1D5DB]">{check.message}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </main>;
}
