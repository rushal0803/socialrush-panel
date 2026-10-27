import Link from "next/link";

/** Original indexable buyer guidance; live catalog facts stay authoritative. */
export default function FacebookGroupMembersBuyerGuide() {
  const checks = [
    {
      title: "Use a Group link, not a Page or profile",
      body: "Open your actual Facebook Group and copy its facebook.com/groups/... URL. Facebook Pages, profiles, individual posts and unrelated invitations are not group destinations. Check the link from a browser before placing an order.",
    },
    {
      title: "Check visibility and membership approval",
      body: "A group can have public or private settings and admin controls. Hidden, restricted, or approval-only groups might not be eligible for delivery. Admin questions and approval settings can prevent someone from joining even if a group link is valid.",
    },
    {
      title: "Compare live INR pricing and support terms",
      body: "The public catalog does not provide a reliable fixed group-member rate or quantity range. Check current availability, minimum and maximum quantity, calculated INR total, delivery estimate and refill/support policy in the live order builder.",
    },
    {
      title: "Separate member count from genuine community activity",
      body: "Membership quantity cannot promise Indian or local members, real discussions, retention, recommendations, sales or meaningful participation. Platform enforcement and admin actions can also change member counts; avoid misrepresenting the audience.",
    },
  ] as const;
  return (
    <section aria-labelledby="facebook-group-members-guide" className="border-y border-white/10 bg-[#101520] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook Groups India · Buyer decisions</p>
        <h2 id="facebook-group-members-guide" className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Buy Facebook Group Members in India: links, approval settings and pricing
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Facebook Group members are different from Facebook Page followers. Before ordering, check whether the
          exact Group URL is eligible for the active service and whether your admin settings allow new members.
          A visible member count is not a measure of community trust.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, body }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Decision {index + 1}</p>
              <h3 className="mt-3 text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black">A better Group growth plan starts with useful conversations</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Make group rules clear, welcome relevant people, publish useful questions, moderate spam and
              reply to genuine members. Artificial or deceptive engagement may breach Meta rules and can be removed.
              For privacy, never change a Group from private to public solely to place an order without considering existing members.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-orange-200">
              <a href="https://about.fb.com/news/2025/11/facebook-update-group-admins-flexibility-protecting-member-privacy/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Meta: Group privacy and membership</a>
              <Link href="/buy-facebook-followers-india" className="underline underline-offset-4">Facebook Page followers</Link>
              <Link href="/facebook-growth-india" className="underline underline-offset-4">Facebook growth advice</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Check live group packages
          </a>
        </div>
      </div>
    </section>
  );
}
