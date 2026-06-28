"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BadgeHelp, Mail, MessageSquare, Ticket, WalletCards, CircleAlert } from "lucide-react";

type TicketType = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
};

type MessageType = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

const categories = ["Order issue", "Payment issue", "Refill request", "Account issue", "Service question"];

const statusStyle: Record<string, string> = {
  open: "bg-blue-100/80 text-blue-700 ring-blue-600/20",
  answered: "bg-emerald-100/80 text-emerald-700 ring-emerald-600/20",
  waiting: "bg-amber-100/80 text-amber-700 ring-amber-600/20",
  closed: "bg-slate-100/80 text-slate-700 ring-slate-600/20",
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
    href: "mailto:support@socialrush.in",
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
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [activeId, setActiveId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");

  const activeTicket = useMemo(
    () => tickets.find((item) => item.id === activeId),
    [tickets, activeId],
  );

  const loadTickets = useCallback(async () => {
    const response = await fetch("/api/support/tickets");
    const payload = (await response.json()) as { data?: TicketType[] };
    const rows = payload.data ?? [];
    setTickets(rows);
    setActiveId((current) => current || rows[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTickets();
    void createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id || ""));
  }, [loadTickets]);

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
    const message = String(formData.get("message") || "");

    const response = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: `[${category}] ${subject}`, message }),
    });

    if (response.ok) {
      setCreating(false);
      setToast("Ticket created successfully");
      await loadTickets();
      window.setTimeout(() => setToast(""), 2500);
    }
  }

  async function sendReply(formData: FormData) {
    const message = String(formData.get("message") || "").trim();
    if (!activeId || !userId || !message) return;

    const supabase = createClient();
    await supabase.from("support_messages").insert({ ticket_id: activeId, sender_id: userId, message });
    await supabase.from("support_tickets").update({ status: "open" }).eq("id", activeId);

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
    await createClient().from("support_tickets").update({ status: "closed" }).eq("id", activeTicket.id);
    await loadTickets();
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1550px]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_26px_60px_-36px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/85 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#4f6aa0]">
                Customer care
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-[#112a5c] sm:text-4xl">Support Center</h1>
              <p className="mt-2 text-sm leading-7 text-[#5d75a7]">Get professional help with campaigns, payments, refills, and your account.</p>
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="btn-dashboard-primary mt-5 inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm"
              >
                <Ticket className="h-4 w-4" />
                Create ticket
              </button>
            </div>
            <motion.article whileHover={{ y: -4 }} className="rounded-[1.6rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_42px_-28px_rgba(15,23,42,.4)]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6e85b1]">Support profile</p>
              <p className="mt-3 text-sm font-semibold text-[#40609a]">Average response time: 30-90 minutes</p>
              <p className="mt-1 text-xs text-[#5f79ab]">Support hours: 24/7 for active orders</p>
              <p className="mt-1 text-xs text-[#5f79ab]">Include order or payment ID for faster resolution</p>
            </motion.article>
          </div>
        </motion.section>

        {toast ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{toast}</p>
        ) : null}

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
                className="rounded-3xl border border-white/85 bg-white/85 p-5 text-left shadow-[0_20px_44px_-30px_rgba(15,23,42,.35)] backdrop-blur-xl"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_14px_28px_-18px_rgba(117,109,255,.65)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-sm font-black text-[#17366f]">{card.title}</h2>
                <p className="mt-2 text-xs leading-6 text-[#5f79ab]">{card.description}</p>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#3f64a5]">{card.action}</p>
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
          <aside className="overflow-hidden rounded-3xl border border-white/85 bg-white/90 shadow-[0_22px_52px_-34px_rgba(15,23,42,.4)] backdrop-blur-xl">
            <div className="border-b border-[#e6eeff] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-[#17366f]">Ticket history</h2>
                  <p className="mt-1 text-[11px] text-[#6f86b2]">{tickets.length} conversations</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="max-h-[650px] divide-y divide-[#edf3ff] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-xl bg-[#eef4ff]" />
                  ))}
                </div>
              ) : (
                tickets.map((ticket) => {
                  const parsed = parseSubject(ticket.subject);
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setActiveId(ticket.id)}
                      className={`w-full p-5 text-left transition ${
                        activeId === ticket.id ? "bg-[#edf4ff]" : "hover:bg-[#f7faff]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-[#3f64a5]">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${statusStyle[ticket.status] || statusStyle.open}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="mt-3 truncate text-xs font-bold text-[#17366f]">{parsed.title}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#6f86b2]">
                        <span>{parsed.category}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </button>
                  );
                })
              )}

              {!loading && tickets.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm font-black text-[#17366f]">No tickets yet</p>
                  <p className="mt-2 text-xs text-[#6f86b2]">Create a ticket whenever you need help.</p>
                </div>
              ) : null}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col overflow-hidden rounded-3xl border border-white/85 bg-white/90 shadow-[0_22px_52px_-34px_rgba(15,23,42,.4)] backdrop-blur-xl">
            {activeTicket ? (
              <>
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e6eeff] p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#3f64a5]">#{activeTicket.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${statusStyle[activeTicket.status] || statusStyle.open}`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    <h2 className="mt-2 text-sm font-black text-[#17366f]">{parseSubject(activeTicket.subject).title}</h2>
                    <p className="mt-1 text-[11px] text-[#6f86b2]">{parseSubject(activeTicket.subject).category}</p>
                  </div>

                  <button
                    type="button"
                    onClick={closeTicket}
                    className="rounded-xl border border-[#dce7ff] bg-white px-4 py-2 text-[11px] font-bold text-[#5974a7] transition hover:-translate-y-0.5"
                  >
                    Close ticket
                  </button>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8fbff]/80 p-5 sm:p-7">
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
                              ? "rounded-br-sm bg-gradient-to-r from-[#4d6cf4] to-[#5f9dff] text-white"
                              : "rounded-bl-sm border border-[#e3ecff] bg-white text-[#4a6597]"
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`mt-2 text-[10px] ${mine ? "text-blue-100" : "text-[#89a0c8]"}`}>
                            {new Date(message.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {messages.length === 0 ? <p className="py-14 text-center text-xs text-[#7a90ba]">No messages yet.</p> : null}
                </div>

                {activeTicket.status !== "closed" ? (
                  <form action={sendReply} className="border-t border-[#e6eeff] p-4 sm:p-5">
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
                  <p className="border-t border-[#e6eeff] p-5 text-xs font-semibold text-[#6f86b2]">This ticket has been closed.</p>
                )}
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <p className="text-sm font-black text-[#17366f]">Select a ticket</p>
                  <p className="mt-2 text-xs text-[#6f86b2]">Choose a conversation or create a new support request.</p>
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
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,.75)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3f64a5]">New support request</p>
                  <h2 className="mt-2 text-xl font-black text-[#17366f]">Create a ticket</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf4ff] text-lg text-[#4f6aa0]"
                >
                  ×
                </button>
              </div>

              <form action={createTicket} className="mt-6 space-y-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f79ab]">
                  Category
                  <select name="category" required className="dashboard-input mt-2">
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f79ab]">
                  Subject
                  <input
                    name="subject"
                    required
                    minLength={3}
                    className="dashboard-input mt-2"
                    placeholder="Briefly describe the issue"
                  />
                </label>

                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f79ab]">
                  Message
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="dashboard-input mt-2 resize-none"
                    placeholder="Include relevant order or transaction details..."
                  />
                </label>

                <div className="rounded-xl border border-dashed border-[#cfdfff] bg-[#f7faff] p-4 text-center text-[11px] font-semibold text-[#5f79ab]">
                  Attach screenshot or payment proof
                  <span className="mt-1 block text-[10px] text-[#87a0c8]">Attachment upload coming soon</span>
                </div>

                <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_34px_-18px_rgba(117,109,255,.62)] transition hover:-translate-y-0.5">
                  Submit ticket
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
