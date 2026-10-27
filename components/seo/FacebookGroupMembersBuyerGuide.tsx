import Link from "next/link";

/**
 * Indexable buyer guidance for the canonical Facebook Group Members landing page.
 * Live service facts, checkout validation and eligibility remain authoritative.
 */
export default function FacebookGroupMembersBuyerGuide() {
  const checks = [
    {
      title: "Submit a Facebook Group, not a Page",
      detail: "Use the exact facebook.com/groups/... address for the community receiving the order. Profile links, business Pages and individual post URLs are different destinations and are not valid for this service.",
    },
    {
      title: "Verify access and administrator settings",
      detail: "Group visibility and admission rules matter. A private group is not automatically eligible: verify the active service requirements and whether the group is accessible before ordering. Admin approvals, entry questions and privacy changes can affect fulfillment.",
    },
    {
      title: "Compare live INR pricing and support",
      detail: "Check that the active group-members service is available, then review its permitted quantity, calculated INR total, estimated delivery and refill or support terms. The public catalog has placeholder quantity limits and does not establish a fixed price or guarantee a refill.",
    },
    {
      title: "Set realistic member-quality expectations",
      detail: "INR pricing for India does not mean every member is based in India or interested in your topic. Group members are not the same as followers of a Facebook Page. Membership totals do not guarantee active discussions, lasting members, local leads or sales.",
    },
  ] as const;

  return (
    <section aria-labelledby="facebook-group-members-guide-heading" className="border-y border-white/10 bg-[#101623] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook Group Members · India buyer guide</p>
        <h2 id="facebook-group-members-guide-heading" className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          Buy Facebook Group members in India: check the group link, access and live terms
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Before comparing Facebook Group member packages, make sure the destination is a real Facebook Group,
          the group can accept members under its current rules, and the service terms match your needs.
          An increased member count is not a substitute for an active community.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, detail }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Before checkout · {index + 1}</p>
              <h3 className="mt-3 text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">Group size and community participation are different</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Meta may limit or remove inauthentic engagement. Member retention, recommendations and reach
              are controlled by the platform and by participants, not an order provider. Sustainable group
              growth depends on clear community rules, useful posts, thoughtful moderation and voluntary participation.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/buy-facebook-followers-india" className="underline underline-offset-4">Facebook followers vs group members</Link>
              <Link href="/facebook-growth-india" className="underline underline-offset-4">Facebook community growth guide</Link>
              <Link href="/facebook-likes" className="underline underline-offset-4">Compare Facebook likes</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Check current packages
          </a>
        </div>
      </div>
    </section>
  );
}
