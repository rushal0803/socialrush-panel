"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/lib/ui/use-body-scroll-lock";

export default function MobileMenuLayer({
  open,
  onClose,
  children,
  topClassName = "top-[5.5rem]",
  showCloseButton = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  topClassName?: string;
  showCloseButton?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useBodyScrollLock(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  if (!mounted || !open) return null;

  const keepOpen = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-x-0 bottom-0 ${topClassName} z-[99999] lg:hidden`}
      aria-modal="true"
      role="dialog"
      aria-label="Mobile navigation"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />
      <div className="absolute inset-0 z-[100000] overflow-y-auto overscroll-contain px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <div onClick={keepOpen} className="relative">
          {showCloseButton ? (
            <button
              type="button"
              aria-label="Close mobile navigation"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white/95 text-xl font-semibold text-slate-600 shadow-lg"
            >
              ×
            </button>
          ) : null}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
