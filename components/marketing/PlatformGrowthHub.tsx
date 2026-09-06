import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PublicShell from "@/components/marketing/PublicShell";
import type { ContentPlatform } from "@/lib/seo/content-clusters";
import { contentClusters } from "@/lib/seo/content-clusters";

const guidance: Record<ContentPlatform, readonly string[]> = {
  instagram: ["Make the profile promise clear.", "Use content that earns useful interaction.", "Review growth alongside reach and enquiries."],
  youtube: ["Match each video to a clear viewer need.", "Improve the opening and viewing experience.", "Review retention and audience feedback together."],
  linkedin: ["Clarify who the profile or page helps.", "Publish useful expertise consistently.", "Build conversations with a relevant audience."],
  twitter: ["Choose a clear topic and point of view.", "Write posts people can respond to or share.", "Review audience quality alongside follower growth."],
  facebook: ["Keep page details and contact paths accurate.", "Publish locally useful, easy-to-understand posts.", "Measure messages and enquiries as well as reactions."],
  tiktok: ["Make the first seconds clear and specific.", "Use formats that fit the intended audience.", "Review completion, comments and follows together."],
};

export default function PlatformGrowthHub({ platform }: { platform: ContentPlatform }) {
  const cluster = contentClusters[platform];
  return <PublicShell><main className="bg-[#050505] px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto max-w-6xl"><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">{cluster.label} resources</p><h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Build a clearer {cluster.label} growth plan.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Explore relevant services and practical guidance from one broad platform hub. Start with the outcome you want to improve, then use the right metric and next step.</p><div className="mt-10 grid gap-4 md:grid-cols-3">{cluster.serviceLinks.map((service) => <Link key={service.href} href={service.href} className="rounded-2xl border border-white/10 bg-white/[.04] p-5 transition hover:border-orange-400/40"><h2 className="font-black">{service.label}</h2><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-200">Explore service <ArrowRight className="h-4 w-4" /></span></Link>)}</div><section className="mt-12 rounded-3xl border border-white/10 bg-[#101116] p-7"><h2 className="text-2xl font-black">Practical {cluster.label} fundamentals</h2><ul className="mt-6 grid gap-4 md:grid-cols-3">{guidance[platform].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />{item}</li>)}</ul></section><section className="mt-12 rounded-3xl border border-orange-400/25 bg-orange-500/[.06] p-7"><h2 className="text-2xl font-black">Plan before you promote</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">Services can support a campaign, but they do not guarantee reach, sales or platform distribution. Keep content quality, audience relevance and a clear objective at the centre of the plan.</p><Link href="/tools/creator-growth-goal-planner" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-black text-black">Use the growth goal planner</Link></section></div></main></PublicShell>;
}
