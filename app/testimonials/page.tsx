import PublicShell from "@/components/marketing/PublicShell";
import PageHero from "@/components/marketing/PageHero";
import { testimonials } from "@/lib/marketing/content";

export default function TestimonialsPage() {
  return <PublicShell><PageHero eyebrow="Client perspectives" title="Partnerships built on clarity and useful work." description="Feedback reflecting the qualities clients value in strategy, delivery, communication, and collaboration."/><section className="px-5 py-20 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">{testimonials.map(([quote,name,role],index) => <figure key={name} className={`rounded-3xl border p-7 ${index === 0 ? "border-blue-600 bg-blue-600 text-white md:col-span-2" : "border-slate-200 bg-white"}`}><div className={index === 0 ? "text-blue-200" : "text-amber-500"}>★★★★★</div><blockquote className={`mt-5 text-base leading-8 ${index === 0 ? "text-blue-50" : "text-slate-600"}`}>“{quote}”</blockquote><figcaption className={`mt-6 border-t pt-5 ${index === 0 ? "border-white/20" : "border-slate-100"}`}><p className="text-sm font-bold">{name}</p><p className={`mt-1 text-xs ${index === 0 ? "text-blue-200" : "text-slate-400"}`}>{role}</p></figcaption></figure>)}</div></section></PublicShell>;
}
