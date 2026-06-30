"use client";

import { useEffect } from "react";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const body = document.body;
    const root = document.documentElement;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyPaddingRight = body.style.paddingRight;
    const originalRootOverflow = root.style.overflow;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    body.style.overflow = "hidden";
    body.style.paddingRight =
      scrollbarWidth > 0 ? `${scrollbarWidth}px` : originalBodyPaddingRight;
    root.style.overflow = "hidden";

    return () => {
      body.style.overflow = originalBodyOverflow;
      body.style.paddingRight = originalBodyPaddingRight;
      root.style.overflow = originalRootOverflow;
    };
  }, [locked]);
}
