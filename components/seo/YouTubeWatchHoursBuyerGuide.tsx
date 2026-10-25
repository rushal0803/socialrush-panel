import Link from "next/link";

/**
 * Server-rendered editorial guidance for the canonical YouTube Watch Hours page.
 * YouTube alone determines qualified watch hours, analytics and YPP eligibility.
 */
export default function YouTubeWatchHoursBuyerGuide() {
  const checks = [
    {
      title: "Use the exact public long-form video",
      text: "Submit a public YouTube watch?v=... or supported youtu.be/... link, not your channel homepage. Keep the content public during delivery. Shorts Feed watch time is not qualified watch time for the 4,000-hour long-form YPP threshold.",
    },
    {
      title: "Separate video length from average viewing time",
      text: "A 60-minute video does not mean that each counted view produces 60 watched minutes. A planning estimate uses views × video minutes × assumed average percentage watched ÷ 60. Actual viewer retention and validated watch hours can differ.",
    },
    {
      title: "Verify package conditions at checkout",
      text: "The public catalog does not publish a reliable fixed watch-hour price or quantity limit. Check active service availability, the live INR total, supported order quantity, estimated delivery, refill or support terms, and video-link rules before proceeding.",
    },
    {
      title: "Understand what is excluded from monetization",
      text: "YouTube excludes watch time from ad campaigns and Shorts from its long-form Partner Program watch-hour threshold. Private, unlisted and deleted videos also do not qualify. YouTube may disregard artificial or low-quality engagement.",
    },
  ] as const;

  return (
    <section aria-labelledby="youtube-watch-hours-buyer-guide-heading" className="border-y border-white/10 bg-[#10131b] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">YouTube Watch Hours buyer guide</p>
        <h2 id="youtube-watch-hours-buyer-guide-heading" className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Buy YouTube watch hours in India: estimate viewing time without promising monetization
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Before choosing where to buy YouTube watch hours, compare the actual live service terms and understand
          the difference between viewing time, analytics reports and qualified public watch hours. Paying for an
          order does not establish genuine viewers or count toward the YouTube Partner Program.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, text }, i) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Review {i + 1}</p>
              <h3 className="mt-3 text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">What YouTube actually counts</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              YouTube can reject artificial engagement and independently verifies its Partner Program thresholds.
              Neither a projected watch-time number nor an order completion confirms YPP progress, approval, revenue
              or search ranking. Publish valuable long-form videos and assess authentic average view duration in
              YouTube Studio for sustainable growth.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <a href="https://support.google.com/youtube/answer/72851" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Official YPP eligibility rules</a>
              <a href="https://support.google.com/youtube/answer/3399767" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">YouTube fake-engagement policy</a>
              <Link href="/youtube-views" className="underline underline-offset-4">Compare YouTube views</Link>
              <Link href="/buy-youtube-comments-india" className="underline underline-offset-4">YouTube comments</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Review live order details
          </a>
        </div>
      </div>
    </section>
  );
}
