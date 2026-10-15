"use client";
import Link, { useLinkStatus } from "next/link";
import { useState, type ComponentProps } from "react";

function PendingHint() {
  const { pending } = useLinkStatus();
  return pending ? <span role="status" className="absolute inset-0 rounded-[inherit] border border-orange-300/70 bg-orange-300/[.06] motion-safe:animate-pulse"><span className="sr-only">Opening page</span></span> : null;
}

/** Full prefetch after intent, rather than fetching all 22 destinations. */
export default function DashboardNavLink({ children, onPointerEnter, onFocus, ...props }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return <Link {...props} prefetch={intent ? true : null}
    onPointerEnter={event => { setIntent(true); onPointerEnter?.(event); }}
    onFocus={event => { setIntent(true); onFocus?.(event); }}>
    {children}<PendingHint />
  </Link>;
}
