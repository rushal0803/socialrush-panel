"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, RotateCcw } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import { track } from "@/lib/analytics/events";

type Props = {
  serviceName: string;
  platform: string;
  quantity: number;
  target: string;
  completedAt: string;
  sameTargetHref: string;
  newTargetHref: string;
  source: string;
  repeatCount?: number;
};

function host(value:string){
  try { return new URL(value).hostname.replace(/^www\./,""); } catch { return value; }
}

export default function RepeatCampaignCard({serviceName,platform,quantity,target,completedAt,sameTargetHref,newTargetHref,source,repeatCount}:Props){
  const onClick=(mode:string)=>track("repeat_order_click",{platform,source,step:mode});
  return <article className="rounded-2xl border border-white/10 bg-[#101116] p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-orange-300"><PlatformIcon platform={platform} className="h-5 w-5"/></span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black text-white">{serviceName}</h3>
        <p className="mt-1 text-[11px] text-slate-400">{quantity.toLocaleString("en-IN")} quantity · {repeatCount ? `ordered ${repeatCount} times · ` : ""}{new Date(completedAt).toLocaleDateString("en-IN")}</p>
      </div>
    </div>
    <a href={target} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-slate-300">
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-orange-300"/><span className="truncate">{host(target)}</span>
    </a>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <Link href={sameTargetHref} onClick={()=>onClick("repeat_same_target")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 text-xs font-black text-white"><RotateCcw className="h-4 w-4"/>Same target</Link>
      <Link href={newTargetHref} onClick={()=>onClick("repeat_new_target")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 text-xs font-black text-orange-200">New target <ArrowRight className="h-4 w-4"/></Link>
    </div>
    <p className="mt-3 text-[10px] leading-4 text-slate-500">Nothing is submitted automatically. The order builder rechecks current availability, quantity rules and price before payment.</p>
  </article>;
}
