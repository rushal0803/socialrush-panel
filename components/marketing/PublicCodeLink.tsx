"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

// Warm immutable client modules on intent. Dynamic prices and account data
// still come from a fresh navigation: never prefetch or cache the route flight.
const loaders = {
  "/services": () => import("./services/ServicesPageContent"),
  "/packages": () => import("./packages/PremiumPackagesPageContent"),
};
const warmed = new Map<string, Promise<unknown>>();
function warmCode(path: string) {
  const load = loaders[path as keyof typeof loaders];
  if (!load || warmed.has(path)) return;
  warmed.set(path, load().catch(() => { warmed.delete(path); }));
}

export default function PublicCodeLink({ href, prefetch, onPointerEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const path = (typeof href === "string" ? href : href.pathname ?? "").split(/[?#]/)[0];
  const known = Object.hasOwn(loaders, path);
  return <Link {...props} href={href} prefetch={known ? false : prefetch}
    onPointerEnter={event => { onPointerEnter?.(event); if (!event.defaultPrevented && event.pointerType === "mouse") warmCode(path); }}
    onFocus={event => { onFocus?.(event); if (!event.defaultPrevented) warmCode(path); }}
    onTouchStart={event => { onTouchStart?.(event); if (!event.defaultPrevented) warmCode(path); }} />;
}
