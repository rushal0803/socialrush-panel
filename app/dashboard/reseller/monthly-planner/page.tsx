"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookmarkPlus, BriefcaseBusiness, CalendarClock, Check, Copy, FolderKanban, History, Percent, RefreshCw, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PlatformIcon from "@/components/PlatformIcon";
import { createClient } from "@/lib/supabase/client";
import { platformMeta, smmServiceCatalog, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { revenueBundlesForPlatform, resolveRevenueBundle } from "@/lib/cro/revenue-bundles";
import { buildClientProposalText, calculateAgencyQuote, normalizeMarkupPercent } from "@/lib/reseller/monthly-plan";
import { compareSavedMonthlyPlan, planSnapshotItems } from "@/lib/reseller/saved-monthly-plan";
import { nextMonthlyReviewDate } from "@/lib/reseller/portfolio";
import { track } from "@/lib/analytics/events";

type ClientOption = { id: string; name: string };
type CampaignOption = { id: string; name: string; client_id: string | null };
type SavedPlanRow = { id:string; name:string; client_id:string|null; campaign_id:string|null; platform:string; bundle_id:string; markup_percent:number; baseline_fulfillment_cost:number; baseline_client_quote:number; baseline_gross_margin:number; next_review_on:string|null; updated_at:string };

const platforms: SmmPlatformId[] = ["instagram", "youtube", "linkedin", "x", "tiktok", "telegram"];
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function orderHref(input: {
  platform: SmmPlatformId;
  service: string;
  quantity: number;
  clientId: string;
  campaignId: string;
}) {
  const params = new URLSearchParams({
    platform: input.platform,
    service: input.service,
    quantity: String(input.quantity),
    resume: "1",
  });
  if (input.clientId) params.set("client", input.clientId);
  if (input.campaignId) params.set("campaign", input.campaignId);
  return `/dashboard/new-order?${params.toString()}`;
}

export default function MonthlyPlanBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedClientId = searchParams.get("client")?.trim() || "";
  const requestedPlanId = searchParams.get("plan")?.trim() || "";
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [clientId, setClientId] = useState(requestedClientId);
  const [campaignId, setCampaignId] = useState("");
  const [platform, setPlatform] = useState<SmmPlatformId>("instagram");
  const [bundleId, setBundleId] = useState("");
  const [markupInput, setMarkupInput] = useState("40");
  const [copied, setCopied] = useState(false);
  const [savedPlan, setSavedPlan] = useState<SavedPlanRow | null>(null);
  const [planName, setPlanName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextReviewOn, setNextReviewOn] = useState(() => nextMonthlyReviewDate());

  useEffect(() => {
    let active = true;
    void (async () => {
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();
      if (!user || !active) return;
      const planQuery = requestedPlanId
        ? db.from("reseller_monthly_plans").select("id,name,client_id,campaign_id,platform,bundle_id,markup_percent,baseline_fulfillment_cost,baseline_client_quote,baseline_gross_margin,next_review_on,updated_at").eq("id", requestedPlanId).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null });
      const [{ data: clientRows }, { data: campaignRows }, { data: planRow }] = await Promise.all([
        db.from("customer_clients").select("id,name").eq("user_id", user.id).is("archived_at", null).order("name"),
        db.from("campaigns").select("id,name,client_id").eq("user_id", user.id).order("created_at", { ascending: false }),
        planQuery,
      ]);
      if (!active) return;
      const safeClients = (clientRows || []) as ClientOption[];
      setClients(safeClients);
      setCampaigns((campaignRows || []) as CampaignOption[]);
      if (planRow) {
        const loaded = planRow as SavedPlanRow;
        setSavedPlan(loaded);
        setPlanName(loaded.name);
        setClientId(loaded.client_id && safeClients.some((client) => client.id === loaded.client_id) ? loaded.client_id : "");
        setCampaignId(loaded.campaign_id || "");
        if (platforms.includes(loaded.platform as SmmPlatformId)) setPlatform(loaded.platform as SmmPlatformId);
        setBundleId(loaded.bundle_id);
        setMarkupInput(String(normalizeMarkupPercent(Number(loaded.markup_percent || 0))));
        setNextReviewOn(loaded.next_review_on || nextMonthlyReviewDate());
      } else if (requestedClientId && !safeClients.some((client) => client.id === requestedClientId)) {
        setClientId("");
      }
    })();
    return () => { active = false; };
  }, [requestedClientId, requestedPlanId]);

  const bundles = useMemo(
    () => revenueBundlesForPlatform(platform)
      .map((bundle) => resolveRevenueBundle(bundle, smmServiceCatalog))
      .filter((bundle) => bundle.items.length >= 2),
    [platform],
  );

  useEffect(() => {
    if (!bundles.length) {
      setBundleId("");
      return;
    }
    if (!bundles.some((bundle) => bundle.id === bundleId)) setBundleId(bundles[0].id);
  }, [bundleId, bundles]);

  useEffect(() => {
    if (!campaignId) return;
    const selected = campaigns.find((campaign) => campaign.id === campaignId);
    if (!selected || (selected.client_id && selected.client_id !== clientId)) setCampaignId("");
  }, [campaignId, campaigns, clientId]);

  const selectedBundle = bundles.find((bundle) => bundle.id === bundleId) || bundles[0] || null;
  const selectedClient = clients.find((client) => client.id === clientId) || null;
  const availableCampaigns = campaigns.filter((campaign) => !campaign.client_id || campaign.client_id === clientId);
  const markup = normalizeMarkupPercent(Number(markupInput || 0));
  const quote = calculateAgencyQuote(selectedBundle?.total || 0, markup);
  const savedComparison = savedPlan && selectedBundle ? compareSavedMonthlyPlan({
    baselineFulfillmentCost:Number(savedPlan.baseline_fulfillment_cost || 0),
    baselineClientQuote:Number(savedPlan.baseline_client_quote || 0),
    baselineGrossMargin:Number(savedPlan.baseline_gross_margin || 0),
    markupPercent:Number(savedPlan.markup_percent || 0),
  }, selectedBundle.total) : null;
  const proposalText = selectedBundle ? buildClientProposalText({
    clientName: selectedClient?.name,
    planName: selectedBundle.name,
    platformLabel: platformMeta[selectedBundle.platform].label,
    items: selectedBundle.items.map((item) => ({ name: item.service.name, quantity: item.quantity })),
    clientQuote: quote.clientQuote,
  }) : "";

  async function copyProposal() {
    if (!proposalText) return;
    await navigator.clipboard.writeText(proposalText).catch(() => undefined);
    setCopied(true);
    track("agency_revenue_path_click", {
      action: "monthly_plan_copy",
      client_id: clientId || undefined,
      campaign_id: campaignId || undefined,
      bundle_id: selectedBundle?.id,
      markup_percent: markup,
      fulfillment_cost: quote.fulfillmentCost,
      client_quote: quote.clientQuote,
    });
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function savePlanBaseline() {
    if (!selectedBundle || saving) return;
    setSaving(true);
    setSaveMessage("");
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      setSaveMessage("Sign in again before saving.");
      setSaving(false);
      return;
    }
    const defaultName = (selectedClient?.name ? selectedClient.name + " — " : "") + selectedBundle.name;
    const payload = {
      user_id: user.id,
      client_id: clientId || null,
      campaign_id: campaignId || null,
      name: (planName.trim() || defaultName).slice(0,160),
      platform: selectedBundle.platform,
      bundle_id: selectedBundle.id,
      markup_percent: markup,
      baseline_fulfillment_cost: quote.fulfillmentCost,
      baseline_client_quote: quote.clientQuote,
      baseline_gross_margin: quote.grossMargin,
      items_snapshot: planSnapshotItems(selectedBundle.items),
      next_review_on: nextReviewOn || null,
      updated_at: new Date().toISOString(),
    };
    if (savedPlan) {
      const { data, error } = await db.from("reseller_monthly_plans").update(payload).eq("id", savedPlan.id).eq("user_id", user.id).select("id,name,client_id,campaign_id,platform,bundle_id,markup_percent,baseline_fulfillment_cost,baseline_client_quote,baseline_gross_margin,next_review_on,updated_at").single();
      if (error || !data) setSaveMessage(error?.message || "Could not refresh this saved plan.");
      else {
        setSavedPlan(data as SavedPlanRow);
        setPlanName(data.name);
        setSaveMessage("Saved baseline refreshed with the current plan.");
      }
    } else {
      const { data, error } = await db.from("reseller_monthly_plans").insert(payload).select("id,name,client_id,campaign_id,platform,bundle_id,markup_percent,baseline_fulfillment_cost,baseline_client_quote,baseline_gross_margin,next_review_on,updated_at").single();
      if (error || !data) setSaveMessage(error?.message || "Could not save this monthly plan.");
      else {
        setSavedPlan(data as SavedPlanRow);
        setPlanName(data.name);
        setSaveMessage("Monthly plan saved for fast renewal.");
        router.replace("/dashboard/reseller/monthly-planner?plan=" + encodeURIComponent(data.id));
      }
    }
    track("agency_revenue_path_click", { action: savedPlan ? "monthly_plan_refresh" : "monthly_plan_save", bundle_id: selectedBundle.id, client_id: clientId || undefined, campaign_id: campaignId || undefined });
    setSaving(false);
  }

  return (
    <main className="dashboard-premium-page mx-auto w-full max-w-[1500px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.18),transparent_34%),linear-gradient(125deg,#17150f,#0f1117_62%)] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Agency revenue conversion</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.035em] sm:text-4xl lg:text-5xl">Build a monthly client plan with margin before you quote.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">Choose a client, use the current SocialRUSH catalog stack as your fulfillment-cost baseline, add your own agency markup, then copy a client-ready monthly scope. Orders still run one by one through normal checkout with final validation.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/reseller" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">← Reseller Hub</Link>
              <Link href="/dashboard/reseller/portfolio" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"><CalendarClock className="h-4 w-4"/>Portfolio</Link><Link href="/dashboard/reseller/monthly-plans" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"><History className="h-4 w-4"/>Saved plans</Link>
              <Link href="/dashboard/retainers" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Recurring Revenue Center</Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[.06] p-5">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-300"/><h2 className="font-black">Margin-safe planning</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-300">The client quote is planning math only. SocialRUSH never auto-charges your client, and this page does not create orders, discounts or recurring billing.</p>
          </aside>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <article className="dashboard-glass p-5 sm:p-6">
          <div className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5 text-orange-300"/><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Plan setup</p><h2 className="mt-1 text-xl font-black">Client + campaign context</h2></div></div>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Client
              <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="dashboard-input normal-case tracking-normal text-white">
                <option value="">General / no saved client</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Campaign
              <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="dashboard-input normal-case tracking-normal text-white">
                <option value="">No campaign selected</option>
                {availableCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Platform
              <select value={platform} onChange={(event) => setPlatform(event.target.value as SmmPlatformId)} className="dashboard-input normal-case tracking-normal text-white">
                {platforms.map((item) => <option key={item} value={item}>{platformMeta[item].label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Campaign stack
              <select value={selectedBundle?.id || ""} onChange={(event) => setBundleId(event.target.value)} className="dashboard-input normal-case tracking-normal text-white">
                {bundles.map((bundle) => <option key={bundle.id} value={bundle.id}>{bundle.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Plan name
              <input value={planName} onChange={(event) => setPlanName(event.target.value.slice(0,160))} className="dashboard-input normal-case tracking-normal text-white" placeholder={selectedClient && selectedBundle ? selectedClient.name + " — " + selectedBundle.name : "Monthly client plan"}/>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Next renewal review
              <input type="date" value={nextReviewOn} onChange={(event) => setNextReviewOn(event.target.value)} className="dashboard-input normal-case tracking-normal text-white"/>
              <span className="normal-case tracking-normal text-[11px] font-medium leading-5 text-slate-500">Used only for your renewal pipeline. It does not schedule an order or charge.</span>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[.1em] text-slate-400">Agency markup
              <div className="relative"><Percent className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/><input value={markupInput} onChange={(event) => setMarkupInput(event.target.value.replace(/\D/g, "").slice(0, 3))} onBlur={() => setMarkupInput(String(markup))} inputMode="numeric" className="dashboard-input pr-11 text-white" placeholder="40"/></div>
              <span className="normal-case tracking-normal text-[11px] font-medium leading-5 text-slate-500">0–200%. This is your own agency pricing decision, not a SocialRUSH discount.</span>
            </label>
          </div>
        </article>

        <article className="dashboard-glass p-5 sm:p-6">
          {selectedBundle ? <>
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><PlatformIcon platform={platformMeta[selectedBundle.platform].label} className="h-5 w-5"/></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">{selectedBundle.eyebrow}</p><h2 className="mt-1 text-2xl font-black">{selectedBundle.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{selectedBundle.description}</p></div></div><span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-xs font-black text-slate-300">{selectedBundle.items.length} services</span></div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[.07] bg-black/20 p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-500">Fulfillment cost</p><p className="mt-2 text-2xl font-black">{money(quote.fulfillmentCost)}</p><p className="mt-1 text-[10px] text-slate-500">Internal planning baseline</p></div>
              <div className="rounded-2xl border border-orange-400/20 bg-orange-500/[.07] p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-orange-300">Client quote</p><p className="mt-2 text-2xl font-black">{money(quote.clientQuote)}</p><p className="mt-1 text-[10px] text-slate-400">{quote.markupPercent}% markup</p></div>
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[.055] p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-emerald-300">Gross margin</p><p className="mt-2 text-2xl font-black">{money(quote.grossMargin)}</p><p className="mt-1 text-[10px] text-slate-400">{quote.grossMarginPercent}% of client fee</p></div>
            </div>

            {savedPlan && savedComparison ? <div className={"mt-4 rounded-2xl border p-4 text-xs leading-5 " + (savedComparison.costDelta>0 ? "border-amber-400/20 bg-amber-500/[.06] text-amber-100" : savedComparison.costDelta<0 ? "border-emerald-400/20 bg-emerald-500/[.06] text-emerald-100" : "border-white/10 bg-white/[.025] text-slate-300")}><div className="flex items-center gap-2"><RefreshCw className="h-4 w-4"/><b>Renewal comparison</b></div><p className="mt-2">Saved cost {money(Number(savedPlan.baseline_fulfillment_cost||0))} → current cost {money(savedComparison.current.fulfillmentCost)}{savedComparison.costDelta===0 ? " · no change" : " · " + (savedComparison.costDelta>0?"+":"") + money(savedComparison.costDelta)}.</p><p className="mt-1">Saved client quote {money(Number(savedPlan.baseline_client_quote||0))} → current quote {money(savedComparison.current.clientQuote)} at the saved {savedPlan.markup_percent}% markup. Change inputs if you want a new markup before refreshing the baseline.</p></div> : null}

            <div className="mt-5 grid gap-3">
              {selectedBundle.items.map((item, index) => <div key={item.service.code} className="flex flex-col gap-3 rounded-2xl border border-white/[.07] bg-white/[.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-500">Monthly item {index + 1}</p><p className="mt-1 font-black">{item.service.name}</p><p className="mt-1 text-[11px] text-slate-400">{item.quantity.toLocaleString("en-IN")} · internal estimate {money(item.total)}</p></div>
                <Link href={orderHref({ platform: selectedBundle.platform, service: item.service.code, quantity: item.quantity, clientId, campaignId })} onClick={() => track("bundle_click", { action: "agency_monthly_plan_order", bundle_id: selectedBundle.id, service_code: item.service.code, client_id: clientId || undefined, campaign_id: campaignId || undefined })} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 text-xs font-black text-orange-100">Open order <ArrowRight className="h-3.5 w-3.5"/></Link>
              </div>)}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => void savePlanBaseline()} disabled={saving} className="btn-dashboard-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm disabled:opacity-60">{savedPlan ? <RefreshCw className="h-4 w-4"/> : <BookmarkPlus className="h-4 w-4"/>}{saving ? "Saving..." : savedPlan ? "Refresh saved baseline" : "Save monthly plan"}</button>
              <button type="button" onClick={() => void copyProposal()} className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">{copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}{copied ? "Proposal copied" : "Copy client proposal"}</button>
              {clientId ? <Link href={campaignId ? `/dashboard/campaigns/${encodeURIComponent(campaignId)}` : `/dashboard/campaigns?client=${encodeURIComponent(clientId)}`} className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"><FolderKanban className="h-4 w-4"/>{campaignId ? "Open campaign" : "Create campaign"}</Link> : <Link href="/dashboard/clients" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"><BriefcaseBusiness className="h-4 w-4"/>Add client first</Link>}
            </div>
            {saveMessage ? <p role="status" className="mt-3 rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs text-slate-300">{saveMessage}</p> : null}

            <div className="mt-5 rounded-2xl border border-sky-400/15 bg-sky-500/[.045] p-4 text-xs leading-6 text-slate-300"><div className="flex gap-2"><WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-sky-300"/><p><b className="text-sky-200">Final checkout remains authoritative.</b> Current service availability, live pricing where applicable, link eligibility, delivery and refill conditions are checked again when each order is placed. The quoted client fee is never passed into SocialRUSH checkout.</p></div></div>
          </> : <div className="grid min-h-[420px] place-items-center text-center"><div><Sparkles className="mx-auto h-8 w-8 text-orange-300"/><h2 className="mt-3 text-xl font-black">No eligible stack for this platform</h2><p className="mt-2 text-sm text-slate-400">Choose another platform or use the normal service catalog.</p></div></div>}
        </article>
      </section>
    </main>
  );
}
