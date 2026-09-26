import Link from "next/link";
import { crawlPriorityServiceLinks, searchPlanningLinks } from "@/lib/seo/search-priority";

export default function CrawlPriorityLinks() {
  return (
    <section aria-labelledby="priority-growth-links" className="border-y border-white/[.06] bg-[#090B10]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">India search shortcuts</p>
          <h2 id="priority-growth-links" className="mt-2 text-xl font-black text-white sm:text-2xl">
            Compare high-intent services and live INR pricing
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#A8AFBD]">
            Use direct canonical service pages for current pricing, public-link requirements, delivery and refill/support details before ordering.
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {crawlPriorityServiceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-orange-400/20 bg-orange-400/[.06] px-4 py-3 transition hover:border-orange-400/50 hover:bg-orange-400/[.1]"
            >
              <span className="block text-xs font-black text-white">{item.label}</span>
              <span className="mt-1 block text-[11px] leading-5 text-[#A8AFBD]">{item.intent}</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {searchPlanningLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs font-bold text-[#E5E7EB] transition hover:border-orange-400/40 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
