import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, ShieldCheck } from "lucide-react";
import type { PolicySection } from "./PolicyPage";

type TocItem = { id: string; label: string };

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  badge: string;
  breadcrumbLabel: string;
  tableOfContentsItems: TocItem[];
  sections: PolicySection[];
};

function isImportantSection(title: string) {
  return /(liability|refund|dispute|retention|security|billing|payment|wallet|cancellations)/i.test(title);
}

export default function LegalPageLayout({
  title,
  subtitle,
  badge,
  breadcrumbLabel,
  tableOfContentsItems,
  sections,
}: LegalPageLayoutProps) {
  return (
    <main className="legal-page relative overflow-x-clip bg-[#07080D] pb-16 text-[#F8FAFC] sm:pb-24">
      <section className="relative border-b border-white/10 bg-[radial-gradient(ellipse_at_90%_10%,rgba(255,118,0,.11),transparent_55%),linear-gradient(160deg,#0C0E14,#07080D)] px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-9 flex items-center gap-2 text-sm text-[#A8AFBD]">
            <Link href="/" className="rounded-md underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7600]">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span aria-current="page" className="text-[#F8FAFC]">{breadcrumbLabel}</span>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-lg border border-[#FF7600]/30 bg-[#FF7600]/10 px-3 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#FF9A2E]">
                <FileText className="h-4 w-4" aria-hidden="true" />{badge}
              </p>
              <h1 className="mt-5 text-[clamp(2rem,5vw,3.7rem)] font-extrabold leading-[1.07] tracking-[-.045em] text-white">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#C4CBD5]">{subtitle}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF7600] px-5 py-3 text-sm font-bold text-[#07080D] hover:bg-[#FF9A2E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9A2E]">Contact support <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7600]">Back to home</Link>
              </div>
            </div>
            <aside className="rounded-2xl border border-white/10 bg-[#101219] p-5" aria-label="Reading guide">
              <ShieldCheck className="h-6 w-6 text-[#FF9A2E]" aria-hidden="true" />
              <p className="mt-3 text-lg font-bold text-white">Understand your policy</p>
              <p className="mt-2 text-sm leading-7 text-[#C4CBD5]">Browse the sections below and check the terms that apply to your account, orders or payments.</p>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 pt-9 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 lg:px-8">
        <aside aria-label="Policy contents" className="min-w-0">
          <details className="rounded-xl border border-white/15 bg-[#101219] p-4 lg:hidden">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-white">On this page</summary>
            <nav aria-label="Policy sections mobile" className="mt-2 grid gap-1">
              {tableOfContentsItems.map((item, index) => (
                <a key={item.id} href={`#${item.id}`} className="rounded-lg px-2 py-2 text-sm leading-6 text-[#C4CBD5] hover:bg-white/[.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF7600]">{index + 1}. {item.label}</a>
              ))}
            </nav>
          </details>
          <nav aria-label="Policy sections" className="sticky top-28 hidden max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#101219] p-5 lg:block">
            <p className="mb-3 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-[.12em] text-[#FF9A2E]">On this page</p>
            <ol className="grid gap-1">
              {tableOfContentsItems.map((item, index) => (
                <li key={item.id}><a href={`#${item.id}`} className="block rounded-lg px-2 py-2 text-sm leading-6 text-[#C4CBD5] hover:bg-white/[.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF7600]">{index + 1}. {item.label}</a></li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 rounded-2xl border border-white/10 bg-[#101219] px-5 py-2 sm:px-8 lg:px-10">
          {sections.map((section, index) => {
            const sectionId = tableOfContentsItems[index]?.id || `section-${index + 1}`;
            const important = isImportantSection(section.title);
            return (
              <section id={sectionId} key={sectionId} className="scroll-mt-28 border-b border-white/10 py-7 last:border-0 sm:py-9">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#FF7600]/10 text-xs font-bold text-[#FF9A2E]">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="min-w-0 text-xl font-bold leading-9 tracking-tight text-white sm:text-2xl">{section.title}</h2>
                </div>
                {important && (
                  <p className="mt-5 rounded-xl border-l-[3px] border-[#FF7600] bg-[#FF7600]/10 px-4 py-3 text-sm leading-7 text-[#F8D0A7]">
                    Important: Review this section carefully before continuing with the relevant service.
                  </p>
                )}
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-[15px] leading-8 text-[#D1D5DB] sm:text-base">{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="grid gap-3 pl-5">
                      {section.bullets.map((item, itemIndex) => (
                        <li key={itemIndex} className="list-disc pl-1 text-[15px] leading-8 marker:text-[#FF9A2E] text-[#D1D5DB] sm:text-base">{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </article>
      </div>
    </main>
  );
}
