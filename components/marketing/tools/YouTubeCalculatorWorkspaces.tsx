"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { revenueEstimate } from "@/lib/tools/calculations";
import { calculateYouTubeEngagement, type YouTubeEngagementMode } from "@/lib/tools/youtube-engagement";
import { track } from "@/lib/analytics/events";

const field = "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";
const number = (value: string) => { const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0; };
function CopyResult({ value }: { value: string }) { const [done, setDone] = useState(false); return <button type="button" className="btn-secondary min-h-12 gap-2 px-4" onClick={async () => { await navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1800); }}>{done ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{done ? "Copied" : "Copy result"}</button>; }
function Shell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="rounded-[1.4rem] border border-orange-400/35 bg-[linear-gradient(145deg,rgba(22,24,32,.98),rgba(10,11,16,.98))] p-5 shadow-[0_22px_60px_rgba(0,0,0,.28)] sm:p-7"><h2 className="text-[1.35rem] leading-tight">{title}</h2><p className="mt-2 text-sm leading-6 text-[#A8AFBD]">{description}</p><div className="mt-6">{children}</div></section>; }
const Input = ({ label, value, setValue, placeholder = "0" }: { label: string; value: string; setValue: (value: string) => void; placeholder?: string }) => <label className="text-sm font-semibold text-[#D7DBE3]">{label}<input className={field} type="number" min="0" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} /></label>;

