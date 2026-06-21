import PublicShell from "@/components/marketing/PublicShell";
import PageHero from "@/components/marketing/PageHero";
import { publicFaqs } from "@/lib/marketing/content";

export default function FaqPage() {
  return <PublicShell><PageHero eyebrow="Frequently asked questions" title="Clear answers before we start working together." description="Learn about SocialRUSH services, onboarding, timelines, reporting, support, and billing."/><section className="bg-[#f6f9ff] px-5 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl space-y-3">{publicFaqs.map(([question,answer],index) => <details key={question} className="group rounded-2xl border border-white bg-white shadow-sm open:border-blue-200 open:shadow-lg"><summary className="flex cursor-pointer list-none items-center gap-4 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">{String(index+1).padStart(2,"0")}</span><h2 className="flex-1 text-sm font-bold text-[#07152f]">{question}</h2><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50 text-blue-600 transition group-open:rotate-45">+</span></summary><p className="border-t border-blue-50 px-5 py-5 pl-[5.25rem] text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></section></PublicShell>;
}
