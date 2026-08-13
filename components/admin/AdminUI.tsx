export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#D1D5DB]">{description}</p>
      </div>
      {action}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { adminStatusLabel, adminStatusTone } from "@/lib/admin/status";

export function AdminStatus({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${adminStatusTone(value)}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {adminStatusLabel(value)}
    </span>
  );
}

export function Modal({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-dashboard-primary px-4 py-3 text-sm font-semibold">{label}</button>
      {open ? (
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
        <button type="button" aria-label={`Close ${title}`} onClick={() => setOpen(false)} className="absolute inset-0 cursor-default" />
        <div role="dialog" aria-modal="true" aria-label={title} className="admin-modal relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto p-4 text-[#D1D5DB] shadow-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">{title}</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label={`Close ${title}`} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-xl text-[#D1D5DB]">×</button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
      ) : null}
    </>
  );
}

export const inputClass = "admin-input mt-2 w-full rounded-xl px-3.5 py-3 text-xs outline-none transition placeholder:text-[#747B89]";
export const primaryButton = "btn-dashboard-primary rounded-xl px-4 py-3 text-xs font-bold";