export function YouTubeEngagementWorkspace() {
  const initial = { mode: "video" as YouTubeEngagementMode, subscribers: "", views: "", likes: "", comments: "", shares: "", engagedViews: "" };
  const [v, setV] = useState(initial);
  const update = (key: keyof typeof initial) => (value: string) => setV({ ...v, [key]: value });
  const result = calculateYouTubeEngagement({
    mode: v.mode,
    subscribers: number(v.subscribers),
    views: number(v.views),
    likes: number(v.likes),
    comments: number(v.comments),
    shares: number(v.shares),
    engagedViews: number(v.engagedViews),
  });
  const ready = result !== null;
  useEffect(() => {
    if (ready) track("creator_tool_result_generated", { tool: "youtube_engagement_rate", format: v.mode });
  }, [ready, v.mode]);

  return <Shell
    title="Calculate YouTube video or Shorts engagement"
    description="Choose Video or Shorts, then enter values from the same YouTube Analytics reporting period. The tool calculates transparent ratios from only your inputs."
  >
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-[#D7DBE3]">
        Content format
        <select className={field} value={v.mode} onChange={(e) => setV({ ...v, mode: e.target.value as YouTubeEngagementMode })}>
          <option value="video">Regular video</option>
          <option value="shorts">YouTube Shorts</option>
        </select>
      </label>
      <Input label="Views" value={v.views} setValue={update("views")} />
      <Input label="Likes" value={v.likes} setValue={update("likes")} />
      <Input label="Comments" value={v.comments} setValue={update("comments")} />
      <Input label="Shares" value={v.shares} setValue={update("shares")} />
      <Input label="Subscribers (optional)" value={v.subscribers} setValue={update("subscribers")} />
      {v.mode === "shorts" ? <Input label="Engaged views (optional)" value={v.engagedViews} setValue={update("engagedViews")} /> : null}
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[
        ["Engagement rate by views", result?.engagementRate ?? null],
        ["Like rate", result?.likeRate ?? null],
        ["Comment rate", result?.commentRate ?? null],
        ["Share rate", result?.shareRate ?? null],
        ["Views-to-subscribers", result?.viewsToSubscribers ?? null],
        ...(v.mode === "shorts" ? [["Engaged-view rate", result?.engagedViewRate ?? null] as const] : []),
      ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-orange-400/25 bg-orange-400/[.07] p-4">
        <p className="text-xs text-[#C0C6D0]">{String(label)}</p>
        <p className="mt-2 text-2xl font-black text-orange-200">{typeof value === "number" ? `${value.toFixed(2)}%` : "—"}</p>
      </div>)}
    </div>

    <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-[#A8AFBD]">
      <b className="text-[#D7DBE3]">Main formula:</b> (likes + comments + shares) ÷ views × 100. Like, comment and share rates use the same view denominator. For Shorts, engaged-view rate is engaged views ÷ views × 100 when you provide that optional value.
    </div>
    <p className="mt-4 text-xs leading-5 text-[#A8AFBD]">
      These are transparent planning ratios, not an official YouTube performance score or benchmark. Compare like-for-like formats and reporting periods in YouTube Analytics.
    </p>

    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" className="btn-secondary min-h-12 gap-2 px-4" onClick={() => setV(initial)}><RotateCcw className="h-4 w-4" /> Reset</button>
      {ready && result ? <CopyResult value={`YouTube ${v.mode === "shorts" ? "Shorts" : "video"} engagement: ${result.engagementRate.toFixed(2)}%; like rate: ${result.likeRate.toFixed(2)}%; comment rate: ${result.commentRate.toFixed(2)}%; share rate: ${result.shareRate.toFixed(2)}%`} /> : null}
    </div>
    <p aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold text-emerald-300">
      {ready && result ? `${result.interactions.toLocaleString()} interactions calculated from ${number(v.views).toLocaleString()} views` : v.views ? "Enter views greater than zero" : ""}
    </p>
  </Shell>;
}

export function YouTubeRevenueWorkspace() {
  const initial = { views: "", low: "1", high: "4", currency: "USD" }; const [v, setV] = useState(initial); const estimate = revenueEstimate(number(v.views), number(v.low), number(v.high)); const ready = number(v.views) > 0;
  useEffect(() => { if (ready) track("creator_tool_result_generated", { tool: "youtube_revenue_estimator" }); }, [ready]);
  const fmt = new Intl.NumberFormat(v.currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency: v.currency, maximumFractionDigits: 0 });
  return <Shell title="Estimate monthly revenue" description="Set a cautious RPM range for your channel. The result is an estimate, never a promise."><div className="grid gap-4 sm:grid-cols-2"><Input label="Estimated monthly views" value={v.views} setValue={(views) => setV({ ...v, views })} /><label className="text-sm font-semibold text-[#D7DBE3]">Currency<select className={field} value={v.currency} onChange={(e) => setV({ ...v, currency: e.target.value })}><option value="USD">USD ($)</option><option value="INR">INR (₹)</option></select></label><Input label="Low estimated RPM" value={v.low} setValue={(low) => setV({ ...v, low })} /><Input label="High estimated RPM" value={v.high} setValue={(high) => setV({ ...v, high })} /></div><div className="mt-6 rounded-2xl border border-orange-400/30 bg-orange-400/[.08] p-5 text-center"><p className="text-sm text-[#D7DBE3]">Estimated monthly revenue range</p><p className="mt-2 text-3xl font-black text-orange-200">{ready ? `${fmt.format(estimate.low)} – ${fmt.format(estimate.high)}` : "—"}</p><p className="mt-3 text-xs leading-5 text-[#A8AFBD]">Formula: monthly views ÷ 1,000 × your entered RPM range.</p></div><p className="mt-5 text-xs leading-5 text-[#A8AFBD]">Actual earnings can vary significantly with audience geography, niche, advertiser demand, monetized playbacks, seasonality, video format and YouTube policies. SocialRUSH does not guarantee YouTube earnings.</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" className="btn-secondary min-h-12 gap-2 px-4" onClick={() => setV(initial)}><RotateCcw className="h-4 w-4" /> Reset</button>{ready && <CopyResult value={`Estimated monthly YouTube revenue: ${fmt.format(estimate.low)}–${fmt.format(estimate.high)} (${number(v.views).toLocaleString()} views)`} />}</div></Shell>;
}
