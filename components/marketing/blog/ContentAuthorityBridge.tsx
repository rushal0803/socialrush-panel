import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { getPlatformAuthorityTargets } from "@/lib/seo/authority-graph";
import type { ContentPlatform } from "@/lib/seo/content-clusters";

type Props = { platform?: string | null; articleSlug: string };

function toPlatform(value?: string | null): ContentPlatform | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return ["instagram", "youtube", "linkedin", "twitter", "facebook", "tiktok", "telegram"].includes(normalized)
    ? (normalized as ContentPlatform)
    : null;
}

export default function ContentAuthorityBridge({ platform, articleSlug }: Props) {
  const targets = getPlatformAuthorityTargets(toPlatform(platform)).slice(0, 3);

  return (
    <aside
      data-article-slug={articleSlug}
      aria-label="From guide to next step"
      className="mt-8 rounded-3xl border border-orange-400/25 bg-gradient-to-br from-orange-500/10 via-[#0E121B] to-[#0E121B] p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-orange-200">
        <BookOpen className="h-4 w-4" />
        From research to action
      </div>
      <h2 className="mt-3 text-2xl font-black text-white">Choose the next step that matches your intent</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
        Keep research links clean and crawlable: move through the relevant growth hub, canonical service page, pricing guide or calculator without tracking-query duplicates.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {targets.map((target) => (
          <Link
            key={target.href}
            href={target.href}
            className="group rounded-2xl border border-white/10 bg-white/[.04] p-5 transition hover:-translate-y-1 hover:border-orange-400/50"
          >
            <BookOpen className="h-5 w-5 text-orange-300" />
            <h3 className="mt-3 font-black text-white">{target.label}</h3>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">
              Continue <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
