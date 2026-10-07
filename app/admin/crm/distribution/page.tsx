import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Link2,
  MessageSquareText,
  Newspaper,
  Rss,
  Share2,
  Target,
  Users,
} from "lucide-react";
import { blogArticles } from "@/components/marketing/blog/blogData";
import { sortArticles, uniqueArticlesBySlug } from "@/lib/blog";
import {
  buildDistributionShareUrl,
  buildTrackedDistributionUrl,
} from "@/lib/marketing/content-distribution";

const lanes = [
  {
    icon: Newspaper,
    title: "Editorial & backlinks",
    goal: "Earn relevant mentions by contributing a useful resource, expert answer or genuinely link-worthy guide.",
    actions: [
      "Identify relevant marketing/creator/business publications",
      "Match one strong SocialRUSH guide or money page to the audience",
      "Pitch a useful contribution before asking for a link",
      "Record replies and next actions in CRM outreach",
    ],
  },
  {
    icon: Users,
    title: "Creators & partners",
    goal: "Reach audiences through transparent creator or partner collaborations instead of disguised endorsements.",
    actions: [
      "Prioritize creators with audience fit, not follower count alone",
      "Offer a useful content angle or campaign collaboration",
      "Disclose the relationship where applicable",
      "Send agency/bulk buyers to the qualified enquiry funnel",
    ],
  },
  {
    icon: MessageSquareText,
    title: "Communities",
    goal: "Participate where a direct answer or resource genuinely solves the question.",
    actions: [
      "Answer the question first",
      "Link only when the resource adds material value",
      "Never pose as an independent customer",
      "Avoid repetitive or mass promotional posting",
    ],
  },
];

const campaigns = [
  { name: "Money-page distribution", target: "/services", source: "partner", medium: "referral" },
  { name: "Help & trust education", target: "/help-center", source: "community", medium: "referral" },
  { name: "Agency acquisition", target: "/for-agencies", source: "agency_partner", medium: "referral" },
  { name: "Partnership recruitment", target: "/partners", source: "creator_outreach", medium: "referral" },
];

const latestArticles = sortArticles(
  uniqueArticlesBySlug(blogArticles).filter((article) => !article.redirectTo),
).slice(0, 6);

export default function DistributionPage() {
  return (
    <main className="space-y-8 p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-600">
          Phase 42 · Content distribution
        </p>
        <h1 className="mt-2 text-3xl font-black">Distribution Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Distribute useful SocialRUSH content through tracked, channel-specific links while keeping every public article canonical. This workspace does not auto-post, fabricate reach, or replace the CRM outreach workflow.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {lanes.map(({ icon: Icon, title, goal, actions }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <Icon className="h-6 w-6 text-orange-500" />
            <h2 className="mt-4 text-lg font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{goal}</p>
            <div className="mt-5 space-y-3">
              {actions.map((action) => (
                <div key={action} className="flex gap-2 text-xs leading-5 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {action}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-orange-500" />
              <h2 className="font-black">Latest article distribution queue</h2>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
              Each channel gets its own UTM source/medium while the public article keeps one canonical URL. Open the composer only when the content is genuinely relevant to the audience.
            </p>
          </div>
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-black text-orange-700"
          >
            <Rss className="h-4 w-4" />
            Open RSS feed
          </a>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {latestArticles.map((article) => {
            const path = `/blog/${article.slug}`;
            const linkedInUrl = buildTrackedDistributionUrl({
              path,
              channel: "linkedin",
              content: article.slug,
            });
            const xUrl = buildTrackedDistributionUrl({
              path,
              channel: "x",
              content: article.slug,
            });
            const whatsappUrl = buildTrackedDistributionUrl({
              path,
              channel: "whatsapp",
              content: article.slug,
            });
            const communityUrl = buildTrackedDistributionUrl({
              path,
              channel: "community",
              content: article.slug,
            });

            return (
              <article key={article.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-[.13em] text-orange-600">
                  {article.category}
                </p>
                <h3 className="mt-2 text-base font-black text-slate-950">{article.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{article.description}</p>
                <code className="mt-3 block break-all rounded-lg bg-white p-3 text-[10px] leading-4 text-slate-600">
                  {communityUrl}
                </code>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={buildDistributionShareUrl({
                      channel: "linkedin",
                      trackedUrl: linkedInUrl,
                      title: article.title,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center rounded-lg bg-slate-950 px-3 text-[11px] font-black text-white"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={buildDistributionShareUrl({
                      channel: "x",
                      trackedUrl: xUrl,
                      title: article.title,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center rounded-lg bg-slate-950 px-3 text-[11px] font-black text-white"
                  >
                    X
                  </a>
                  <a
                    href={buildDistributionShareUrl({
                      channel: "whatsapp",
                      trackedUrl: whatsappUrl,
                      title: article.title,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center rounded-lg bg-emerald-600 px-3 text-[11px] font-black text-white"
                  >
                    WhatsApp
                  </a>
                  <Link
                    href={path}
                    target="_blank"
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-black text-slate-700"
                  >
                    Article <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          <h2 className="font-black">Tracked evergreen campaign templates</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {campaigns.map((campaign) => {
            const url = `${campaign.target}?utm_source=${campaign.source}&utm_medium=${campaign.medium}&utm_campaign=distribution`;
            return (
              <div key={campaign.name} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-black">{campaign.name}</p>
                <code className="mt-2 block break-all text-xs text-slate-600">{url}</code>
                <Link
                  href={url}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-black text-orange-600"
                >
                  Open tracked destination <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/crm/prospecting" className="rounded-2xl bg-slate-950 p-5 text-white">
          <Target className="h-5 w-5 text-orange-300" />
          <p className="mt-3 font-black">Prospecting</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Find and qualify the next outreach candidates.</p>
          <ArrowRight className="mt-4 h-4 w-4" />
        </Link>
        <Link href="/admin/crm/outreach" className="rounded-2xl bg-slate-950 p-5 text-white">
          <MessageSquareText className="h-5 w-5 text-orange-300" />
          <p className="mt-3 font-black">Outreach</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Run outreach through the existing CRM workflow.</p>
          <ArrowRight className="mt-4 h-4 w-4" />
        </Link>
        <Link href="/partners" className="rounded-2xl bg-orange-500 p-5 text-white">
          <Link2 className="h-5 w-5" />
          <p className="mt-3 font-black">Public partner hub</p>
          <p className="mt-1 text-xs leading-5 text-orange-50">Share the public collaboration destination.</p>
          <ArrowRight className="mt-4 h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
