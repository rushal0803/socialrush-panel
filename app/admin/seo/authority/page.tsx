import Link from "next/link";
import { ArrowRight, CheckCircle2, GitBranch, Link2, Network, TriangleAlert } from "lucide-react";
import { buildInternalAuthoritySnapshot } from "@/lib/seo/authority-graph";

export const dynamic = "force-dynamic";

export default function SeoAuthorityPage() {
  const snapshot = buildInternalAuthoritySnapshot();
  const hubs = snapshot.nodes.filter((node) => node.kind === "hub" || node.kind === "country-hub");
  const strongest = [...snapshot.nodes].sort((a, b) => b.inbound - a.inbound).slice(0, 12);

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Phase 29 · Internal Authority Graph</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Internal Authority Command Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8AFBD]">
            Track how platform hubs, canonical money pages, supporting guides and international market pages reinforce each other without routing authority through aliases or noindex catalog pages.
          </p>
        </div>
        <Link href="/admin/seo/content" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-100">
          Content Engine <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Graph nodes", snapshot.summary.nodes, "Hubs, services and guides"],
          ["Authority edges", snapshot.summary.edges, "Declared crawlable relationships"],
          ["Money pages", snapshot.summary.serviceNodes, "Canonical platform services"],
          ["International nodes", snapshot.summary.internationalNodes, "Country hubs + service pages"],
          ["Orphan services", snapshot.summary.orphanServices, "Should stay at zero"],
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
            <div className="flex items-center gap-2"><Network className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Hub authority flow</h2></div>
            <p className="mt-1 text-xs text-[#8B93A1]">Inbound and outbound edge counts from the canonical graph.</p>
          </div>
          <div className="divide-y divide-white/10">
            {hubs.map((node) => (
              <div key={node.path} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-bold text-white">{node.label}</p>
                  <p className="mt-1 truncate text-[11px] text-[#8B93A1]">{node.path}</p>
                </div>
                <div className="flex shrink-0 gap-2 text-[10px] font-black uppercase">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-200">In {node.inbound}</span>
                  <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-sky-100">Out {node.outbound}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2"><Link2 className="h-5 w-5 text-orange-300" /><h2 className="font-bold text-white">Strongest receiving nodes</h2></div>
            <p className="mt-1 text-xs text-[#8B93A1]">Useful for spotting over-concentration and weak internal support.</p>
          </div>
          <div className="divide-y divide-white/10">
            {strongest.map((node) => (
              <div key={node.path} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-bold text-white">{node.label}</p>
                  <p className="mt-1 truncate text-[11px] text-[#8B93A1]">{node.path}</p>
                </div>
                <span className="shrink-0 text-sm font-black text-orange-200">{node.inbound} in</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex items-start gap-3">
          {snapshot.orphanServices.length ? <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />}
          <div>
            <h2 className="font-bold text-white">Orphan service check</h2>
            {snapshot.orphanServices.length ? (
              <div className="mt-3 space-y-2">
                {snapshot.orphanServices.map((node) => <p key={node.path} className="text-sm text-amber-100">{node.path}</p>)}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-emerald-200">Every canonical service node in the Phase 29 graph has at least one inbound authority edge.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#111111] p-5">
        <div className="flex gap-3">
          <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
          <div>
            <h2 className="font-bold text-white">Organic exclusions</h2>
            <p className="mt-2 text-sm leading-6 text-[#A8AFBD]">Catalog-only TikTok pages remain usable from the product catalog but are intentionally excluded from the organic authority graph because they are noindex.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {snapshot.excludedPaths.map((path) => <span key={path} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[11px] font-bold text-[#D1D5DB]">{path}</span>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
