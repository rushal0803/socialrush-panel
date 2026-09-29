import Link from "next/link";
import { ArrowLeft, ReceiptText, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import CurrencyAmount from "@/components/currency/CurrencyAmount";
import PaymentReceiptActions from "@/components/wallet/PaymentReceiptActions";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

function label(value:string|null|undefined){return String(value||"—").replaceAll("_"," ");}
function dateTime(value:string){return new Date(value).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});}

export default async function PaymentReceiptPage({params:paramsPromise}:{params:Promise<{id:string}>}){
  const params=await paramsPromise;
  const {supabase,user}=await getDashboardContext();
  const {data:item,error}=await supabase.from("transactions").select("id,amount,type,status,payment_method,provider_order_id,provider_payment_id,provider_refund_id,description,metadata,created_at").eq("id",params.id).maybeSingle();
  if(error||!item) notFound();
  const amount=Number(item.amount||0);
  const metadata=(item.metadata||{}) as Record<string,unknown>;
  const orderId=typeof metadata.order_id==="string"?metadata.order_id:null;
  const reference=item.provider_payment_id||item.provider_order_id||item.provider_refund_id||item.id;
  return <main className="min-h-screen bg-[#090a0d] px-4 py-8 text-white print:bg-white print:text-black sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl">
    <div className="mb-5 flex items-center justify-between gap-3 print:hidden"><Link href="/dashboard/billing" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-300"><ArrowLeft className="h-4 w-4"/>Back to billing</Link><PaymentReceiptActions reference={reference}/></div>
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111217] shadow-2xl print:border-slate-300 print:bg-white print:shadow-none">
      <header className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.16),transparent_35%),#101116] p-6 print:border-slate-300 print:bg-white sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300 print:text-slate-600">SocialRUSH payment proof</p><h1 className="mt-2 text-3xl font-black print:text-black">Transaction receipt</h1><p className="mt-2 text-sm text-slate-400 print:text-slate-600">Customer-owned record for transaction verification and account history.</p></div><ReceiptText className="h-8 w-8 text-orange-300 print:text-black"/></div></header>
      <div className="p-6 sm:p-8"><div className="grid gap-3 sm:grid-cols-2">
        <Detail label="Amount" value={<CurrencyAmount amountINR={amount}/>}/>
        <Detail label="Status" value={label(item.status)}/>
        <Detail label="Payment method" value={label(item.payment_method||item.type)}/>
        <Detail label="Date" value={dateTime(item.created_at)}/>
        <Detail label="Reference" value={reference} breakable/>
        <Detail label="Transaction ID" value={item.id} breakable/>
        {item.description?<Detail label="Description" value={item.description}/>:null}
        {orderId?<Detail label="Related order" value={orderId} breakable/>:null}
      </div>
      <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-500/[.05] p-4 text-xs leading-6 text-slate-300 print:border-slate-300 print:bg-slate-50 print:text-slate-700"><div className="flex items-center gap-2 font-black text-emerald-200 print:text-black"><ShieldCheck className="h-4 w-4"/>Payment record note</div><p className="mt-2">This page reflects the transaction status stored in your SocialRUSH account at the time you opened it. Pending records are not proof of completed wallet credit.</p></div>
      {orderId?<Link href={`/dashboard/orders/${orderId}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-sm font-black text-orange-100 print:hidden">View related order</Link>:null}
      <p className="mt-8 text-[10px] text-slate-500 print:text-slate-600">Account: {user?.email||"Signed-in customer"} · Generated from SocialRUSH billing records.</p>
      </div>
    </section>
  </div></main>;
}

function Detail({label,value,breakable}:{label:string;value:React.ReactNode;breakable?:boolean}){return <div className="rounded-2xl border border-white/10 bg-black/20 p-4 print:border-slate-300 print:bg-white"><dt className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</dt><dd className={`mt-2 text-sm font-black text-white print:text-black ${breakable?"break-all":""}`}>{value}</dd></div>}
