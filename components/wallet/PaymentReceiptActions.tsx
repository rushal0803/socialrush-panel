"use client";
import { Copy, Printer } from "lucide-react";
import { useState } from "react";

export default function PaymentReceiptActions({ reference }: { reference: string }) {
  const [copied,setCopied]=useState(false);
  async function copy(){await navigator.clipboard.writeText(reference);setCopied(true);window.setTimeout(()=>setCopied(false),1500);}
  return <div className="flex flex-wrap gap-2 print:hidden"><button type="button" onClick={()=>void copy()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-slate-200"><Copy className="h-4 w-4"/>{copied?"Copied":"Copy reference"}</button><button type="button" onClick={()=>window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black text-black"><Printer className="h-4 w-4"/>Print / Save PDF</button></div>;
}
