import Link from "next/link";

/**
 * Indexable, server-rendered buying decisions for the canonical comments page.
 * Do not duplicate dynamic prices or promise outcomes controlled by YouTube.
 */
export default function YouTubeCommentsBuyerGuide() {
  const checks = [
    {
      title: "Confirm the exact video or Short",
      text: "Paste the public video URL, such as youtube.com/watch?v=..., youtu.be/... or youtube.com/shorts/.... A channel homepage, playlist or private video is not an eligible comments destination. Keep the video accessible during processing.",
    },
    {
      title: "Check whether comments are enabled",
      text: "YouTube creators can disable or restrict commenting, and the platform can hold, filter or remove comments. A public video with a disabled comment section may not be eligible. Visibility cannot be guaranteed after an order.",
    },
    {
      title: "Use live INR prices and current conditions",
      text: "The public catalog does not provide a reliable fixed YouTube Comments price or quantity range. The active service must supply availability, the allowed quantity, the calculated INR total, the delivery estimate and any refill or support terms before payment.",
    },
    {
      title: "Do not assume targeted or custom responses",
      text: "Orders in India are priced in INR; that does not guarantee comments from Indian accounts, interested viewers or creators in a particular niche. Custom comment wording, meaningful conversations and comment retention should never be assumed unless the active service explicitly supports them.",
    },
  ] as const;

  return (
    <section aria-labelledby="youtube-comments-buyer-heading" className="border-y border-white/10 bg-[#10131b] px-4 py-16 text-[#f8f6f1] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">YouTube Comments: buyer questions</p>
        <h2 id="youtube-comments-buyer-heading" className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          Buy YouTube comments in India: video eligibility, moderation and live packages
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Before choosing where to buy YouTube comments, check the individual video, not just the package size.
          A visible comment count is not evidence of an engaged audience, genuine feedback or a more trusted
          channel. The correct order conditions depend on the currently active service.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, text }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Before payment · {index + 1}</p>
              <h3 className="mt-3 text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">Comments vs organic audience growth</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Artificial engagement can violate YouTube policies, be removed and create misleading signals.
              Buying comments does not guarantee recommendations, search placement, public watch hours,
              YouTube Partner Program approval or revenue. For genuine comments, ask relevant questions in
              videos, reply to real viewers and create content that invites discussion.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/youtube-views" className="underline underline-offset-4">Compare YouTube views</Link>
              <Link href="/youtube-subscribers" className="underline underline-offset-4">Compare YouTube subscribers</Link>
              <Link href="/buy-youtube-watch-hours-india" className="underline underline-offset-4">Understand watch hours</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Check live comment packages
          </a>
        </div>
      </div>
    </section>
  );
}
