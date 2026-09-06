"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/lib/ui/use-body-scroll-lock";

export default function MobileMenuLayer({
  open,
  onClose,
  children,
  topClassName = "top-[5.5rem]",
  showCloseButton = true,
  variant = "popover",
  hiddenFrom = "lg",
  initialFocusRef,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  topClassName?: string;
  showCloseButton?: boolean;
  variant?: "popover" | "drawer";
  hiddenFrom?: "lg" | "xl";
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusRef?: RefObject<HTMLElement>;
}) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
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

    const focusTimer = window.setTimeout(() => {
      (initialFocusRef?.current || dialogRef.current)?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [initialFocusRef, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      returnFocusRef?.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open, returnFocusRef]);

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

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (variant !== "drawer" || event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const visibilityClass = hiddenFrom === "xl" ? "xl:hidden" : "lg:hidden";

  return createPortal(
    <div
      ref={dialogRef}
      onKeyDown={trapFocus}
      className={variant === "drawer" ? `fixed inset-0 z-[99999] ${visibilityClass}` : `fixed inset-x-0 bottom-0 ${topClassName} z-[99999] ${visibilityClass}`}
      aria-modal="true"
      role="dialog"
      aria-label="Mobile navigation"
      tabIndex={-1}
    >
      <button type="button" tabIndex={-1} aria-label="Close menu backdrop" onClick={onClose} className={`absolute inset-0 h-full w-full cursor-default bg-[#050505]/80 backdrop-blur-[2px] ${variant === "drawer" ? "" : "bg-[#050505]/95"}`} />
      {variant === "drawer" ? (
        <div onClick={keepOpen} className="mobile-menu-theme absolute bottom-0 right-0 top-0 z-[100000] flex w-[min(92vw,25rem)] max-w-[25rem] flex-col overflow-hidden border-l border-orange-400/30 bg-[#0B0B0F] shadow-[-24px_0_60px_-24px_rgba(0,0,0,.9)]">
          {children}
        </div>
      ) : (
        <div className="absolute inset-0 z-[100000] overflow-y-auto overscroll-contain px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
          <div onClick={keepOpen} className="mobile-menu-theme relative">
          {showCloseButton ? (
            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-xl border border-orange-400/30 bg-[#151515] text-xl font-semibold text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.8)]"
            >
              ×
            </button>
          ) : null}
          {children}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
