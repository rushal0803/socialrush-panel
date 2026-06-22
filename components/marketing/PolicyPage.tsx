import PageHero from "./PageHero";
import PublicShell from "./PublicShell";

export type PolicySection = { title: string; body: string[]; bullets?: string[] };

export default function PolicyPage({ title, summary, sections }: { title: string; summary: string; sections: PolicySection[] }) {
  return (
    <PublicShell>
      <PageHero eyebrow="SocialRUSH policies" title={title} description={summary} action="Contact our team" actionHref="/contact" />
      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-28">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">On this page</p>
            <nav className="mt-4 space-y-2">{sections.map((section, index) => <a key={section.title} href={`#section-${index + 1}`} className="block text-xs leading-5 text-slate-600 hover:text-blue-600">{section.title}</a>)}</nav>
            <p className="mt-6 border-t border-slate-200 pt-4 text-[10px] leading-5 text-slate-400">Effective: 20 June 2026<br />Contact: support@socialrush.in</p>
          </aside>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            {sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title} className="scroll-mt-28 border-b border-slate-100 py-8 first:pt-0 last:border-0 last:pb-0"><h2 className="text-xl font-bold text-[#07152f]">{index + 1}. {section.title}</h2>{section.body.map((paragraph) => <p key={paragraph} className="mt-4 text-sm leading-7 text-slate-600">{paragraph}</p>)}{section.bullets && <ul className="mt-4 space-y-2">{section.bullets.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600"><span className="text-blue-600">•</span>{item}</li>)}</ul>}</section>)}
          </article>
        </div>
      </section>
    </PublicShell>
  );
}
