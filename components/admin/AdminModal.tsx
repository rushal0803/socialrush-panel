"use client";

import { useEffect, useState } from "react";

export default function AdminModal({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-dashboard-primary px-4 py-3 text-sm font-semibold"
      >
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="admin-modal relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto p-4 text-[#D1D5DB] shadow-2xl sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={`Close ${title}`}
                className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-xl text-[#D1D5DB]"
              >
                ×
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
