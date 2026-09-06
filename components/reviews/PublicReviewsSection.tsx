import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { getPublicReviews } from "@/lib/reviews/public";

export default async function PublicReviewsSection({ limit = 3 }: { limit?: number }) {
  const reviews = await getPublicReviews(limit);
  if (!reviews.length) return null;

  return (
    <section className="border-y border-white/[.07] bg-[#0A0C11] px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Permissioned customer feedback</p>
            <h2 id="reviews-heading" className="mt-3 text-3xl font-black tracking-[-.04em] text-white sm:text-4xl">Reviews from completed orders</h2>
            <p className="mt-3 text-sm leading-6 text-[#A8AFBD]">Submitted for completed orders, then published only with customer permission and after moderation.</p>
          </div>
          <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-orange-200 transition hover:text-orange-100 focus-visible:rounded-lg">
            View all reviews <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#101219] p-5 shadow-[0_18px_42px_-34px_rgba(0,0,0,.95)] transition hover:border-orange-400/35 sm:p-6">
                <div className="flex items-center gap-0.5 text-amber-300" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? "fill-current" : "text-white/15"}`} aria-hidden="true" />)}
                </div>
                <h3 className="mt-4 text-base font-black text-white">{review.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{review.message}</p>
                <div className="mt-auto border-t border-white/[.08] pt-4">
                  <p className="text-xs font-bold text-orange-200">{review.display_name} <span aria-hidden="true">&middot;</span> Completed-order review</p>
                  {(review.platform || review.service_name) && <p className="mt-1 text-xs text-slate-500">{[review.platform, review.service_name].filter(Boolean).join(" \u00b7 ")}</p>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
