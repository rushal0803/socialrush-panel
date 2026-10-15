"use client";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
const SearchDialog = dynamic(() => import("./DashboardSearchDialog"));

export default function DashboardSearch() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!document.querySelector('[role="dialog"][aria-modal="true"]')) setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return <div>
    <button type="button" onClick={event => { event.currentTarget.focus(); setOpen(true); }} aria-label="Search orders and support tickets" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-slate-100 transition hover:border-orange-400/35 hover:bg-orange-500/[.08] sm:w-auto sm:px-3"><Search className="h-4 w-4" /><span className="ml-2 hidden text-xs font-bold sm:inline">Search</span></button>
    {open ? <SearchDialog onClose={close} /> : null}
  </div>;
}
