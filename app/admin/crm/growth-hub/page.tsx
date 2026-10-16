import Link from "next/link";
import {
  Activity, ArrowRight, Bot, Bug, ClipboardCheck,
  ExternalLink, FileSearch, Mail, ShieldCheck, TriangleAlert,
  Users, Workflow,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aeoTargets } from "@/lib/seo/answer-engine";
import { indexationTargets } from "@/lib/seo/indexation-command-center";

export const dynamic = "force-dynamic";

type Action = {
  title: string;
  detail: string;
  href: string;
  label: string;
  priority: "urgent" | "review" | "next";
};

const actionTone: Record<Action["priority"], string> = {
  urgent: "border-red-400/30 bg-red-500/10 text-red-200",
  review: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  next: "border-sky-400/30 bg-sky-500/10 text-sky-100",
};

function Counter({ title, value, note, href }: {
  title: string;
  value: number | string | null;
  note: string;
  href: string;
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-white/10 bg-[#111111] p-5 transition-colors hover:border-orange-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">
      <p className="text-xs font-semibold text-[#A8AFBD]">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value ?? "Unavailable"}</p>
      <p className="mt-2 text-xs leading-5 text-[#9CA3AF]">{note}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-200">Inspect <ArrowRight size={14} /></span>
    </Link>
  );
}

const sections = [
  {
    title: "SEO recovery",
    eyebrow: "Google & organic search",
    description: "Check technical eligibility, investigate indexing, improve commercial pages and review keyword changes from real Search Console exports.",
    href: "/admin/seo/indexation",
    cta: "Open indexation",
    icon: FileSearch,
    quickLinks: [
      { href: "/admin/seo/ctr", label: "Search snippets" },
      { href: "/admin/seo/competitors", label: "Competitors" },
      { href: "/admin/seo/content", label: "Content" },
    ],
  },
  {
    title: "GEO & AI visibility",
    eyebrow: "Answer engine optimization",
    description: "Improve factual answers, service entities, structured data and AI crawler access; distinguish readiness from verified AI citations.",
    href: "/admin/seo/aeo",
    cta: "Open AI-search audit",
    icon: Bot,
    quickLinks: [
      { href: "/admin/seo/authority", label: "Authority graph" },
      { href: "/admin/seo/digital-pr", label: "Digital PR" },
    ],
  },
  {
    title: "Leads & marketing email",
    eyebrow: "Sales CRM",
    description: "Qualify contacts, prepare messages, check deliverability, review interested replies and enforce suppression and consent safeguards.",
    href: "/admin/crm/outreach",
    cta: "Open outreach",
    icon: Mail,
    quickLinks: [
      { href: "/admin/crm/leads", label: "Leads" },
      { href: "/admin/crm/prospecting", label: "Prospecting" },
      { href: "/admin/crm/replies", label: "Replies" },
    ],
  },
  {
    title: "Error recovery & upgrades",
    eyebrow: "Engineering operations",
    description: "Triage real failures and incidents, prepare small safe code fixes, run CI checks, then review a pull request before production.",
    href: "/admin/crm/automation-health",
    cta: "Open system health",
    icon: Bug,
    quickLinks: [
      { href: "/admin/incidents", label: "Incidents" },
      { href: "/admin/quality", label: "Quality checks" },
    ],
  },
] as const;

