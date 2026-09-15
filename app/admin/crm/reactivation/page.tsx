/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRight, RefreshCcw, UserRoundCheck, WalletCards } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { date, money } from "@/lib/crm/types";

type Profile={id:string;email:string;full_name:string|null;company_name:string|null};
type Order={user_id:string;charge:number|string|null;status:string|null;payment_status:string|null;platform:string|null;created_at:string};
const valid=(o:Order)=>o.status!=="cancelled"&&o.payment_status!=="failed";
const paid=(o:Order)=>o.payment_status==="paid"||o.status==="completed";
const daysSince=(iso?:string)=>iso?Math.max(0,Math.floor((Date.now()-Date.parse(iso))/86400000)):9999;

export default async function ReactivationPage(){
  const s=await createClient();
  const since=new Date(Date.now()-180*86400000).toISOString();
  const [{data:profiles},{data:orders}]=await Promise.all([
    s.from("profiles").select("id,email,full_name,company_name").neq("role","admin").limit(1000),
    s.from("orders").select("user_id,charge,status,payment_status,platform,created_at").gte("created_at",since).order("created_at",{ascending:false}).limit(5000),
  ]);
  const people=(profiles||[]) as Profile[], all=(orders||[]) as Order[], by=new Map<string,Order[]>();
  all.forEach(o=>by.set(o.user_id,[...(by.get(o.user_id)||[]),o]));
  const rows=people.map(p=>{const os=(by.get(p.id)||[]).filter(valid),completed=os.filter(paid),last=os[0],lastPaid=completed[0],spend=completed.reduce((n,o)=>n+Number(o.charge||0),0),age=daysSince(lastPaid?.created_at),repeat=completed.length>=2;return {p,completed,last,lastPaid,spend,age,repeat,top:lastPaid?.platform||last?.platform||"—"};})
    .filter(x=>x.completed.length>0&&x.age>=21)
    .sort((a,b)=>(b.repeat?1:0)-(a.repeat?1:0)||b.spend-a.spend||b.age-a.age)
    .slice(0,200);
  const repeat=rows.filter(x=>x.repeat).length, value=rows.reduce((n,x)=>n+x.spend,0), stale60=rows.filter(x=>x.age>=60).length;
  return <main className="mx-auto max-w-[1500px] p-4 sm:p-8"><header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Repeat revenue</p><h1 className="mt-2 text-3xl font-black text-white">Customer Reactivation Queue</h1><p className="mt-2 max-w-3xl text-sm text-[#9CA3AF]">Prioritise customers who previously completed orders but have not completed another order recently. This queue does not send messages automatically.</p></div><Link href="/admin/crm/follow-ups?type=retention" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-bold text-white">Open retention follow-ups <ArrowRight size={15}/></Link></header>
  <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[RefreshCcw,"Reactivation candidates",rows.length],[UserRoundCheck,"Repeat customers",repeat],[WalletCards,"Historical completed value",money(value)],[RefreshCcw,"60+ days inactive",stale60]].map(([Icon,label,val]:any)=><article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-5"><div className="flex items-center justify-between text-[#9CA3AF]"><span className="text-[10px] font-bold uppercase tracking-wide">{label}</span><Icon size={16} className="text-orange-300"/></div><b className="mt-3 block text-2xl text-white">{val}</b></article>)}</section>
  <section className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/[.035] p-5"><h2 className="font-bold text-white">How to use this queue</h2><p className="mt-2 text-sm leading-6 text-[#D1D5DB]">Start with repeat and higher-value customers. Review the customer record before outreach, confirm the service is still available at current pricing, then create a retention follow-up. Avoid promising discounts, delivery times or refill terms that are not shown by the current service.</p></section>
  <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="text-[#9CA3AF]"><tr>{["Customer","Completed Orders","Historical Value","Last Completed","Inactive","Last Platform","Signal","Action"].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.p.id} className="border-t border-white/10"><td className="px-5 py-4"><b className="block text-sm text-white">{x.p.full_name||x.p.company_name||"Customer"}</b><span className="text-[#9CA3AF]">{x.p.email}</span></td><td className="px-5 py-4 text-white">{x.completed.length}</td><td className="px-5 py-4 font-bold text-white">{money(x.spend)}</td><td className="px-5 py-4">{date(x.lastPaid?.created_at)}</td><td className="px-5 py-4">{x.age} days</td><td className="px-5 py-4">{x.top}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${x.repeat?"bg-orange-500/10 text-orange-200":"bg-white/5 text-[#D1D5DB]"}`}>{x.repeat?"Repeat buyer":"Win-back"}</span></td><td className="px-5 py-4"><Link href={`/admin/crm/customers/${x.p.id}`} className="rounded-lg border border-orange-400/30 px-3 py-2 font-bold text-orange-200">Review customer</Link></td></tr>)}{!rows.length&&<tr><td colSpan={8} className="p-14 text-center text-[#9CA3AF]">No reactivation candidates found in the last 180 days.</td></tr>}</tbody></table></div></section></main>;
}
