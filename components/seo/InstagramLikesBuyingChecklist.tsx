import Link from "next/link";

/**
 * Buyer-first guidance for the existing /instagram-likes canonical page.
 * Avoid promising the geographic origin, permanence or impact of purchased likes.
 */
export default function InstagramLikesBuyingChecklist() {
  const checkpoints = [
    {
      title: "Choose a post or Reel, not a profile",
      body: "An Instagram Likes order needs the exact public post or Reel URL, such as instagram.com/p/... or instagram.com/reel/.... A profile URL is not the right destination. Keep the content public during processing.",
    },
    {
      title: "Compare the INR total and service terms",
      body: "Select a valid quantity and check the displayed catalog estimate. The final price, availability, delivery window and any refill eligibility must be confirmed in the live order review before payment.",
    },
    {
      title: "India billing is not India-targeted engagement",
      body: "You can place an order from India in rupees, but Instagram likes are not guaranteed to come from Indian accounts or people interested in your niche. Never assume geographic targeting from an INR price.",
    },
    {
      title: "Understand what a like count cannot prove",
      body: "A displayed like count does not verify authentic people, reach, enquiries, conversions or future retention. Artificial engagement can be removed by Instagram and may breach its platform rules.",
    },
  ] as const;

  return (
    <section id="instagram-likes-buying-guide" aria-labelledby="instagram-likes-guide-heading" className="scroll-mt-24 border-y border-white/10 bg-[#111115] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.14em] text-orange-300">Before you order Instagram likes</p>
        <h2 id="instagram-likes-guide-heading" className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          A practical guide to buying Instagram likes in India
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D1D5DB] sm:text-base">
          If you are comparing where to buy Instagram likes for posts and Reels, focus on the correct
          content link, current quantity-based price and clear service limitations—not promises of
          guaranteed reach or real Indian engagement.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {checkpoints.map(({ title, body }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Check {index + 1}</p>
              <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h3 className="text-lg font-black text-white">Want engagement from a relevant Indian audience?</h3>
            <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">
              For meaningful reach, prioritize India-relevant content, creator collaborations and
              location-targeted advertising. Track saves, conversations and customer actions alongside likes.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/blog/instagram-followers-vs-likes-india" className="underline underline-offset-4">Followers vs. likes guide</Link>
              <Link href="/buy-instagram-comments-india" className="underline underline-offset-4">Instagram comment packages</Link>
              <Link href="/buy-instagram-saves-india" className="underline underline-offset-4">Instagram save packages</Link>
              <Link href="/blog/instagram-followers-vs-engagement" className="underline underline-offset-4">Engagement explained</Link>
              <a href="https://transparency.meta.com/policies/community-standards/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Meta&apos;s platform standards</a>
            </div>
          </div>
          <div className="md:text-right">
            <a href="#packages" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
              Review your quantity and terms
            </a>
            <p className="mt-2 text-xs leading-5 text-[#C8CAD0]">No payment is taken on this guide.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