export default async function GrowthHubPage() {
  // Admin authorization and noindex are enforced by app/admin/layout.tsx.
  // Only bounded, read-only queries run here; no email, cron, crawl or deployment is triggered.
  const db = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [leads, drafts, failedWebhooks, failedDeliveries, outreachSettings, automationRun, discoveryRun] = await Promise.all([
    db.from("crm_leads").select("id", { count: "exact", head: true }),
    db.from("crm_outreach_messages").select("id", { count: "exact", head: true })
      .eq("status", "draft").eq("direction", "outbound"),
    db.from("crm_resend_webhook_events").select("event_id", { count: "exact", head: true })
      .eq("status", "failed"),
    db.from("customer_email_events").select("id", { count: "exact", head: true })
      .in("delivery_status", ["bounced", "complained", "suppressed", "failed"]).gte("sent_at", sevenDaysAgo),
    db.from("crm_outreach_settings").select("enabled,auto_send,global_daily_send_limit").limit(1).maybeSingle(),
    db.from("crm_automation_runs").select("started_at,status").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("crm_prospect_discovery_runs").select("started_at,status").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const errors = [leads, drafts, failedWebhooks, failedDeliveries, outreachSettings, automationRun, discoveryRun]
    .filter((result) => result.error).length;
  const sendingKnown = !outreachSettings.error && !!outreachSettings.data;
  const sendingEnabled = !!(outreachSettings.data?.enabled && outreachSettings.data?.auto_send);
  const actions: Action[] = [];

  if (errors > 0) {
    actions.push({
      title: "Some CRM signals could not be read",
      detail: String(errors) + " read-only query/queries failed. Counts marked unavailable must not be treated as zero.",
      href: "/admin/crm/automation-health",
      label: "Investigate monitoring",
      priority: "urgent",
    });
  }
  if ((failedWebhooks.count ?? 0) > 0) {
    actions.push({
      title: "Failed outreach webhook processing",
      detail: String(failedWebhooks.count) + " provider event(s) failed processing; check retries and suppression outcomes.",
      href: "/admin/crm/automation-health",
      label: "Inspect failures",
      priority: "urgent",
    });
  }
  if ((failedDeliveries.count ?? 0) > 0) {
    actions.push({
      title: "Customer email delivery needs review",
      detail: String(failedDeliveries.count) + " negative delivery event(s) recorded in the last seven days.",
      href: "/admin/crm/automation-health",
      label: "Review deliverability",
      priority: "urgent",
    });
  }
  if (automationRun.data && automationRun.data.status !== "completed") {
    actions.push({
      title: "Latest customer automation was not completed",
      detail: "Check its run state and error logs before changing outreach volume.",
      href: "/admin/crm/automation-health",
      label: "Check automation",
      priority: "review",
    });
  }
  if (discoveryRun.data && discoveryRun.data.status !== "completed") {
    actions.push({
      title: "Latest lead discovery was not completed",
      detail: "Confirm the discovery workflow has not failed or become stuck.",
      href: "/admin/crm/prospecting",
      label: "Check discovery",
      priority: "review",
    });
  }
  if ((drafts.count ?? 0) > 0) {
    actions.push({
      title: "Outreach drafts awaiting a decision",
      detail: String(drafts.count) + " outbound draft(s) available for eligibility and message review.",
      href: "/admin/crm/outreach",
      label: "Review drafts",
      priority: "review",
    });
  }
  actions.push({
    title: "Confirm Google indexing with Search Console",
    detail: "Internal indexation checks measure technical eligibility, not Google's indexed URL count. Use current Google exports for exclusions and ranking losses.",
    href: "/admin/seo/indexation",
    label: "Open SEO checks",
    priority: "next",
  });

  return (
    <main className="mx-auto max-w-[1650px] space-y-6 p-4 pb-20 text-white sm:p-8">
      <header className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.22),transparent_52%),#101014] px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">SocialRUSH growth operations</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Unified Growth CRM</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#C4CBD6]">
            One admin workspace for SEO, GEO, lead marketing, email delivery and engineering health.
            Existing systems remain the source of truth — this overview does not send email or deploy changes.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white"><ShieldCheck size={15} /> Admin only</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white"><Activity size={15} /> Live CRM counters</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white"><ClipboardCheck size={15} /> Review before deploy</span>
          </div>
        </div>
      </header>

      <section aria-label="Growth operations metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Counter title="Tracked SEO URLs" value={indexationTargets.length} note="Curated technical targets, not Google-indexed pages" href="/admin/seo/indexation" />
        <Counter title="AI-search audit targets" value={aeoTargets.length} note="Configured readiness checks, not measured AI citations" href="/admin/seo/aeo" />
        <Counter title="CRM sales leads" value={leads.error ? null : leads.count} note="Existing lead records; not automatically qualified" href="/admin/crm/leads" />
        <Counter title="Outreach drafts" value={drafts.error ? null : drafts.count} note="Draft messages; not emails delivered" href="/admin/crm/outreach" />
      </section>

      <section aria-labelledby="workspaces-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-orange-300">Workspaces</p>
            <h2 id="workspaces-heading" className="mt-2 text-xl font-bold">Operate everything from one place</h2>
          </div>
          <Link href="/admin/command-center" className="inline-flex items-center gap-2 text-sm font-bold text-orange-200">CEO brief <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.title} className="flex flex-col rounded-2xl border border-white/10 bg-[#111111] p-5 transition-colors hover:border-orange-400/30 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-3 text-orange-200"><Icon size={22} /></span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-orange-300">{section.eyebrow}</p>
                    <h3 className="mt-1 text-lg font-black">{section.title}</h3>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#B6BECC]">{section.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {section.quickLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-xs font-semibold text-[#D1D5DB] hover:bg-white/10">{item.label}</Link>)}
                </div>
                <Link href={section.href} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF8A1F] px-4 py-2 text-sm font-black text-[#171008] hover:bg-[#FFAD56]">
                  {section.cta} <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="action-heading" className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <h2 id="action-heading" className="text-xl font-black">Priority action queue</h2>
            <p className="mt-2 text-xs text-[#A8AFBD]">Existing workflow signals and explicit next steps; no invented indexing or AI ranking metrics.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#D1D5DB]">{actions.length} action(s)</span>
        </div>
        <div className="divide-y divide-white/10">
          {actions.map((item) => (
            <article key={item.title} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <span className={"inline-flex rounded-md border px-2 py-1 text-[10px] font-black uppercase " + actionTone[item.priority]}>{item.priority}</span>
                <h3 className="mt-2 text-sm font-bold">{item.title}</h3>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-[#9CA3AF]">{item.detail}</p>
              </div>
              <Link href={item.href} className="inline-flex min-h-10 shrink-0 items-center gap-1 text-xs font-bold text-orange-200 hover:text-white">{item.label} <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2"><Users size={19} className="text-orange-300" /><h2 className="font-black">Email safeguards</h2></div>
          <p className="mt-3 text-sm text-[#B6BECC]">Existing suppression, opt-out and verified-business-contact safeguards remain unchanged.</p>
          <p className="mt-3 text-sm">Current CRM auto-send setting: <strong className={sendingKnown ? "text-white" : "text-amber-200"}>{!sendingKnown ? "Unavailable" : sendingEnabled ? "Enabled" : "Disabled"}</strong></p>
          <p className="mt-1 text-xs text-[#9CA3AF]">A displayed setting does not prove that a message was sent or delivered. Sending can only be managed in the existing outreach controls.</p>
          <Link href="/admin/crm/automation-health" className="mt-3 inline-flex gap-1 text-xs font-bold text-orange-200">Review delivery and webhook health <ArrowRight size={14} /></Link>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-2"><Workflow size={19} className="text-orange-300" /><h2 className="font-black">Change management</h2></div>
          <p className="mt-3 text-sm text-[#B6BECC]">Error reported → issue reproduced → fix prepared on a branch → automated tests → PR review → explicit production approval.</p>
          <p className="mt-2 text-xs text-[#9CA3AF]">No database migration, mass email, new paid API, background crawl or production deployment is triggered by this hub.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/admin/incidents" className="inline-flex items-center gap-1 text-xs font-bold text-orange-200">Investigate incidents <ArrowRight size={14} /></Link>
            <a href="https://github.com/rushal0803/socialrush-panel/pulls" rel="noreferrer" target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-orange-200">Review code PRs <ExternalLink size={14} /></a>
          </div>
        </article>
      </section>
      <p className="flex items-start gap-2 text-xs leading-5 text-[#8B93A1]"><TriangleAlert size={16} className="mt-0.5 shrink-0" />
        Technical crawl eligibility and configured GEO readiness are not Google-indexing confirmation or AI-answer placement. Fresh search performance exports remain necessary to prioritize revenue pages.
      </p>
    </main>
  );
}
