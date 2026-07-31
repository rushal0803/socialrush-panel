import Link from "next/link";
import { getPublicReviews } from "@/lib/reviews/public";

export default async function PublicReviewsSection({limit=3}:{limit?:number}) {
  const reviews=await getPublicReviews(limit); if(!reviews.length) return null;
  return <section className="px-4 py-16 sm:px-6"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-orange-400">Verified customers</p><h2 className="mt-2 text-3xl font-black text-white">Reviews from completed orders</h2></div><Link href="/reviews" className="text-sm font-bold text-orange-300">View all</Link></div><div className="mt-8 grid gap-4 md:grid-cols-3">{reviews.map(r=><article key={r.id} className="rounded-2xl border border-white/10 bg-[#101219] p-6 text-white"><p className="text-amber-300" aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}<span className="text-white/20">{"★".repeat(5-r.rating)}</span></p><h3 className="mt-4 font-black">{r.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{r.message}</p><p className="mt-5 text-xs font-bold text-orange-300">{r.display_name} · Verified purchase</p><p className="mt-1 text-xs text-slate-500">{[r.platform,r.service_name].filter(Boolean).join(" · ")}</p></article>)}</div></div></section>;
}
