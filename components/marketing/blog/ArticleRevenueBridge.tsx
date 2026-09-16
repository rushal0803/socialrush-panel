import TrackedLink from "@/components/analytics/TrackedLink";
import type { ContentCluster } from "@/lib/seo/content-clusters";

type Props = {
  articleSlug: string;
  cluster: ContentCluster | null;
};

export default function ArticleRevenueBridge({ articleSlug, cluster }: Props) {
  if (!cluster) return null;

  const primary = cluster.serviceLinks.slice(0, 3);

  return (
    <section className="mt-8 rounded-[30px] border border-orange-400/20 bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,.14),transparent_38%),#0E121B] p-6 shadow-[0_18px_40px_rgba(0,0,0,.22)] sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">From research to action</p>
      <h2 className="mt-2 text-2xl font-black text-white">Compare the relevant {cluster.label} options before ordering</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
        If this guide matches your campaign goal, review the current service page for live quantity, pricing, delivery and support information. Larger or multi-service requirements can use packages or campaign planning instead.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {primary.map((item, index) => (
          <TrackedLink
            key={item.href}
            href={item.href}
            event="blog_service_cta_clicked"
            metadata={{ article_slug: articleSlug, destination: item.href, surface: "article_revenue_bridge", position: index + 1 }}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-orange-400/50"
          >
            <span className="text-xs font-black text-orange-200">{index === 0 ? "Primary service" : "Related service"}</span>
            <span className="mt-2 block text-sm font-extrabold leading-6 text-white">{item.label}</span>
            <span className="mt-3 block text-xs font-bold text-orange-300">Review current service →</span>
          </TrackedLink>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <TrackedLink href="/packages" event="blog_service_cta_clicked" metadata={{ article_slug: articleSlug, destination: "/packages", surface: "article_revenue_bridge" }} className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-sm font-bold text-white transition hover:border-orange-400/60">Compare larger packages</TrackedLink>
        <TrackedLink href="/for-agencies#bulk-lead-engine" event="blog_service_cta_clicked" metadata={{ article_slug: articleSlug, destination: "/for-agencies#bulk-lead-engine", surface: "article_revenue_bridge" }} className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-sm font-bold text-white transition hover:border-orange-400/60">Agency / recurring requirement</TrackedLink>
        <TrackedLink href={cluster.hubPath} event="blog_service_cta_clicked" metadata={{ article_slug: articleSlug, destination: cluster.hubPath, surface: "article_revenue_bridge" }} className="inline-flex min-h-11 items-center rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-2.5 text-sm font-bold text-orange-100 transition hover:border-orange-400/60">Explore {cluster.hubLabel}</TrackedLink>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-slate-500">Service availability, pricing, delivery estimates and refill/support terms are confirmed on the active service flow. This guide does not promise platform performance.</p>
    </section>
  );
}
