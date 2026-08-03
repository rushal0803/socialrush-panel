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

  useEffect(() => {
    if (!open) return;

    // Safari can restore a page from the back-forward cache without changing
    // the pathname. Close the portal before it can remain above the dashboard.
    const closeForNavigation = () => onClose();
    window.addEventListener("popstate", closeForNavigation);
    window.addEventListener("pagehide", closeForNavigation);
    window.addEventListener("pageshow", closeForNavigation);
    return () => {
      window.removeEventListener("popstate", closeForNavigation);
      window.removeEventListener("pagehide", closeForNavigation);
      window.removeEventListener("pageshow", closeForNavigation);
    };
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
      <div aria-hidden="true" className="absolute inset-0 bg-[#050505]/95" />
      <div className="absolute inset-0 z-[100000] overflow-y-auto overscroll-contain px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <div onClick={keepOpen} className="mobile-menu-theme relative">
          {showCloseButton ? (
            <button
              type="button"
              aria-label="Close mobile navigation"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-xl border border-orange-400/30 bg-[#151515] text-xl font-semibold text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.8)]"
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
