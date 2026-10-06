import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ExternalLink, Link2, Newspaper, ShieldCheck, Wrench } from "lucide-react";
import PublicShell from "@/components/marketing/PublicShell";
import { digitalPrAssets, digitalPrGuardrails } from "@/lib/seo/digital-pr";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "SocialRUSH Press & Media Resources",
  description:
    "Access SocialRUSH media resources, free social-media planning tools, safety guides and collaboration standards for relevant editorial coverage.",
  path: "/press",
  keywords: ["SocialRUSH press", "SocialRUSH media resources", "social media tools for journalists"],
});

const expertTopics = [
  "Social-media campaign planning and budgeting",
  "Creator growth workflows and measurement basics",
  "Public-link ordering and account-access safety",
  "How to evaluate service requirements before ordering",
] as const;

function kindIcon(kind: "tool" | "guide" | "resource") {
  if (kind === "tool") return Wrench;
  if (kind === "guide") return BookOpenCheck;
  return Link2;
}

export default function PressPage() {
  return (
    <PublicShell>
      <main className="bg-slate-50 text-slate-950">
        <section className="bg-slate-950 px-5 py-20 text-white sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Press & media resources</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Useful SocialRUSH resources for editors, educators and publishers.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              SocialRUSH provides social-media growth services and free planning tools. This page collects resources that may be useful when covering creator planning, campaign measurement, ordering safety or social-media workflow topics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact?service=Press%20or%20Media%20Enquiry&utm_source=press&utm_medium=website&utm_campaign=digital_pr"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black"
              >
                Press or media enquiry <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/partners"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-black"
              >
                Partnership standards
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-orange-700">
                <Newspaper className="h-4 w-4" /> What we can discuss
              </div>
              <h2 className="mt-3 text-2xl font-black">Editorially useful topics</h2>
              <div className="mt-5 space-y-3">
                {expertTopics.map((topic) => (
                  <div key={topic} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-700">{topic}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                Any contribution should stay factual and within the evidence available to SocialRUSH. We do not provide invented market statistics, guaranteed outcomes, fabricated customer stories or unsupported ranking claims.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-orange-700">
                <Link2 className="h-4 w-4" /> Citation-ready resources
              </div>
              <h2 className="mt-3 text-2xl font-black">Free tools and guides</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                These resources are designed to be useful without requiring a purchase. Cite or reference them only when they genuinely help the reader.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {digitalPrAssets.map((asset) => {
                  const Icon = kindIcon(asset.kind);
                  return (
                    <Link
                      key={asset.id}
                      href={asset.path}
                      className="group rounded-2xl border border-slate-200 p-5 transition hover:border-orange-300 hover:bg-orange-50/50"
                    >
                      <Icon className="h-5 w-5 text-orange-500" />
                      <h3 className="mt-3 font-black">{asset.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{asset.pitchAngle}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-600">
                        Open resource <ExternalLink className="h-3 w-3" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </article>
          </div>

          <article className="mt-5 rounded-3xl border border-orange-200 bg-orange-50 p-7">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-orange-700">
              <ShieldCheck className="h-4 w-4" /> Editorial standard
            </div>
            <h2 className="mt-3 text-2xl font-black">Earned coverage only.</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {digitalPrGuardrails.map((rule) => (
                <p key={rule} className="rounded-xl bg-white/70 p-4 text-sm leading-6 text-slate-700">
                  {rule}
                </p>
              ))}
            </div>
          </article>
        </section>
      </main>
    </PublicShell>
  );
}
