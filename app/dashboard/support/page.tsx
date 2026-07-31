"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BadgeHelp, Mail, MessageSquare, Ticket, WalletCards, CircleAlert } from "lucide-react";

type TicketType = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  category: string;
  order_id: string | null;
  orders?: { platform?: string; service_name?: string; status?: string; refill_eligible?: boolean; services?: { refill_policy?: string } | null } | null;
};

type MessageType = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

const categories = [["order_pending","Order pending"],["partial_delivery","Partial delivery"],["drop_or_refill","Drop or refill"],["incorrect_public_link","Incorrect public link"],["cancellation_request","Cancellation request"],["payment_or_wallet","Payment or wallet issue"],["account_issue","Account issue"],["service_availability","Service availability"],["other","Other"]] as const;

const statusStyle: Record<string, string> = {
  open: "bg-orange-500/10 text-orange-200 ring-orange-400/25",
  waiting_for_support: "bg-amber-500/10 text-amber-200 ring-amber-400/25",
  waiting_for_customer: "bg-blue-500/10 text-blue-200 ring-blue-400/25",
  resolved: "bg-emerald-500/10 text-emerald-200 ring-emerald-400/25",
  closed: "bg-white/5 text-[#D1D5DB] ring-white/10",
};

const supportCards = [
  {
    title: "Create Ticket",
    description: "Open a tracked support request with full conversation history.",
    action: "Open form",
    icon: Ticket,
  },
  {
    title: "WhatsApp Support",
    description: "Chat instantly for quick order and payment guidance.",
    action: "Start support",
    href: "https://wa.me/918860330771",
    icon: MessageSquare,
  },
  {
    title: "Email Support",
    description: "Share details and evidence with our support team.",
    action: "Send email",
    href: "mailto:support@getsocialrush.com",
    icon: Mail,
  },
  {
    title: "FAQs",
    description: "Find quick answers to common billing and service questions.",
    action: "View FAQs",
    href: "/faq",
    icon: BadgeHelp,
  },
  {
    title: "Order Issue",
    description: "Report delivery delays, status mismatches, or link problems.",
    action: "New ticket",
    icon: CircleAlert,
  },
  {
    title: "Payment Issue",
    description: "Get help with wallet funding, receipts, and payment status.",
    action: "New ticket",
    icon: WalletCards,
  },
] as const;

function parseSubject(subject: string) {
  const match = subject.match(/^\[([^\]]+)]\s*(.*)$/);
  return {
    category: match?.[1] || "General",
    title: match?.[2] || subject,
  };
}

