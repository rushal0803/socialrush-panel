import Link from "next/link";

export type PriorityServiceGuide =
  | "instagram-comments"
  | "instagram-saves"
  | "instagram-shares"
  | "youtube-comments"
  | "youtube-watch-hours"
  | "facebook-group-members";

type Guide = {
  heading: string;
  introduction: string;
  checks: readonly { label: string; detail: string }[];
  related: readonly { label: string; href: string }[];
};

const guides: Record<PriorityServiceGuide, Guide> = {
  "instagram-comments": {
    heading: "Instagram comments: what to check before ordering",
    introduction: "Comments add visible discussion to a post or Reel. They are different from likes or saves and do not guarantee genuine conversations, reach or new followers.",
    checks: [
      { label: "Use the right link", detail: "Submit the exact public Instagram post or Reel URL, not a profile link. Keep the content accessible during delivery." },
      { label: "Compare live terms", detail: "Confirm the permitted comment quantity, INR total, delivery estimate and any applicable support terms before payment." },
      { label: "Understand the limits", detail: "Comment visibility is controlled by Instagram and can change with moderation or platform activity. A higher comment count does not guarantee distribution." },
    ],
    related: [
      { label: "Instagram likes", href: "/instagram-likes" },
      { label: "Instagram saves", href: "/buy-instagram-saves-india" },
    ],
  },
  "instagram-saves": {
    heading: "Instagram saves vs likes: choose the right activity",
    introduction: "A save is a bookmark action on a post or Reel; a like is a separate engagement count. Neither guarantees algorithmic recommendations or organic reach.",
    checks: [
      { label: "Eligible destination", detail: "Provide the public post or Reel URL. A private account or an inaccessible post may prevent delivery." },
      { label: "Choose an allowed quantity", detail: "Review the live minimum, maximum, INR price and estimated delivery before you confirm an order." },
      { label: "Set realistic expectations", detail: "Save counts are not the same as real audience interest, purchases or follower growth. Results depend on platform visibility." },
    ],
    related: [
      { label: "Instagram shares", href: "/buy-instagram-shares-india" },
      { label: "Instagram comments", href: "/buy-instagram-comments-india" },
    ],
  },
  "instagram-shares": {
    heading: "Instagram shares vs saves: what is different?",
    introduction: "A share is an action involving sending or sharing content, whereas a save bookmarks content. These are distinct metrics and do not promise viral distribution.",
    checks: [
      { label: "Public content required", detail: "Use the specific public post or Reel link, not your Instagram profile URL." },
      { label: "Review service availability", detail: "Check the current supported quantity, live INR total, delivery estimate and refill or support conditions in the order panel." },
      { label: "No reach guarantee", detail: "Share activity does not guarantee more impressions, recommendations, followers or sales. Continue improving your content independently." },
    ],
    related: [
      { label: "Instagram saves", href: "/buy-instagram-saves-india" },
      { label: "Instagram views", href: "/instagram-views" },
    ],
  },
  "youtube-comments": {
    heading: "YouTube comments: video URLs, Shorts and moderation",
    introduction: "Comments are attached to an individual public video or Short, not a channel. YouTube can moderate, hide or remove comments independently.",
    checks: [
      { label: "Submit one video link", detail: "Use a public youtube.com/watch, Shorts or youtu.be URL. A channel homepage is not a valid comments destination." },
      { label: "Compare order details", detail: "Check supported quantities, the calculated INR total, estimated delivery and support terms before checkout." },
      { label: "Consider moderation", detail: "Visibility and retention can change. Comment packages do not guarantee recommendations, subscribers or YouTube monetization." },
    ],
    related: [
      { label: "YouTube views", href: "/youtube-views" },
      { label: "YouTube watch hours", href: "/buy-youtube-watch-hours-india" },
    ],
  },
  "youtube-watch-hours": {
    heading: "Watch-time estimates are not monetization eligibility",
    introduction: "Estimated viewing hours are calculated from the quantity and assumed minutes watched. YouTube independently measures eligible public watch hours and decides Partner Program approval.",
    checks: [
      { label: "Use a public video", detail: "Provide the exact public YouTube video URL, rather than a channel link. Keep it accessible while an order is processing." },
      { label: "Check the calculation", detail: "Review the estimated duration, view quantity, live INR total and service limits. An estimate is not a guaranteed YouTube Analytics figure." },
      { label: "Know the distinction", detail: "Purchased or promotional watch time must not be assumed to count toward the YouTube Partner Program. Monetization is never guaranteed." },
    ],
    related: [
      { label: "YouTube views", href: "/youtube-views" },
      { label: "YouTube comments", href: "/buy-youtube-comments-india" },
    ],
  },
  "facebook-group-members": {
    heading: "Facebook Group members: link and access requirements",
    introduction: "A Facebook Group is different from a Facebook Page. Member count alone does not indicate active participation, discussions or community quality.",
    checks: [
      { label: "Send the group URL", detail: "Use the exact accessible facebook.com/groups/... address, not a Facebook Page, profile or post link." },
      { label: "Keep access consistent", detail: "Check the current public or accessible group requirements and avoid changing privacy settings while delivery is active." },
      { label: "Compare current terms", detail: "Review the permitted quantity, live INR rate, delivery estimate and refill or support policy. Group engagement is not guaranteed." },
    ],
    related: [
      { label: "Facebook followers", href: "/buy-facebook-followers-india" },
      { label: "Facebook growth hub", href: "/facebook-growth-india" },
    ],
  },
};

export default function ServiceSearchDecisionGuide({ service }: { service: PriorityServiceGuide }) {
  const guide = guides[service];
  const headingId = "search-decision-guide-" + service;
  return (
    <section aria-labelledby={headingId} className="bg-[#10151e] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-orange-300">Before you order</p>
        <h2 id={headingId} className="mt-3 max-w-4xl text-2xl font-black tracking-tight sm:text-3xl">{guide.heading}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{guide.introduction}</p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {guide.checks.map((check) => (
            <article key={check.label} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <h3 className="text-base font-bold text-white">{check.label}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{check.detail}</p>
            </article>
          ))}
        </div>
        <nav aria-label="Related service comparisons" className="mt-7 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">Compare related services:</span>
          {guide.related.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center rounded-xl border border-orange-300/30 px-4 text-sm font-semibold text-orange-200 underline-offset-4 hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
