"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  ["What is SocialRUSH?", "SocialRUSH is a premium social media growth platform that helps creators, influencers, brands, and businesses grow their presence across Instagram, YouTube, Facebook, and X."],
  ["Are the services safe?", "Yes. We use gradual delivery, secure ordering, refill support, and professional campaign tracking to make the process reliable."],
  ["How long does delivery take?", "Delivery time depends on the selected service and quantity. Most campaigns begin processing quickly and are completed within the displayed delivery period."],
  ["Do you offer refill support?", "Yes. Eligible services include refill protection during the mentioned refill period."],
  ["Can I track my order?", "Yes. Every order can be tracked directly from your SocialRUSH dashboard."],
  ["Which platforms do you support?", "We support Instagram, YouTube, Facebook, and Twitter/X growth services."],
  ["How do payments work?", "Users can add funds securely through supported payment methods and use their wallet balance to place orders."],
  ["Can agencies use SocialRUSH?", "Yes. SocialRUSH is designed for creators, businesses, resellers, agencies, and social media managers."],
];

function QuestionIcon({ index }: { index: number }) {
  const paths = [
    <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01"/></>,
    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    <><path d="M20 7 9 18l-5-5"/><path d="M16 3h5v5"/></>,
    <><path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="9"/></>,
    <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
    <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M18 15a6 6 0 0 1 4 6"/></>,
  ];
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[index]}</svg>;
}

export default function HomeFAQ() {
  const [active, setActive] = useState<number | null>(0);
  return <section id="faq" className="relative overflow-hidden bg-[#FFF8F1] px-5 py-20 sm:px-6 lg:px-8 lg:py-28"><div className="absolute left-[8%] top-20 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl"/><div className="absolute bottom-10 right-[5%] h-72 w-72 rounded-full bg-amber-200/20 blur-3xl"/><div className="hero-grid absolute inset-0 opacity-30"/><div className="relative mx-auto max-w-5xl"><motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl text-center"><span className="inline-flex rounded-full border border-orange-200 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-orange-600 shadow-sm backdrop-blur">Help center</span><h2 className="mt-5 text-3xl font-bold tracking-[-.04em] text-[#0B0B0F] sm:text-4xl lg:text-5xl">Frequently Asked Questions</h2><p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">Everything you need to know before starting your SocialRUSH growth campaign.</p></motion.div><div className="mt-12 grid gap-3 md:grid-cols-2">{faqs.map(([question,answer],index) => { const open = active === index; return <motion.article key={question} layout whileHover={{ y: -2 }} className={`group h-fit overflow-hidden rounded-2xl border bg-white/80 shadow-sm backdrop-blur-xl transition ${open ? "border-orange-300 shadow-xl shadow-orange-900/5" : "border-white hover:border-orange-200"}`}><button type="button" onClick={() => setActive(open ? null : index)} className={`flex w-full items-center gap-4 p-5 text-left transition ${open ? "bg-gradient-to-r from-orange-50 to-amber-50" : "hover:bg-gradient-to-r hover:from-orange-50/70 hover:to-transparent"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${open ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-orange-50 text-orange-600"}`}><QuestionIcon index={index}/></span><span className="flex-1 text-sm font-bold text-[#0B0B0F]">{question}</span><motion.span animate={{ rotate: open ? 45 : 0 }} className="grid h-7 w-7 place-items-center rounded-full bg-white text-lg text-orange-600 shadow-sm">+</motion.span></button><AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}><p className="border-t border-orange-100/60 px-5 py-5 pl-[5.75rem] text-xs leading-6 text-slate-500 sm:text-sm sm:leading-7">{answer}</p></motion.div>}</AnimatePresence></motion.article>; })}</div></div></section>;
}
