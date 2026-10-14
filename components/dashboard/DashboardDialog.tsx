"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/lib/ui/use-body-scroll-lock";
import styles from "./PremiumWorkspace.module.css";

/** Viewport-bound customer dialog shared by workspace tools. */
export default function DashboardDialog({ open, label, onClose, initialFocusRef, children }: {
  open: boolean;
  label: string;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open || !mounted) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => (initialFocusRef?.current || root.current)?.focus());
    return () => {
      cancelAnimationFrame(frame);
      if (previous?.isConnected) previous.focus();
    };
  }, [open, mounted, initialFocusRef]);

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const targets = Array.from(root.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]',
    ) || []).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert], [aria-hidden="true"]'));
    if (!targets.length) { event.preventDefault(); root.current?.focus(); return; }
    const current = targets.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? (event.shiftKey ? targets.length - 1 : 0) : (current + (event.shiftKey ? -1 : 1) + targets.length) % targets.length;
    event.preventDefault();
    targets[next].focus();
  }

  if (!mounted || !open) return null;
  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
      className={styles.dialogOverlay} onKeyDown={handleKey}
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialogSurface}>{children}</section>
    </div>, document.body,
  );
}
