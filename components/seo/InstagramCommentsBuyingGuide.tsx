import Link from "next/link";
import { getServiceById } from "@/lib/smm-service-catalog";

/**
 * Intent-specific, buyer-first content for the single canonical Instagram Comments URL.
 * Catalog facts are explanatory only; checkout validates the live service and final total.
 */
export default function InstagramCommentsBuyingGuide() {
  const catalog = getServiceById("instagram-comments");
  const quantity = catalog?.minQuantity ?? 100;
  const maxQuantity = catalog?.maxQuantity ?? 10000;
  const rate = catalog?.pricePer1000;
  const checks = [
    {
      title: "Use the public post or Reel link",
      detail: "Provide the exact public Instagram post or Reel URL, not a profile, Story or private link. Keep the submitted content public during delivery; no account password, OTP or recovery code is needed.",
    },
    {
      title: "Confirm quantity and price before payment",
      detail: "The current catalog supports whole-number quantities within its limits. A displayed catalog price is not a confirmed live quote. The existing checkout validates availability, quantity, service pricing and your final INR total.",
    },
    {
      title: "Check delivery and refill conditions",
      detail: "The catalog lists an indicative 1–24 hour delivery period and no refill for this service. Actual delivery can vary. A completed comments order does not include a promise that every comment remains visible indefinitely.",
    },
    {
      title: "Do not assume Indian or custom commenters",
      detail: "India billing means customers can compare INR pricing; it does not guarantee that comments come from Indian accounts, use a chosen language, match your niche or contain user-supplied wording. Do not assume custom comments are included unless the active service explicitly says so.",
    },
  ] as const;

  return (
    <section aria-labelledby="instagram-comments-guide-title" className="border-y border-white/10 bg-[#10131b] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Instagram comment packages explained</p>
        <h2 id="instagram-comments-guide-title" className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          Before you buy Instagram comments in India: price, links and expectations
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D1D5DB] sm:text-base">
          Comparing where to buy Instagram comments for a post or Reel? Look beyond the displayed comment count.
          Confirm the exact destination, quantity limits, order terms and platform risks before deciding whether
          this service supports your goal. Comments alone do not guarantee organic reach, genuine discussions, customers or sales.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {checks.map(({ title, detail }, i) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-widest text-orange-300">Check {i + 1}</p>
              <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-4 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h3 className="text-lg font-black text-white">Understand the catalog before choosing a package</h3>
            <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">
              {catalog && rate
                ? `Current catalog reference: ₹${rate.toLocaleString("en-IN")} per 1,000 comments; minimum ${quantity.toLocaleString("en-IN")}, maximum ${maxQuantity.toLocaleString("en-IN")}. Live checkout remains authoritative.`
                : "Live service availability and final pricing must be checked in the order builder before payment."}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#D1D5DB]">
              Instagram may restrict or remove artificial engagement under its rules. For meaningful engagement,
              prioritize useful posts, relevant questions and conversations with your audience.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/instagram-likes" className="underline underline-offset-4">Compare Instagram likes</Link>
              <Link href="/instagram-views" className="underline underline-offset-4">Compare Reel views</Link>
              <Link href="/buy-instagram-saves-india" className="underline underline-offset-4">Instagram save packages</Link>
              <Link href="/buy-instagram-shares-india" className="underline underline-offset-4">Instagram share packages</Link>
              <Link href="/blog/instagram-followers-vs-engagement" className="underline underline-offset-4">Understand engagement</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Check live order details
          </a>
        </div>
      </div>
    </section>
  );
}
