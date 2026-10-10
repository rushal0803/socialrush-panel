import Link from "next/link";
import { ArrowRight, MessageSquareQuote, Star } from "lucide-react";
import { getPublicReviews } from "@/lib/reviews/public";

export default async function PublicReviewsSection({ limit = 3 }: { limit?: number }) {
  const reviews = await getPublicReviews(limit);

  return (
    <section className="border-y border-white/10 bg-[#0C0E14] px-4 py-14 text-[#F8FAFC] sm:px-6 sm:py-16 lg:px-8" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-7">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-[#FF9A2E]">Customer feedback, with permission</p>
            <h2 id="reviews-heading" className="mt-3 text-3xl font-bold tracking-[-.04em] text-white sm:text-4xl">Reviews from completed orders</h2>
            <p className="mt-3 text-base leading-7 text-[#C4CBD5]">Feedback appears here only after customer permission and moderation. Reviews reflect individual experiences, not guaranteed results.</p>
          </div>
          {limit <= 3 && <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-[#FF9A2E] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF7600]">See all reviews <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
        </div>
        {reviews.length === 0 ? (
          <div className="mt-7 flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-[#101219] px-6 py-8 sm:p-9">
            <MessageSquareQuote className="h-7 w-7 text-[#FF9A2E]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-white">No published customer reviews yet</h3>
            <p className="max-w-xl text-sm leading-7 text-[#C4CBD5]">Reviews are displayed only when an eligible customer chooses to share feedback and the submission is approved for publication.</p>
            <Link href="/dashboard/reviews" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#FF7600]/40 px-4 py-2 text-sm font-bold text-[#FF9A2E] hover:bg-[#FF7600]/10">Your reviews <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        ) : (
          <ul className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#101219] p-5 shadow-[0_14px_32px_-26px_rgba(0,0,0,.7)] transition-colors hover:border-[#FF7600]/40 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-0.5 text-[#FF9A2E]" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-white/15"}`} aria-hidden="true" />)}
                    </div>
                    <span className="text-xs font-semibold text-[#A8AFBD]">Completed order</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold leading-7 text-white">{review.title}</h3>
                  <p className="mt-3 flex-1 whitespace-pre-line break-words text-sm leading-7 text-[#D1D5DB]">{review.message}</p>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-[#FF9A2E]">{review.display_name}</p>
                    {(review.platform || review.service_name) && <p className="mt-1 text-xs leading-5 text-[#A8AFBD]">{[review.platform, review.service_name].filter(Boolean).join(" · ")}</p>}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
