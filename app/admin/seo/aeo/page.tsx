import { Bot, CheckCircle2, Network, SearchCheck, ShieldCheck } from "lucide-react";
import { buildAeoSnapshot } from "@/lib/seo/answer-engine";

export const dynamic = "force-dynamic";

export default function AeoCommandCenterPage() {
  const snapshot = buildAeoSnapshot();

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header>
        <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 48 · AI Search / AEO</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Answer Engine Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
          Track crawler access, answer-ready canonical pages and entity consistency for AI-assisted search without inventing AI rankings or citations.
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["AEO targets", snapshot.summary.targets, "Canonical pages in the answer graph"],
          ["Service answers", snapshot.summary.serviceTargets, "Core service pages with Quick Answer"],
          ["Answer-ready", snapshot.summary.answerReady, "Pages with concise source-backed answers"],
          ["Entity-linked", snapshot.summary.entityLinked, "Pages tied to the canonical organization"],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8B93A1]">{label}</p>
            <b className="mt-3 block text-3xl text-white">{value}</b>
            <p className="mt-2 text-xs text-[#8B93A1]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-300" />
            <h2 className="font-bold text-white">AI search crawler access</h2>
          </div>
          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="font-bold text-emerald-200">{snapshot.crawler.name}: explicitly allowed</p>
            <p className="mt-2 text-xs leading-5 text-[#C7D2D9]">
              Public pages remain crawlable while account, dashboard, admin, API and checkout-sensitive paths stay blocked.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot.crawler.privatePathsProtected.map((path) => (
              <span key={path} className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[10px] font-bold text-[#D1D5DB]">{path}</span>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2">
              <SearchCheck className="h-5 w-5 text-orange-300" />
              <h2 className="font-bold text-white">Answer-ready canonical targets</h2>
            </div>
          </div>
          <div className="divide-y divide-white/10">
            {snapshot.targets.map((target) => (
              <div key={target.path} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-bold text-white">{target.label}</p>
                  <p className="mt-1 truncate text-[11px] text-[#8B93A1]">{target.path}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {target.answerReady ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : null}
                  {target.entityLinked ? <Network className="h-5 w-5 text-sky-200" /> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
          <div>
            <h2 className="font-bold text-white">AEO guardrails</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#A8AFBD] md:grid-cols-2">
              {snapshot.principles.map((principle) => <li key={principle}>• {principle}</li>)}
            </ul>
            <p className="mt-4 text-xs leading-5 text-[#737B8B]">{snapshot.note}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
