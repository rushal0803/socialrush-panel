import Link from "next/link";
import { getServiceById } from "@/lib/smm-service-catalog";

/**
 * Server-rendered buyer information for Instagram Shares.
 * Live catalog and checkout remain the source of truth for sellability and price.
 */
export default function InstagramSharesBuyerGuide() {
  const catalog = getServiceById("instagram-shares");
  const checks = [
    {
      title: "Paste the exact post or Reel URL",
      detail: "Use an accessible public instagram.com/p/... or instagram.com/reel/... link. Do not submit a profile URL, Story, private post or a different campaign link. Keep your chosen content public while delivery is active.",
    },
    {
      title: "Compare live price and quantity limits",
      detail: "The active order builder validates available whole-number quantities and calculates the INR estimate. Static examples are not a quote; final service availability, limits, fees and total must be checked before confirmation.",
    },
    {
      title: "Review delivery and no-refill terms",
      detail: "The public service catalog currently lists an indicative 1–24 hour delivery window and no refill. Live service details can change; confirm them at checkout. Do not assume instant delivery, lifetime retention or automatic replacements.",
    },
    {
      title: "Understand what shares do not guarantee",
      detail: "An added share count is not verified organic distribution, Indian viewers or actual messages sent to interested customers. Shares do not guarantee recommendation placement, followers, leads, sales, visibility to a particular country or viral reach.",
    },
  ] as const;

  return (
    <section aria-labelledby="instagram-shares-buyer-guide-heading" className="border-y border-white/10 bg-[#10131b] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.15em] text-orange-300">Instagram Shares buyer guide</p>
        <h2 id="instagram-shares-buyer-guide-heading" className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Buy Instagram shares in India: check links, price and delivery first
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          Wondering where to buy Instagram shares for a Reel or public post? Compare the current order terms rather
          than a marketing promise. SocialRUSH displays INR pricing for customers in India, but does not guarantee
          shares from Indian accounts or a relevant audience. This is different from naturally earned sharing.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, detail }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Check {index + 1}</p>
              <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black text-white">Check the live package before confirming</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {catalog
                ? `The public catalog currently lists ${catalog.minQuantity.toLocaleString("en-IN")}–${catalog.maxQuantity.toLocaleString("en-IN")} shares as reference limits. The active service and protected checkout determine your actual quantities, INR price and eligibility.`
                : "Use the active order builder for quantities, final pricing and availability."}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Artificial engagement can be removed and may violate Instagram rules. For sustainable sharing,
              publish useful Reels, relatable stories and practical content people want to send to friends.
              Organic distribution depends on genuine audience interest, not an order quantity.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/buy-instagram-saves-india" className="underline underline-offset-4">Instagram saves</Link>
              <Link href="/instagram-views" className="underline underline-offset-4">Instagram Reel views</Link>
              <Link href="/blog/instagram-followers-vs-engagement" className="underline underline-offset-4">Engagement explained</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Review live share packages
          </a>
        </div>
      </div>
    </section>
  );
}
