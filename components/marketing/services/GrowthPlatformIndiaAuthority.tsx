import Link from "next/link";
import { ArrowRight, BarChart3, IndianRupee, Layers3, ShieldCheck } from "lucide-react";
import { growthPlatformDecisionPoints } from "@/lib/seo/growth-platform-intent";

const icons = {
  platform: Layers3,
  pricing: IndianRupee,
  safety: ShieldCheck,
  tracking: BarChart3,
} as const;

export default function GrowthPlatformIndiaAuthority() {
  return (
    <section aria-labelledby="growth-platform-india" className="border-y border-white/10 bg-[#0b0d12] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">SocialRUSH growth platform</p>
        <h2 id="growth-platform-india" className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          Compare social media growth services in India from one platform
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Explore Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X services with current INR pricing, public-link ordering and clear campaign tracking. Choose the service that matches your goal; final availability and checkout details remain authoritative.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {growthPlatformDecisionPoints.map((item) => {
            const Icon = icons[item.id];
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <Icon className="h-5 w-5 text-orange-300" />
                <h3 className="mt-4 text-sm font-black">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{item.copy}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/pricing" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-400">
            Compare pricing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/social-media-growth-india" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-black text-white transition hover:border-orange-400/40">
            Growth guide <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/for-agencies" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-black text-white transition hover:border-orange-400/40">
            Agency workflows <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/trust" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-black text-white transition hover:border-orange-400/40">
            Trust & ordering safety <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
