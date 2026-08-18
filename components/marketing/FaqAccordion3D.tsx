"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = { question: string; answer: string; related?: { href: string; label: string } };

export default function FaqAccordion3D({ items, idPrefix = "faq" }: { items: FaqItem[]; idPrefix?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return <div className="space-y-3">{items.map((item, index) => {
    const open = openIndex === index; const id = `${idPrefix}-answer-${index}`;
    return <article data-faq-accordion key={item.question} className={`overflow-hidden rounded-2xl border bg-[#10131d] shadow-[0_14px_32px_-22px_rgba(0,0,0,.75)] transition ${open ? "border-orange-400/35" : "border-white/10 hover:border-white/20"}`}><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpenIndex(open ? null : index)} className="flex min-h-[4.5rem] w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-orange-400 sm:px-5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-400/10 text-xs font-black text-orange-200">{String(index + 1).padStart(2, "0")}</span><h3 className="flex-1 text-sm font-black leading-6 text-white sm:text-base">{item.question}</h3><ChevronDown className={`h-5 w-5 shrink-0 text-orange-300 transition-transform ${open ? "rotate-180" : ""}`} /></button><div id={id} className={`grid transition-[grid-template-rows,opacity] duration-200 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5"><p className="text-sm leading-7 text-slate-300">{item.answer}</p>{item.related && <Link href={item.related.href} className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-orange-400/25 bg-orange-400/[.1] px-3 text-xs font-black text-orange-100 hover:bg-orange-400/[.16]">{item.related.label} <span aria-hidden className="ml-1">→</span></Link>}</div></div></div></article>;
  })}</div>;
}
