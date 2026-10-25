import Link from "next/link";

/**
 * Server-rendered buying and eligibility information.
 * Avoid treating computed viewing duration as delivered/eligible YPP hours.
 */
export default function YouTubeWatchHoursBuyerGuide() {
  const checks = [
    {
      title: "Use a public long-form video",
      detail: "Submit the exact accessible youtube.com/watch?v=... or youtu.be/... video URL, not a channel or playlist URL. Long-form videos are different from Shorts; watch time from the Shorts Feed does not count toward the 4,000 public watch-hours milestone.",
    },
    {
      title: "Understand the maximum-duration assumption",
      detail: "The on-page calculator multiplies view quantity by the entire video duration and divides by 60. That is a full-length viewing illustration, not a forecast. Real viewing duration, verification and eligible public watch hours can be much lower, including zero.",
    },
    {
      title: "Check active INR pricing and eligibility",
      detail: "The public catalog contains placeholder limits for this service. Use the active service to confirm availability, supported view quantity, calculated INR total, delivery estimate and refill or support terms. Never use the example video lengths as a fixed package quote.",
    },
    {
      title: "Know monetization and policy limitations",
      detail: "YouTube independently verifies legitimate viewing and Partner Program eligibility. Paid ad-campaign watch time is excluded from YPP thresholds, and artificial viewing can violate YouTube policies. Purchased activity does not guarantee 4,000 qualified public watch hours, YPP approval, revenue or search ranking.",
    },
  ] as const;

  return (
    <section aria-labelledby="youtube-watch-hours-guide-heading" className="border-y border-white/10 bg-[#10141c] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">YouTube Watch Hours India · Buyer guide</p>
        <h2 id="youtube-watch-hours-guide-heading" className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Buy YouTube watch hours in India: check real eligibility before paying
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Comparing YouTube watch-hours packages? First separate watch-time illustrations, publicly displayed
          views and the qualified public watch hours shown in YouTube Studio. These are not interchangeable.
          YouTube reviews valid engagement independently of any third-party order.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, detail }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Decision {index + 1}</p>
              <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">Understand the official YouTube requirements</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Video analytics may change after YouTube verifies views and playbacks. Build genuine viewing through
              useful longer videos, clear introductions, accurate thumbnails, playlists and audience retention.
              Never assume a purchased package will help reach a monetization threshold.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-orange-200">
              <a href="https://support.google.com/adsense/answer/72851" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">YouTube YPP eligibility</a>
              <a href="https://support.google.com/youtube/answer/3399767" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Fake engagement policy</a>
              <Link href="/youtube-views" className="underline underline-offset-4">YouTube views guide</Link>
              <Link href="/buy-youtube-comments-india" className="underline underline-offset-4">YouTube comments guide</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Check live service details
          </a>
        </div>
      </div>
    </section>
  );
}
