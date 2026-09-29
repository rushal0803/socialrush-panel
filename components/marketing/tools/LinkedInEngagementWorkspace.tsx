"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, Copy, RotateCcw, ShieldCheck } from "lucide-react";
import { calculateLinkedInEngagement } from "@/lib/tools/linkedin-engagement";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";

const initial = { impressions: "", reactions: "", comments: "", reposts: "", clicks: "" };
const n = (value: string) => Number(value) || 0;
const fmt = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);

export default function LinkedInEngagementWorkspace() {
  const [values, setValues] = useState(initial);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => calculateLinkedInEngagement({
    impressions: n(values.impressions),
    reactions: n(values.reactions),
    comments: n(values.comments),
    reposts: n(values.reposts),
    clicks: n(values.clicks),
  }), [values]);

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function copyResult() {
    if (!result) return;
    const text = `LinkedIn engagement rate: ${result.engagementRate.toFixed(2)}% (${result.interactions.toLocaleString("en-IN")} interactions from ${result.impressions.toLocaleString("en-IN")} impressions)`;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-[1.6rem] border border-sky-400/25 bg-[linear-gradient(145deg,#121925,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-sky-200">LinkedIn analytics</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate LinkedIn engagement rate</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter metrics from the same LinkedIn post and reporting window. Clicks are optional so the tool works for both personal-post and Page reporting.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sky-400/25 bg-sky-400/[.08]">
          <BarChart3 className="h-5 w-5 text-sky-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200 sm:col-span-2">Impressions
          <input className={field} type="number" min="1" inputMode="numeric" value={values.impressions} onChange={(e)=>update("impressions",e.target.value)} placeholder="8500" />
        </label>
        <label className="text-sm font-semibold text-slate-200">Reactions
          <input className={field} type="number" min="0" inputMode="numeric" value={values.reactions} onChange={(e)=>update("reactions",e.target.value)} placeholder="148" />
        </label>
        <label className="text-sm font-semibold text-slate-200">Comments
          <input className={field} type="number" min="0" inputMode="numeric" value={values.comments} onChange={(e)=>update("comments",e.target.value)} placeholder="26" />
        </label>
        <label className="text-sm font-semibold text-slate-200">Reposts
          <input className={field} type="number" min="0" inputMode="numeric" value={values.reposts} onChange={(e)=>update("reposts",e.target.value)} placeholder="12" />
        </label>
        <label className="text-sm font-semibold text-slate-200">Clicks <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.clicks} onChange={(e)=>update("clicks",e.target.value)} placeholder="95" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={()=>setValues({impressions:"8500",reactions:"148",comments:"26",reposts:"12",clicks:"95"})} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={()=>setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm"><RotateCcw className="h-4 w-4"/>Reset</button>
        <button type="button" disabled={!result} onClick={copyResult} className="btn-secondary min-h-11 gap-2 px-4 text-sm disabled:opacity-45"><Copy className="h-4 w-4"/>{copied?"Copied":"Copy result"}</button>
      </div>

      <div className="mt-7 rounded-2xl border border-sky-400/20 bg-black/25 p-5">
        {result ? <>
          <p className="text-xs font-black uppercase tracking-[.13em] text-sky-200">Engagement rate by impressions</p>
          <p className="mt-2 text-5xl font-black tracking-tight text-white">{fmt(result.engagementRate)}%</p>
          <p className="mt-2 text-sm text-slate-400">{fmt(result.interactions)} total interactions from the values you entered.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Reaction rate", result.reactionRate],
              ["Comment rate", result.commentRate],
              ["Repost rate", result.repostRate],
              ["Click rate", result.clickRate],
            ].map(([label,value])=><div key={String(label)} className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">{String(label)}</p><p className="mt-1 text-base font-black text-white">{typeof value==="number"?`${fmt(value)}%`:"—"}</p></div>)}
          </div>
        </> : <div className="py-4 text-center"><ShieldCheck className="mx-auto h-6 w-6 text-emerald-300"/><p className="mt-3 font-black text-white">Enter post impressions to begin</p><p className="mt-2 text-sm leading-6 text-slate-400">Use one post and one reporting window for a consistent calculation.</p></div>}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <b className="text-slate-200">Formula:</b> (reactions + comments + reposts + optional clicks) ÷ impressions × 100.
      </div>
      <p className="mt-4 text-xs leading-6 text-slate-400">
        This tool does not assign a universal “good” or “bad” benchmark. Compare like-for-like posts from your own LinkedIn analytics because audience size, format and reporting definitions can differ.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/linkedin-followers" className="btn-primary min-h-12">Explore LinkedIn followers</Link>
        <Link href="/linkedin-likes" className="btn-secondary min-h-12">Explore LinkedIn likes</Link>
      </div>
    </section>
  );
}
