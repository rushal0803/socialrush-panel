import Link from "next/link";
import { engagementBuyerChecks, engagementBuyerFaqSchema, type EngagementBuyerService } from "@/lib/seo/engagement-buyer-checks";

export default function EngagementBuyerChecks({ service }: { service: EngagementBuyerService }) {
  const content = engagementBuyerChecks[service];
  return <section data-buyer-checks={service} className="border-y border-white/10 bg-[#101014] px-4 py-12 text-white sm:px-6 lg:px-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(engagementBuyerFaqSchema(service)).replace(/</g, "\\u003c") }} />
    <div className="mx-auto max-w-7xl">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Understand the service</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">{content.heading}</h2>
      <div className="mt-7 grid gap-5 md:grid-cols-3">{content.questions.map(([question, answer]) => <article key={question} className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <h3 className="text-lg font-bold">{question}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{answer}</p>
      </article>)}</div>
      <nav aria-label={`${content.heading} further reading`} className="mt-6 flex flex-wrap gap-3">{content.links.map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-xl border border-orange-300/25 px-4 py-2 text-sm font-bold text-orange-200 underline underline-offset-4">{label}</Link>)}</nav>
    </div>
  </section>;
}
