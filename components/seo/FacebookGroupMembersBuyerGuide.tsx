import Link from "next/link";

/**
 * Server-rendered decisions for the canonical Facebook Group Members page.
 * Keep prices and service eligibility with live catalog/order validation.
 */
export default function FacebookGroupMembersBuyerGuide() {
  const decisions = [
    {
      heading: "Use a Group link, not a Page or profile",
      body: "Open the Facebook Group itself and copy its exact facebook.com/groups/... address. A Facebook Page, personal profile, post or event link is a different destination and is not valid for this service.",
    },
    {
      heading: "Check whether the Group is accessible",
      body: "Public and private groups have different access controls. An approval-only or hidden group may not be supported by the currently active service. Check its instructions before checkout and avoid changing the privacy settings while an order is processing.",
    },
    {
      heading: "Group admins keep control of membership",
      body: "Admins can approve or reject requests, set group questions, moderate members and remove accounts. Facebook can also restrict activity. Group membership and retention are never assured by the order alone.",
    },
    {
      heading: "Compare the live total and current terms",
      body: "The public catalog has placeholder quantity limits for this service. Confirm current availability, permitted member quantity, calculated INR price, delivery estimate and refill or support terms in the live order builder before paying.",
    },
  ] as const;

  return (
    <section aria-labelledby="facebook-group-members-buyer-heading" className="border-y border-white/10 bg-[#101723] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook Group Members · India buyer guide</p>
        <h2 id="facebook-group-members-buyer-heading" className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          Buy Facebook Group members in India: eligibility, privacy and live pricing
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          A Facebook Group is a member community, not a Facebook Page follower count. Before choosing
          a Facebook Group members package, confirm where members would join, who manages approvals,
          and what the active service actually supports. A larger member count is not evidence of
          authentic discussion or a loyal audience.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {decisions.map(({heading,body},i) => (
            <article key={heading} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Check {i + 1}</p>
              <h3 className="mt-3 text-lg font-black">{heading}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-300/20 bg-orange-300/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">What buying group members cannot promise</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              INR pricing does not mean India-only accounts or local audience targeting.
              Group members may leave or be removed, and neither group activity nor sales are guaranteed.
              Artificial engagement may also conflict with Facebook platform rules. To build a useful community,
              welcome new people, share relevant discussions, enforce clear rules and answer genuine member questions.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-orange-200">
              <Link href="/buy-facebook-followers-india" className="underline underline-offset-4">Compare Facebook followers</Link>
              <Link href="/facebook-likes" className="underline underline-offset-4">Compare Facebook likes</Link>
              <Link href="/facebook-growth-india" className="underline underline-offset-4">Facebook growth resources</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">Review live Group service</a>
        </div>
      </div>
    </section>
  );
}