export default function SupportPage() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [activeId, setActiveId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Array<{ id:string; platform:string; service_name:string; status:string; refill_eligible:boolean }>>([]);
  const [email, setEmail] = useState("");

  const activeTicket = useMemo(
    () => tickets.find((item) => item.id === activeId),
    [tickets, activeId],
  );

  const loadTickets = useCallback(async () => {
    setLoading(true); setError("");
    const response = await fetch("/api/support/tickets");
    const payload = (await response.json()) as { data?: TicketType[]; error?: string };
    if (!response.ok) { setError(payload.error || "Tickets could not be loaded."); setLoading(false); return; }
    const rows = payload.data ?? [];
    setTickets(rows);
    setActiveId((current) => current || rows[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTickets();
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => { setUserId(data.user?.id || ""); setEmail(data.user?.email || ""); });
    void supabase.from("orders").select("id,platform,service_name,status,refill_eligible").order("created_at",{ascending:false}).limit(100).then(({data}) => setOrders((data as typeof orders | null) || []));
  }, [loadTickets]);

  useEffect(() => {
    if (searchParams.get("order")) setCreating(true);
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    const supabase = createClient();
    void supabase
      .from("support_messages")
      .select("id, sender_id, message, created_at")
      .eq("ticket_id", activeId)
      .order("created_at")
      .then(({ data }) => setMessages((data as MessageType[] | null) ?? []));
  }, [activeId]);

  async function createTicket(formData: FormData) {
    const category = String(formData.get("category") || "");
    const subject = String(formData.get("subject") || "");
    const reference = String(formData.get("payment_reference") || "").trim();
    const message = `${String(formData.get("message") || "")}${reference ? `\n\nPayment/transaction reference: ${reference}` : ""}`;
    const orderId = String(formData.get("order_id") || "") || null;

    const response = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subject, message, orderId }),
    });

    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (response.ok) {
      setCreating(false);
      setToast("Ticket created successfully");
      await loadTickets();
      window.setTimeout(() => setToast(""), 2500);
    } else setError(payload.error || "Ticket could not be created.");
  }

  async function sendReply(formData: FormData) {
    const message = String(formData.get("message") || "").trim();
    if (!activeId || !userId || !message) return;

    const supabase = createClient();
    const { error: replyError } = await supabase.rpc("reply_to_support_ticket", { p_ticket_id: activeId, p_message: message });
    if (replyError) { setError(replyError.message); return; }

    const { data } = await supabase
      .from("support_messages")
      .select("id, sender_id, message, created_at")
      .eq("ticket_id", activeId)
      .order("created_at");

    setMessages((data as MessageType[] | null) ?? []);
    await loadTickets();
  }

  async function closeTicket() {
    if (!activeTicket) return;
    await createClient().rpc("resolve_my_support_ticket", { p_ticket_id: activeTicket.id });
    await loadTickets();
  }

  const filteredTickets = useMemo(() => tickets.filter((ticket) => (statusFilter === "all" || ticket.status === statusFilter) && `${ticket.id} ${ticket.order_id || ""} ${ticket.subject} ${ticket.status}`.toLowerCase().includes(search.toLowerCase())), [tickets, search, statusFilter]);
  const ticketSummary = useMemo(() => ({ open: tickets.filter((item) => ["open","waiting_for_support","waiting_for_customer"].includes(item.status)).length, waiting: tickets.filter((item) => item.status === "waiting_for_customer").length, resolved: tickets.filter((item) => ["resolved","closed"].includes(item.status)).length }), [tickets]);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1550px]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2rem] border border-orange-400/25 bg-[#111111] p-6 shadow-[0_26px_60px_-36px_rgba(255,122,0,.45)] backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-orange-200">
                Customer care
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">Support Centre</h1>
              <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">Get help with orders, payments, delivery, refill eligibility or account questions.</p>
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="btn-dashboard-primary mt-5 inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm"
              >
                <Ticket className="h-4 w-4" />
                Create Support Ticket
              </button>
            </div>
            <motion.article whileHover={{ y: -4 }} className="rounded-[1.6rem] border border-orange-400/25 bg-[#151515] p-5 shadow-[0_20px_42px_-28px_rgba(255,122,0,.45)]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9CA3AF]">Support profile</p>
              <p className="mt-3 text-sm font-semibold text-[#FF9F00]">Secure account support</p>
              <p className="mt-1 text-xs text-[#D1D5DB]">Include the related order when your issue concerns delivery or refill eligibility.</p>
              <p className="mt-1 text-xs text-[#D1D5DB]">Never share passwords, OTPs, UPI PINs, CVV or recovery codes.</p>
            </motion.article>
          </div>
        </motion.section>

        {toast ? (
          <p className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">{toast}</p>
        ) : null}
        {error ? <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm font-semibold text-red-200">{error}</p> : null}
        <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{[["Open tickets",ticketSummary.open],["Waiting for reply",ticketSummary.waiting],["Resolved",ticketSummary.resolved]].map(([label,value]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#111111] p-3 sm:p-4"><p className="text-[9px] font-black uppercase tracking-wider text-[#9CA3AF]">{label}</p><p className="mt-2 text-xl font-black text-white">{value}</p></article>)}</section>
        <section className="mt-4 grid gap-3 rounded-2xl border border-orange-400/20 bg-[#111111] p-3 sm:grid-cols-[1fr_220px]"><input value={search} onChange={(event) => setSearch(event.target.value)} className="dashboard-input" placeholder="Search ticket ID, order ID or subject" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="dashboard-input"><option value="all">All statuses</option><option value="open">Open</option><option value="waiting_for_support">Waiting for Support</option><option value="waiting_for_customer">Waiting for Customer</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {supportCards.map((card, index) => {
            const Icon = card.icon;
            const cardContent = (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-orange-400/20 bg-[#111111] p-5 text-left shadow-[0_20px_44px_-30px_rgba(255,122,0,.45)] backdrop-blur-xl"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_14px_28px_-18px_rgba(255, 196, 0, .65)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-sm font-black text-white">{card.title}</h2>
                <p className="mt-2 text-xs leading-6 text-[#D1D5DB]">{card.description}</p>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#FF9F00]">{card.action}</p>
              </motion.article>
            );

            if ("href" in card && card.href) {
              return (
                <Link key={card.title} href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                  {cardContent}
                </Link>
              );
            }

            return (
              <button key={card.title} type="button" onClick={() => setCreating(true)} className="text-left">
                {cardContent}
              </button>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-3xl border border-orange-400/25 bg-[#111111] shadow-[0_22px_52px_-34px_rgba(255,122,0,.45)] backdrop-blur-xl">
            <div className="border-b border-orange-400/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-white">Ticket history</h2>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">{tickets.length} conversations</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="max-h-[650px] divide-y divide-white/10 overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-xl bg-[#151515]" />
                  ))}
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const parsed = { title: parseSubject(ticket.subject).title, category: ticket.category?.replaceAll("_", " ") || parseSubject(ticket.subject).category };
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setActiveId(ticket.id)}
                      className={`w-full p-5 text-left transition ${
                        activeId === ticket.id ? "bg-orange-500/10" : "hover:bg-white/[.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-[#FF9F00]">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${statusStyle[ticket.status] || statusStyle.open}`}>
                          {ticket.status === "waiting_for_customer" ? "Waiting for Your Reply" : ticket.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-3 truncate text-xs font-bold text-white">{parsed.title}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#9CA3AF]">
                        <span>{parsed.category}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </button>
                  );
                })
              )}

              {!loading && filteredTickets.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-black text-white">{tickets.length ? "No matching tickets" : "No support tickets yet"}</p>
                  <p className="mt-2 text-xs text-[#D1D5DB]">{tickets.length ? "Try another search or status filter." : "When you need help with an order or account issue, create a ticket here."}</p>
                </div>
              ) : null}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col overflow-hidden rounded-3xl border border-orange-400/25 bg-[#111111] shadow-[0_22px_52px_-34px_rgba(255,122,0,.45)] backdrop-blur-xl">
            {activeTicket ? (
              <>
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-400/20 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#FF9F00]">#{activeTicket.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${statusStyle[activeTicket.status] || statusStyle.open}`}>
                        {activeTicket.status === "waiting_for_customer" ? "Waiting for Your Reply" : activeTicket.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <h2 className="mt-2 text-sm font-black text-white">{parseSubject(activeTicket.subject).title}</h2>
                    <p className="mt-1 text-[11px] capitalize text-[#9CA3AF]">{activeTicket.category?.replaceAll("_", " ") || parseSubject(activeTicket.subject).category}</p>
                    <p className="mt-1 text-[10px] text-[#9CA3AF]">Created {new Date(activeTicket.created_at).toLocaleString("en-IN")} · Updated {new Date(activeTicket.updated_at).toLocaleString("en-IN")}</p>
                    {activeTicket.order_id ? <Link href={`/dashboard/orders/${activeTicket.order_id}`} className="mt-2 inline-flex text-xs font-bold text-orange-300">View Related Order</Link> : null}
                  </div>

                  <button
                    type="button"
                    onClick={closeTicket}
                    className="rounded-xl border border-orange-400/25 bg-[#151515] px-4 py-2 text-[11px] font-bold text-[#D1D5DB] hover:border-orange-400/50 hover:text-white transition hover:-translate-y-0.5"
                  >
                    Mark as Resolved
                  </button>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto bg-[#0B0B0F] p-5 sm:p-7">
                  {messages.map((message) => {
                    const mine = message.sender_id === userId;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-xs leading-6 shadow-sm ${
                            mine
                              ? "rounded-br-sm bg-gradient-to-r from-[#FF9F00] to-[#FF9F00] text-white"
                              : "rounded-bl-sm border border-orange-400/20 bg-[#151515] text-[#D1D5DB]"
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`mt-2 text-[10px] ${mine ? "text-orange-100" : "text-[#9CA3AF]"}`}>
                            {new Date(message.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {messages.length === 0 ? <p className="py-14 text-center text-xs text-[#D1D5DB]">No messages yet.</p> : null}
                </div>

                {!(["closed","resolved"].includes(activeTicket.status)) ? (
                  <form action={sendReply} className="border-t border-orange-400/20 p-4 sm:p-5">
                    <textarea
                      name="message"
                      required
                      rows={2}
                      className="dashboard-input min-h-[110px] resize-none"
                      placeholder="Write your reply..."
                    />
                    <button className="btn-dashboard-primary mt-3 inline-flex min-h-11 w-full items-center justify-center px-5 py-2.5 text-sm sm:w-auto">
                      Send reply
                    </button>
                  </form>
                ) : (
                  <p className="border-t border-orange-400/20 p-5 text-xs font-semibold text-[#D1D5DB]">This ticket has been closed.</p>
                )}
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <p className="text-sm font-black text-white">Select a ticket</p>
                  <p className="mt-2 text-xs text-[#D1D5DB]">Choose a conversation or create a new support request.</p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>

      <AnimatePresence>
        {creating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl rounded-3xl border border-orange-400/30 bg-[#111111] p-6 text-[#D1D5DB] shadow-[0_30px_90px_-40px_rgba(0,0,0,.9)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF9F00]">New support request</p>
                  <h2 className="mt-2 text-xl font-black text-white">Create a ticket</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[.06] text-lg text-white transition hover:bg-orange-500/10"
                >
                  ×
                </button>
              </div>

              <form action={createTicket} className="mt-6 space-y-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">
                  Category
                  <select name="category" required defaultValue={searchParams.get("category") || (searchParams.get("status") === "partial" ? "partial_delivery" : "other")} className="dashboard-input mt-2">
                    {categories.map(([value,label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">Related order<select name="order_id" defaultValue={searchParams.get("orderId") || ""} className="dashboard-input mt-2"><option value="">No related order</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.id.slice(0,8).toUpperCase()} · {order.platform} · {order.service_name} · {order.status.replaceAll("_"," ")}</option>)}</select></label>
                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">Contact email<input value={email} readOnly className="dashboard-input mt-2 opacity-75" /></label>

                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">
                  Subject
                  <input
                    name="subject"
                    required
                    minLength={3}
                    defaultValue={searchParams.get("order") ? `Support for order ${searchParams.get("order")}` : ""}
                    className="dashboard-input mt-2"
                    placeholder="Briefly describe the issue"
                  />
                </label>

                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">Payment or transaction reference (optional)<input name="payment_reference" defaultValue={searchParams.get("payment") || searchParams.get("transaction") || ""} className="dashboard-input mt-2" placeholder="Reference ID only" /></label>

                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300">
                  Message
                  <textarea
                    name="message"
                    required
                    rows={5}
                    defaultValue={searchParams.get("order") ? `Order ID: ${searchParams.get("order")}\nPlatform: ${searchParams.get("platform") || ""}\nService: ${searchParams.get("service") || ""}\nCurrent status: ${(searchParams.get("status") || "").replaceAll("_", " ")}\n\nPlease describe what you need help with:` : searchParams.get("transaction") ? `Transaction ID: ${searchParams.get("transaction")}\nPayment status: ${(searchParams.get("status") || "").replaceAll("_", " ")}\n\nPlease describe the payment or wallet issue:` : ""}
                    className="dashboard-input mt-2 resize-none"
                    placeholder="Include relevant order or transaction details..."
                  />
                </label>

                <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-4 text-[11px] font-semibold leading-5 text-amber-100">For your security, never provide card numbers, CVV, UPI PIN, OTP, passwords or recovery codes. Secure attachment storage is not configured, so attachments are not accepted.</div>

                <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_34px_-18px_rgba(255, 196, 0, .62)] transition hover:-translate-y-0.5">
                  Confirm &amp; Create Ticket
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
