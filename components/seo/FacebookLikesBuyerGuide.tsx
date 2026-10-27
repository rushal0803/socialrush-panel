import Link from "next/link";

/**
 * Server-rendered guidance for the canonical Facebook Likes purchase-intent page.
 * Static copy must not invent account origin, retention, conversion or reach.
 */
export default function FacebookLikesBuyerGuide() {
  const decisions = [
    {
      heading: "Post likes are not page likes or Group members",
      detail: "Facebook post Likes apply to an eligible post or video. Facebook Page Likes, Page followers and Group members use different destinations and service types. Choose the correct action before paying.",
    },
    {
      heading: "Copy the exact eligible public post link",
      detail: "Open the Facebook post or video you want to use, copy its link, and check that it is publicly accessible. Submit that post URL rather than a personal profile, Page homepage or Facebook Group link. Keep its visibility unchanged during the order.",
    },
    {
      heading: "Compare quantity, INR total and current service terms",
      detail: "The total depends on your selected quantity and the active catalog rate; the order builder calculates the amount before checkout. Confirm minimum and maximum quantities, delivery expectations and any refill or support terms. These details can vary with the active service.",
    },
    {
      heading: "Understand what Likes do not guarantee",
      detail: "Buying Facebook Likes does not guarantee real conversations, follower growth, customers, Indian-origin users, improved reach, retention or sales. Inauthentic engagement can violate Meta platform policies and may be removed; use relevant posts and authentic audience interactions for sustainable growth.",
    },
  ] as const;
  return (
    <section aria-labelledby="facebook-likes-buyer-guide" className="border-y border-white/10 bg-[#10141d] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook Likes India · Buying checklist</p>
        <h2 id="facebook-likes-buyer-guide" className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Buy Facebook Likes in India: choose the right post and understand the service
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Before comparing Facebook Likes packages, confirm whether you need reactions on one public post,
          followers for a Facebook Page, or members for a Facebook Group. These are distinct services.
          The exact order link and current terms matter more than the visible Like count alone.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {decisions.map(({ heading, detail }, index) => (
            <article key={heading} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Check {index + 1}</p>
              <h3 className="mt-3 text-lg font-black">{heading}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">Other Facebook growth options</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Want Page followers or Facebook Group membership instead of post Likes? Compare the correct
              service and review its link requirements. For genuine engagement, publish posts that invite
              relevant responses and participate in existing community conversations.
            </p>
            <div className="mt-3 flex flex-wrap gap-5 text-sm font-semibold text-orange-200">
              <Link href="/buy-facebook-followers-india" className="underline underline-offset-4">Facebook Page followers</Link>
              <Link href="/buy-facebook-group-members-india" className="underline underline-offset-4">Facebook Group members</Link>
              <Link href="/facebook-views" className="underline underline-offset-4">Facebook video views</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Review Likes order
          </a>
        </div>
      </div>
    </section>
  );
}
