import Link from "next/link";
import { getServiceById } from "@/lib/smm-service-catalog";

/**
 * Server-rendered buyer information for the single canonical Instagram Saves page.
 * The live service record and protected checkout remain authoritative.
 */
export default function InstagramSavesBuyerGuide() {
  const catalog = getServiceById("instagram-saves");
  const decisions = [
    {
      title: "Check the destination before you order",
      detail: "Use the exact public Instagram post (/p/...) or Reel (/reel/...) URL. A profile link, Story or inaccessible private post is not a supported saves destination. Keep the content public during processing.",
    },
    {
      title: "Compare live INR pricing and allowed quantities",
      detail: "The live order builder shows the active rate and available minimum and maximum. Catalog examples and static prices can become outdated; the final quantity, price and availability must be confirmed before checkout.",
    },
    {
      title: "Read delivery and refill conditions",
      detail: "Delivery time and refill eligibility depend on the currently active service. Do not assume an instant start, lifetime retention or a refill guarantee. Review the displayed terms and keep your order ID for support.",
    },
    {
      title: "Understand what a purchased save means",
      detail: "A save is a bookmarking action, not a follower, a like, a visit or a purchase. Buying saves does not guarantee Indian users, a relevant audience, organic reach, recommendations, leads or sales. Artificial engagement may be removed and may violate Instagram rules.",
    },
  ] as const;
  return (
    <section aria-labelledby="saves-buyer-guide-heading" className="border-y border-white/10 bg-[#10131b] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.14em] text-orange-300">Instagram Saves buying guide</p>
        <h2 id="saves-buyer-guide-heading" className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Buy Instagram saves in India: what to check before paying
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          If you are comparing where to buy Instagram saves for a post or Reel, start with the correct
          public link and the current service conditions. The page supports orders from India in INR,
          but that does not mean the saves will come from Indian people or genuine fans of your content.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {decisions.map(({ title, detail }, index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-300">Check {index + 1}</p>
              <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-5 rounded-2xl border border-orange-400/20 bg-orange-400/[.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-lg font-black text-white">What quantity can you choose?</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {catalog
                ? `The public catalog reference currently lists ${catalog.minQuantity.toLocaleString("en-IN")} to ${catalog.maxQuantity.toLocaleString("en-IN")} saves. Live availability, limits and the final INR total may differ; confirm them in the order form.`
                : "Check the active service for available quantities, final INR pricing and applicable terms."}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              For saves from genuinely interested people, publish useful tips, checklists, tutorials or
              ideas worth bookmarking. Ask your audience to save valuable content without promising algorithmic outcomes.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-orange-200">
              <Link href="/instagram-likes" className="underline underline-offset-4">Compare Instagram likes</Link>
              <Link href="/buy-instagram-shares-india" className="underline underline-offset-4">Compare Instagram shares</Link>
              <Link href="/blog/instagram-followers-vs-engagement" className="underline underline-offset-4">Understand engagement</Link>
            </div>
          </div>
          <a href="#order" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Review live saves packages
          </a>
        </div>
      </div>
    </section>
  );
}
