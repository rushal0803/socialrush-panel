import Link from "next/link";
import { platformBuyerDecisions, type BuyerDecisionPlatform } from "@/lib/seo/platform-buyer-decisions";

export default function PlatformBuyerDecisions({ platform }: { platform: BuyerDecisionPlatform }) {
  const content = platformBuyerDecisions[platform];
  return <section data-platform-buyer-decisions={platform} className="mx-auto max-w-6xl px-5 py-12 text-white sm:px-6">
    <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{content.heading}</h2>
    <div className="mt-6 grid gap-4 md:grid-cols-3">{content.checks.map(([title, text]) => <article key={title} className="min-w-0 rounded-2xl border border-white/10 bg-[#101116] p-5">
      <h3 className="text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
    </article>)}</div>
    <Link href="/refund-policy" className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-orange-200 underline underline-offset-4">Read refund eligibility and conditions</Link>
  </section>;
}
