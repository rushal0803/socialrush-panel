import Link from "next/link";
import { addSupportInternalNote, replyToTicket, setTicketStatus } from "@/app/admin/actions";
import { AdminPageHeader, AdminStatus, primaryButton } from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

const ticketStatuses = ["open", "waiting_for_support", "waiting_for_customer", "resolved", "closed"] as const;

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams?: { ticket?: string; status?: string; q?: string; category?: string; order?: string };
}) {
  const supabase = await createClient();
  let query = supabase
    .from("support_tickets")
    .select("id,subject,category,status,order_id,created_at,updated_at,last_reply_at,user_id,profiles(email,full_name),orders(id,platform,service_name,status,quantity,refill_eligible,services(delivery_time,refill_policy))")
    .order("updated_at", { ascending: false });

  if (searchParams?.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams?.q) query = query.ilike("subject", `%${searchParams.q}%`);
  if (searchParams?.category) query = query.eq("category", searchParams.category);
  if (searchParams?.order) query = query.eq("order_id", searchParams.order);

  const { data: tickets } = await query.limit(200);
  const selectedId = searchParams?.ticket || tickets?.[0]?.id;
  const selected = tickets?.find((ticket) => ticket.id === selectedId);
  const selectedOrder = selected ? ((Array.isArray(selected.orders) ? selected.orders[0] : selected.orders) as unknown as { platform?: string; service_name?: string; status?: string; quantity?: number; refill_eligible?: boolean; services?: { delivery_time?: string; refill_policy?: string } | Array<{ delivery_time?: string; refill_policy?: string }> | null } | null) : null;
  const selectedService = selectedOrder ? (Array.isArray(selectedOrder.services) ? selectedOrder.services[0] : selectedOrder.services) : null;
  const { data: messages } = selectedId
    ? await supabase
        .from("support_messages")
        .select("id,sender_id,message,created_at,profiles(full_name,role)")
        .eq("ticket_id", selectedId)
        .order("created_at")
    : { data: [] };
  const { data: internalNotes } = selectedId ? await supabase.from("support_internal_notes").select("id,note,created_at").eq("ticket_id", selectedId).order("created_at",{ascending:false}) : { data: [] };

  return (
    <main className="mx-auto max-w-[1500px] p-4 sm:p-8">
      <AdminPageHeader
        title="Support tickets"
        description="Review customer issues, reply to conversations, and manage ticket status."
      />
      <form className="panel-card mt-5 grid gap-3 p-4 sm:grid-cols-4"><input name="q" defaultValue={searchParams?.q} className="min-h-11 rounded-xl border px-3 text-xs" placeholder="Search subject" /><select name="status" defaultValue={searchParams?.status || "all"} className="min-h-11 rounded-xl border px-3 text-xs"><option value="all">All statuses</option>{ticketStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_"," ")}</option>)}</select><input name="category" defaultValue={searchParams?.category} className="min-h-11 rounded-xl border px-3 text-xs" placeholder="Category" /><input name="order" defaultValue={searchParams?.order} className="min-h-11 rounded-xl border px-3 text-xs" placeholder="Related order UUID" /><button className={`${primaryButton} sm:col-span-4`}>Search support inbox</button></form>

      <div className="mt-5 flex flex-wrap gap-2">
        {["all", ...ticketStatuses].map((status) => (
          <Link
            key={status}
            href={status === "all" ? "/admin/support" : `/admin/support?status=${status}`}
            className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize ${
              searchParams?.status === status || (!searchParams?.status && status === "all")
                ? "bg-orange-600 text-white"
                : "border bg-white text-slate-500"
            }`}
          >
            {status}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="panel-card min-w-0 overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-bold text-white">Ticket queue</h2>
            <p className="mt-1 text-xs text-slate-400">{tickets?.length ?? 0} conversations</p>
          </div>
          <div className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto xl:max-h-[700px]">
            {(tickets ?? []).map((ticket) => {
              const profile = ticket.profiles as unknown as { full_name?: string; email?: string } | null;
              return (
                <Link
                  key={ticket.id}
                  href={`/admin/support?ticket=${ticket.id}`}
                  className={`block p-4 transition sm:p-5 ${selectedId === ticket.id ? "bg-orange-500/10" : "hover:bg-white/[.06]"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold text-orange-600">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                    <AdminStatus value={ticket.status} />
                  </div>
                  <p className="mt-3 truncate text-xs font-semibold">{ticket.subject}</p>
                  <p className="mt-2 truncate text-[10px] text-slate-400">
                    {profile?.full_name || profile?.email || "User"} · {new Date(ticket.created_at).toLocaleDateString("en-IN")}
                  </p>
                </Link>
              );
            })}
            {!tickets?.length && <p className="p-10 text-center text-xs text-slate-400">No support tickets found.</p>}
          </div>
        </section>

        <section className="panel-card flex min-h-[560px] min-w-0 flex-col overflow-hidden xl:max-h-[calc(100dvh-9rem)]">
          {selected ? (
            <>
              <header className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-orange-600">#{selected.id.slice(0, 8).toUpperCase()}</span>
                    <AdminStatus value={selected.status} />
                  </div>
                  <h2 className="mt-2 break-words text-sm font-bold">{selected.subject}</h2>
                  <p className="mt-1 text-[10px] text-slate-400">{selected.category?.replaceAll("_", " ")} · Order {selected.order_id ? selected.order_id.slice(0,8).toUpperCase() : "Not linked"}</p>
                </div>
                <form action={setTicketStatus} className="flex w-full gap-2 sm:w-auto">
                  <input type="hidden" name="ticket_id" value={selected.id} />
                  <select
                    name="status"
                    defaultValue={selected.status}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3 text-xs font-bold capitalize text-white sm:flex-none"
                  >
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                  <button className="min-h-11 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-bold text-white transition hover:-translate-y-0.5 active:scale-[.98]">Update</button>
                </form>
              </header>
              {selectedOrder ? <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-4 text-xs sm:grid-cols-3">{[["Platform",selectedOrder.platform],["Service",selectedOrder.service_name],["Order status",selectedOrder.status],["Quantity",Number(selectedOrder.quantity).toLocaleString("en-IN")],["Delivery",selectedService?.delivery_time || "Not specified"],["Refill",selectedOrder.refill_eligible ? (selectedService?.refill_policy || "Eligible") : "Not eligible"]].map(([label,value]) => <div key={label} className="rounded-xl bg-white/[.04] p-3"><p className="text-[9px] uppercase text-slate-400">{label}</p><p className="mt-1 break-words font-bold">{value}</p></div>)}</div> : null}

              <div className="max-h-[420px] flex-1 space-y-4 overflow-y-auto bg-[#0B0B0F]/70 p-4 sm:max-h-[520px] sm:p-6 xl:max-h-none">
                {(messages ?? []).map((message) => {
                  const sender = message.profiles as unknown as { full_name?: string; role?: string } | null;
                  const admin = sender?.role === "admin" || message.sender_id !== selected.user_id;
                  return (
                    <div key={message.id} className={`flex w-full gap-3 ${admin ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[92%] gap-3 sm:max-w-[78%] ${admin ? "flex-row-reverse" : ""}`}>
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[9px] font-bold text-white ${admin ? "bg-orange-600" : "bg-[#0B0B0F]"}`}>
                          {admin ? "ADM" : "USR"}
                        </span>
                        <div className="min-w-0">
                          <div className={`break-words rounded-2xl p-4 text-xs leading-6 shadow-sm ${admin ? "rounded-tr-sm bg-orange-600 text-white" : "rounded-tl-sm border border-white/10 bg-[#151515] text-[#D1D5DB]"}`}>
                            {message.message}
                          </div>
                          <p className={`mt-2 text-[9px] text-slate-400 ${admin ? "text-right" : ""}`}>
                            {admin ? "SocialRUSH Support" : sender?.full_name || "Customer"} · {new Date(message.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!messages?.length && <p className="py-10 text-center text-xs text-slate-400">No messages in this conversation.</p>}
              </div>

              <div className="border-t border-white/10 p-4"><h3 className="text-xs font-bold text-amber-300">Internal notes</h3><div className="mt-2 space-y-2">{(internalNotes ?? []).map((note) => <p key={note.id} className="rounded-xl bg-amber-500/10 p-3 text-xs">{note.note}<span className="mt-1 block text-[9px] text-slate-400">{new Date(note.created_at).toLocaleString("en-IN")}</span></p>)}</div><form action={addSupportInternalNote} className="mt-3 flex gap-2"><input type="hidden" name="ticket_id" value={selected.id} /><input name="note" required className="min-h-11 min-w-0 flex-1 rounded-xl border border-amber-400/25 bg-[#0B0B0F] px-3 text-xs text-white" placeholder="Admin-only note" /><button className="rounded-xl bg-amber-500 px-4 text-xs font-bold text-white">Add note</button></form></div>
              <form action={replyToTicket} className="sticky bottom-0 z-10 shrink-0 border-t border-orange-400/20 bg-[#111111] p-4 shadow-[0_-12px_30px_-24px_rgba(0,0,0,.65)] sm:p-5">
                <input type="hidden" name="ticket_id" value={selected.id} />
                <label htmlFor="admin-reply" className="text-xs font-bold text-orange-300">Reply as SocialRUSH Support</label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    id="admin-reply"
                    name="message"
                    required
                    rows={3}
                    className="min-h-24 min-w-0 flex-1 resize-y rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3 text-sm text-white outline-none placeholder:text-[#9CA3AF] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    placeholder={selected.status === "closed" ? "Replying will reopen this ticket as Answered." : "Write your reply to the customer..."}
                  />
                  <button className={`${primaryButton} min-h-11 w-full shrink-0 sm:w-auto`}>Send Reply</button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-slate-400">
              Choose a ticket to view its conversation.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
