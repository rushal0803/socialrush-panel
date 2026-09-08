import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import {
  contentClusters,
  type ContentPlatform,
} from "@/lib/seo/content-clusters";

export default function PlatformAuthorityLinks({
  platform,
}: {
  platform: ContentPlatform;
}) {
  const cluster = contentClusters[platform];

  return (
    <section
      aria-labelledby={`${platform}-guides-heading`}
      className="my-12 border-y border-white/10 py-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
            Practical guidance
          </p>
          <h2
            id={`${platform}-guides-heading`}
            className="mt-2 text-2xl font-black sm:text-3xl"
          >
            Learn more about {cluster.label} growth
          </h2>
        </div>

        <Link href="/blog" className="text-sm font-bold text-orange-200">
          Browse all guides
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {cluster.guideLinks.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/45 hover:bg-white/[.06]"
          >
            <BookOpen className="h-5 w-5 text-orange-300" />
            <h3 className="mt-4 font-black leading-6">{guide.label}</h3>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-200">
              Read guide
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
