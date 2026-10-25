import Link from "next/link";
import { calculateServiceTotal } from "@/lib/service-pricing";

const exampleQuantities = [100, 1000, 5000] as const;
const money = (value: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
}).format(value);

/**
 * Buyer-first information for the canonical Instagram followers India page.
 * Estimates use the shared catalog rate; authenticated checkout checks the live service row.
 */
export default function InstagramFollowersIndiaBuyingGuide() {
  return (
    <section aria-labelledby="instagram-followers-buying-guide" className="border-y border-white/10 bg-[#101014] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Instagram follower buying guide</p>
        <h2 id="instagram-followers-buying-guide" className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          Before you buy Instagram followers in India, compare the total and the terms.
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D1D5DB] sm:text-base">
          A follower package is not the same as an Instagram advertising campaign. Compare the number of followers,
          current order price, account requirements, delivery estimate and support policy before deciding.
          The Instagram Real Followers label names this service; it does not guarantee a follower&apos;s authenticity,
          location, engagement or continued presence.
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <h3 className="text-lg font-bold">Check the actual quantity and INR total</h3>
            <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
              The minimum listed quantity is 100 followers. These examples use the current public catalog rate of
              { " " }{money(calculateServiceTotal("instagram-followers", 1000))} per 1,000 followers.
              Confirm the live rate and exact total again during order review.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Illustrative Instagram follower package prices</caption>
                <thead className="bg-white/[.06] text-[#E5E7EB]"><tr><th scope="col" className="px-3 py-2 font-semibold">Followers</th><th scope="col" className="px-3 py-2 text-right font-semibold">Catalog estimate</th></tr></thead>
                <tbody>{exampleQuantities.map(quantity => (
                  <tr key={quantity} className="border-t border-white/10">
                    <th scope="row" className="px-3 py-2 font-medium">{quantity.toLocaleString("en-IN")}</th>
                    <td className="px-3 py-2 text-right tabular-nums">{money(calculateServiceTotal("instagram-followers", quantity))}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#B9BDC7]">Illustrative catalog estimates, not a checkout quote. The active service row controls final order pricing.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <h3 className="text-lg font-bold">India billing does not mean Indian followers</h3>
            <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
              This page serves customers ordering in INR. It does not promise that delivered followers are from
              India or are relevant to your niche. If your goal is a genuine Indian audience, prioritize
              region-relevant content, creator collaborations or targeted advertising instead.
            </p>
            <Link href="/blog/instagram-followers-vs-engagement" className="mt-4 inline-block text-sm font-bold text-orange-200 underline underline-offset-4">
              Understand followers versus engagement
            </Link>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <h3 className="text-lg font-bold">Understand drops and platform risks</h3>
            <p className="mt-3 text-sm leading-7 text-[#D1D5DB]">
              This specific service has no refill support. Followers can disappear after delivery,
              and buying inauthentic engagement can conflict with Instagram&apos;s rules.
              No follower package guarantees reach, likes, leads or sales.
            </p>
            <Link href="/blog/instagram-followers-price-in-india" className="mt-4 inline-block text-sm font-bold text-orange-200 underline underline-offset-4">
              Read the follower price guide
            </Link>
          </article>
        </div>
        <div className="mt-7 flex flex-col items-start gap-4 rounded-2xl border border-orange-400/25 bg-orange-500/[.07] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-7 text-[#F3F4F6]">
            <strong>Before checkout:</strong> Use a public Instagram profile link, never share your password or OTP,
            and review the live price, delivery information and no-refill policy.
          </p>
          <a href="#packages" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 px-5 text-sm font-black text-[#201309] hover:bg-orange-300">
            Compare your order
          </a>
        </div>
      </div>
    </section>
  );
}
