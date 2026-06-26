"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { chatbotPolicies, findChatbotAnswer, quickQuestions } from "@/lib/chatbot/knowledge";

type Message = { id: number; role: "assistant" | "user"; text: string };

function ChatIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.5-5A9 9 0 1 1 21 12Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>;
}

export default function AIChatbot() {
  const pathname = usePathname();
  const allowed = pathname === "/" || pathname.startsWith("/dashboard");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", text: chatbotPolicies.welcomeMessage }]);
  const nextId = useRef(2);
  if (!allowed) return null;

  async function ask(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setMessages((items) => [...items, { id: nextId.current++, role: "user", text: message }]); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const payload = await response.json() as { answer?: string };
      setMessages((items) => [...items, { id: nextId.current++, role: "assistant", text: payload.answer || findChatbotAnswer(message) }]);
    } catch { setMessages((items) => [...items, { id: nextId.current++, role: "assistant", text: findChatbotAnswer(message) }]); }
    finally { setLoading(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void ask(input); }

  return <><AnimatePresence>{open && <motion.aside initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }} transition={{ duration: .22 }} className="fixed bottom-24 left-4 right-4 z-[70] flex max-h-[min(680px,calc(100vh-6.5rem))] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-[0_30px_100px_-25px_rgba(4,20,50,.55)] backdrop-blur-2xl sm:bottom-24 sm:left-auto sm:right-6 sm:h-[620px] sm:w-[390px]"><header className="relative overflow-hidden bg-gradient-to-br from-[#07152f] to-blue-700 p-5 text-white"><div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-cyan-400/15 blur-2xl"/><div className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-blue-200 ring-1 ring-white/15"><ChatIcon/></span><div className="flex-1"><h2 className="text-sm font-bold">SocialRUSH AI Assistant</h2><p className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-200"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"/>Online · Usually replies instantly</p></div><button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-lg hover:bg-white/20">×</button></div></header><div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f8faff,#fff)] p-4">{messages.map((message) => <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-6 shadow-sm ${message.role === "user" ? "rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm border border-slate-100 bg-white text-slate-600"}`}>{message.text}</div></motion.div>)}{loading && <div className="flex"><div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">{[0,1,2].map((item) => <motion.i key={item} animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, delay: item * .13 }} className="h-1.5 w-1.5 rounded-full bg-blue-400"/>)}</div></div>}{messages.length < 3 && <div><p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Quick questions</p><div className="flex flex-wrap gap-2">{quickQuestions.map((question) => <button key={question} onClick={() => void ask(question)} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-left text-[9px] font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100">{question}</button>)}</div></div>}</div><div className="border-t border-slate-100 bg-white p-3"><form onSubmit={submit} className="flex items-end gap-2"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void ask(input); } }} rows={1} maxLength={1000} className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Ask about campaigns, payments, delivery..."/><button disabled={!input.trim() || loading} className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 disabled:opacity-40" aria-label="Send message">→</button></form><div className="mt-2 flex items-center justify-between px-1"><p className="text-[8px] text-slate-400">AI guidance · No account data accessed</p><Link href="/dashboard/support" className="text-[8px] font-bold text-blue-600">Create Support Ticket</Link></div></div></motion.aside>}</AnimatePresence><motion.button onClick={() => setOpen(!open)} whileHover={{ y: -3 }} whileTap={{ scale: .96 }} className="fixed bottom-4 right-4 z-[69] flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-xs font-bold text-white shadow-[0_15px_40px_-10px_rgba(37,99,235,.65)] sm:bottom-6 sm:right-6" aria-label="Open AI support chat"><span className="relative grid h-7 w-7 place-items-center rounded-full bg-white/15"><ChatIcon className="h-4 w-4"/><i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-blue-600 bg-emerald-400"/></span>{open ? "Close" : "Need Help?"}</motion.button></>;
}

