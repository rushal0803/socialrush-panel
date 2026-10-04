import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentPlatform } from "@/lib/seo/content-clusters";
import { getMoneyPageAuthorityTargets } from "@/lib/seo/authority-graph";

const copy: Record<ContentPlatform, { eyebrow: string; title: string; intro: string }> = {
  instagram: {
    eyebrow: "Instagram topic cluster",
    title: "Explore related Instagram growth services",
    intro: "Move between the Instagram growth hub, canonical service pages and supporting guides without creating duplicate search paths.",
  },
  youtube: {
    eyebrow: "YouTube topic cluster",
    title: "Explore related YouTube growth services",
    intro: "Compare canonical YouTube service pages and supporting guides from one connected authority cluster.",
  },
  facebook: {
    eyebrow: "Facebook topic cluster",
    title: "Explore related Facebook growth services",
    intro: "Compare canonical audience, engagement, visibility and community-growth pages from one Facebook cluster.",
  },
  linkedin: {
    eyebrow: "LinkedIn topic cluster",
    title: "Explore related LinkedIn growth services",
    intro: "Move between the LinkedIn growth hub, canonical service pages and supporting research without splitting search intent.",
  },
  tiktok: {
    eyebrow: "TikTok topic cluster",
    title: "Explore related TikTok growth resources",
    intro: "Keep TikTok authority concentrated on the indexed growth hub, follower money page and supporting guides.",
  },
  twitter: {
    eyebrow: "Twitter / X topic cluster",
    title: "Explore related Twitter / X growth services",
    intro: "Compare the canonical follower, engagement and crypto service pages without linking through legacy aliases.",
  },
  telegram: {
    eyebrow: "Telegram topic cluster",
    title: "Explore related Telegram growth services",
    intro: "Connect the Telegram service hub with canonical member, view, reaction and poll-vote pages plus supporting guidance.",
  },
};

export default function MoneyPageAuthorityLinks({ platform }: { platform: ContentPlatform }) {
  const group = copy[platform];
  const targets = getMoneyPageAuthorityTargets(platform);

  return (
    <section className="border-y border-white/10 bg-[#0d0f13] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">{group.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-black sm:text-3xl">{group.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{group.intro}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {targets.map((target) => (
            <Link
              key={target.href}
              href={target.href}
              data-authority-kind={target.kind}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm font-bold transition hover:border-orange-400/40 hover:bg-white/[.06]"
            >
              <span>{target.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-orange-300 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
