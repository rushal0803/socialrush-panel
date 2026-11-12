import Link from "next/link";
import { batch4CatalogGuides } from "@/lib/seo/service-batch4-content";

export default function CatalogBuyerGuide({ platform }: { platform: keyof typeof batch4CatalogGuides }) {
  const guide = batch4CatalogGuides[platform];
  return <section data-catalog-buyer-guide className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <h2 className="text-2xl font-black text-white">{guide.heading}</h2>
    <div className="mt-6 grid gap-4 md:grid-cols-2">{guide.checks.map(([heading, text]) => <article key={heading} className="rounded-2xl border border-white/10 bg-[#0d1118] p-6"><h3 className="font-bold text-white">{heading}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{text}</p></article>)}</div>
    <nav aria-label="Compare service requirements" className="mt-6 flex flex-wrap gap-4">{guide.links.map(([href, label]) => <Link key={href} href={href} className="text-sm font-bold text-orange-300 underline underline-offset-4">{label}</Link>)}</nav>
  </section>;
}
