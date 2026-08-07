"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type ClientAnalyticsEvent } from "@/lib/analytics/events";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  event: ClientAnalyticsEvent;
  metadata?: Record<string, string | number | boolean | null>;
};

export default function TrackedLink({ event, metadata, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(eventObject) => {
        onClick?.(eventObject);
        if (!eventObject.defaultPrevented) track(event, metadata);
      }}
    />
  );
}
