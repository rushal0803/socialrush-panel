import Link from "next/link";
import { ArrowLeft, Inbox, MessageSquareText, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { promoteWebsiteEnquiry, updateWebsiteEnquiry } from "./actions";

export const dynamic = "force-dynamic";

type Enquiry = {
  id: string;
  lead_id: string | null;
  full_name: string;
  email: string;
  whatsapp: string;
  service: string;
  category: string;
  message: string;
  source: string;
  status: string;
  reply_draft: string | null;
  notification_status: string;
  marketing_opt_in: boolean;
  received_at: string;
};

function formatReceived(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
}

export default async function WebsiteEnquiriesPage() {
  // This URL is under the admin layout and the underlying table is admin-only RLS.
  const db = await createClient();
  const { data, error } = await db.from("crm_website_enquiries")
    .select("id,lead_id,full_name,email,whatsapp,service,category,message,source,status,reply_draft,notification_status,marketing_opt_in,received_at")
    .order("received_at", { ascending: false }).limit(100);
  const enquiries = (data || []) as Enquiry[];
  const open = enquiries.filter((row) => row.status === "new" || row.status === "working").length;
  const partnerships = enquiries.filter((row) => row.service.toLowerCase() === "partnership enquiry").length;
  const linked = enquiries.filter((row) => row.lead_id !== null).length;
  return (
    <main className="mx-auto max-w-[1400px] space-y-6 p-4 pb-20 text-white sm:p-8">
      <header className="rounded-3xl border border-orange-400/20 bg-[#111111] p-6 sm:p-8">
        <Link href="/admin/crm/growth-hub" className="inline-flex items-center gap-2 text-xs font-bold text-orange-200">
          <ArrowLeft size={15}/> Growth Hub
        </Link>
        <p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-orange-300">Inbound sales & support · Draft first</p>
        <h1 className="mt-2 text-3xl font-black">Website Enquiry Inbox</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#AFB6C2]">
          Review genuine website and partner enquiries, organise follow-ups and edit suggested replies.
          Saving a reply draft never sends an email. An enquiry is not permission to add a contact to marketing campaigns.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">Recent enquiries: {error ? "Unavailable" : enquiries.length}{enquiries.length === 100 ? " (first 100 only)" : ""}</span>
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">Open in view: {error ? "Unavailable" : open}</span>
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">Partnerships in view: {error ? "Unavailable" : partnerships}</span>
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">Linked CRM leads: {error ? "Unavailable" : linked}</span>
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2"><ShieldCheck className="mr-1 inline h-4 w-4"/> No auto replies</span>
        </div>
      </header>
      {error && (
        <p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Enquiry storage is unavailable. The private database migration and admin permissions must be deployed before the inbox can load.
        </p>
      )}
      {!error && enquiries.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-center">
          <Inbox className="mx-auto h-8 w-8 text-orange-300"/>
          <p className="mt-3 text-sm text-[#A8AFBD]">No website enquiry records yet. Submitted enquiries will appear here after the contact integration is deployed.</p>
        </div>
      )}
      <section aria-label="Recent website enquiries" className="space-y-4">
        {enquiries.map((row) => (
          <article key={row.id} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><MessageSquareText size={15} className="text-orange-300"/><h2 className="break-words text-base font-black">{row.full_name}</h2></div>
                <p className="mt-1 break-words text-xs text-[#9CA3AF]">{row.email} · {row.whatsapp}</p>
                <p className="mt-2 text-sm text-white">{row.service} · {row.category}</p>
                <p className="mt-1 break-all text-xs text-[#9CA3AF]">Source: {row.source} · {formatReceived(row.received_at)}</p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-[#D1D5DB]">
                <span>Stage: {row.status}</span>
                <span>Internal notification: {row.notification_status}</span>
              </div>
            </div>
            <details className="mt-4 rounded-xl border border-white/10 bg-[#0B0B0F] p-4">
              <summary className="cursor-pointer text-sm font-bold text-orange-200">Read enquiry and edit reply draft</summary>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-[#A8AFBD]">Customer message (untrusted text)</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#D1D5DB]">{row.message}</p>
              <form action={updateWebsiteEnquiry} className="mt-5 space-y-3">
                <input type="hidden" name="enquiry_id" value={row.id}/>
                <input type="hidden" name="operation" value="draft"/>
                <label htmlFor={"draft-" + row.id} className="block text-sm font-bold">Suggested reply — review and edit</label>
                <textarea id={"draft-" + row.id} name="reply_draft" defaultValue={row.reply_draft || ""} rows={7} maxLength={4000} required className="w-full rounded-xl border border-white/15 bg-[#10131e] p-3 text-sm text-white outline-none focus:border-orange-300"/>
                <p className="text-xs text-[#9CA3AF]">Template suggestion only. This action saves the draft privately and never sends it.</p>
                <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-black text-black">Save draft</button>
              </form>
            </details>
            {row.lead_id ? (
              <p className="mt-4 rounded-xl border border-white/10 bg-[#0B0B0F] p-3 text-sm text-slate-200">
                Linked to <Link href={"/admin/crm/leads/" + row.lead_id} className="font-bold text-orange-200 underline">CRM lead record</Link>.
                This link is not evidence of a completed sale.
              </p>
            ) : row.category === "bulk" || row.category === "guidance" ? (
              <div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-400/5 p-4">
                <h3 className="text-sm font-bold text-orange-200">Move reviewed enquiry to sales pipeline</h3>
                {row.status === "working" ? (
                  <form action={promoteWebsiteEnquiry} className="mt-3 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="enquiry_id" value={row.id}/>
                    <label className="min-w-[200px] flex-1 text-xs font-bold text-slate-200">
                      Business or creator name
                      <input name="business_name" minLength={2} maxLength={140} required placeholder="Enter the verified business name" className="mt-2 w-full rounded-lg border border-white/15 bg-[#10131e] px-3 py-2 text-sm text-white"/>
                    </label>
                    <button type="submit" className="rounded-lg bg-orange-500 px-4 py-3 text-xs font-black text-black">Link or create CRM lead</button>
                  </form>
                ) : (
                  <p className="mt-2 text-xs leading-6 text-slate-300">
                    Review the enquiry and change its follow-up stage to working before linking it to a sales lead.
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Exact email matches link to an existing lead; otherwise a new lead is created with contact compliance set to Review. No marketing consent or email sending is enabled.
                </p>
              </div>
            ) : null}
            <form action={updateWebsiteEnquiry} className="mt-4 flex flex-wrap items-center gap-3">
              <input type="hidden" name="enquiry_id" value={row.id}/>
              <input type="hidden" name="operation" value="status"/>
              <label className="text-xs font-bold text-[#A8AFBD]" htmlFor={"status-" + row.id}>Follow-up stage</label>
              <select id={"status-" + row.id} name="status" defaultValue={row.status} className="rounded-lg border border-white/15 bg-[#10131e] px-3 py-2 text-sm text-white">
                {["new", "working", "replied", "closed"].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button type="submit" className="rounded-lg border border-orange-400/30 px-4 py-2 text-xs font-bold text-orange-200">Update stage</button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
