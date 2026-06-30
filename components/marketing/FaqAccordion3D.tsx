"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqAccordion3D({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <motion.article
            key={item.question}
            layout
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_18px_42px_-20px_rgba(15,23,42,.26)] backdrop-blur-xl"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
              className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-sky-500 text-xs font-black text-white shadow-[0_10px_24px_rgba(236,72,153,.35)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="flex-1 text-sm font-bold leading-6 text-slate-900 sm:text-base">{item.question}</h3>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/80 bg-white text-slate-500 shadow-sm transition duration-300 ${
                  isOpen ? "rotate-180 text-sky-600" : "rotate-0"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>

            <div
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                  <p className="border-t border-sky-100/80 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600 sm:px-6 sm:pb-6 sm:text-[15px]">
                    {item.answer}
                  </p>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
