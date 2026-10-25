import Link from "next/link";

/**
 * Original buyer guidance for the canonical Instagram Views service URL.
 * Ordering availability, pricing and delivery must come from the active checkout.
 */
export default function InstagramViewsBuyingGuide() {
  const checks = [
    {
      title: "Use the exact public Reel or video URL",
      body: "Instagram video views apply to an eligible public Reel or video post, not to a profile, Story or private link. Paste the full URL for the content you want to order for, and keep it publicly accessible.",
    },
    {
      title: "Check live availability before paying",
      body: "The page may display a catalog starting rate, but that is not a live quote or a guarantee that the service is taking orders. Confirm the active service, your quantity and the final INR total in checkout.",
    },
    {
      title: "Review the actual delivery and refill terms",
      body: "The public catalog lists an indicative 1–3 day delivery estimate and refill eligibility. Timing and support can vary; the live order review controls the applicable terms for your purchase.",
    },
    {
      title: "Understand views versus meaningful growth",
      body: "Purchased view counts do not guarantee Indian viewers, unique people, watch time, comments, followers, leads or sales. Artificial engagement may violate Instagram rules and may be removed.",
    },
  ] as const;
  return (
    <section aria-labelledby="instagram-views-buyer-guide-title" className="border-y border-white/10 bg-[#101014] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Instagram Reels and video buying guide</p>
        <h2 id="instagram-views-buyer-guide-title" className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          Before you buy Instagram views in India, compare the important details
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D1D5DB] sm:text-base">
          If you are researching where to buy Instagram views, focus on whether the service supports your public
          Reel, the final price and the actual delivery terms. India-based billing does not imply views from India.
          For a relevant audience, combine useful Reels with organic distribution and location-targeted promotion.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, body }, i) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-wider text-orange-300">Check {i + 1}</p>
              <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 flex flex-col gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-white">Still comparing Instagram services?</h3>
            <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">
              A view is not a like, save or follower. Choose the metric that matches your actual content goal.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/instagram-likes" className="underline underline-offset-4">Compare Instagram likes</Link>
              <Link href="/buy-instagram-comments-india" className="underline underline-offset-4">Instagram comment packages</Link>
              <Link href="/buy-instagram-saves-india" className="underline underline-offset-4">Instagram save packages</Link>
              <Link href="/buy-instagram-shares-india" className="underline underline-offset-4">Instagram share packages</Link>
              <Link href="/blog/instagram-followers-vs-engagement" className="underline underline-offset-4">Understand engagement</Link>
            </div>
          </div>
          <a href="#packages" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Check order availability
          </a>
        </div>
      </div>
    </section>
  );
}
