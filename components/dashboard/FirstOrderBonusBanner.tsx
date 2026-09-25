"use client";

import Link from "next/link";
import { ArrowRight, Gift, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { track } from "@/lib/analytics/events";

type Offer = { reward:number; minimum:number };

export default function FirstOrderBonusBanner({ compact=false,currentTotal=0 }: { compact?:boolean;currentTotal?:number }) {
  const [offer,setOffer]=useState<Offer|null>(null);

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      const db=createClient();
      const {data:{user}}=await db.auth.getUser();
      if(!user)return;
      const [{data:rules,error:rulesError},{data:orders,error:ordersError}]=await Promise.all([
        db.from("reward_programme_rules").select("enabled,manual_approval,minimum_order_amount,new_customer_reward").eq("id",true).maybeSingle(),
        db.from("orders").select("id,status,payment_status").eq("user_id",user.id).order("created_at",{ascending:true}).limit(100)
      ]);
      if(!active||rulesError||ordersError||!rules||!rules.enabled||rules.manual_approval)return;
      const hasValidOrder=(orders||[]).some(order=>
        !["cancelled","refunded","failed"].includes(String(order.status||"").toLowerCase()) &&
        !["cancelled","refunded","failed"].includes(String(order.payment_status||"paid").toLowerCase())
      );
      const reward=Number(rules.new_customer_reward||0);
      const minimum=Number(rules.minimum_order_amount||0);
      if(!hasValidOrder&&reward>0&&minimum>0)setOffer({reward,minimum});
    };
    void load();
    return()=>{active=false;};
  },[]);

  useEffect(()=>{ if(offer)track("first_order_bonus_view",{reward:offer.reward,minimum:offer.minimum}); },[offer]);
  if(!offer)return null;
  const safeTotal=Number.isFinite(currentTotal)?Math.max(0,currentTotal):0;
  const remaining=Math.max(0,offer.minimum-safeTotal);
  const progress=Math.max(0,Math.min(100,offer.minimum>0?(safeTotal/offer.minimum)*100:0));

  return <section className={`${compact?"mb-4":"mt-4"} overflow-hidden rounded-2xl border border-emerald-400/25 bg-[linear-gradient(135deg,rgba(16,185,129,.12),rgba(255,122,0,.08),rgba(11,11,15,.98))] p-4 shadow-[0_18px_46px_-32px_rgba(16,185,129,.8)] sm:p-5`} aria-label="First order bonus">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300"><Gift className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-emerald-300">New customer reward</p>
          <h2 className="mt-1 text-lg font-black text-white">Get {formatCurrency(offer.reward,"INR")} wallet bonus</h2>
          <p className="mt-1 text-xs leading-5 text-slate-300">Complete your first order of {formatCurrency(offer.minimum,"INR")} or more and the bonus is added to your SocialRUSH wallet after the order is completed. One bonus per eligible account.</p>
          {safeTotal>0 ? <div className="mt-3 max-w-xl">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-bold">
              <span className={remaining>0?"text-amber-200":"text-emerald-300"}>{remaining>0?`Add ${formatCurrency(remaining,"INR")} more to unlock your bonus`:`${formatCurrency(offer.reward,"INR")} bonus unlocked for this order`}</span>
              <span className="shrink-0 text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all" style={{width:`${progress}%`}} /></div>
          </div> : null}
        </div>
      </div>
      <Link href="/dashboard/new-order" onClick={()=>track("first_order_bonus_click",{reward:offer.reward,minimum:offer.minimum})} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 text-xs font-black text-[#04110b] shadow-lg shadow-emerald-500/15">
        <Wallet className="h-4 w-4" /> Start First Order <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </section>;
}
